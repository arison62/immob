# dashboard/views/contrats.py
from django.views import View
from inertia import render as render_inertia, defer
from finance.services.contrat_service import contrat_service
from finance.services.dtos import ContratCreateDTO, ContratUpdateDTO
from pydantic import ValidationError
from core.utils import format_pydantic_errors
from django.contrib import messages
from uuid import UUID
import json

class ContratsView(View):

    def _parse_request_data(self, request):
        if request.body:
            return json.loads(request.body)
        return request.POST or {}

    def get(self, request):
        contrats = contrat_service.list_contrats_for_workspace(request.user)
        return render_inertia(request, 'dashboard/Contrats', {
            'contrats': defer(lambda: list(contrats), merge=True)
        })

    def post(self, request):
        try:
            data = self._parse_request_data(request)
            contrat_dto = ContratCreateDTO.model_validate(data)
            new_contrat = contrat_service.create_contrat(request.user, contrat_dto, request)
            messages.success(request, "Contrat créé avec succès.")
            return render_inertia(request, "dashboard/Contrats", {
                "contrat": new_contrat
            })
        except ValidationError as ve:
            errors = format_pydantic_errors(ve.errors())
            messages.error(request, "Erreur de validation lors de la création du contrat.")
            return render_inertia(request, "dashboard/Contrats", {"errors": errors})
        except Exception as e:
            messages.error(request, f"Erreur lors de la création du contrat : {str(e)}")
            return render_inertia(request, "dashboard/Contrats", {"errors": [{"msg": str(e)}]})

    def put(self, request):
        try:
            data = self._parse_request_data(request)
            contrat_id = data.get('id')
            if not contrat_id:
                raise ValueError("ID du contrat manquant pour la mise à jour.")

            contrat_dto = ContratUpdateDTO.model_validate(data)
            updated_contrat = contrat_service.update_contrat(request.user, UUID(contrat_id), contrat_dto, request)
            messages.success(request, "Contrat mis à jour avec succès.")
            return render_inertia(request, "dashboard/Contrats", {
                "contrat": updated_contrat
            })
        except ValidationError as ve:
            errors = format_pydantic_errors(ve.errors())
            messages.error(request, "Erreur de validation lors de la mise à jour.")
            return render_inertia(request, "dashboard/Contrats", {"errors": errors})
        except Exception as e:
            messages.error(request, f"Erreur lors de la mise à jour : {str(e)}")
            return render_inertia(request, "dashboard/Contrats", {"errors": [{"msg": str(e)}]})

    def delete(self, request):
        try:
            data = self._parse_request_data(request)
            contrat_id = data.get('id')
            if not contrat_id:
                raise ValueError("ID du contrat manquant pour la suppression.")

            contrat_service.delete_contrat(request.user, UUID(contrat_id), request)
            messages.success(request, "Contrat supprimé avec succès.")
            return render_inertia(request, "dashboard/Contrats", {
                "deleted_id": contrat_id
            })
        except Exception as e:
            messages.error(request, f"Erreur lors de la suppression : {str(e)}")
            return render_inertia(request, "dashboard/Contrats", {"errors": [{"msg": str(e)}]})
