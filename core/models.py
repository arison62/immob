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