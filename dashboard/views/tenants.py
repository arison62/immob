# dashboard/views/tenants.py
from django.views import View
from inertia import render as render_inertia
from finance.services.tenant_service import tenant_service
from finance.services.dtos import TenantCreateDTO, TenantUpdateDTO
from pydantic import ValidationError
from core.utils import format_pydantic_errors
from django.shortcuts import redirect
from django.http import JsonResponse
from uuid import UUID
import json

class TenantsView(View):
    def get(self, request):
        tenants = tenant_service.list_tenants_for_workspace(request.user)
        return render_inertia(request, 'Tenants/index', {
            'tenants': list(tenants)
        })

    def post(self, request):
        try:
            data = json.loads(request.body)
            data['workspace_id'] = request.user.workspace_id
            tenant_dto = TenantCreateDTO(**data)
            tenant_service.create_tenant(request.user, tenant_dto, request)
            return redirect('dashboard:tenants')
        except (ValidationError, json.JSONDecodeError) as e:
            errors = format_pydantic_errors(e.errors()) if isinstance(e, ValidationError) else {'error': str(e)}
            # It's better to re-render with the errors on the same page/component
            # This requires fetching the initial data again.
            tenants = tenant_service.list_tenants_for_workspace(request.user)
            return render_inertia(request, 'Tenants/index', {'errors': errors, 'tenants': list(tenants)}, status=400)
        except Exception as e:
            tenants = tenant_service.list_tenants_for_workspace(request.user)
            return render_inertia(request, 'Tenants/index', {'errors': str(e), 'tenants': list(tenants)}, status=400)

class TenantEditView(View):
    def get(self, request, tenant_id: UUID):
        tenant = tenant_service.get_tenant_details(request.user, tenant_id)
        return render_inertia(request, 'Tenants/edit', {'tenant': tenant})

    def post(self, request, tenant_id: UUID):
        try:
            data = json.loads(request.body)
            tenant_dto = TenantUpdateDTO(**data)
            tenant_service.update_tenant(request.user, tenant_id, tenant_dto, request)
            return redirect('dashboard:tenants')
        except (ValidationError, json.JSONDecodeError) as e:
            errors = format_pydantic_errors(e.errors()) if isinstance(e, ValidationError) else {'error': str(e)}
            tenant = tenant_service.get_tenant_details(request.user, tenant_id)
            return render_inertia(request, 'Tenants/edit', {'errors': errors, 'tenant': tenant}, status=400)
        except Exception as e:
            tenant = tenant_service.get_tenant_details(request.user, tenant_id)
            return render_inertia(request, 'Tenants/edit', {'errors': str(e), 'tenant': tenant}, status=400)

def tenant_delete_view(request, tenant_id: UUID):
    if request.method == 'DELETE':
        try:
            tenant_service.delete_tenant(request.user, tenant_id, request)
            return JsonResponse({}, status=204)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
