# dashboard/views/contrats.py
from django.views import View
from inertia import Inertia

class ContratsView(View):
    def get(self, request):
        return Inertia.render('Contrats/index', {})
