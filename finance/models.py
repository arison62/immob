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
