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
        max_length=20,
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


class Owner(SoftDeletedModelMixin, ImmobBaseModel):
    """Profil propriétaire lié à un utilisateur"""
    
    user = models.OneToOneField(
        ImmobUser,
        on_delete=models.CASCADE,
        related_name='owner_profile',
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
        db_table = 'immob_owners'
        verbose_name = _('Owner')
        verbose_name_plural = _('Owners')

    def __str__(self):
        return f"{self.company_name or self.user.get_full_name()}"

    def create_manager(self, email, first_name, last_name, **kwargs):
        """Crée un utilisateur manager pour ce propriétaire"""
        manager = ImmobUser.objects.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=ImmobUser.UserRole.MANAGER,
            created_by=self.user,
            **kwargs
        )
        return manager


class UserPropertyPermission(ImmobBaseModel):
    """Permissions granulaires par propriété/bâtiment"""
    
    user = models.ForeignKey(
        ImmobUser,
        on_delete=models.CASCADE,
        related_name='property_permissions'
    )
    building = models.ForeignKey(
        'holdings.Building',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='user_permissions'
    )
    property = models.ForeignKey(
        'holdings.Property',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='user_permissions'
    )
    
    # Permissions CRUD
    can_view = models.BooleanField(default=True)
    can_create = models.BooleanField(default=False)
    can_update = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)
    
    granted_by = models.ForeignKey(
        ImmobUser,
        on_delete=models.CASCADE,
        null=True,
        related_name='granted_permissions'
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'immob_user_property_permissions'
        verbose_name = _('User Property Permission')
        verbose_name_plural = _('User Property Permissions')
        unique_together = [['user', 'building', 'property']]
        indexes = [
            models.Index(fields=['user', 'expires_at']),
            models.Index(fields=['building', 'user']),
            models.Index(fields=['property', 'user']),
        ]

    def __str__(self):
        scope = self.property or self.building or "Global"
        return f"{self.user.email} - {scope}"

    def is_valid(self):
        """Vérifie si la permission est toujours valide"""
        from django.utils import timezone
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True

    def has_access(self, action):
        """Vérifie l'accès pour une action spécifique"""
        if not self.is_valid():
            return False
        
        action_map = {
            'view': self.can_view,
            'create': self.can_create,
            'update': self.can_update,
            'delete': self.can_delete,
        }
        return action_map.get(action, False)

    def is_expired(self):
        """Vérifie si la permission a expiré"""
        return not self.is_valid()