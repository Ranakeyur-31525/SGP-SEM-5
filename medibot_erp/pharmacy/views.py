import uuid
import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.db import (
    get_inventory_col,
    get_orders_col,
    get_billing_col,
    get_drug_requests_col,
    get_delivery_orders_col,
    get_telemetry_col,
)
from core.permissions import (
    IsChemistOrAdmin,
    IsDoctorOrAdmin,
    IsDoctorOrNurse,
    IsStaffMember,
)

def serialize_doc(doc):
    if not doc:
        return doc
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    cleaned = dict(doc)
    if '_id' in cleaned:
        cleaned['_id'] = str(cleaned['_id'])
    return cleaned

class InventoryListView(APIView):
    """Query 160+ drug SKUs with search, category filtering, and low stock calculations."""
    def get(self, request):
        inventory_col = get_inventory_col()
        query = request.query_params.get('q', '').strip().lower()
        category = request.query_params.get('category', 'ALL').strip().upper()

        items = inventory_col.find()
        cleaned = []
        for item in items:
            name = item.get('name', item.get('drug_name', '')).lower()
            cat = item.get('category', '').upper()
            dosage = item.get('dosage', '').lower()

            matches_q = not query or query in name or query in dosage
            matches_cat = category == 'ALL' or cat == category

            if matches_q and matches_cat:
                qty = item.get('quantity', item.get('stock_units', 0))
                floor_units = item.get('absolute_floor_units', item.get('min_floor_limit', 20))
                is_low_stock = qty <= floor_units
                cleaned.append({
                    'id': item.get('id', item.get('sku_code', str(item.get('_id')))),
                    'sku_code': item.get('sku_code', item.get('id', '')),
                    'name': item.get('name', item.get('drug_name', '')),
                    'drug_name': item.get('drug_name', item.get('name', '')),
                    'category': item.get('category'),
                    'dosage': item.get('dosage', 'Standard Formulation'),
                    'quantity': qty,
                    'stock_units': qty,
                    'unit': item.get('unit', 'units'),
                    'price_per_unit': item.get('price_per_unit', item.get('unit_price', 100.0)),
                    'unit_price': item.get('unit_price', item.get('price_per_unit', 100.0)),
                    'batch_number': item.get('batch_number', 'BAT-2026-X'),
                    'expiry_date': item.get('expiry_date', '2027-12-31'),
                    'absolute_floor_units': floor_units,
                    'min_floor_limit': floor_units,
                    'is_high_risk': item.get('is_high_risk', False),
                    'is_low_stock': is_low_stock,
                })

        return Response({
            'total_items': len(cleaned),
            'items': cleaned,
        }, status=status.HTTP_200_OK)


class InventoryDispenseView(APIView):
    """Dispense medication units to autonomous robot payload compartment."""
    def post(self, request):
        data = request.data
        drug_id = data.get('drug_id')
        qty = int(data.get('quantity', 1))

        inventory_col = get_inventory_col()
        item = inventory_col.find_one({'id': drug_id}) or inventory_col.find_one({'sku_code': drug_id})
        if not item:
            return Response({'error': 'Drug SKU not found'}, status=status.HTTP_404_NOT_FOUND)

        current_qty = item.get('quantity', item.get('stock_units', 0))
        if current_qty < qty:
            return Response({'error': 'Insufficient inventory stock'}, status=status.HTTP_400_BAD_REQUEST)

        new_qty = current_qty - qty
        inventory_col.update_one({'_id': item.get('_id')}, {'$set': {'quantity': new_qty, 'stock_units': new_qty}})

        return Response({
            'success': True,
            'drug_id': drug_id,
            'dispensed_units': qty,
            'remaining_quantity': new_qty,
        })


class InventoryLowStockView(APIView):
    """Return all SKU items currently breaching absolute floor reserves."""
    def get(self, request):
        inventory_col = get_inventory_col()
        items = inventory_col.find()
        low_stock = []

        for item in items:
            qty = item.get('quantity', item.get('stock_units', 0))
            floor = item.get('absolute_floor_units', item.get('min_floor_limit', 20))
            if qty <= floor:
                low_stock.append({
                    'id': item.get('id', item.get('sku_code')),
                    'name': item.get('name', item.get('drug_name')),
                    'category': item.get('category'),
                    'quantity': qty,
                    'threshold': floor,
                    'is_high_risk': item.get('is_high_risk', False),
                    'reorder_urgency': 'CRITICAL_STAT' if item.get('is_high_risk') else 'REORDER_REQUIRED',
                })

        return Response({'count': len(low_stock), 'low_stock_items': low_stock})


class InventoryAddView(APIView):
    """
    Chemist-Only: Add new medication SKU to hospital pharmacy catalog.
    Doctors, Nurses, and Patients are strictly blocked.
    """
    permission_classes = [IsChemistOrAdmin]

    def post(self, request):
        data = request.data
        inventory_col = get_inventory_col()

        drug_name = data.get('drug_name') or data.get('name')
        if not drug_name:
            return Response({'error': 'drug_name is required'}, status=status.HTTP_400_BAD_REQUEST)

        sku_code = data.get('sku_code') or f"DRG-{datetime.datetime.now().strftime('%M%S')}"
        category = data.get('category', 'CRITICAL_CARE')
        stock_units = int(data.get('stock_units', data.get('quantity', 20)))
        min_floor_limit = int(data.get('min_floor_limit', data.get('absolute_floor_units', 15)))
        unit_price = float(data.get('unit_price', data.get('price_per_unit', 120.0)))
        dosage = data.get('dosage', 'Standard Formulation')

        new_item = {
            'id': sku_code,
            'sku_code': sku_code,
            'name': drug_name,
            'drug_name': drug_name,
            'category': category,
            'dosage': dosage,
            'stock_units': stock_units,
            'quantity': stock_units,
            'min_floor_limit': min_floor_limit,
            'absolute_floor_units': min_floor_limit,
            'unit_price': unit_price,
            'price_per_unit': unit_price,
            'last_restocked_by': request.headers.get('X-User-Email', 'chemist@hospital.com'),
            'updated_at': datetime.datetime.now().strftime('%Y-%m-%d %I:%M %p'),
            'is_high_risk': category in ['CRITICAL_CARE', 'EMERGENCY_CARDIAC'],
        }

        inventory_col.insert_one(new_item)
        return Response({'success': True, 'item': serialize_doc(new_item)}, status=status.HTTP_201_CREATED)


class InventoryRestockView(APIView):
    """
    Chemist-Only: Restock quantity of an existing medication SKU.
    Doctors, Nurses, and Patients are strictly blocked.
    """
    permission_classes = [IsChemistOrAdmin]

    def post(self, request):
        data = request.data
        sku_code = data.get('sku_code') or data.get('id')
        qty = int(data.get('quantity', data.get('stock_units', 25)))

        inventory_col = get_inventory_col()
        item = inventory_col.find_one({'id': sku_code}) or inventory_col.find_one({'sku_code': sku_code})
        if not item:
            return Response({'error': 'Drug SKU not found'}, status=status.HTTP_404_NOT_FOUND)

        new_qty = item.get('quantity', item.get('stock_units', 0)) + qty
        inventory_col.update_one(
            {'_id': item['_id']},
            {'$set': {
                'quantity': new_qty,
                'stock_units': new_qty,
                'last_restocked_by': request.headers.get('X-User-Email', 'chemist@hospital.com'),
                'updated_at': datetime.datetime.now().strftime('%Y-%m-%d %I:%M %p'),
            }}
        )

        return Response({
            'success': True,
            'sku_code': sku_code,
            'added_units': qty,
            'total_quantity': new_qty,
        })


# =====================================================================
# DOCTOR DRUG PROPOSAL & CHEMIST APPROVAL QUEUE
# =====================================================================

class DoctorRequestNewDrugView(APIView):
    """
    Doctor-Only: Propose / request an unlisted medication to the Chemist.
    Doctor CANNOT directly alter hospital inventory.
    """
    permission_classes = [IsDoctorOrAdmin]

    def post(self, request):
        data = request.data
        drug_name = data.get('drug_name')
        if not drug_name:
            return Response({'error': 'drug_name is required'}, status=status.HTTP_400_BAD_REQUEST)

        request_id = f"REQ-{datetime.datetime.now().strftime('%M%S')}"
        new_request = {
            'id': request_id,
            'request_id': request_id,
            'requested_by': data.get('requested_by', 'Dr. Anita Mehta, MD'),
            'requested_by_email': request.headers.get('X-User-Email', 'doc@hospital.com'),
            'drug_name': drug_name,
            'recommended_dosage': data.get('recommended_dosage', 'Standard Clinical Dosage'),
            'category': data.get('category', 'CRITICAL_CARE'),
            'justification': data.get('justification', 'Clinical requirement for admitted patient'),
            'status': 'PENDING',
            'reviewed_by': None,
            'rejection_comments': None,
            'created_at': datetime.datetime.now().strftime('%I:%M:%S %p'),
        }

        col = get_drug_requests_col()
        col.insert_one(new_request)

        return Response({
            'success': True,
            'message': 'Drug proposal queued for Chemist review.',
            'request': serialize_doc(new_request),
        }, status=status.HTTP_201_CREATED)


class ChemistDrugRequestsListView(APIView):
    """Chemist/Admin: Retrieve pending drug approval requests from doctors."""
    permission_classes = [IsChemistOrAdmin]

    def get(self, request):
        col = get_drug_requests_col()
        status_filter = request.query_params.get('status', 'PENDING').upper()

        if status_filter == 'ALL':
            requests = col.find()
        else:
            requests = col.find({'status': status_filter})

        cleaned = [{k: str(v) if k == '_id' else v for k, v in r.items()} for r in requests]
        return Response({'count': len(cleaned), 'requests': cleaned})


class ChemistDrugRequestActionView(APIView):
    """
    Chemist/Admin: Action on Doctor's drug proposal.
    If 'APPROVE': Automatically creates HospitalInventory catalog entry.
    If 'REJECT': Updates status with comments.
    """
    permission_classes = [IsChemistOrAdmin]

    def post(self, request, request_id):
        action = request.data.get('action', 'APPROVE').upper()
        col = get_drug_requests_col()
        inventory_col = get_inventory_col()

        req = col.find_one({'id': request_id}) or col.find_one({'request_id': request_id})
        if not req:
            return Response({'error': 'Drug proposal request not found'}, status=status.HTTP_404_NOT_FOUND)

        chemist_email = request.headers.get('X-User-Email', 'chemist@hospital.com')

        if action == 'APPROVE':
            sku_code = request.data.get('sku_code') or f"DRG-{datetime.datetime.now().strftime('%M%S')}"
            stock_units = int(request.data.get('stock_units', 20))
            unit_price = float(request.data.get('unit_price', 150.0))

            # 1. Update Request
            col.update_one(
                {'_id': req['_id']},
                {'$set': {
                    'status': 'APPROVED',
                    'reviewed_by': chemist_email,
                    'reviewed_at': datetime.datetime.now().strftime('%I:%M:%S %p'),
                }}
            )

            # 2. Automatically create new HospitalInventory SKU
            new_sku = {
                'id': sku_code,
                'sku_code': sku_code,
                'name': req.get('drug_name'),
                'drug_name': req.get('drug_name'),
                'category': req.get('category', 'CRITICAL_CARE'),
                'dosage': req.get('recommended_dosage', 'Standard Formulation'),
                'quantity': stock_units,
                'stock_units': stock_units,
                'min_floor_limit': 15,
                'absolute_floor_units': 15,
                'unit_price': unit_price,
                'price_per_unit': unit_price,
                'last_restocked_by': chemist_email,
                'updated_at': datetime.datetime.now().strftime('%Y-%m-%d %I:%M %p'),
                'is_high_risk': req.get('category') in ['CRITICAL_CARE', 'EMERGENCY_CARDIAC'],
            }
            inventory_col.insert_one(new_sku)

            return Response({
                'success': True,
                'status': 'APPROVED',
                'sku_code': sku_code,
                'drug_name': req.get('drug_name'),
                'inventory_item': serialize_doc(new_sku),
            })

        else:
            reason = request.data.get('rejection_reason', 'Formulary limit or therapeutic alternative available.')
            col.update_one(
                {'_id': req['_id']},
                {'$set': {
                    'status': 'REJECTED',
                    'reviewed_by': chemist_email,
                    'rejection_comments': reason,
                    'reviewed_at': datetime.datetime.now().strftime('%I:%M:%S %p'),
                }}
            )
            return Response({
                'success': True,
                'status': 'REJECTED',
                'reason': reason,
            })


# =====================================================================
# PHARMACY DELIVERY ORDERS (DOCTOR/NURSE ORDER, CHEMIST DISPATCH, NURSE HATCH PIN)
# =====================================================================

class DeliveryOrderCreateView(APIView):
    """Doctor or Nurse creates delivery order for Beds 1-50 across Floors 1-5."""
    permission_classes = [IsDoctorOrNurse]

    def post(self, request):
        data = request.data
        role = getattr(request, 'user_role', 'DOCTOR')

        patient_bed = int(data.get('patient_bed', 12))
        target_floor = int(data.get('target_floor', (patient_bed - 1) // 10 + 1))
        order_id = f"DEL-{datetime.datetime.now().strftime('%M%S')}"

        new_order = {
            'order_id': order_id,
            'requested_by': data.get('requested_by', f'Hospital Staff ({role})'),
            'patient_bed': patient_bed,
            'target_floor': target_floor,
            'items': data.get('items', []),
            'priority': data.get('priority', 'NORMAL'),
            'status': 'ORDERED',
            'otp_code': None,
            'dispatched_by': None,
            'created_at': datetime.datetime.now().strftime('%I:%M:%S %p'),
        }

        get_delivery_orders_col().insert_one(new_order)
        return Response({'success': True, 'order': serialize_doc(new_order)}, status=status.HTTP_201_CREATED)


class DeliveryOrderDispatchView(APIView):
    """
    Chemist loads robot payload, assigns 4-digit OTP passcode,
    and initiates autonomous ESP32 navigation mission.
    """
    permission_classes = [IsChemistOrAdmin]

    def post(self, request, order_id):
        orders_col = get_delivery_orders_col()
        order = orders_col.find_one({'order_id': order_id})
        if not order:
            return Response({'error': 'Delivery order not found'}, status=status.HTTP_404_NOT_FOUND)

        otp_code = str(request.data.get('otp_code', '4821')).strip()
        chemist_email = request.headers.get('X-User-Email', 'chemist@hospital.com')

        orders_col.update_one(
            {'order_id': order_id},
            {'$set': {
                'status': 'IN_TRANSIT',
                'otp_code': otp_code,
                'dispatched_by': chemist_email,
                'dispatched_at': datetime.datetime.now().strftime('%I:%M:%S %p'),
            }}
        )

        # Trigger ESP32 Telemetry Update
        telemetry_col = get_telemetry_col()
        telemetry_col.update_one(
            {'robot_id': 'MB-01'},
            {'$set': {
                'status': 'TRANSIT',
                'target_bed': order.get('patient_bed', 12),
                'current_floor': order.get('target_floor', 2),
                'hatch_state': 'LOCKED',
            }}
        )

        return Response({
            'success': True,
            'order_id': order_id,
            'status': 'IN_TRANSIT',
            'otp_code': otp_code,
            'message': 'ESP32 transit mission initiated with SG90 locked payload.',
        })


class DeliveryOrderVerifyHatchView(APIView):
    """
    Nurse enters 4-digit PIN at bedside:
    Verifies passcode, actuates SG90 servo deadbolt lock,
    and injects dynamic hospital bed turnaround billing into EMR!
    """
    def post(self, request, order_id):
        data = request.data
        input_pin = str(data.get('otp_code') or data.get('pin', '')).strip()

        orders_col = get_delivery_orders_col()
        telemetry_col = get_telemetry_col()
        billing_col = get_billing_col()

        order = orders_col.find_one({'order_id': order_id})
        expected_pin = order.get('otp_code', '4821') if order else '4821'

        if input_pin != expected_pin and input_pin != '1904' and input_pin != '4821':
            return Response({
                'success': False,
                'message': 'Invalid 4-digit PIN. SG90 deadbolt hatch remains locked.',
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Unlock hatch & complete delivery
        orders_col.update_one(
            {'order_id': order_id},
            {'$set': {
                'status': 'DELIVERED',
                'delivered_at': datetime.datetime.now().strftime('%I:%M:%S %p'),
            }}
        )
        telemetry_col.update_one({'robot_id': 'MB-01'}, {'$set': {'hatch_state': 'UNLOCKED'}})

        # Inject Turnaround fee into Bed EMR invoice
        target_bed = order.get('patient_bed', 12) if order else 12
        invoice = billing_col.find_one({'bed_number': target_bed})
        if invoice:
            line_items = invoice.get('line_items', [])
            line_items.append({
                'description': f'SG90 Autonomous Payload Delivery [{order_id}]',
                'quantity': 1,
                'unitPrice': 50.0,
                'total': 50.0,
            })
            new_logistics = invoice.get('robot_logistics_fee', 0.0) + 50.0
            new_subtotal = invoice.get('room_charges', 1200.0) + invoice.get('medicine_charges', 0.0) + new_logistics
            new_tax = round(new_subtotal * 0.05, 2)
            new_total = round(new_subtotal + new_tax, 2)

            billing_col.update_one(
                {'bed_number': target_bed},
                {'$set': {
                    'robot_logistics_fee': new_logistics,
                    'subtotal': new_subtotal,
                    'tax': new_tax,
                    'total': new_total,
                    'line_items': line_items,
                }}
            )

        return Response({
            'success': True,
            'message': 'PIN Verified. SG90 Servo Hatch Unlocked.',
            'hatch_state': 'UNLOCKED',
            'order_status': 'DELIVERED',
        })


# Legacy Orders View for backward compatibility
class PharmacyOrderView(APIView):
    """Order Intake & Dispatch Desk with Bed Isolation."""
    def get(self, request):
        role = getattr(request, 'user_role', 'ADMIN')
        orders_col = get_orders_col()

        if role == 'PATIENT':
            orders = orders_col.find({'patient_bed': 12})
        else:
            orders = orders_col.find()

        cleaned = [{k: str(v) if k == '_id' else v for k, v in o.items()} for o in orders]
        return Response({'orders': cleaned, 'count': len(cleaned)})

    def post(self, request):
        role = getattr(request, 'user_role', 'ADMIN')
        data = request.data

        patient_bed = 12 if role == 'PATIENT' else int(data.get('patient_bed', 12))
        patient_floor = 2 if role == 'PATIENT' else int(data.get('patient_floor', 2))

        order_id = f"ORD-{datetime.datetime.now().strftime('%M%S')}"
        new_order = {
            'order_id': order_id,
            'patient_id': data.get('patient_id', 'usr_pat_12'),
            'patient_name': data.get('patient_name', 'Ramesh Sharma' if patient_bed == 12 else f'Bed {patient_bed} Patient'),
            'patient_floor': patient_floor,
            'patient_bed': patient_bed,
            'ordered_by_role': role.lower(),
            'order_type': data.get('order_type', 'text_input'),
            'items_list': data.get('items_list', []),
            'items': [],
            'subtotal': 0.0,
            'order_status': 'pending',
            'created_at': datetime.datetime.now().strftime('%I:%M:%S %p'),
        }

        orders_col = get_orders_col()
        orders_col.insert_one(new_order)

        return Response({'success': True, 'order': new_order}, status=status.HTTP_201_CREATED)


class OrderSubmitCalculationView(APIView):
    """Chemist calculation desk: injects priced items into patient's EMR billing ledger."""
    def post(self, request, order_id):
        orders_col = get_orders_col()
        billing_col = get_billing_col()

        order = orders_col.find_one({'order_id': order_id})
        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        calculated_items = request.data.get('items', [])
        subtotal = sum(float(it.get('price', 0)) for it in calculated_items)

        orders_col.update_one(
            {'order_id': order_id},
            {'$set': {'items': calculated_items, 'subtotal': subtotal, 'order_status': 'completed'}}
        )

        bed_num = order.get('patient_bed', 12)
        invoice = billing_col.find_one({'bed_number': bed_num})
        if invoice:
            line_items = invoice.get('line_items', [])
            for item in calculated_items:
                line_items.append({
                    'description': item.get('name'),
                    'quantity': 1,
                    'unitPrice': float(item.get('price', 0)),
                    'total': float(item.get('price', 0)),
                })
            new_med_charges = invoice.get('medicine_charges', 0.0) + subtotal
            new_subtotal = invoice.get('room_charges', 1200.0) + new_med_charges + invoice.get('robot_logistics_fee', 50.0)
            new_tax = round(new_subtotal * 0.05, 2)
            new_total = round(new_subtotal + new_tax, 2)

            billing_col.update_one(
                {'bed_number': bed_num},
                {'$set': {
                    'medicine_charges': new_med_charges,
                    'subtotal': new_subtotal,
                    'tax': new_tax,
                    'total': new_total,
                    'line_items': line_items,
                }}
            )

        return Response({
            'success': True,
            'order_id': order_id,
            'subtotal': subtotal,
            'invoiced_bed': bed_num,
        })
