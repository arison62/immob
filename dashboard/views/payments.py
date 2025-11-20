# dashboard/views/payments.py
from django.views import View
from inertia import render as render_inertia
from finance.services.payment_service import payment_service
from finance.services.dtos import PaymentCreateDTO, PaymentUpdateDTO
from pydantic import ValidationError
from core.utils import format_pydantic_errors
from django.shortcuts import redirect
from django.http import JsonResponse
from uuid import UUID
import json

class PaymentsView(View):
    def get(self, request):
        payments = payment_service.list_payments_for_workspace(request.user)
        return render_inertia(request, 'Payments/index', {
            'payments': list(payments)
        })

    def post(self, request):
        try:
            data = json.loads(request.body)
            payment_dto = PaymentCreateDTO(**data)
            payment_service.create_payment(request.user, payment_dto, request)
            return redirect('dashboard:payments')
        except (ValidationError, json.JSONDecodeError) as e:
            errors = format_pydantic_errors(e.errors()) if isinstance(e, ValidationError) else {'error': str(e)}
            payments = payment_service.list_payments_for_workspace(request.user)
            return render_inertia(request, 'Payments/index', {'errors': errors, 'payments': list(payments)}, status=400)
        except Exception as e:
            payments = payment_service.list_payments_for_workspace(request.user)
            return render_inertia(request, 'Payments/index', {'errors': str(e), 'payments': list(payments)}, status=400)

class PaymentEditView(View):
    def get(self, request, payment_id: UUID):
        payment = payment_service.get_payment_details(request.user, payment_id)
        return render_inertia(request, 'Payments/edit', {'payment': payment})

    def post(self, request, payment_id: UUID):
        try:
            data = json.loads(request.body)
            payment_dto = PaymentUpdateDTO(**data)
            payment_service.update_payment_status(request.user, payment_id, payment_dto, request)
            return redirect('dashboard:payments')
        except (ValidationError, json.JSONDecodeError) as e:
            errors = format_pydantic_errors(e.errors()) if isinstance(e, ValidationError) else {'error': str(e)}
            payment = payment_service.get_payment_details(request.user, payment_id)
            return render_inertia(request, 'Payments/edit', {'errors': errors, 'payment': payment}, status=400)
        except Exception as e:
            payment = payment_service.get_payment_details(request.user, payment_id)
            return render_inertia(request, 'Payments/edit', {'errors': str(e), 'payment': payment}, status=400)

def payment_delete_view(request, payment_id: UUID):
    if request.method == 'DELETE':
        try:
            payment_service.delete_payment(request.user, payment_id, request)
            return JsonResponse({}, status=204)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
