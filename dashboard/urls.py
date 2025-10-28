from django.urls import path

from .views.dashboard import DashboardView, get_global_permissions
from .views.teams import TeamsView
from .views.buildings import BuildingsView
from .views.properties import PropertiesView
from .views.contrats import ContratsView
from .views.tenants import TenantsView
from .views.finances import FinancesView
from .views.maintenances import MaintenancesView

urlpatterns = [
   path("", DashboardView.as_view(), name="dashboard"),
   path("teams/", TeamsView.as_view(), name="teams"),
   path("buildings/", BuildingsView.as_view(), name="buildings"),
   path("properties/", PropertiesView.as_view(), name="properties"),
   path("contrats/", ContratsView.as_view(), name="contrats"),
   path("tenants/", TenantsView.as_view(), name="tenants"),
   path("finances/", FinancesView.as_view(), name="finances"),
   path("maintenances/", MaintenancesView.as_view(), name="maintenances"),
   path("permissions/", get_global_permissions, name="get_global_permissions"),
]
