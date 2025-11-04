from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid


# ============================================================================
# CLASSES DE BASE
# ============================================================================

class ImmobBaseModel(models.Model):
    """Modèle de base avec UUID et timestamps"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']
        


class SoftDeletedModelMixin(models.Model):
    """Mixin pour la suppression logique"""
    is_deleted = models.BooleanField(default=False, db_index=True)

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        self.is_deleted = True
        self.save()

    def hard_delete(self, using=None, keep_parents=False):
        super().delete(using=using, keep_parents=keep_parents)


class ImmobDefaultManager(models.Manager):
    """Manager par défaut qui exclut les objets supprimés"""
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    


# ============================================================================
# CLASSES D'AUDIT LOGGING
# ============================================================================


class AuditLog(ImmobBaseModel):
    """Journal d'audit pour la traçabilité complète"""
    
    class AuditAction(models.TextChoices):
        CREATE = 'CREATE', _('Create')
        UPDATE = 'UPDATE', _('Update')
        DELETE = 'DELETE', _('Delete')
        VIEW = 'VIEW', _('View')
        ACCESS_DENIED = 'ACCESS_DENIED', _('Access denied')

    user = models.ForeignKey(
        "accounts.ImmobUser",
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    action = models.CharField(
        max_length=20,
        choices=AuditAction.choices,
        verbose_name=_('Action'),
        db_index=True
    )
    
    # Informations sur l'entité concernée
    entity_type = models.CharField(
        max_length=100,
        verbose_name=_('Entity type'),
        db_index=True
    )
    entity_id = models.UUIDField(verbose_name=_('Entity ID'), db_index=True)
    
    # Détails des changements
    old_values = models.JSONField(
        null=True,
        blank=True,
        verbose_name=_('Old values')
    )
    new_values = models.JSONField(
        null=True,
        blank=True,
        verbose_name=_('New values')
    )
    
    # Informations de connexion
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_('IP address')
    )
    user_agent = models.TextField(
        blank=True,
        verbose_name=_('User agent')
    )
    
    action_date = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'immob_audit_logs'
        verbose_name = _('Audit Log')
        verbose_name_plural = _('Audit Logs')
        ordering = ['-action_date']
        indexes = [
            models.Index(fields=['user', 'action_date']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['action', 'action_date']),
            models.Index(fields=['action_date']),
        ]

    def __str__(self):
        return f"{self.user} - {self.get_action_display()} - {self.entity_type} - {self.action_date}" # type: ignore
