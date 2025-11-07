# core/models.py

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


# accounts/models.py

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
        db_table = 'immob_user_building_permissions'
        verbose_name = _('User Building Permission')
        verbose_name_plural = _('User Building Permissions')
        unique_together = [['user', 'building', 'property']]
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


# holdings/models.py

from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal
from django.utils import timezone

from finance.models import Contract
from core.models import SoftDeletedModelMixin, ImmobBaseModel, ImmobDefaultManager

class Building(SoftDeletedModelMixin, ImmobBaseModel):
    """Bâtiment contenant plusieurs propriétés"""
    
    workspace = models.ForeignKey(
        "accounts.Workspace",
        on_delete=models.CASCADE,
        related_name='buildings'
    )
    name = models.CharField(max_length=255, verbose_name=_('Building name'))
    address = models.CharField(max_length=500, verbose_name=_('Address'))
    city = models.CharField(max_length=100, verbose_name=_('City'), db_index=True)
    postal_code = models.CharField(max_length=20, verbose_name=_('Postal code'))
    country = models.CharField(max_length=100, default='Cameroun', verbose_name=_('Country'))
    
    # Coordonnées GPS
    latitude = models.FloatField(null=True, blank=True, verbose_name=_('Latitude'))
    longitude = models.FloatField(null=True, blank=True, verbose_name=_('Longitude'))
    
    floor_count = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name=_('Number of floors')
    )
    description = models.TextField(blank=True, verbose_name=_('Description'))

    objects = ImmobDefaultManager()
    all_objects = models.Manager()

    class Meta:
        db_table = 'immob_buildings'
        verbose_name = _('Building')
        verbose_name_plural = _('Buildings')
        indexes = [
            models.Index(fields=['workspace', 'city']),
            models.Index(fields=['postal_code']),
        ]

    def __str__(self):
        return f"{self.name} - {self.city}"

    def get_occupancy_rate(self):
        """Calcule le taux d'occupation du bâtiment"""
        total = self.get_property_count()
        if total == 0:
            return 0.0
        occupied = self.get_occupied_property_count()
        return (occupied / total) * 100

    def get_property_count(self):
        """Retourne le nombre total de propriétés"""
        return self.building_properties.filter(is_deleted=False).count()

    def get_occupied_property_count(self):
        """Retourne le nombre de propriétés occupées"""
        return self.building_properties.filter(
            is_deleted=False,
            status=Property.PropertyStatus.OCCUPIED
        ).count()


class Property(SoftDeletedModelMixin, ImmobBaseModel):
    """Propriété/logement individuel"""
    
    class PropertyType(models.TextChoices):
        APARTMENT = 'APARTMENT', _('Apartment')
        HOUSE = 'HOUSE', _('House')
        STUDIO = 'STUDIO', _('Studio')

    class PropertyStatus(models.TextChoices):
        AVAILABLE = 'AVAILABLE', _('Available')
        OCCUPIED = 'OCCUPIED', _('Occupied')
        MAINTENANCE = 'MAINTENANCE', _('Maintenance')
        UNAVAILABLE = 'UNAVAILABLE', _('Unavailable')

    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name='building_properties',
        null=True,
        blank=True
    )
    workspace = models.ForeignKey(
        "accounts.Workspace",
        on_delete=models.CASCADE,
        related_name='workspace_properties'
    )
    
    reference_code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_('Reference code'),
        db_index=True
    )
    name = models.CharField(max_length=255, verbose_name=_('Property name'))
    type = models.CharField(
        max_length=20,
        choices=PropertyType.choices,
        verbose_name=_('Property type'),
        db_index=True
    )
    status = models.CharField(
        max_length=20,
        choices=PropertyStatus.choices,
        default=PropertyStatus.AVAILABLE,
        verbose_name=_('Status'),
        db_index=True
    )
    
    # Localisation
    floor = models.IntegerField(null=True, blank=True, verbose_name=_('Floor'))
    door_number = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        verbose_name=_('Door number')
    )
    
    # Caractéristiques
    surface_area = models.FloatField(
        validators=[MinValueValidator(0)],
        verbose_name=_('Surface area (m²)')
    )
    room_count = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name=_('Number of rooms')
    )
    bedroom_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Number of bedrooms')
    )
    bathroom_count = models.PositiveIntegerField(
        default=1,
        verbose_name=_('Number of bathrooms')
    )
    
    # Équipements
    has_parking = models.BooleanField(default=False, verbose_name=_('Has parking'))
    has_balcony = models.BooleanField(default=False, verbose_name=_('Has balcony'))
    equipment_list = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Equipment list')
    )
    
    # Financier
    monthly_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name=_('Monthly rent')
    )
    
    description = models.TextField(blank=True, verbose_name=_('Description'))

    objects = ImmobDefaultManager()
    all_objects = models.Manager()

    class Meta:
        db_table = 'immob_properties'
        verbose_name = _('Property')
        verbose_name_plural = _('Properties')
        indexes = [
            models.Index(fields=['workspace', 'status']),
            models.Index(fields=['building', 'floor']),
            models.Index(fields=['type', 'status']),
            models.Index(fields=['reference_code']),
        ]

    def __str__(self):
        return f"{self.reference_code} - {self.name}"

    def is_available(self):
        """Vérifie si la propriété est disponible"""
        return self.status == self.PropertyStatus.AVAILABLE

    def change_status(self, new_status):
        """Change le statut de la propriété"""
        if new_status in self.PropertyStatus.values:
            self.status = new_status
            self.save()

    def has_active_contract(self):
        """Vérifie si la propriété a un contrat actif"""
        return self.property_contracts.filter(
            status=Contract.ContractStatus.ACTIVE,
            end_date__gte=timezone.now().date()
        ).exists()


class PropertyPhoto(ImmobBaseModel):
    """Photos d'une propriété"""
    
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='property_photos'
    )
    file_path = models.ImageField(
        upload_to='properties/%Y/%m/',
        verbose_name=_('Photo')
    )
    file_name = models.CharField(max_length=255, verbose_name=_('File name'))
    is_primary = models.BooleanField(default=False, verbose_name=_('Primary photo'))
    display_order = models.PositiveIntegerField(default=0, verbose_name=_('Display order'))
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'immob_property_photos'
        verbose_name = _('Property Photo')
        verbose_name_plural = _('Property Photos')
        ordering = ['display_order', 'uploaded_at']
        indexes = [
            models.Index(fields=['property', 'is_primary']),
            models.Index(fields=['property', 'display_order']),
        ]

    def __str__(self):
        return f"Photo {self.property.reference_code} - {self.file_name}"

    def set_as_primary(self):
        """Définit cette photo comme photo principale"""
        PropertyPhoto.objects.filter(property=self.property).update(is_primary=False)
        self.is_primary = True
        self.save()


# ============================================================================
# MODÈLES MAINTENANCE
# ============================================================================

class MaintenanceLog(SoftDeletedModelMixin, ImmobBaseModel):
    """Journal de maintenance"""
    
    class MaintenanceType(models.TextChoices):
        REPAIR = 'REPAIR', _('Repair')
        INSPECTION = 'INSPECTION', _('Inspection')
        CLEANING = 'CLEANING', _('Cleaning')
        IMPROVEMENT = 'IMPROVEMENT', _('Improvement')

    class MaintenanceStatus(models.TextChoices):
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        IN_PROGRESS = 'IN_PROGRESS', _('In progress')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='property_maintenance_logs'
    )
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='building_maintenance_logs'
    )
    type = models.CharField(
        max_length=20,
        choices=MaintenanceType.choices,
        verbose_name=_('Type'),
        db_index=True
    )
    status = models.CharField(
        max_length=20,
        choices=MaintenanceStatus.choices,
        default=MaintenanceStatus.SCHEDULED,
        verbose_name=_('Status'),
        db_index=True
    )
    
    scheduled_date = models.DateField(verbose_name=_('Scheduled date'), db_index=True)
    completion_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Completion date')
    )
    
    description = models.TextField(verbose_name=_('Description'))
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name=_('Cost')
    )
    technician_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Technician name')
    )
    
    created_by = models.ForeignKey(
        "accounts.ImmobUser",
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_maintenance_logs'
    )

    objects = ImmobDefaultManager()
    all_objects = models.Manager()

    class Meta:
        db_table = 'immob_maintenance_logs'
        verbose_name = _('Maintenance Log')
        verbose_name_plural = _('Maintenance Logs')
        indexes = [
            models.Index(fields=['property', 'status']),
            models.Index(fields=['scheduled_date', 'status']),
            models.Index(fields=['type', 'status']),
        ]

    def __str__(self):
        return f"{self.property_maintenance_logs.first().reference_code or self.building_maintenance_logs.first().name} - {self.get_type_display()} - {self.scheduled_date}"

    def complete(self, cost=None):
        """Marque la maintenance comme complétée"""
       
        self.status = self.MaintenanceStatus.COMPLETED
        self.completion_date = timezone.now()
        if cost:
            self.cost = cost
        self.save()

    def cancel(self):
        """Annule la maintenance"""
        self.status = self.MaintenanceStatus.CANCELLED
        self.save()
@receiver(post_save, sender=PropertyPhoto)
def ensure_single_primary_photo(sender, instance, created, **kwargs):
    """Assure qu'une seule photo est marquée comme principale par propriété"""
    if instance.is_primary:
        PropertyPhoto.objects.filter(
            property=instance.property
        ).exclude(id=instance.id).update(is_primary=False)


# finance/models.py

from django.db import models
from django.core.validators import MinValueValidator, EmailValidator
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from core.models import SoftDeletedModelMixin, ImmobBaseModel, ImmobDefaultManager
from django.utils import timezone

class Tenant(SoftDeletedModelMixin, ImmobBaseModel):
    """Locataire"""
    
    first_name = models.CharField(max_length=100, verbose_name=_('First name'))
    last_name = models.CharField(
        max_length=100, verbose_name=_('Last name'), 
        null=True,
        blank=True
    )

    email = models.EmailField(
        validators=[EmailValidator()],
        verbose_name=_('Email'),
        null=True,
        blank=True,
        db_index=True
    )
    phone = models.CharField(max_length=20, verbose_name=_('Phone number'))
    
    # Informations sensibles (à chiffrer)
    id_number = models.CharField(
        max_length=255,
        unique=True,
        verbose_name=_('ID number (encrypted)'),
        help_text=_('Should be encrypted at application level')
    )
    address = models.TextField(verbose_name=_('Address'))
    
    # Contact d'urgence
    emergency_contact_name = models.CharField(
        max_length=200,
        verbose_name=_('Emergency contact name')
    )
    emergency_contact_phone = models.CharField(
        max_length=20,
        verbose_name=_('Emergency contact phone')
    )

    objects = ImmobDefaultManager()
    all_objects = models.Manager()

    class Meta:
        db_table = 'immob_tenants'
        verbose_name = _('Tenant')
        verbose_name_plural = _('Tenants')
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['last_name', 'first_name']),
        ]

    def __str__(self):
        return f"{self.last_name} {self.first_name}"

    def get_active_contracts(self):
        """Retourne les contrats actifs du locataire"""
        return self.tenant_contracts.filter(
            status=Contract.ContractStatus.ACTIVE,
            end_date__gte=timezone.now().date(),
            is_deleted=False
        )

    def get_history(self):
        """Retourne l'historique des contrats du locataire"""
        return self.tenant_contracts.filter(is_deleted=False).order_by('-start_date')


class Contract(SoftDeletedModelMixin, ImmobBaseModel):
    """Contrat de location"""
    
    class ContractStatus(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        ACTIVE = 'ACTIVE', _('Active')
        EXPIRED = 'EXPIRED', _('Expired')
        TERMINATED = 'TERMINATED', _('Terminated')

    class PaymentFrequency(models.TextChoices):
        MONTHLY = 'MONTHLY', _('Monthly')
        QUARTERLY = 'QUARTERLY', _('Quarterly')
        ANNUALLY = 'ANNUALLY', _('Annually')

    property = models.ForeignKey(
        "holdings.Property",
        on_delete=models.PROTECT,
        related_name='property_contracts'
    )
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.PROTECT,
        related_name='tenant_contracts'
    )
    created_by = models.ForeignKey(
        "accounts.ImmobUser",
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_contracts'
    )
    updated_by = models.ForeignKey(
        "accounts.ImmobUser",
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_contracts'
    )
    
    contract_number = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_('Contract number'),
        db_index=True
    )
    
    # Dates
    start_date = models.DateField(verbose_name=_('Start date'), db_index=True)
    end_date = models.DateField(verbose_name=_('End date'), db_index=True)
    signature_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Signature date')
    )
    
    # Financier
    monthly_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name=_('Monthly rent')
    )
    security_deposit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name=_('Security deposit')
    )
    charges = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name=_('Charges')
    )
    
    payment_frequency = models.CharField(
        max_length=20,
        choices=PaymentFrequency.choices,
        default=PaymentFrequency.MONTHLY,
        verbose_name=_('Payment frequency')
    )
    status = models.CharField(
        max_length=20,
        choices=ContractStatus.choices,
        default=ContractStatus.DRAFT,
        verbose_name=_('Status'),
        db_index=True
    )
    
    terms = models.TextField(
        verbose_name=_('Contract terms'),
        null=True,
        blank=True
    )

    objects = ImmobDefaultManager()
    all_objects = models.Manager()

    class Meta:
        db_table = 'immob_contracts'
        verbose_name = _('Contract')
        verbose_name_plural = _('Contracts')
        indexes = [
            models.Index(fields=['property', 'status']),
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['status', 'end_date']),
        ]

    def __str__(self):
        return f"{self.contract_number} - {self.tenant}"

    def activate(self):
        """Active le contrat"""
        
        self.status = self.ContractStatus.ACTIVE
        from holdings.models import Property
        self.property.change_status(Property.PropertyStatus.OCCUPIED)
        self.save()
        self.generate_payments()

    def terminate(self):
        """Termine le contrat"""
        self.status = self.ContractStatus.TERMINATED
        from holdings.models import Property
        self.property.change_status(Property.PropertyStatus.AVAILABLE)
        self.save()

    def is_active(self):
        """Vérifie si le contrat est actif"""
        return (
            self.status == self.ContractStatus.ACTIVE and
            self.start_date <= timezone.now().date() <= self.end_date
        )

    def generate_payments(self):
        """Génère les paiements pour le contrat"""
        from dateutil.relativedelta import relativedelta
        
        if self.status != self.ContractStatus.ACTIVE:
            return
        
        current_date = self.start_date
        payment_number = 1
        
        while current_date <= self.end_date:
            Payment.objects.get_or_create(
                contract=self,
                due_date=current_date,
                defaults={
                    'amount': self.monthly_rent + self.charges,
                    'status': Payment.PaymentStatus.PENDING,
                    'reference_number': f"{self.contract_number}-{payment_number:03d}",
                    'created_by': self.created_by
                }
            )
            
            # Incrémenter selon la fréquence
            if self.payment_frequency == self.PaymentFrequency.MONTHLY:
                current_date += relativedelta(months=1)
            elif self.payment_frequency == self.PaymentFrequency.QUARTERLY:
                current_date += relativedelta(months=3)
            elif self.payment_frequency == self.PaymentFrequency.ANNUALLY:
                current_date += relativedelta(years=1)
            
            payment_number += 1


# ============================================================================
# MODÈLES PAIEMENTS
# ============================================================================

class Payment(ImmobBaseModel):
    """Paiement de loyer"""
    
    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        PAID = 'PAID', _('Paid')
        LATE = 'LATE', _('Late')
        CANCELLED = 'CANCELLED', _('Cancelled')

    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', _('Cash')
        BANK_TRANSFER = 'BANK_TRANSFER', _('Bank transfer')
        CHECK = 'CHECK', _('Check')
        CARD = 'CARD', _('Card')

    contract = models.ForeignKey(
        Contract,
        on_delete=models.PROTECT,
        related_name='contract_payments'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name=_('Amount')
    )
    due_date = models.DateField(verbose_name=_('Due date'), db_index=True)
    payment_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Payment date')
    )
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        verbose_name=_('Status'),
        db_index=True
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        null=True,
        blank=True,
        verbose_name=_('Payment method')
    )
    reference_number = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_('Reference number')
    )
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    created_by = models.ForeignKey(
        "accounts.ImmobUser",
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_payments'
    )

    class Meta:
        db_table = 'immob_payments'
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')
        indexes = [
            models.Index(fields=['contract', 'due_date']),
            models.Index(fields=['status', 'due_date']),
            models.Index(fields=['reference_number']),
        ]

    def __str__(self):
        return f"{self.reference_number} - {self.amount}"

    def mark_as_paid(self, payment_method=None, notes=''):
        """Marque le paiement comme payé"""
        from django.utils import timezone
        
        self.status = self.PaymentStatus.PAID
        self.payment_date = timezone.now()
        if payment_method:
            self.payment_method = payment_method
        if notes:
            self.notes = notes
        self.save()

    def is_late(self):
        """Vérifie si le paiement est en retard"""
        from django.utils import timezone
        
        return (
            self.status == self.PaymentStatus.PENDING and
            self.due_date < timezone.now().date()
        )

    def calculate_late_days(self):
        """Calcule le nombre de jours de retard"""
        from django.utils import timezone
        
        if not self.is_late():
            return 0
        return (timezone.now().date() - self.due_date).days


class Invoice(ImmobBaseModel):
    class InvoiceStatus(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        SENT = 'SENT', _('Sent')
        PAID = 'PAID', _('Paid')
        OVERDUE = 'OVERDUE', _('Overdue')
    payment = models.ForeignKey(
        Payment,
        on_delete=models.PROTECT,
        related_name='payment_invoices'
    )
    invoice_number = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_('Invoice number'),
        db_index=True
    )
    issue_date = models.DateField(verbose_name=_('Issue date'), db_index=True)
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name=_('Total amount')
    )
    pdf = models.FileField(
        upload_to='invoices/',
        null=True,
        blank=True,
        verbose_name=_('Invoice PDF')
    )
    status = models.CharField(
        max_length=20,
        choices=InvoiceStatus.choices,
        default=InvoiceStatus.DRAFT,
        verbose_name=_('Status'),
        db_index=True
    )
    class Meta:
        db_table = 'immob_invoices'
        verbose_name = _('Invoice')
        verbose_name_plural = _('Invoices')
        indexes = [
            models.Index(fields=['payment', 'issue_date']),
            models.Index(fields=['status', 'issue_date']),
            models.Index(fields=['invoice_number']),
        ]
    
