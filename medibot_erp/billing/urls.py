from django.urls import path
from .views import PatientBillingView, SettleBillView, InvoicePdfDownloadView, DischargeRequestView

urlpatterns = [
    path('patient/<int:bed_id>/', PatientBillingView.as_view(), name='erp-patient-billing'),
    path('patient/<int:bed_id>/settle/', SettleBillView.as_view(), name='erp-patient-settle'),
    path('patient/<int:bed_id>/request-discharge/', DischargeRequestView.as_view(), name='erp-patient-request-discharge'),
    path('invoice/<int:bed_id>/pdf/', InvoicePdfDownloadView.as_view(), name='erp-invoice-pdf'),
]
