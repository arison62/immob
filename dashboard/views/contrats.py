# dashboard/views/contrats.py
from django.views import View
from inertia import Inertia
from finance.services.contrat_service import contrat_service
from finance.services.dtos import ContratCreateDTO, ContratUpdateDTO
from pydantic import ValidationError
from core.utils import format_pydantic_errors
from django.shortcuts import redirect
from django.http import JsonResponse
from uuid import UUID
import json

class ContratsView(View):
    def get(self, request):
        contrats = contrat_service.list_contrats_for_workspace(request.user)
        return Inertia.render('Contrats/index', {
            'contrats': list(contrats)
        })

    def post(self, request):
        try:
            data = json.loads(request.body)
            contrat_dto = ContratCreateDTO(**data)
            contrat_service.create_contrat(request.user, contrat_dto, request)
            return redirect('dashboard:contrats')
        except (ValidationError, json.JSONDecodeError) as e:
            errors = format_pydantic_errors(e.errors()) if isinstance(e, ValidationError) else {'error': str(e)}
            return Inertia.render('Contrats/index', {'errors': errors}, status=400)
        except Exception as e:
            return Inertia.render('Contrats/index', {'errors': str(e)}, status=400)

class ContratEditView(View):
    def get(self, request, contrat_id: UUID):
        contrat = contrat_service.get_contrat_details(request.user, contrat_id)
        return Inertia.render('Contrats/edit', {'contrat': contrat})

    def post(self, request, contrat_id: UUID):
        try:
            data = json.loads(request.body)
            contrat_dto = ContratUpdateDTO(**data)
            contrat_service.update_contrat(request.user, contrat_id, contrat_dto, request)
            return redirect('dashboard:contrats')
        except (ValidationError, json.JSONDecodeError) as e:
            errors = format_pydantic_errors(e.errors()) if isinstance(e, ValidationError) else {'error': str(e)}
            return Inertia.render('Contrats/edit', {'errors': errors}, status=400)
        except Exception as e:
            return Inertia.render('Contrats/edit', {'errors': str(e)}, status=400)

def contrat_delete_view(request, contrat_id: UUID):
    if request.method == 'DELETE':
        try:
            contrat_service.delete_contrat(request.user, contrat_id, request)
            return JsonResponse({}, status=204)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
