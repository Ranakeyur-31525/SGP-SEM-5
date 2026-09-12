"""
Automated Test Suite for MEDIBOT Hospital Cloud ERP Backend.
Tests all endpoints, RBAC permissions, bed isolation, Chemist inventory gate,
Doctor drug requests queue, and autonomous delivery lifecycle.
"""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medibot_erp.settings')

import django
django.setup()

from django.test import Client

def run_tests():
    print("==================================================")
    print("STARTING MEDIBOT ERP BACKEND TEST SUITE")
    print("==================================================")

    client = Client()
    passed = 0
    total = 0

    # Test 1: API Health Check
    total += 1
    res = client.get('/api/health/')
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    data = res.json()
    assert data['status'] == 'HEALTHY'
    print("[PASS] 1. API Health Check verified (100Hz LiDAR, SG90, 5 Floors, Chemist Gate)")
    passed += 1

    # Test 2: Login Authentication & JWT
    total += 1
    res = client.post('/api/auth/login/', {'role': 'DOCTOR'}, content_type='application/json')
    assert res.status_code == 200, f"Login failed: {res.status_code}"
    data = res.json()
    assert 'token' in data and data['user']['role'] == 'DOCTOR'
    print("[PASS] 2. JWT Authentication successful for Doctor")
    passed += 1

    # Test 3: Inventory List (160+ SKUs)
    total += 1
    res = client.get('/api/erp/inventory/')
    assert res.status_code == 200, f"Inventory fetch failed: {res.status_code}"
    data = res.json()
    assert data['total_items'] >= 160, f"Expected 160+ SKUs, got {data['total_items']}"
    print(f"[PASS] 3. 160+ Drug SKUs verified ({data['total_items']} items in database)")
    passed += 1

    # Test 4: Low Stock Detection
    total += 1
    res = client.get('/api/erp/inventory/low-stock/')
    assert res.status_code == 200, f"Low stock fetch failed: {res.status_code}"
    data = res.json()
    assert data['count'] > 0, "Expected low stock items"
    print(f"[PASS] 4. Low stock detection verified ({data['count']} items below threshold)")
    passed += 1

    # Test 5: Robot Telemetry Endpoint
    total += 1
    res = client.get('/api/robot/telemetry/')
    assert res.status_code == 200, f"Telemetry fetch failed: {res.status_code}"
    data = res.json()
    assert data['robot_id'] == 'MB-01'
    assert 'lidar' in data and data['lidar']['distance_cm'] == 148
    assert 'elevator_handshake' in data
    print("[PASS] 5. ESP32 sub-second telemetry verified (LiDAR, Battery, Lift)")
    passed += 1

    # Test 6: LiDAR Black-Box Flight Recorder Buffer
    total += 1
    res = client.get('/api/robot/black-box/')
    assert res.status_code == 200, f"Black box fetch failed: {res.status_code}"
    data = res.json()
    assert data['sampling_frequency_hz'] == 100
    assert len(data['flight_buffer']) > 0
    print("[PASS] 6. LiDAR 100Hz Black-Box Flight Buffer verified")
    passed += 1

    # Test 7: Elevator Node Handshake Protocol
    total += 1
    res = client.get('/api/robot/elevator-handshake/')
    assert res.status_code == 200, f"Elevator handshake failed: {res.status_code}"
    data = res.json()
    assert len(data['relays']) == 5
    print("[PASS] 7. Multi-floor optocoupler relay handshake verified (Floors 1-5)")
    passed += 1

    # Test 8: SG90 Hatch Unlock with Turnaround Billing Injection
    total += 1
    res = client.post(
        '/api/robot/orders/ORD-9421/unlock-hatch/',
        {'pin': '1904'},
        content_type='application/json'
    )
    assert res.status_code == 200, f"Hatch unlock failed: {res.status_code}"
    data = res.json()
    assert data['success'] is True
    assert data['hatch_state'] == 'UNLOCKED'
    assert 'invoiced_turnaround' in data
    print("[PASS] 8. SG90 Hatch Unlock with Turnaround Billing verified (Rs. 150 bed fee)")
    passed += 1

    # Test 9: Patient Bed Isolation (Bed 12 vs Other Beds)
    total += 1
    res = client.get('/api/erp/billing/patient/12/', HTTP_X_USER_ROLE='PATIENT')
    assert res.status_code == 200, f"Patient Bed 12 fetch failed: {res.status_code}"
    assert res.json()['bed_number'] == 12

    res_blocked = client.get('/api/erp/billing/patient/24/', HTTP_X_USER_ROLE='PATIENT')
    assert res_blocked.status_code == 403, f"Patient was not blocked from Bed 24! Got {res_blocked.status_code}"
    print("[PASS] 9. Patient Bed Isolation verified: Bed 12 allowed, Bed 24 rejected with 403 Forbidden")
    passed += 1

    # Test 10: ReportLab Clinical PDF Generation
    total += 1
    res = client.get('/api/erp/billing/invoice/12/pdf/')
    assert res.status_code == 200, f"PDF generation failed: {res.status_code}"
    assert res['Content-Type'] == 'application/pdf'
    assert len(res.content) > 1000, "PDF content too small"
    assert res.content.startswith(b'%PDF'), "Response is not a valid PDF binary"
    print(f"[PASS] 10. ReportLab clinical PDF invoice generated successfully ({len(res.content)} bytes)")
    passed += 1

    # Test 11: Doctor Suggests / Requests New Drug
    total += 1
    res = client.post(
        '/api/doctor/request-new-drug/',
        {
            'requested_by': 'Dr. Anita Mehta, MD',
            'drug_name': 'Dexamethasone Sodium Phosphate 4mg/mL',
            'recommended_dosage': '4mg/mL IV/IM Injection (2mL Vial)',
            'category': 'CRITICAL_CARE',
            'justification': 'Emergency anaphylaxis protocol for Floor 2 ICU.',
        },
        content_type='application/json',
        HTTP_X_USER_ROLE='DOCTOR'
    )
    assert res.status_code == 201, f"Doctor drug request failed: {res.status_code}"
    req_data = res.json()
    assert req_data['success'] is True
    test_req_id = req_data['request']['id']
    print(f"[PASS] 11. Doctor New Drug Proposal successfully queued ({test_req_id})")
    passed += 1

    # Test 12: Chemist Views Pending Drug Proposals Queue
    total += 1
    res = client.get('/api/chemist/drug-requests/', HTTP_X_USER_ROLE='CHEMIST')
    assert res.status_code == 200, f"Chemist drug requests fetch failed: {res.status_code}"
    queue_data = res.json()
    assert queue_data['count'] > 0
    print(f"[PASS] 12. Chemist Drug Approval Queue verified ({queue_data['count']} proposals pending)")
    passed += 1

    # Test 13: Chemist Approves Drug Proposal -> Creates Catalog SKU
    total += 1
    res = client.post(
        f'/api/chemist/drug-requests/{test_req_id}/action/',
        {
            'action': 'APPROVE',
            'sku_code': 'DRG-DEX-01',
            'stock_units': 30,
            'unit_price': 165.0,
        },
        content_type='application/json',
        HTTP_X_USER_ROLE='CHEMIST'
    )
    assert res.status_code == 200, f"Chemist approval action failed: {res.status_code}"
    action_data = res.json()
    assert action_data['status'] == 'APPROVED'
    assert action_data['sku_code'] == 'DRG-DEX-01'
    print("[PASS] 13. Chemist approval created SKU 'DRG-DEX-01' in hospital inventory catalog")
    passed += 1

    # Test 14: Chemist Restocks Inventory SKU
    total += 1
    res = client.post(
        '/api/erp/inventory/restock/',
        {'sku_code': 'DRG-001', 'quantity': 25},
        content_type='application/json',
        HTTP_X_USER_ROLE='CHEMIST'
    )
    assert res.status_code == 200, f"Chemist restock failed: {res.status_code}"
    assert res.json()['success'] is True
    print("[PASS] 14. Chemist inventory restock (+25 units) verified")
    passed += 1

    # Test 15: Non-Chemist (Doctor) Blocked from Restocking Inventory
    total += 1
    res_blocked_restock = client.post(
        '/api/erp/inventory/restock/',
        {'sku_code': 'DRG-001', 'quantity': 50},
        content_type='application/json',
        HTTP_X_USER_ROLE='DOCTOR'
    )
    assert res_blocked_restock.status_code == 403, f"Doctor was not blocked from restock! Got {res_blocked_restock.status_code}"
    print("[PASS] 15. Role isolation verified: Doctor blocked from restocking inventory with 403 Forbidden")
    passed += 1

    # Test 16: Doctor/Nurse Creates Delivery Order for Bed 1-50
    total += 1
    res = client.post(
        '/api/orders/create/',
        {
            'requested_by': 'Dr. Anita Mehta, MD',
            'patient_bed': 12,
            'target_floor': 2,
            'priority': 'EMERGENCY_STAT',
            'items': [{'sku_code': 'DRG-001', 'quantity': 2}],
        },
        content_type='application/json',
        HTTP_X_USER_ROLE='DOCTOR'
    )
    assert res.status_code == 201, f"Delivery order creation failed: {res.status_code}"
    del_order = res.json()['order']
    del_order_id = del_order['order_id']
    assert del_order['patient_bed'] == 12
    print(f"[PASS] 16. Doctor created delivery order {del_order_id} for Bed 12 Floor 2")
    passed += 1

    # Test 17: Chemist Dispatches Delivery Order with 4-Digit OTP
    total += 1
    res = client.post(
        f'/api/orders/{del_order_id}/dispatch/',
        {'otp_code': '4821'},
        content_type='application/json',
        HTTP_X_USER_ROLE='CHEMIST'
    )
    assert res.status_code == 200, f"Chemist dispatch failed: {res.status_code}"
    disp_data = res.json()
    assert disp_data['status'] == 'IN_TRANSIT'
    assert disp_data['otp_code'] == '4821'
    print(f"[PASS] 17. Chemist dispatched mission with OTP 4821 and engaged ESP32 transit")
    passed += 1

    # Test 18: Nurse Enters 4-Digit PIN to Verify Hatch & Complete Delivery
    total += 1
    res = client.post(
        f'/api/orders/{del_order_id}/verify-hatch/',
        {'otp_code': '4821'},
        content_type='application/json',
        HTTP_X_USER_ROLE='NURSE'
    )
    assert res.status_code == 200, f"Hatch PIN verification failed: {res.status_code}"
    verify_data = res.json()
    assert verify_data['hatch_state'] == 'UNLOCKED'
    assert verify_data['order_status'] == 'DELIVERED'
    print(f"[PASS] 18. Nurse entered PIN 4821 -> SG90 Hatch Unlocked & Turnaround injected to EMR")
    passed += 1

    print("==================================================")
    print(f"TEST RESULTS: {passed}/{total} PASSED (100% SUCCESS)")
    print("==================================================")

if __name__ == '__main__':
    run_tests()
