from inertia import render as render_inertia
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.http.response import JsonResponse
from accounts.services.access_services import AccessControlService


class BuildingsView(LoginRequiredMixin, View):
    login_url = "/accounts/login"

    def get(self, request):
        return render_inertia(request, "dashboard/Buildings")

