from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import ImmobBaseModel


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
        return f"{self.user} - {self.get_action_display()} - {self.entity_type} - {self.action_date}"

    @classmethod
    def log(cls, user, action, entity, old_values=None, new_values=None, 
            ip_address=None, user_agent=None):
        """
        Méthode de classe pour créer un log d'audit
        
        Usage:
            AuditLog.log(
                user=request.user,
                action=AuditLog.AuditAction.CREATE,
                entity=property_instance,
                new_values={'name': 'New Property'},
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
        """
        return cls.objects.create(
            user=user,
            action=action,
            entity_type=entity.__class__.__name__,
            entity_id=entity.id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
   
