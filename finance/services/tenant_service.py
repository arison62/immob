from finance.models import Tenant
from .dtos import TenantCreateDTO
from accounts.models import ImmobUser
from core.services.audit_log_service import AuditLogService
from core.models import AuditLog
from django.db import transaction

class TenantService:
    @transaction.atomic
    def create_tenant(self, acting_user: ImmobUser, tenant_data: TenantCreateDTO, request=None) -> Tenant:
        if not acting_user.has_permission('tenant', 'create'):
            AuditLogService.log_action(
                user=acting_user,
                action=AuditLog.AuditAction.ACCESS_DENIED,
                entity_type='Tenant',
                entity_id='N/A (Attempted creation)',
                request=request
            )
            raise PermissionError("You do not have permission to create tenants.")

        tenant = Tenant.objects.create(
            workspace=acting_user.workspace,
            created_by=acting_user,
            **tenant_data.model_dump()
        )

        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.CREATE,
            entity_type='Tenant',
            entity_id=str(tenant.id),
            new_values=tenant_data.model_dump(),
            request=request
        )

        return tenant

    def list_tenants_for_user(self, acting_user: ImmobUser):
        if not acting_user.has_permission('tenant', 'view'):
            raise PermissionError("You do not have permission to view tenants.")

        return Tenant.objects.filter(workspace=acting_user.workspace, is_deleted=False).values()

tenant_service = TenantService()
