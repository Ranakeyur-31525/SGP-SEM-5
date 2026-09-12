from django.db import models


class MedicalProposal(models.Model):
    """
    Doctor & Nurse clinical drug proposals queue.
    Chemist reviews, approves, and assigns inventory SKU & loading parameters.
    """
    STATUS_CHOICES = [
        ('PENDING_CHEMIST', 'Pending Chemist Review'),
        ('APPROVED', 'Approved by Chemist'),
        ('LOADED', 'Cargo Loaded in Bot'),
        ('IN_TRANSIT', 'In Autonomous Transit'),
        ('DELIVERED', 'Delivered to Bedside'),
        ('REJECTED', 'Rejected'),
    ]

    proposal_id = models.CharField(max_length=64, unique=True)
    requested_by = models.CharField(max_length=128)
    requested_by_role = models.CharField(max_length=32, default='DOCTOR')
    drug_name = models.CharField(max_length=255)
    recommended_dosage = models.CharField(max_length=128, default='Standard Clinical Dose')
    category = models.CharField(max_length=64, default='CRITICAL_CARE')
    target_floor = models.IntegerField(default=2)
    target_bed = models.IntegerField(default=12)
    justification = models.TextField(blank=True, default='')
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='PENDING_CHEMIST')
    passcode_otp = models.CharField(max_length=8, default='4821')
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.CharField(max_length=128, blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"[{self.proposal_id}] {self.drug_name} -> Bed {self.target_bed} ({self.status})"


class IoTLiftBridge(models.Model):
    """
    Hardware bridge monitoring ESP32 multi-floor elevator optocoupler relays,
    cabin alignment, and safety handshake state across Floors 1–5.
    """
    bridge_id = models.CharField(max_length=64, unique=True, default='LIFT-MAIN')
    active_relay_floor = models.IntegerField(default=2)
    transit_status = models.CharField(max_length=64, default='LEVEL')
    door_status = models.CharField(max_length=64, default='CLOSED')
    is_interlocked = models.BooleanField(default=True)
    pulse_duration_ms = models.IntegerField(default=500)
    last_actuation = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Elevator Bridge: Floor {self.active_relay_floor} | Doors: {self.door_status}"


class BedAllocation(models.Model):
    """
    50-Bed intra-hospital registry mapping inpatient admissions,
    real-time alert triage, and turnaround billing fees.
    """
    bed_number = models.IntegerField(unique=True)
    floor = models.IntegerField(default=1)
    ward = models.CharField(max_length=128, default='Cardiology Ward')
    patient_name = models.CharField(max_length=128, blank=True, null=True)
    patient_mrn = models.CharField(max_length=64, blank=True, null=True)
    is_occupied = models.BooleanField(default=False)
    active_alert = models.CharField(max_length=64, blank=True, null=True)
    turnaround_billing_incurred = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Bed #{self.bed_number} (Floor {self.floor}) - {self.patient_name or 'Vacant'}"


class InventorySKU(models.Model):
    """
    Master hospital formulary drug catalog (160+ SKUs)
    with dual-threshold low stock limits and unit pricing.
    """
    sku_code = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=64, default='CRITICAL_CARE')
    dosage = models.CharField(max_length=128)
    quantity = models.IntegerField(default=20)
    unit = models.CharField(max_length=32, default='vials')
    price_per_unit = models.DecimalField(max_digits=8, decimal_places=2, default=150.00)
    min_threshold_percent = models.IntegerField(default=20)
    absolute_floor_units = models.IntegerField(default=15)
    is_high_risk = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.sku_code}] {self.name} ({self.quantity} {self.unit})"
