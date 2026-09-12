"""
Seed script for MEDIBOT Intra-Hospital Cloud ERP & MongoDB Collections.
Populates 50 hospital beds, 160+ drug SKUs, staff accounts, initial robot telemetry, and billing records.
"""
import os
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medibot_erp.settings')

from core.db import (
    get_users_col,
    get_inventory_col,
    get_orders_col,
    get_telemetry_col,
    get_billing_col,
)

def seed_database():
    print("Initializing MEDIBOT Hospital ERP database seed...")

    # 1. SEED USERS & 50 BEDS
    users_col = get_users_col()
    staff_and_patients = [
        {
            'id': 'usr_pat_12',
            'name': 'Ramesh Sharma',
            'email': 'ramesh.bed12@medibot.hospital',
            'role': 'PATIENT',
            'assigned_bed': 12,
            'allocated_floor': 2,
            'department': 'Cardiology Ward Floor 2',
            'diagnosis': 'Acute Coronary Syndrome (Post-PTCA Stent)',
            'is_active': True,
        },
        {
            'id': 'usr_doc_01',
            'name': 'Dr. Anita Mehta, MD',
            'email': 'anita.mehta@medibot.hospital',
            'role': 'DOCTOR',
            'duty_shift': 'Day',
            'department': 'Critical Care & ICU',
            'is_active': True,
        },
        {
            'id': 'usr_nur_01',
            'name': 'Sarah Joseph, RN',
            'email': 'sarah.nurse@medibot.hospital',
            'role': 'NURSE',
            'duty_shift': 'Day',
            'department': 'Floor 3 Station',
            'is_active': True,
        },
        {
            'id': 'usr_chm_01',
            'name': 'Rahul Verma (R.Ph)',
            'email': 'rahul.pharmacy@medibot.hospital',
            'role': 'CHEMIST',
            'department': 'Central Drug Dispensary & Calculation Desk',
            'is_active': True,
        },
        {
            'id': 'usr_adm_01',
            'name': 'Patel Vikram (Lead SysAdmin)',
            'email': 'admin.patel@medibot.hospital',
            'role': 'ADMIN',
            'department': 'Hospital Biomedical & 50-Bed Logistics',
            'is_active': True,
        },
    ]

    # Generate the remaining 49 beds
    for b in range(1, 51):
        if b == 12:
            continue
        floor = (b - 1) // 10 + 1
        staff_and_patients.append({
            'id': f'usr_pat_{b:02d}',
            'name': f'Patient #{b:02d}',
            'email': f'patient.bed{b}@medibot.hospital',
            'role': 'PATIENT',
            'assigned_bed': b,
            'allocated_floor': floor,
            'department': f'Ward Floor {floor}',
            'diagnosis': 'Admitted Inpatient Care',
            'is_active': True,
        })

    for u in staff_and_patients:
        users_col.insert_one(u)
    print(f"Seeded {len(staff_and_patients)} staff and patient records (50 beds).")

    # 2. SEED 160+ DRUG SKUs
    inventory_col = get_inventory_col()
    categories = [
        'CRITICAL_CARE',
        'EMERGENCY_CARDIAC',
        'ANTIBIOTIC',
        'ANALGESIC',
        'IV_FLUID',
        'RESPIRATORY',
        'SURGICAL_SUPPLIES',
    ]

    base_drugs = [
        ('Adrenaline (Epinephrine) 1mg/mL', 'CRITICAL_CARE', '1mg/1mL Ampoule', 14, 'ampoules', 145.0, 20, True),
        ('Atropine Sulfate 0.6mg/mL', 'CRITICAL_CARE', '0.6mg/mL Ampoule', 12, 'ampoules', 85.0, 15, True),
        ('Meropenem 1g IV Infusion', 'ANTIBIOTIC', '1g Vial with Diluent', 45, 'vials', 890.0, 15, False),
        ('Regular Human Insulin 100 IU/mL', 'CRITICAL_CARE', '10mL Vial (1000 IU)', 18, 'vials', 340.0, 25, True),
        ('Normal Saline (0.9% NaCl)', 'IV_FLUID', '500 mL IV Bottle', 115, 'bottles', 60.0, 30, False),
        ('Ringer Lactate (RL)', 'IV_FLUID', '500 mL IV Bottle', 84, 'bottles', 65.0, 25, False),
        ('Morphine Sulfate 10mg/mL', 'ANALGESIC', '1mL Narcotic Ampoule', 9, 'ampoules', 220.0, 15, True),
        ('Fentanyl Citrate 50mcg/mL', 'ANALGESIC', '2mL Ampoule', 28, 'ampoules', 310.0, 15, True),
        ('Piperacillin + Tazobactam 4.5g', 'ANTIBIOTIC', '4.5g IV Vial', 62, 'vials', 520.0, 20, False),
        ('Amiodarone 150mg/3mL', 'EMERGENCY_CARDIAC', '3mL Ampoule', 16, 'ampoules', 215.0, 20, True),
        ('Dopamine Hydrochloride 200mg', 'EMERGENCY_CARDIAC', '5mL Ampoule', 35, 'ampoules', 180.0, 15, True),
        ('Paracetamol IV 1000mg', 'ANALGESIC', '100mL IV Bottle', 140, 'bottles', 110.0, 25, False),
        ('Dextrose 5% (D5W)', 'IV_FLUID', '500 mL Infusion', 95, 'bottles', 58.0, 30, False),
        ('Ceftriaxone 1g IV', 'ANTIBIOTIC', '1g Dry Powder Vial', 120, 'vials', 160.0, 25, False),
        ('Vancomycin 500mg IV', 'ANTIBIOTIC', '500mg Vial', 38, 'vials', 450.0, 15, False),
        ('Furosemide 20mg/2mL', 'EMERGENCY_CARDIAC', '2mL Ampoule', 70, 'ampoules', 45.0, 20, False),
        ('Salbutamol 2.5mg Respules', 'RESPIRATORY', '2.5mL Nebulizer Pack', 85, 'respules', 32.0, 25, False),
        ('Budesonide 0.5mg Respules', 'RESPIRATORY', '2mL Nebulizer Pack', 64, 'respules', 48.0, 20, False),
        ('Midazolam 5mg/mL', 'ANALGESIC', '1mL Sedative Ampoule', 22, 'ampoules', 190.0, 15, True),
        ('Heparin Sodium 5000 IU/mL', 'CRITICAL_CARE', '5mL Multidose Vial', 40, 'vials', 280.0, 20, True),
    ]

    sku_items = []
    # Add base 20 drugs
    for i, (name, cat, dos, qty, unit, price, floor, high_risk) in enumerate(base_drugs, 1):
        sku_items.append({
            'id': f'DRG-{i:03d}',
            'name': name,
            'category': cat,
            'dosage': dos,
            'quantity': qty,
            'unit': unit,
            'price_per_unit': price,
            'absolute_floor_units': floor,
            'batch_number': f'BAT-2026-{i:04d}',
            'expiry_date': '2027-11-30',
            'is_high_risk': high_risk,
        })

    # Expand to 165 total catalog SKUs
    for i in range(21, 166):
        cat = categories[i % len(categories)]
        unit = 'vials' if 'ANTIBIOTIC' in cat else 'ampoules' if 'CARDIAC' in cat or 'ANALGESIC' in cat else 'bottles' if 'FLUID' in cat else 'packs'
        is_hr = cat in ['CRITICAL_CARE', 'EMERGENCY_CARDIAC'] or (i % 7 == 0)
        floor = 15 if is_hr else 20
        qty = 8 if i in [23, 47, 89, 112, 145] else (30 + (i * 3) % 90)

        sku_items.append({
            'id': f'DRG-{i:03d}',
            'name': f'Medication {cat.replace("_", " ").title()} SKU #{i:03d}',
            'category': cat,
            'dosage': f'{10 * (i % 10 + 1)}mg Formulation Unit',
            'quantity': qty,
            'unit': unit,
            'price_per_unit': float(50 + (i * 12) % 450),
            'absolute_floor_units': floor,
            'batch_number': f'BAT-2026-{i:04d}',
            'expiry_date': '2028-06-30',
            'is_high_risk': is_hr,
        })

    for item in sku_items:
        inventory_col.insert_one(item)
    print(f"Seeded {len(sku_items)} formulary drug SKUs (160+ items).")

    # 3. SEED INITIAL ROBOT TELEMETRY
    telemetry_col = get_telemetry_col()
    telemetry_state = {
        'robot_id': 'MB-01',
        'status': 'NAVIGATING',
        'current_floor': 2,
        'current_junction': 4,
        'target_bed': 12,
        'lidar': {
            'distance_cm': 148,
            'signal_strength': 2850,
            'brake_engaged': False,
            'sensor_healthy': True,
        },
        'power': {
            'battery_voltage': 8.12,
            'battery_percentage': 86,
            'step_down_rail_5v': 5.02,
            'is_rail_normal': True,
            'estimated_runtime_minutes': 140,
        },
        'hatch_state': 'LOCKED',
        'ir_array': {'sensor1': 0, 'sensor2': 0, 'sensor3': 1, 'sensor4': 0, 'sensor5': 0},
        'elevator_handshake': {
            'active_relay_floor': 2,
            'door_status': 'CLOSED',
            'is_interlocked': True,
            'cabin_status': 'LEVEL',
        },
    }
    telemetry_col.insert_one(telemetry_state)
    print("Seeded initial robot telemetry for MediBot-01.")

    # 4. SEED SAMPLE PHARMACY ORDERS
    orders_col = get_orders_col()
    sample_orders = [
        {
            'order_id': 'ORD-9421',
            'patient_id': 'usr_pat_12',
            'patient_name': 'Ramesh Sharma',
            'patient_floor': 2,
            'patient_bed': 12,
            'ordered_by_role': 'patient',
            'order_type': 'text_input',
            'items_list': ['Paracetamol 650mg (Oral)', 'Saline D5 IV 500mL', 'Surgical Cotton Gauze Roll'],
            'items': [],
            'subtotal': 0.0,
            'order_status': 'pending',
            'created_at': '10:15:20 AM',
        },
        {
            'order_id': 'ORD-9419',
            'patient_id': 'usr_pat_24',
            'patient_name': 'Kavita Singh',
            'patient_floor': 2,
            'patient_bed': 24,
            'ordered_by_role': 'patient',
            'order_type': 'prescription_upload',
            'items_list': ['Prescription Attachment #412'],
            'items': [
                {'name': 'Paracetamol IV 1000mg Infusion', 'price': 220},
                {'name': 'Normal Saline 500mL', 'price': 120},
                {'name': 'MediBot Autonomous Delivery Fee', 'price': 50},
            ],
            'subtotal': 390.0,
            'order_status': 'completed',
            'created_at': '09:20:10 AM',
        }
    ]
    for o in sample_orders:
        orders_col.insert_one(o)
    print("Seeded active pharmacy orders.")

    # 5. SEED BILLING INVOICES FOR PATIENTS
    billing_col = get_billing_col()
    bed12_invoice = {
        'patient_id': 'PAT-2026-0412',
        'bed_number': 12,
        'patient_name': 'Ramesh Sharma',
        'room_charges': 3600.0,
        'medicine_charges': 1845.0,
        'robot_logistics_fee': 150.0,
        'subtotal': 5595.0,
        'tax': 279.75,
        'total': 5874.75,
        'line_items': [
            {'description': 'Cardiology ICU Bed (Per Diem x 3)', 'quantity': 3, 'unitPrice': 1200.0, 'total': 3600.0},
            {'description': 'Adrenaline 1mg/mL Ampoule (STAT Delivery)', 'quantity': 2, 'unitPrice': 145.0, 'total': 290.0},
            {'description': 'Meropenem 1g IV Infusion', 'quantity': 1, 'unitPrice': 890.0, 'total': 890.0},
            {'description': 'Atropine Sulfate 0.6mg/mL Ampoule', 'quantity': 1, 'unitPrice': 85.0, 'total': 85.0},
            {'description': 'Normal Saline (0.9% NaCl) 500mL', 'quantity': 3, 'unitPrice': 60.0, 'total': 180.0},
            {'description': 'MediBot ESP32 Autonomous Sterilized Dispatch Fee', 'quantity': 3, 'unitPrice': 50.0, 'total': 150.0},
        ],
    }
    billing_col.insert_one(bed12_invoice)
    print("Seeded EMR billing invoices with Bed 12 turnaround charges.")

    # 6. SEED DOCTOR DRUG APPROVAL PROPOSALS
    from core.db import get_drug_requests_col, get_delivery_orders_col
    drug_req_col = get_drug_requests_col()
    sample_requests = [
        {
            'id': 'REQ-501',
            'request_id': 'REQ-501',
            'requested_by': 'Dr. Anita Mehta, MD',
            'requested_by_email': 'doc@hospital.com',
            'drug_name': 'Dexamethasone Sodium Phosphate 4mg/mL',
            'recommended_dosage': '4mg/mL IV/IM Injection (2mL Vial)',
            'category': 'CRITICAL_CARE',
            'justification': 'Severe anaphylaxis and acute post-op inflammatory crisis protocol.',
            'status': 'PENDING',
            'reviewed_by': None,
            'created_at': '10:30:15 AM',
        },
        {
            'id': 'REQ-502',
            'request_id': 'REQ-502',
            'requested_by': 'Dr. Sandeep Rao',
            'requested_by_email': 'sandeep.rao@hospital.com',
            'drug_name': 'Levetiracetam 500mg IV Infusion',
            'recommended_dosage': '500mg/5mL Ampoule',
            'category': 'CRITICAL_CARE',
            'justification': 'Acute status epilepticus management for Floor 4 neurology bed.',
            'status': 'PENDING',
            'reviewed_by': None,
            'created_at': '09:15:40 AM',
        }
    ]
    for r in sample_requests:
        drug_req_col.insert_one(r)
    print("Seeded Doctor drug proposals for Chemist approval queue.")

    # 7. SEED INITIAL DELIVERY MISSIONS
    del_col = get_delivery_orders_col()
    sample_deliveries = [
        {
            'order_id': 'DEL-8902',
            'requested_by': 'Dr. Anita Mehta, MD',
            'patient_bed': 12,
            'target_floor': 2,
            'items': [{'sku_code': 'DRG-001', 'quantity': 2}],
            'priority': 'EMERGENCY_STAT',
            'status': 'IN_TRANSIT',
            'otp_code': '4821',
            'dispatched_by': 'chemist@hospital.com',
            'created_at': '10:45:00 AM',
        }
    ]
    for d in sample_deliveries:
        del_col.insert_one(d)
    print("Seeded active autonomous delivery missions.")

    print("\nDatabase seed completed successfully! 50 Beds, 160+ SKUs, Proposals & Telemetry initialized.")

if __name__ == '__main__':
    seed_database()
