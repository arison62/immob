# dashboard/views/payments.py
from django.views import View
from inertia import render as render_inertia
from finance.services.payment_service import payment_service
from finance.services.dtos import PaymentCreateDTO, PaymentUpdateDTO
from pydantic import ValidationError
from core.utils import format_pydantic_errors
from django.shortcuts import redirect
from django.contrib import messages
from uuid import UUID
import json

class PaymentsView(View):

    def _parse_request_data(self, request):
        if request.body:
            return json.loads(request.body)
        return {}

    def get(self, request):
        payments = payment_service.list_payments_for_workspace(request.user)
        return render_inertia(request, 'Payments/index', {
            'payments': list(payments)
        })

    def post(self, request):
        try:
            data = self._parse_request_data(request)
            payment_dto = PaymentCreateDTO(**data)
            payment_service.create_payment(request.user, payment_dto, request)
            messages.success(request, "Paiement créé avec succès.")
            return redirect('dashboard:payments')
        except (ValidationError, Exception) as e:
            error_message = str(e)
            if isinstance(e, ValidationError):
                error_message = format_pydantic_errors(e.errors())
            messages.error(request, f"Erreur lors de la création : {error_message}")
            return redirect('dashboard:payments')

    def put(self, request):
        try:
            data = self._parse_request_data(request)
            payment_id = data.get('id')
            if not payment_id:
                raise ValueError("ID du paiement manquant pour la mise à jour.")

            payment_dto = PaymentUpdateDTO(**data)
            payment_service.update_payment_status(request.user, UUID(payment_id), payment_dto, request)
            messages.success(request, "Paiement mis à jour avec succès.")
            return redirect('dashboard:payments')
        except (ValidationError, Exception) as e:
            error_message = str(e)
            if isinstance(e, ValidationError):
                error_message = format_pydantic_errors(e.errors())
            messages.error(request, f"Erreur lors de la mise à jour : {error_message}")
            return redirect('dashboard:payments')

    def delete(self, request):
        try:
            data = self._parse_request_data(request)
            payment_id = data.get('id')
            if not payment_id:
                raise ValueError("ID du paiement manquant pour la suppression.")

            payment_service.delete_payment(request.user, UUID(payment_id), request)
            messages.success(request, "Paiement supprimé avec succès.")
            return redirect('dashboard:payments')
        except Exception as e:
            messages.error(request, f"Erreur lors de la suppression : {str(e)}")
            return redirect('dashboard:payments')
