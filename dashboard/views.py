from inertia import render as render_inertia
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.http.response import JsonResponse
from accounts.services import AccessControlService


class DashboardView(LoginRequiredMixin, View):
    login_url = "/accounts/login"

    def get(self, request):
        return render_inertia(request, "dashboard/Index")


@login_required(login_url="/accounts/login")
def get_global_permissions(request, *args, **kwargs):
   
    permissions = AccessControlService.get_global_permission(request.user)
    return JsonResponse(permissions)