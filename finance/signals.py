
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Contract, Payment
from holdings.models import Property


@receiver(post_save, sender=Contract)
def update_property_status_on_contract_save(sender, instance, created, **kwargs):
    """Met à jour le statut de la propriété lors de la sauvegarde d'un contrat"""
    if instance.status == Contract.ContractStatus.ACTIVE:
        instance.property.status = Property.PropertyStatus.OCCUPIED
        instance.property.save()
    elif instance.status in [Contract.ContractStatus.TERMINATED, Contract.ContractStatus.EXPIRED]:
        # Vérifier s'il n'y a pas d'autre contrat actif
        active_contracts = Contract.objects.filter(
            property=instance.property,
            status=Contract.ContractStatus.ACTIVE
        ).exclude(id=instance.id).exists()
        
        if not active_contracts:
            instance.property.status = Property.PropertyStatus.AVAILABLE
            instance.property.save()


@receiver(pre_save, sender=Payment)
def check_payment_late_status(sender, instance, **kwargs):
    """Vérifie et met à jour le statut de retard des paiements"""
    if instance.status == Payment.PaymentStatus.PENDING:
        if instance.due_date < timezone.now().date():
            instance.status = Payment.PaymentStatus.LATE


