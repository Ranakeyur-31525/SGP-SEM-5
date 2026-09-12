import datetime
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import MedicalProposal, IoTLiftBridge, BedAllocation, InventorySKU
from .serializers import (
    MedicalProposalSerializer,
    IoTLiftBridgeSerializer,
    BedAllocationSerializer,
    InventorySKUSerializer,
    UserRBACSerializer,
)
from core.db import (
    get_drug_requests_col,
    get_inventory_col,
    get_users_col,
    get_telemetry_col,
)


class MedicalProposalViewSet(viewsets.ModelViewSet):
    """
    CRUD for Doctor & Nurse Medical Proposals.
    Includes Chemist Approve and Reject actions.
    """
    queryset = MedicalProposal.objects.all().order_by('-created_at')
    serializer_class = MedicalProposalSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'proposal_id' not in data:
            data['proposal_id'] = f"PROP-{datetime.datetime.now().strftime('%M%S')}"

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Sync to MongoDB collection
        try:
            col = get_drug_requests_col()
            col.insert_one({
                'request_id': data['proposal_id'],
                'drug_name': data.get('drug_name'),
                'recommended_dosage': data.get('recommended_dosage', 'Standard Clinical Dose'),
                'category': data.get('category', 'CRITICAL_CARE'),
                'requested_by': data.get('requested_by'),
                'target_bed': data.get('target_bed', 12),
                'target_floor': data.get('target_floor', 2),
                'justification': data.get('justification', ''),
                'status': 'PENDING',
                'created_at': datetime.datetime.now().strftime('%I:%M %p'),
            })
        except Exception:
            pass

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve_proposal(self, request, pk=None):
        proposal = self.get_object()
        chemist_name = request.data.get('chemist_name', 'Rahul Verma (R.Ph)')

        proposal.status = 'APPROVED'
        proposal.reviewed_by = chemist_name
        proposal.reviewed_at = datetime.datetime.now()
        proposal.save()

        # Update MongoDB
        try:
            col = get_drug_requests_col()
            col.update_one(
                {'request_id': proposal.proposal_id},
                {'$set': {'status': 'APPROVED', 'reviewed_by': chemist_name}}
            )
        except Exception:
            pass

        return Response({
            'success': True,
            'message': f"Proposal {proposal.proposal_id} approved. Added to hospital catalog.",
            'proposal': MedicalProposalSerializer(proposal).data,
        })

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_proposal(self, request, pk=None):
        proposal = self.get_object()
        chemist_name = request.data.get('chemist_name', 'Rahul Verma (R.Ph)')
        reason = request.data.get('reason', 'Formulary alternative available.')

        proposal.status = 'REJECTED'
        proposal.reviewed_by = chemist_name
        proposal.reviewed_at = datetime.datetime.now()
        proposal.save()

        try:
            col = get_drug_requests_col()
            col.update_one(
                {'request_id': proposal.proposal_id},
                {'$set': {'status': 'REJECTED', 'reviewed_by': chemist_name, 'reason': reason}}
            )
        except Exception:
            pass

        return Response({
            'success': True,
            'message': f"Proposal {proposal.proposal_id} rejected.",
            'proposal': MedicalProposalSerializer(proposal).data,
        })


class IoTLiftBridgeViewSet(viewsets.ModelViewSet):
    """
    CRUD & Hardware actuation for 5-floor elevator optocoupler relays.
    """
    queryset = IoTLiftBridge.objects.all()
    serializer_class = IoTLiftBridgeSerializer

    @action(detail=False, methods=['get', 'post'], url_path='telemetry')
    def lift_telemetry(self, request):
        if request.method == 'GET':
            bridge, _ = IoTLiftBridge.objects.get_or_create(bridge_id='LIFT-MAIN')
            return Response(IoTLiftBridgeSerializer(bridge).data)

        # POST actuation
        target_floor = int(request.data.get('target_floor', 2))
        bridge, _ = IoTLiftBridge.objects.get_or_create(bridge_id='LIFT-MAIN')
        bridge.active_relay_floor = target_floor
        bridge.door_status = request.data.get('door_status', 'CLOSED')
        bridge.is_interlocked = True
        bridge.save()

        # Update Robot Telemetry in MongoDB
        try:
            t_col = get_telemetry_col()
            t_col.update_one(
                {'robot_id': 'MB-01'},
                {'$set': {
                    'current_floor': target_floor,
                    'elevator_handshake.active_relay_floor': target_floor,
                    'elevator_handshake.is_interlocked': True,
                }}
            )
        except Exception:
            pass

        return Response({
            'success': True,
            'message': f"Elevator optocoupler relay pulsed for Floor {target_floor}.",
            'bridge': IoTLiftBridgeSerializer(bridge).data,
        })


class BedAllocationViewSet(viewsets.ModelViewSet):
    """
    50-Bed Ward Registry and Occupancy Matrix.
    """
    queryset = BedAllocation.objects.all().order_by('bed_number')
    serializer_class = BedAllocationSerializer

    @action(detail=False, methods=['get'], url_path='seed-50-beds')
    def seed_beds(self, request):
        """Pre-populate Beds 1 through 50 if table is empty."""
        count = BedAllocation.objects.count()
        if count < 50:
            for b in range(1, 51):
                fl = (b - 1) // 10 + 1
                is_occ = b <= 36
                BedAllocation.objects.get_or_create(
                    bed_number=b,
                    defaults={
                        'floor': fl,
                        'ward': f"Floor {fl} Ward",
                        'is_occupied': is_occ,
                        'patient_name': 'Ramesh Sharma' if b == 12 else (f"Inpatient #{b}" if is_occ else None),
                        'patient_mrn': f"MRN-2026-08{b:02d}" if is_occ else None,
                    }
                )
        return Response({'success': True, 'total_beds': BedAllocation.objects.count()})


class InventorySKUViewSet(viewsets.ModelViewSet):
    """
    CRUD for Master Inventory SKUs.
    """
    queryset = InventorySKU.objects.all().order_by('sku_code')
    serializer_class = InventorySKUSerializer


class UserRBACViewSet(viewsets.ViewSet):
    """
    User provisioning, directory inspection, and status toggle.
    """
    def list(self, request):
        col = get_users_col()
        users = list(col.find({}))
        cleaned = [{k: str(v) if k == '_id' else v for k, v in u.items()} for u in users]
        return Response(cleaned)

    def create(self, request):
        serializer = UserRBACSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        col = get_users_col()

        user_doc = serializer.validated_data.copy()
        user_doc['id'] = f"usr_{datetime.datetime.now().strftime('%M%S')}"
        col.insert_one(user_doc)

        return Response({
            'success': True,
            'message': f"Staff user {user_doc['name']} created.",
            'user': user_doc,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='toggle-status')
    def toggle_status(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)

        col = get_users_col()
        user = col.find_one({'id': user_id})
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = not user.get('is_active', True)
        col.update_one({'id': user_id}, {'$set': {'is_active': new_status}})

        return Response({
            'success': True,
            'user_id': user_id,
            'is_active': new_status,
        })
