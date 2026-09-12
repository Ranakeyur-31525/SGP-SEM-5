from django.urls import path
from .views import (
    InventoryListView,
    InventoryDispenseView,
    InventoryLowStockView,
    InventoryAddView,
    InventoryRestockView,
    DoctorRequestNewDrugView,
    ChemistDrugRequestsListView,
    ChemistDrugRequestActionView,
    DeliveryOrderCreateView,
    DeliveryOrderDispatchView,
    DeliveryOrderVerifyHatchView,
    PharmacyOrderView,
    OrderSubmitCalculationView,
)

urlpatterns = [
    # Inventory CRUD & Restock
    path('inventory/', InventoryListView.as_view(), name='erp-inventory'),
    path('inventory/add/', InventoryAddView.as_view(), name='erp-inventory-add'),
    path('inventory/restock/', InventoryRestockView.as_view(), name='erp-inventory-restock'),
    path('inventory/dispense/', InventoryDispenseView.as_view(), name='erp-dispense'),
    path('inventory/low-stock/', InventoryLowStockView.as_view(), name='erp-low-stock'),

    # Doctor Drug Suggestions & Chemist Queue
    path('doctor/request-new-drug/', DoctorRequestNewDrugView.as_view(), name='doctor-request-drug'),
    path('chemist/drug-requests/', ChemistDrugRequestsListView.as_view(), name='chemist-drug-requests'),
    path('chemist/drug-requests/<str:request_id>/action/', ChemistDrugRequestActionView.as_view(), name='chemist-drug-action'),

    # Bed Delivery Orders Lifecycle
    path('orders/create/', DeliveryOrderCreateView.as_view(), name='delivery-order-create'),
    path('orders/<str:order_id>/dispatch/', DeliveryOrderDispatchView.as_view(), name='delivery-order-dispatch'),
    path('orders/<str:order_id>/verify-hatch/', DeliveryOrderVerifyHatchView.as_view(), name='delivery-order-verify-hatch'),

    # Legacy Pharmacy Orders
    path('orders/pharmacy-request/', PharmacyOrderView.as_view(), name='erp-pharmacy-order'),
    path('orders/<str:order_id>/submit-calculation/', OrderSubmitCalculationView.as_view(), name='erp-submit-calc'),
]
