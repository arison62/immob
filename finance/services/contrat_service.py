from django.db import transaction
from uuid import UUID
from typing import Optional, Any, Dict

from accounts.models import ImmobUser, UserBuildingPermission
from finance.models import Contrat, Tenant
from holdings.models import Property
from .dtos import ContratCreateDTO, ContratUpdateDTO
from core.services.audit_log_service import AuditLogService, AuditLog
from holdings.services.property_service import property_service
from .tenant_service import tenant_service
from finance.utils import generate_contrat_number
from django.utils import timezone

class ContratService:

    def _get_contrat_for_user(
        self,
        acting_user: ImmobUser,
        contrat_id: UUID,
        required_permission: UserBuildingPermission.PermissionLevel,
        request: Optional[Any] = None
    ) -> Contrat:
        """
        Récupère un contrat et vérifie les droits de l'utilisateur sur la
        propriété associée.
        """
        try:
            contrat = Contrat.objects.select_related('property__building').get(
                id=contrat_id,
                workspace=acting_user.workspace,
                is_deleted=False
            )
        except Contrat.DoesNotExist:
            AuditLogService.log_action(
                user=acting_user,
                action=AuditLog.AuditAction.ACCESS_DENIED,
                entity_type='Contrat',
                entity_id=str(contrat_id),
                request=request
            )
            raise PermissionError("Contrat non trouvé ou accès non autorisé.")

        # Déléguer le contrôle d'accès au service des propriétés
        property_service.get_property_for_user(
            acting_user=acting_user,
            property_id=contrat.property.id,
            required_permission=required_permission,
            request=request
        )

        return contrat

    @transaction.atomic
    def create_contrat(self, acting_user: ImmobUser, contrat_data: ContratCreateDTO, request: Optional[Any] = None) -> Contrat:
        """Crée un nouveau contrat."""

        # 1. Vérifier les droits sur la propriété cible (CREATE)
        property_service.get_property_for_user(
            acting_user,
            contrat_data.property_id,
            UserBuildingPermission.PermissionLevel.UPDATE, # Pour lier un contrat, on considère UPDATE
            request
        )

        # 2. Vérifier que le locataire existe et est dans le même workspace
        tenant = tenant_service._get_tenant_for_user(acting_user, contrat_data.tenant_id, request)
        
        # 3. Vérifier que la propriété est disponible
        prop = Property.objects.get(id=contrat_data.property_id)
        if prop.status != Property.PropertyStatus.AVAILABLE:
            raise ValueError("La propriété n'est pas disponible pour un nouveau contrat.")

        from dateutil.relativedelta import relativedelta

        end_date = contrat_data.start_date + relativedelta(months=contrat_data.duration_in_months)

        status = Contrat.ContratStatus.DRAFT
        if contrat_data.start_date <= timezone.now().date():
            status = Contrat.ContratStatus.ACTIVE

        payment_method = contrat_data.payment_method
        data_to_create = contrat_data.model_dump(exclude={'payment_method', 'duration_in_months'})
        
        contrat = Contrat.objects.create(
            contrat_number=generate_contrat_number(),
            workspace=acting_user.workspace,
            property=prop,
            tenant=tenant,
            created_by=acting_user,
            end_date=end_date,
            status=status,
            **data_to_create
        )

        if status == Contrat.ContratStatus.ACTIVE:
            contrat.generate_payments(payment_method=payment_method)
        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.CREATE,
            entity_type='Contrat',
            entity_id=str(contrat.id),
            new_values={
                'property_id': str(data_to_create.pop('property_id')),
                'tenant_id': str(data_to_create.pop('tenant_id')),
                **data_to_create
                },
            request=request,
        )

        return contrat

    @transaction.atomic
    def update_contrat(self, acting_user: ImmobUser, contrat_id: UUID, contrat_data: ContratUpdateDTO, request: Optional[Any] = None) -> Contrat:
        """Met à jour un contrat existant."""

        contrat_to_update = self._get_contrat_for_user(
            acting_user,
            contrat_id,
            UserBuildingPermission.PermissionLevel.UPDATE,
            request
        )

        update_data = contrat_data.model_dump(exclude_none=True)
        old_values: Dict[str, Any] = {}

        for key, value in update_data.items():
            old_values[key] = getattr(contrat_to_update, key)
            setattr(contrat_to_update, key, value)

        contrat_to_update.updated_by = acting_user
        contrat_to_update.full_clean()
        contrat_to_update.save()

        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.UPDATE,
            entity_type='Contrat',
            entity_id=str(contrat_to_update.id),
            old_values=old_values,
            new_values=update_data,
            request=request
        )

        return contrat_to_update

    @transaction.atomic
    def delete_contrat(self, acting_user: ImmobUser, contrat_id: UUID, request: Optional[Any] = None):
        """Supprime logiquement un contrat."""

        contrat_to_delete = self._get_contrat_for_user(
            acting_user,
            contrat_id,
            UserBuildingPermission.PermissionLevel.DELETE,
            request
        )

        if contrat_to_delete.status == Contrat.ContratStatus.ACTIVE:
            raise ValueError("Impossible de supprimer un contrat actif. Veuillez d'abord le terminer.")

        contrat_to_delete.is_deleted = True
        contrat_to_delete.save()

        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.DELETE,
            entity_type='Contrat',
            entity_id=str(contrat_to_delete.id),
            request=request
        )

    @transaction.atomic
    def change_contrat_status(
        self,
        acting_user: ImmobUser,
        contrat_id: UUID,
        new_status: Contrat.ContratStatus,
        request: Optional[Any] = None
    ) -> Contrat:
        """Active ou termine un contrat."""

        contrat = self._get_contrat_for_user(
            acting_user,
            contrat_id,
            UserBuildingPermission.PermissionLevel.UPDATE,
            request
        )

        if new_status == Contrat.ContratStatus.ACTIVE:
            contrat.activate()
        elif new_status == Contrat.ContratStatus.TERMINATED:
            contrat.terminate()
        else:
            # Gérer d'autres statuts si nécessaire
            contrat.status = new_status
            contrat.save()

        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.UPDATE,
            entity_type='Contrat',
            entity_id=str(contrat.id),
            request=request
        )

        return contrat

    def get_contrat_details(self, acting_user: ImmobUser, contrat_id: UUID, request: Optional[Any] = None):
        """Récupère les détails d'un contrat."""

        return self._get_contrat_for_user(
            acting_user,
            contrat_id,
            UserBuildingPermission.PermissionLevel.VIEW,
            request
        )

    def list_contrats_for_property(self, acting_user: ImmobUser, property_id: UUID, request: Optional[Any] = None):
        """Liste les contrats pour une propriété donnée."""

        # Vérifie les droits VIEW sur la propriété
        property_service.get_property_for_user(
            acting_user,
            property_id,
            UserBuildingPermission.PermissionLevel.VIEW,
            request
        )

        return Contrat.objects.filter(
            property_id=property_id,
            is_deleted=False
        ).select_related('tenant').values(
            'id', 'contrat_number', 'tenant__first_name', 'tenant__last_name', 'start_date', 'end_date', 'status'
        )

    def list_contrats_for_workspace(self, acting_user: ImmobUser):
        """Liste tous les contrats pour le workspace de l'utilisateur."""
        return Contrat.objects.filter(
            workspace=acting_user.workspace,
            is_deleted=False
        ).select_related('tenant', 'property').values(
            'id', 'contrat_number', 'tenant__first_name', 'tenant__last_name',
            'property__name', 'start_date', 'end_date', 'status'
        )

# Instance du service
contrat_service = ContratService()
