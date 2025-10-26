from django.urls import path

from .views import DashboardView, get_global_permissions

urlpatterns = [
   path("", DashboardView.as_view(), name="dashboard"),
   path("permissions/", get_global_permissions, name="get_global_permissions"),
]
