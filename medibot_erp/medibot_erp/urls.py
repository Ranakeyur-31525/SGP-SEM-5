from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter

from core.portal_views import (
    BackendPortalView,
    PortalStatsView,
    CollectionDataView,
    BackupExportView,
    BackupDownloadView,
    BackupSeedView,
    HardwareSimulateView,
)
from core.views import (
    MedicalProposalViewSet,
    IoTLiftBridgeViewSet,
    BedAllocationViewSet,
    InventorySKUViewSet,
    UserRBACViewSet,
)

router = DefaultRouter()
router.register('proposals', MedicalProposalViewSet, basename='proposals')
router.register('lift-bridge', IoTLiftBridgeViewSet, basename='lift-bridge')
router.register('beds', BedAllocationViewSet, basename='beds')
router.register('skus', InventorySKUViewSet, basename='skus')
router.register('rbac', UserRBACViewSet, basename='rbac')

def api_health(request):
    return JsonResponse({
        'status': 'HEALTHY',
        'service': 'MEDIBOT Hospital Logistics Cloud ERP',
        'version': '3.0.0',
        'subsystems': {
            'mongodb': 'ACTIVE',
            'tf_luna_lidar_bridge': '100Hz ONLINE',
            'sg90_servo_deadbolt': 'LINKED',
            'elevator_optocoupler_relays': '5 FLOORS LINKED',
            'patient_bed_isolation': 'ENFORCED (BED 12)',
            'chemist_inventory_gate': 'ENFORCED (CHEMIST ONLY)',
            'doctor_drug_proposal_queue': 'ACTIVE',
        }
    })

urlpatterns = [
    # Single-Page Enterprise Backend & Database Operations Console
    path('', BackendPortalView.as_view(), name='backend-portal'),

    # Live Database Explorer & Backup Manager APIs
    path('api/erp/portal/stats/', PortalStatsView.as_view(), name='portal-stats'),
    path('api/erp/portal/collection/<str:collection_name>/', CollectionDataView.as_view(), name='portal-collection'),
    path('api/erp/portal/export/', BackupExportView.as_view(), name='portal-export'),
    path('api/erp/portal/download/', BackupDownloadView.as_view(), name='portal-download'),
    path('api/erp/portal/seed/', BackupSeedView.as_view(), name='portal-seed'),
    path('api/erp/portal/hardware/actuate/', HardwareSimulateView.as_view(), name='portal-hardware-actuate'),

    # Core Model ViewSets
    path('api/erp/', include(router.urls)),

    # Core Hospital ERP APIs
    path('admin/', admin.site.urls),
    path('api/health/', api_health, name='api-health'),
    path('api/auth/', include('users.urls')),
    path('api/profile/', include('users.urls')),
    path('api/users/', include('users.urls')),
    path('api/', include('pharmacy.urls')),
    path('api/erp/', include('pharmacy.urls')),
    path('api/robot/', include('robot.urls')),
    path('api/erp/billing/', include('billing.urls')),
]
