from inertia import defer, render as render_inertia
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.http.response import JsonResponse
from accounts.services.team_service import team_service
from finance.services.tenant_service import tenant_service
from finance.services.contrat_service import contrat_service
from holdings.services.property_service import property_service
from accounts.services.access_services import AccessControlService


class DashboardView(LoginRequiredMixin, View):
    login_url = "/accounts/login"

    def get(self, request):
        users = team_service.list_team_members(acting_user=request.user)
        tenants = tenant_service.list_tenants_for_workspace(request.user)
        contrats = contrat_service.list_contrats_for_workspace(request.user)
        properties = property_service.list_all_properties_for_user(request.user)

        return render_inertia(request, "dashboard/Index", {
            "users": defer(users, merge=True),
            "tenants": defer(tenants, merge=True),
            "properties": defer(properties, merge=True),
            "contrats": defer(contrats, merge=True)
        })


@login_required(login_url="/accounts/login")
def get_global_permissions(request, *args, **kwargs):
   
    permissions = AccessControlService.get_global_permission(request.user)
    return JsonResponse(permissions)