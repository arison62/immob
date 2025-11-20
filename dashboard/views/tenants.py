# dashboard/views/tenants.py
from django.views import View
from inertia import Inertia

class TenantsView(View):
    def get(self, request):
        return Inertia.render('Tenants/index', {})
