from django.urls import path
from .views import (
    RobotTelemetryView,
    UnlockHatchWithTurnaroundBillingView,
    LidarBlackBoxView,
    ElevatorHandshakeView,
)

urlpatterns = [
    path('telemetry/', RobotTelemetryView.as_view(), name='robot-telemetry'),
    path('telemetry/update/', RobotTelemetryView.as_view(), name='robot-telemetry-update'),
    path('orders/<str:order_id>/unlock-hatch/', UnlockHatchWithTurnaroundBillingView.as_view(), name='robot-unlock-hatch'),
    path('black-box/', LidarBlackBoxView.as_view(), name='robot-black-box'),
    path('elevator-handshake/', ElevatorHandshakeView.as_view(), name='robot-elevator-handshake'),
    path('elevator-handshake/call/', ElevatorHandshakeView.as_view(), name='robot-elevator-call'),
]
