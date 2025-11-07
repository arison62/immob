from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager
from django.utils.translation import gettext_lazy as _
from core.models import SoftDeletedModelMixin, ImmobBaseModel, ImmobDefaultManager
from django.core.validators import EmailValidator

class ImmobUser(SoftDeletedModelMixin, ImmobBaseModel, AbstractUser):
    """Utilisateur du système avec gestion des rôles"""
    
    class UserRole(models.TextChoices):
        OWNER = 'OWNER', _('Owner')
        MANAGER = 'MANAGER', _('Manager')
        VIEWER = 'VIEWER', _('Viewer')

    email = models.EmailField(
        _('email address'),
        unique=True,
        validators=[EmailValidator()],
        db_index=True
    )
    phone = models.CharField(
        max_length=25,
        null=True,
        blank=True,
        verbose_name=_('Phone number')
    )
    role = models.CharField(
        max_length=10,
        choices=UserRole.choices,
        default=UserRole.OWNER,
        db_index=True
    )
    failed_login_attempts = models.PositiveIntegerField(default=0, verbose_name=_('Failed login attempts'))
    last_failed_login = models.DateTimeField(null=True, blank=True, verbose_name=_('Last failed login'))
    created_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_users'
    )

    workspace = models.ForeignKey(
        'Workspace',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'immob_users'
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        indexes = [
            models.Index(fields=['email', 'is_active']),
            models.Index(fields=['role', 'is_deleted']),
        ]
    
    class InertiaMeta:
        fields = ('id', 'first_name', 'last_name', 'email', 'phone', 'role', 'is_active', 'created_at')

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def has_permission(self, resource, action):
        """Vérifie les permissions d'un utilisateur"""
        if self.role == self.UserRole.OWNER:
            return True
        if self.role == self.UserRole.VIEWER and action in ['view']:
            return True
        if self.role == self.UserRole.MANAGER and action in ['view', 'create', 'update']:
            return True
        return False


class Workspace(SoftDeletedModelMixin, ImmobBaseModel):
    """Workspace lié à un propriétaire"""
    
    admin = models.OneToOneField(
        ImmobUser,
        on_delete=models.CASCADE,
        related_name='admin_workspace',
        limit_choices_to={'role': ImmobUser.UserRole.OWNER}
    )
    company_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_('Company name')
    )
    tax_number = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        verbose_name=_('Tax number'),
        db_index=True
    )
    full_address = models.TextField(verbose_name=_('Full address'))

    objects = ImmobDefaultManager()
    all_objects = models.Manager()

    class Meta:
        db_table = 'immob_workspace'
        verbose_name = _('Workspace')
        verbose_name_plural = _('Workspaces')

    def __str__(self):
        return f"{self.company_name or 'Workspace'} - Admin: {self.admin.get_full_name()}"




class UserBuildingPermission(ImmobBaseModel):
    """Permissions granulaires par bâtiment"""
    
    class PermissionLevel(models.TextChoices):
        VIEW = 'VIEW', _('View')
        CREATE = 'CREATE', _('Create')
        UPDATE = 'UPDATE', _('Update')
        DELETE = 'DELETE', _('Delete')

    user = models.ForeignKey(
        ImmobUser,
        on_delete=models.CASCADE,
        related_name='user_building_permissions'
    )
    building = models.ForeignKey(
        'holdings.Building',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='user_permissions'
    )

    # Permissions 
    permission_level = models.CharField(
        max_length=10,
        choices=PermissionLevel.choices,
        default=PermissionLevel.VIEW
    )
    
    granted_by = models.ForeignKey(
        ImmobUser,
        on_delete=models.CASCADE,
        null=True,
        related_name='granted_permissions'
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'immob_user_building_permissions'
        verbose_name = _('User Building Permission')
        verbose_name_plural = _('User Building Permissions')
        unique_together = [['user', 'building']]
        indexes = [
            models.Index(fields=['user', 'expires_at']),
            models.Index(fields=['building', 'user']),
        ]

    def __str__(self):
        scope = self.building
        return f"{self.user.email} - {scope}"

    def is_valid(self):
        """Vérifie si la permission est toujours valide"""
        from django.utils import timezone
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True

    def is_expired(self):
        """Vérifie si la permission a expiré"""
        return not self.is_valid()