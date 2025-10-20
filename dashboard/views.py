from inertia import render as render_inertia
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin


class DashboardView(LoginRequiredMixin, View):
    login_url = "/accounts/login"

    def get(self, request):
        return render_inertia(request, "dashboard/Index")
