# dashboard/views/payments.py
from django.views import View
from inertia import Inertia

class PaymentsView(View):
    def get(self, request):
        return Inertia.render('Payments/index', {})
