from django.views import View
from inertia import render as render_inertia, defer
from finance.services.tenant_service import tenant_service
from finance.services.dtos import TenantCreateDTO, TenantUpdateDTO
from pydantic import ValidationError
from core.utils import format_pydantic_errors
from django.contrib import messages
from uuid import UUID
import json

class TenantsView(View):

    def _parse_request_data(self, request):
        if request.body:
            return json.loads(request.body)
        return request.POST or {}

    def get(self, request):
        tenants = tenant_service.list_tenants_for_workspace(request.user)
        return render_inertia(request, 'dashboard/Tenants', {
            'tenants': defer(lambda: list(tenants), merge=True)
        })

    def post(self, request):
        try:
            data = self._parse_request_data(request)
            data['workspace_id'] = request.user.workspace.id
            tenant_dto = TenantCreateDTO.model_validate(data)
            new_tenant = tenant_service.create_tenant(request.user, tenant_dto, request)
            messages.success(request, "Locataire créé avec succès.")
            return render_inertia(request, "dashboard/Tenants", {
                "tenant": new_tenant
            })
        except ValidationError as ve:
            errors = format_pydantic_errors(ve.errors())
            messages.error(request, "Erreur de validation lors de la création du locataire.")
            return render_inertia(request, "dashboard/Tenants", {"errors": errors})
        except Exception as e:
            messages.error(request, f"Erreur lors de la création du locataire : {str(e)}")
            return render_inertia(request, "dashboard/Tenants", {"errors": [{"msg": str(e)}]})

    def put(self, request):
        try:
            data = self._parse_request_data(request)
            tenant_id = data.get('id')
            if not tenant_id:
                raise ValueError("ID du locataire manquant pour la mise à jour.")

            tenant_dto = TenantUpdateDTO.model_validate(data)
            updated_tenant = tenant_service.update_tenant(request.user, UUID(tenant_id), tenant_dto, request)
            messages.success(request, "Locataire mis à jour avec succès.")
            return render_inertia(request, "dashboard/Tenants", {
                "tenant": updated_tenant
            })
        except ValidationError as ve:
            errors = format_pydantic_errors(ve.errors())
            messages.error(request, "Erreur de validation lors de la mise à jour.")
            return render_inertia(request, "dashboard/Tenants", {"errors": errors})
        except Exception as e:
            messages.error(request, f"Erreur lors de la mise à jour : {str(e)}")
            return render_inertia(request, "dashboard/Tenants", {"errors": [{"msg": str(e)}]})

    def delete(self, request):
        try:
            data = self._parse_request_data(request)
            tenant_id = data.get('id')
            if not tenant_id:
                raise ValueError("ID du locataire manquant pour la suppression.")

            tenant_service.delete_tenant(request.user, UUID(tenant_id), request)
            messages.success(request, "Locataire supprimé avec succès.")
            return render_inertia(request, "dashboard/Tenants", {
                "deleted_id": tenant_id
            })
        except Exception as e:
            messages.error(request, f"Erreur lors de la suppression : {str(e)}")
            return render_inertia(request, "dashboard/Tenants", {"errors": [{"msg": str(e)}]})
