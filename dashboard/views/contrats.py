# dashboard/views/contrats.py
from django.views import View
from inertia import render as render_inertia
from finance.services.contrat_service import contrat_service
from finance.services.dtos import ContratCreateDTO, ContratUpdateDTO
from pydantic import ValidationError
from core.utils import format_pydantic_errors
from django.shortcuts import redirect
from django.contrib import messages
from uuid import UUID
import json

class ContratsView(View):

    def _parse_request_data(self, request):
        if request.body:
            return json.loads(request.body)
        return {}

    def get(self, request):
        contrats = contrat_service.list_contrats_for_workspace(request.user)
        return render_inertia(request, 'Contrats/index', {
            'contrats': list(contrats)
        })

    def post(self, request):
        try:
            data = self._parse_request_data(request)
            contrat_dto = ContratCreateDTO(**data)
            contrat_service.create_contrat(request.user, contrat_dto, request)
            messages.success(request, "Contrat créé avec succès.")
            return redirect('dashboard:contrats')
        except (ValidationError, Exception) as e:
            error_message = str(e)
            if isinstance(e, ValidationError):
                error_message = format_pydantic_errors(e.errors())
            messages.error(request, f"Erreur lors de la création : {error_message}")
            return redirect('dashboard:contrats')

    def put(self, request):
        try:
            data = self._parse_request_data(request)
            contrat_id = data.get('id')
            if not contrat_id:
                raise ValueError("ID du contrat manquant pour la mise à jour.")

            contrat_dto = ContratUpdateDTO(**data)
            contrat_service.update_contrat(request.user, UUID(contrat_id), contrat_dto, request)
            messages.success(request, "Contrat mis à jour avec succès.")
            return redirect('dashboard:contrats')
        except (ValidationError, Exception) as e:
            error_message = str(e)
            if isinstance(e, ValidationError):
                error_message = format_pydantic_errors(e.errors())
            messages.error(request, f"Erreur lors de la mise à jour : {error_message}")
            return redirect('dashboard:contrats')

    def delete(self, request):
        try:
            data = self._parse_request_data(request)
            contrat_id = data.get('id')
            if not contrat_id:
                raise ValueError("ID du contrat manquant pour la suppression.")

            contrat_service.delete_contrat(request.user, UUID(contrat_id), request)
            messages.success(request, "Contrat supprimé avec succès.")
            return redirect('dashboard:contrats')
        except Exception as e:
            messages.error(request, f"Erreur lors de la suppression : {str(e)}")
            return redirect('dashboard:contrats')
