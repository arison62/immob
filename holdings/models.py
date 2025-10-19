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
    
    owner = models.ForeignKey(
        "accounts.Owner",
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
            models.Index(fields=['owner', 'city']),
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
    owner = models.ForeignKey(
        "accounts.Owner",
        on_delete=models.CASCADE,
        related_name='owner_properties'
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
            models.Index(fields=['owner', 'status']),
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

