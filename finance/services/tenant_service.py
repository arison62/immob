from django.db import transaction
from uuid import UUID
from typing import Optional, Dict, Any

from accounts.models import ImmobUser
from finance.models import Tenant
from .dtos import TenantCreateDTO, TenantUpdateDTO
from core.utils import encrypt_data, decrypt_data
from core.services.audit_log_service import AuditLogService, AuditLog

class TenantService:

    @staticmethod
    def _get_tenant_for_user(acting_user: ImmobUser, tenant_id: UUID, request: Optional[Any] = None) -> Tenant:
        """
        Récupère un locataire en s'assurant qu'il appartient au même workspace
        que l'utilisateur. C'est une mesure de sécurité de base pour éviter
        la fuite de données entre workspaces.
        """
        try:
            tenant = Tenant.objects.get(id=tenant_id, workspace=acting_user.workspace, is_deleted=False)
            return tenant
        except Tenant.DoesNotExist:
            # Log l'échec d'accès
            AuditLogService.log_action(
                user=acting_user,
                action=AuditLog.AuditAction.ACCESS_DENIED,
                entity_type='Tenant',
                entity_id=str(tenant_id),
                request=request
            )
            raise PermissionError("Locataire non trouvé ou accès non autorisé.")

    @transaction.atomic
    def create_tenant(self, acting_user: ImmobUser, tenant_data: TenantCreateDTO, request: Optional[Any] = None) -> Tenant:
        """
        Crée un nouveau locataire.
        L'ID number est chiffré avant d'être sauvegardé.
        """
        if acting_user.workspace_id != tenant_data.workspace_id:
            raise PermissionError("Opération non autorisée sur ce workspace.")

        # Chiffrer les données sensibles
        encrypted_id_number = encrypt_data(tenant_data.id_number)

        data_to_create = tenant_data.model_dump(exclude={'id_number'})

        tenant = Tenant.objects.create(
            workspace_id=acting_user.workspace_id,
            id_number=encrypted_id_number,
            **data_to_create
        )

        # Log de l'action
        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.CREATE,
            entity_type='Tenant',
            entity_id=str(tenant.id),
            new_values=tenant_data.model_dump(),
            request=request,
        )

        return tenant

    @transaction.atomic
    def update_tenant(self, acting_user: ImmobUser, tenant_id: UUID, tenant_data: TenantUpdateDTO, request: Optional[Any] = None) -> Tenant:
        """Met à jour un locataire existant."""

        tenant_to_update = self._get_tenant_for_user(acting_user, tenant_id, request)

        update_data = tenant_data.model_dump(exclude_none=True)
        old_values: Dict[str, Any] = {}

        # Chiffrer l'id_number si présent
        if 'id_number' in update_data:
            old_values['id_number'] = decrypt_data(tenant_to_update.id_number)
            tenant_to_update.id_number = encrypt_data(update_data.pop('id_number'))

        for key, value in update_data.items():
            old_values[key] = getattr(tenant_to_update, key)
            setattr(tenant_to_update, key, value)

        tenant_to_update.full_clean()
        tenant_to_update.save()

        # Log de la mise à jour
        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.UPDATE,
            entity_type='Tenant',
            entity_id=str(tenant_to_update.id),
            old_values=old_values,
            new_values=tenant_data.model_dump(exclude_none=True),
            request=request
        )

        return tenant_to_update

    @transaction.atomic
    def delete_tenant(self, acting_user: ImmobUser, tenant_id: UUID, request: Optional[Any] = None):
        """Supprime logiquement un locataire."""

        tenant_to_delete = self._get_tenant_for_user(acting_user, tenant_id, request)

        # Vérifier s'il y a des contrats actifs
        if tenant_to_delete.get_active_contrats().exists():
            raise ValueError("Impossible de supprimer un locataire avec des contrats actifs.")

        tenant_to_delete.is_deleted = True
        tenant_to_delete.save()

        # Log de la suppression
        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.DELETE,
            entity_type='Tenant',
            entity_id=str(tenant_to_delete.id),
            request=request
        )

    def get_tenant_details(self, acting_user: ImmobUser, tenant_id: UUID, request: Optional[Any] = None) -> Dict[str, Any]:
        """
        Retourne les détails d'un locataire, avec déchiffrement
        des données sensibles pour l'affichage.
        """
        tenant = self._get_tenant_for_user(acting_user, tenant_id, request)

        tenant_details = {
            "id": tenant.id,
            "workspace_id": tenant.workspace_id,
            "first_name": tenant.first_name,
            "last_name": tenant.last_name,
            "email": tenant.email,
            "phone": tenant.phone,
            "address": tenant.address,
            "emergency_contact_name": tenant.emergency_contact_name,
            "emergency_contact_phone": tenant.emergency_contact_phone,
            "id_number": decrypt_data(tenant.id_number), # Déchiffrement
            "is_deleted": tenant.is_deleted,
            "created_at": tenant.created_at,
            "updated_at": tenant.updated_at,
        }
        return tenant_details

    def list_tenants_for_workspace(self, acting_user: ImmobUser):
        """Liste tous les locataires pour le workspace de l'utilisateur."""

        return Tenant.objects.filter(
            workspace=acting_user.workspace,
            is_deleted=False
        ).values(
            'id', 'first_name', 'last_name', 'email', 'phone'
        )

# Instance unique du service
tenant_service = TenantService()
