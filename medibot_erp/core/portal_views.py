"""
Views for the MEDIBOT Enterprise Backend Operations Console & Live Database Explorer.
Provides single-page dashboard rendering, live database queries, snapshot management,
and interactive hardware actuation endpoints.
"""

from datetime import datetime
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from backup_manager import (
    get_system_stats,
    get_collection_data,
    export_all_collections,
    generate_backup_zip,
    restore_from_backup,
    KNOWN_COLLECTIONS,
)
from core.db import get_telemetry_col


class BackendPortalView(APIView):
    """
    GET /
    Renders the unified Single-Page Developer, Database & Operations Console.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        stats = get_system_stats()
        return render(request, 'backend_portal.html', {
            'stats': stats,
            'collections': KNOWN_COLLECTIONS,
            'timestamp': datetime.utcnow().isoformat(),
        })


class PortalStatsView(APIView):
    """
    GET /api/erp/portal/stats/
    Returns live statistics of all 7 hospital collections, MongoDB health, and telemetry.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        stats = get_system_stats()
        return Response(stats)


class CollectionDataView(APIView):
    """
    GET /api/erp/portal/collection/<str:collection_name>/
    Query documents of any hospital collection with instant search and pagination.
    """
    permission_classes = [AllowAny]

    def get(self, request, collection_name):
        search = request.GET.get('search', '').strip()
        try:
            limit = int(request.GET.get('limit', 50))
        except ValueError:
            limit = 50
        try:
            skip = int(request.GET.get('skip', 0))
        except ValueError:
            skip = 0

        data = get_collection_data(collection_name, limit=limit, skip=skip, search=search)
        return Response(data)


class BackupExportView(APIView):
    """
    POST /api/erp/portal/export/
    Triggers export of all collections to JSON files & creates a snapshot.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            result = export_all_collections(create_snapshot=True)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e), 'status': 'failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BackupDownloadView(APIView):
    """
    GET /api/erp/portal/download/
    Generates and streams a .zip archive containing all collection JSON backups.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            zip_buffer = generate_backup_zip()
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
            response['Content-Disposition'] = f'attachment; filename="medibot_db_backup_{timestamp}.zip"'
            return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BackupSeedView(APIView):
    """
    POST /api/erp/portal/seed/
    Restores / seeds the clean hospital database (50 Beds, 160+ SKUs, Staff, Telemetry).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            result = restore_from_backup()
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e), 'status': 'failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HardwareSimulateView(APIView):
    """
    POST /api/erp/portal/hardware/actuate/
    Allows interactive testing of hardware actuators directly from the portal:
    - SG90 deadbolt hatch angle (0° LOCKED, 90° UNLOCKED)
    - Elevator floor relay dispatch (1 to 5)
    - TF-Luna LiDAR obstacle distance simulation (cm)
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data or {}
        telemetry_col = get_telemetry_col()

        action = data.get('action')
        updated_fields = {}

        if action == 'toggle_deadbolt':
            angle = int(data.get('angle', 0))
            is_locked = angle == 0
            updated_fields = {
                'servo_angle_deg': angle,
                'hatch_locked': is_locked,
                'hatch_status': 'DEADBOLT_LOCKED' if is_locked else 'HATCH_OPEN',
            }
        elif action == 'elevator_dispatch':
            target_floor = int(data.get('floor', 1))
            updated_fields = {
                'current_floor': target_floor,
                'elevator_relay_state': f'RELAY_ACTIVE_FLOOR_{target_floor}',
            }
        elif action == 'simulate_lidar':
            distance_cm = float(data.get('distance_cm', 120.0))
            is_obstacle = distance_cm < 40.0
            updated_fields = {
                'lidar_distance_cm': distance_cm,
                'obstacle_detected': is_obstacle,
                'navigation_state': 'EMERGENCY_STOP' if is_obstacle else 'PATH_CLEAR',
            }
        else:
            return Response({'error': f"Unknown action '{action}'"}, status=status.HTTP_400_BAD_REQUEST)

        # Update telemetry record
        telemetry_col.update_one({'robot_id': 'medibot_rover_01'}, {'$set': updated_fields})
        record = telemetry_col.find_one({'robot_id': 'medibot_rover_01'}) or updated_fields

        return Response({
            'status': 'success',
            'action': action,
            'updated': updated_fields,
            'telemetry': record,
            'timestamp': datetime.utcnow().isoformat(),
        })
