from inertia import render as render_inertia, defer
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from finance.services.tenant_service import tenant_service
from finance.services.dtos import TenantCreateDTO
from pydantic import ValidationError
from core.utils import format_pydantic_errors
from django.contrib import messages
import json

class TenantsView(LoginRequiredMixin, View):
    login_url = "/accounts/login"

    def get(self, request):
        list_tenants = tenant_service.list_tenants_for_user(request.user)
        return render_inertia(request, "dashboard/Tenants", {
            "tenants": defer(list_tenants, merge=True)
        })

    def post(self, request):
        try:
            data = json.loads(request.body)
            tenant_dto = TenantCreateDTO.model_validate(data)
            new_tenant = tenant_service.create_tenant(
                acting_user=request.user,
                tenant_data=tenant_dto,
                request=request
            )
            messages.success(request, f"Tenant {new_tenant.first_name} created successfully.")
            return render_inertia(request, "dashboard/Tenants", {
                "tenant": new_tenant
            })
        except ValidationError as ve:
            errors = format_pydantic_errors(ve.errors())
            return render_inertia(request, "dashboard/Tenants", {
                "errors": errors
            })
        except Exception as e:
            messages.error(request, f"Error creating tenant: {str(e)}")
            return render_inertia(request, "dashboard/Tenants", {
                "errors": [{"msg": str(e)}]
            })

