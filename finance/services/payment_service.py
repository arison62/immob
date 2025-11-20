from django.db import transaction
from uuid import UUID
from typing import Optional, Any, Dict

from accounts.models import ImmobUser, UserBuildingPermission
from finance.models import Payment, Contrat
from .dtos import PaymentUpdateDTO
from core.services.audit_log_service import AuditLogService, AuditLog
from .contrat_service import contrat_service

class PaymentService:

    def _get_payment_for_user(
        self,
        acting_user: ImmobUser,
        payment_id: UUID,
        required_permission: UserBuildingPermission.PermissionLevel,
        request: Optional[Any] = None
    ) -> Payment:
        """
        Récupère un paiement et vérifie les droits sur le contrat (et donc la propriété)
        auquel il est lié.
        """
        try:
            payment = Payment.objects.select_related('contrat__property__building').get(id=payment_id)

            if payment.contrat.workspace_id != acting_user.workspace_id:
                raise PermissionError() # Sera attrapée ci-dessous

        except (Payment.DoesNotExist, PermissionError):
            AuditLogService.log_action(
                user=acting_user,
                action=AuditLog.AuditAction.ACCESS_DENIED,
                entity_type='Payment',
                entity_id=str(payment_id),
                request=request
            )
            raise PermissionError("Paiement non trouvé ou accès non autorisé.")

        # Déléguer la vérification des droits au service des contrats
        contrat_service._get_contrat_for_user(
            acting_user=acting_user,
            contrat_id=payment.contrat.id,
            required_permission=required_permission,
            request=request
        )

        return payment

    @transaction.atomic
    def update_payment_status(
        self,
        acting_user: ImmobUser,
        payment_id: UUID,
        payment_data: PaymentUpdateDTO,
        request: Optional[Any] = None
    ) -> Payment:
        """
        Met à jour le statut d'un paiement (ex: le marquer comme payé).
        """
        payment_to_update = self._get_payment_for_user(
            acting_user,
            payment_id,
            UserBuildingPermission.PermissionLevel.UPDATE,
            request
        )

        update_data = payment_data.model_dump(exclude_none=True)
        old_values: Dict[str, Any] = {}

        if not update_data:
            return payment_to_update

        # Logique spécifique pour marquer comme payé
        if update_data.get('status') == Payment.PaymentStatus.PAID:
            payment_to_update.mark_as_paid(
                payment_method=update_data.get('payment_method'),
                notes=update_data.get('notes', '')
            )
            old_values['status'] = Payment.PaymentStatus.PENDING
        else:
            # Mise à jour générique pour d'autres champs
            for key, value in update_data.items():
                old_values[key] = getattr(payment_to_update, key)
                setattr(payment_to_update, key, value)
            payment_to_update.save()

        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.UPDATE,
            entity_type='Payment',
            entity_id=str(payment_to_update.id),
            old_values=old_values,
            new_values=update_data,
            request=request
        )

        return payment_to_update

    def get_payment_details(self, acting_user: ImmobUser, payment_id: UUID, request: Optional[Any] = None) -> Payment:
        """Récupère les détails d'un paiement."""

        return self._get_payment_for_user(
            acting_user,
            payment_id,
            UserBuildingPermission.PermissionLevel.VIEW,
            request
        )

    def list_payments_for_contrat(self, acting_user: ImmobUser, contrat_id: UUID, request: Optional[Any] = None):
        """Liste tous les paiements pour un contrat donné."""

        # La vérification des droits se fait en récupérant le contrat
        contrat = contrat_service.get_contrat_details(acting_user, contrat_id, request)

        return Payment.objects.filter(contrat=contrat).order_by('due_date').values()

    @transaction.atomic
    def create_payment(self, acting_user: ImmobUser, payment_data: "PaymentCreateDTO", request: Optional[Any] = None) -> Payment:
        """Crée un nouveau paiement manuellement."""

        contrat = contrat_service.get_contrat_details(
            acting_user,
            payment_data.contrat_id,
            UserBuildingPermission.PermissionLevel.UPDATE
        )

        payment = Payment.objects.create(
            contrat=contrat,
            amount=payment_data.amount,
            due_date=payment_data.due_date,
            status=payment_data.status,
            created_by=acting_user,
            reference_number=f"MANUAL-{contrat.contrat_number}-{payment_data.due_date.strftime('%Y%m%d')}"
        )

        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.CREATE,
            entity_type='Payment',
            entity_id=str(payment.id),
            new_values=payment_data.model_dump(),
            request=request
        )
        return payment

    @transaction.atomic
    def delete_payment(self, acting_user: ImmobUser, payment_id: UUID, request: Optional[Any] = None):
        """Supprime un paiement."""

        payment_to_delete = self._get_payment_for_user(
            acting_user,
            payment_id,
            UserBuildingPermission.PermissionLevel.DELETE,
            request
        )

        if payment_to_delete.status == Payment.PaymentStatus.PAID:
            raise ValueError("Impossible de supprimer un paiement qui a déjà été marqué comme payé.")

        payment_to_delete.delete()

        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.DELETE,
            entity_type='Payment',
            entity_id=str(payment_id),
            request=request
        )

    def list_payments_for_workspace(self, acting_user: ImmobUser):
        """Liste tous les paiements pour le workspace de l'utilisateur."""
        return Payment.objects.filter(
            contrat__workspace=acting_user.workspace
        ).select_related('contrat__tenant', 'contrat__property').order_by('-due_date').values(
            'id', 'reference_number', 'contrat__contrat_number', 'contrat__tenant__first_name',
            'contrat__tenant__last_name', 'amount', 'due_date', 'status'
        )

# Instance du service
payment_service = PaymentService()
