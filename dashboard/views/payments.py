# dashboard/views/payments.py
from django.views import View
from inertia import Inertia
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
        return Inertia.render('Payments/index', {
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
            return Inertia.render('Payments/index', {'errors': errors}, status=400)
        except Exception as e:
            return Inertia.render('Payments/index', {'errors': str(e)}, status=400)

class PaymentEditView(View):
    def get(self, request, payment_id: UUID):
        payment = payment_service.get_payment_details(request.user, payment_id)
        return Inertia.render('Payments/edit', {'payment': payment})

    def post(self, request, payment_id: UUID):
        try:
            data = json.loads(request.body)
            payment_dto = PaymentUpdateDTO(**data)
            payment_service.update_payment_status(request.user, payment_id, payment_dto, request)
            return redirect('dashboard:payments')
        except (ValidationError, json.JSONDecodeError) as e:
            errors = format_pydantic_errors(e.errors()) if isinstance(e, ValidationError) else {'error': str(e)}
            return Inertia.render('Payments/edit', {'errors': errors}, status=400)
        except Exception as e:
            return Inertia.render('Payments/edit', {'errors': str(e)}, status=400)

def payment_delete_view(request, payment_id: UUID):
    if request.method == 'DELETE':
        try:
            payment_service.delete_payment(request.user, payment_id, request)
            return JsonResponse({}, status=204)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
