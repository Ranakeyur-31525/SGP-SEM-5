import io
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.db import get_billing_col

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class PatientBillingView(APIView):
    """Retrieve itemized billing ledger with Turnaround & Autonomous fees."""
    def get(self, request, bed_id):
        role = getattr(request, 'user_role', 'ADMIN')
        bed_num = int(bed_id)

        # Patient Bed Isolation
        if role == 'PATIENT' and bed_num != 12:
            return Response({
                'error': 'Forbidden. Patients are strictly restricted to their assigned Bed 12.'
            }, status=status.HTTP_403_FORBIDDEN)

        billing_col = get_billing_col()
        invoice = billing_col.find_one({'bed_number': bed_num})

        if not invoice:
            invoice = {
                'patient_id': f'PAT-2026-{str(bed_num).zfill(4)}',
                'bed_number': bed_num,
                'patient_name': 'Ramesh Sharma' if bed_num == 12 else f'Inpatient (Bed {bed_num})',
                'room_charges': 3600.0 if bed_num == 12 else 1200.0,
                'medicine_charges': 1845.0 if bed_num == 12 else 0.0,
                'robot_logistics_fee': 150.0 if bed_num == 12 else 50.0,
                'subtotal': 5595.0 if bed_num == 12 else 1250.0,
                'tax': 279.75 if bed_num == 12 else 62.50,
                'total': 5874.75 if bed_num == 12 else 1312.50,
                'line_items': [
                    {'description': 'Cardiology ICU Bed (Per Diem x 3)', 'quantity': 3, 'unitPrice': 1200.0, 'total': 3600.0},
                    {'description': 'Adrenaline 1mg/mL Ampoule (STAT Delivery)', 'quantity': 2, 'unitPrice': 145.0, 'total': 290.0},
                    {'description': 'Meropenem 1g IV Infusion', 'quantity': 1, 'unitPrice': 890.0, 'total': 890.0},
                    {'description': 'Atropine Sulfate 0.6mg/mL Ampoule', 'quantity': 1, 'unitPrice': 85.0, 'total': 85.0},
                    {'description': 'Normal Saline (0.9% NaCl) 500mL', 'quantity': 3, 'unitPrice': 60.0, 'total': 180.0},
                    {'description': 'MediBot ESP32 Autonomous Sterilized Dispatch Fee', 'quantity': 3, 'unitPrice': 50.0, 'total': 150.0},
                ] if bed_num == 12 else [
                    {'description': 'Inpatient Bed Per Diem', 'quantity': 1, 'unitPrice': 1200.0, 'total': 1200.0},
                    {'description': 'MediBot Autonomous Delivery Fee', 'quantity': 1, 'unitPrice': 50.0, 'total': 50.0},
                ],
            }

        cleaned = {k: str(v) if k == '_id' else v for k, v in invoice.items()}
        return Response(cleaned, status=status.HTTP_200_OK)


class SettleBillView(APIView):
    """Settle patient invoice and release hospital bed for turnaround. Strictly restricted to ADMIN."""
    def post(self, request, bed_id):
        role = getattr(request, 'user_role', 'ADMIN')
        if role != 'ADMIN':
            return Response({
                'error': 'Forbidden. Patient discharge and bill settlement can only be executed by Hospital Administration. Attending physicians can only submit clinical discharge requests.'
            }, status=status.HTTP_403_FORBIDDEN)

        bed_num = int(bed_id)
        billing_col = get_billing_col()
        billing_col.delete_one({'bed_number': bed_num})
        return Response({
            'success': True,
            'message': f'Invoice for Bed {bed_num} settled in EMR by Admin. Bed released for UV-C turnaround.',
            'bed_number': bed_num,
        })


class DischargeRequestView(APIView):
    """Doctor clinical clearance & discharge recommendation submission."""
    def post(self, request, bed_id):
        role = getattr(request, 'user_role', 'DOCTOR')
        if role not in ['DOCTOR', 'ADMIN']:
            return Response({
                'error': 'Forbidden. Only Attending Doctors or Administrators can submit clinical discharge recommendations.'
            }, status=status.HTTP_403_FORBIDDEN)

        bed_num = int(bed_id)
        clinical_notes = request.data.get('clinical_notes', 'Patient hemodynamically stable. Vitals normal.')
        doctor_name = request.data.get('doctor_name', 'Dr. Anita Mehta, MD')

        return Response({
            'success': True,
            'message': f'Clinical discharge recommendation for Bed {bed_num} forwarded to Hospital Administration for authorization.',
            'bed_number': bed_num,
            'doctor_name': doctor_name,
            'clinical_notes': clinical_notes,
            'status': 'PENDING_ADMIN_APPROVAL',
        }, status=status.HTTP_201_CREATED)


class InvoicePdfDownloadView(APIView):
    """Generate high-fidelity clinical PDF medical invoice via ReportLab."""
    def get(self, request, bed_id):
        bed_num = int(bed_id)
        billing_col = get_billing_col()
        invoice = billing_col.find_one({'bed_number': bed_num})

        patient_name = invoice.get('patient_name', 'Ramesh Sharma') if invoice else 'Ramesh Sharma'
        patient_id = invoice.get('patient_id', 'PAT-2026-0412') if invoice else 'PAT-2026-0412'
        total = invoice.get('total', 5874.75) if invoice else 5874.75
        subtotal = invoice.get('subtotal', 5595.00) if invoice else 5595.00
        tax = invoice.get('tax', 279.75) if invoice else 279.75
        line_items = invoice.get('line_items', []) if invoice else []

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()

        # Header Title
        title_style = ParagraphStyle(
            'HospitalTitle',
            parent=styles['Heading1'],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0284C7'),
        )
        elements.append(Paragraph("MEDIBOT HEALTHCARE & AUTONOMOUS LOGISTICS", title_style))
        elements.append(Paragraph("Clinical Inpatient EMR Billing & Turnaround Summary", styles['Normal']))
        elements.append(Spacer(1, 12))

        # Patient Info Table
        patient_data = [
            [f"Patient Name: {patient_name}", f"MRN / ID: {patient_id}"],
            [f"Facility Location: Floor 2 (Cardiology)", f"Bed Assigned: #{bed_num}"],
            ["Status: Discharged / Active Inpatient", "Autonomous Unit: MediBot-01"],
        ]
        p_table = Table(patient_data, colWidths=[270, 270])
        p_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#0F172A')),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(p_table)
        elements.append(Spacer(1, 16))

        # Items Table
        table_data = [["DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL (INR)"]]
        for item in line_items:
            table_data.append([
                item.get('description', ''),
                str(item.get('quantity', 1)),
                f"₹{item.get('unitPrice', 0.0):.2f}",
                f"₹{item.get('total', 0.0):.2f}",
            ])

        table_data.append(["", "", "SUBTOTAL:", f"₹{subtotal:.2f}"])
        table_data.append(["", "", "GST (5%):", f"₹{tax:.2f}"])
        table_data.append(["", "", "FINAL AMOUNT:", f"₹{total:.2f}"])

        item_table = Table(table_data, colWidths=[310, 50, 90, 90])
        item_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284C7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -4), 0.5, colors.HexColor('#CBD5E1')),
            ('LINEABOVE', (2, -3), (-1, -1), 1, colors.HexColor('#0284C7')),
            ('FONTNAME', (2, -1), (-1, -1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (2, -1), (-1, -1), colors.HexColor('#0284C7')),
        ]))
        elements.append(item_table)
        elements.append(Spacer(1, 24))

        elements.append(Paragraph("System Generated by MediBot Autonomous Intra-Hospital Logistics ERP v2.4", styles['Italic']))

        doc.build(elements)
        buffer.seek(0)

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="medibot_invoice_bed_{bed_num}.pdf"'
        return response
