from django.urls import path

from .views.dashboard import DashboardView, get_global_permissions
from .views.teams import TeamsView
from .views.properties import PropertiesView
from .views.contrats import ContratsView
from .views.tenants import TenantsView, TenantEditView, tenant_delete_view
from .views.finances import FinancesView
from .views.maintenances import MaintenancesView
from .views.payments import PaymentsView

urlpatterns = [
   path("", DashboardView.as_view(), name="dashboard"),
   path("teams/", TeamsView.as_view(), name="teams"),
   path("properties/", PropertiesView.as_view(), name="properties"),
   path("contrats/", ContratsView.as_view(), name="contrats"),
   path("contrats/<uuid:contrat_id>/edit/", ContratEditView.as_view(), name="contrat-edit"),
   path("contrats/<uuid:contrat_id>/delete/", contrat_delete_view, name="contrat-delete"),
   path("tenants/", TenantsView.as_view(), name="tenants"),
   path("tenants/<uuid:tenant_id>/edit/", TenantEditView.as_view(), name="tenant-edit"),
   path("tenants/<uuid:tenant_id>/delete/", tenant_delete_view, name="tenant-delete"),
   path("finances/", FinancesView.as_view(), name="finances"),
   path("payments/", PaymentsView.as_view(), name="payments"),
   path("payments/<uuid:payment_id>/edit/", PaymentEditView.as_view(), name="payment-edit"),
   path("payments/<uuid:payment_id>/delete/", payment_delete_view, name="payment-delete"),
   path("maintenances/", MaintenancesView.as_view(), name="maintenances"),
   path("permissions/", get_global_permissions, name="get_global_permissions"),
]
