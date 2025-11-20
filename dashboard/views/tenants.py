# dashboard/views/tenants.py
from django.views import View
from inertia import render as render_inertia
from finance.services.tenant_service import tenant_service
from finance.services.dtos import TenantCreateDTO, TenantUpdateDTO
from pydantic import ValidationError
from core.utils import format_pydantic_errors
from django.shortcuts import redirect
from django.contrib import messages
from uuid import UUID
import json

class TenantsView(View):

    def _parse_request_data(self, request):
        """Helper to parse JSON data from the request body."""
        if request.body:
            return json.loads(request.body)
        return {}

    def get(self, request):
        tenants = tenant_service.list_tenants_for_workspace(request.user)
        return render_inertia(request, 'Tenants/index', {
            'tenants': list(tenants)
        })

    def post(self, request):
        try:
            data = self._parse_request_data(request)
            data['workspace_id'] = request.user.workspace_id
            tenant_dto = TenantCreateDTO(**data)
            tenant_service.create_tenant(request.user, tenant_dto, request)
            messages.success(request, "Locataire créé avec succès.")
            return redirect('dashboard:tenants')
        except (ValidationError, Exception) as e:
            error_message = str(e)
            if isinstance(e, ValidationError):
                error_message = format_pydantic_errors(e.errors())
            messages.error(request, f"Erreur lors de la création : {error_message}")
            return redirect('dashboard:tenants')

    def put(self, request):
        try:
            data = self._parse_request_data(request)
            tenant_id = data.get('id')
            if not tenant_id:
                raise ValueError("ID du locataire manquant pour la mise à jour.")

            tenant_dto = TenantUpdateDTO(**data)
            tenant_service.update_tenant(request.user, UUID(tenant_id), tenant_dto, request)
            messages.success(request, "Locataire mis à jour avec succès.")
            return redirect('dashboard:tenants')
        except (ValidationError, Exception) as e:
            error_message = str(e)
            if isinstance(e, ValidationError):
                error_message = format_pydantic_errors(e.errors())
            messages.error(request, f"Erreur lors de la mise à jour : {error_message}")
            return redirect('dashboard:tenants')

    def delete(self, request):
        try:
            data = self._parse_request_data(request)
            tenant_id = data.get('id')
            if not tenant_id:
                raise ValueError("ID du locataire manquant pour la suppression.")

            tenant_service.delete_tenant(request.user, UUID(tenant_id), request)
            messages.success(request, "Locataire supprimé avec succès.")
            return redirect('dashboard:tenants')
        except Exception as e:
            messages.error(request, f"Erreur lors de la suppression : {str(e)}")
            return redirect('dashboard:tenants')
