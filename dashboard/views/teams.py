from inertia import defer, render as render_inertia
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models.functions import Concat
from django.db.models import Value 
from accounts.models import ImmobUser


class TeamsView(LoginRequiredMixin, View):
    login_url = "/accounts/login"

    def get(self, request):
        # TODO: Implement pagination and filtering later
        # TODO: Implement search functionality later
        user = ImmobUser.objects.all()

        return render_inertia(request, "dashboard/Teams", {
            "users": defer(lambda: user)
        })
    
    def post(self, request):
        # Handle user creation logic here
        return render_inertia(request, "dashboard/Teams", {
            "users" : defer(lambda: [], merge=True)
        })

