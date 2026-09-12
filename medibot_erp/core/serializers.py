from rest_framework import serializers
from .models import MedicalProposal, IoTLiftBridge, BedAllocation, InventorySKU


class MedicalProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalProposal
        fields = '__all__'


class IoTLiftBridgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = IoTLiftBridge
        fields = '__all__'


class BedAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BedAllocation
        fields = '__all__'


class InventorySKUSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventorySKU
        fields = '__all__'


class UserRBACSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=64, required=False)
    name = serializers.CharField(max_length=128)
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=['DOCTOR', 'NURSE', 'CHEMIST', 'PATIENT', 'ADMIN', 'PEON'])
    department = serializers.CharField(max_length=128, required=False, allow_blank=True)
    is_active = serializers.BooleanField(default=True)
    assigned_bed = serializers.IntegerField(required=False, allow_null=True)
    allocated_floor = serializers.IntegerField(required=False, allow_null=True)
