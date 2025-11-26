from django.db.models import Sum, Count
from django.utils import timezone
from finance.models import Payment, Contrat
from holdings.models import Property
from accounts.models import ImmobUser

class StatisticsService:
    def get_workspace_statistics(self, acting_user: ImmobUser):
        """Calcule les statistiques pour le workspace de l'utilisateur."""

        workspace = acting_user.workspace

        # Statistiques sur les paiements
        payments = Payment.objects.filter(contrat__workspace=workspace)
        total_paid = payments.filter(status=Payment.PaymentStatus.PAID).aggregate(Sum('amount'))['amount__sum'] or 0
        total_pending = payments.filter(status=Payment.PaymentStatus.PENDING).aggregate(Sum('amount'))['amount__sum'] or 0
        total_late = payments.filter(status=Payment.PaymentStatus.LATE).aggregate(Sum('amount'))['amount__sum'] or 0

        # Statistiques sur les contrats
        contrats = Contrat.objects.filter(workspace=workspace)
        active_contrats = contrats.filter(status=Contrat.ContratStatus.ACTIVE).count()

        # Statistiques sur les propriétés
        properties = Property.objects.filter(building__workspace=workspace)
        total_properties = properties.count()
        occupied_properties = properties.filter(status=Property.PropertyStatus.OCCUPIED).count()
        occupancy_rate = (occupied_properties / total_properties) * 100 if total_properties > 0 else 0

        return {
            'total_paid': total_paid,
            'total_pending': total_pending,
            'total_late': total_late,
            'active_contrats': active_contrats,
            'occupancy_rate': occupancy_rate,
        }

statistics_service = StatisticsService()
