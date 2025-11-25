from accounts.models import ImmobUser
from finance.models import Invoice

class InvoiceService:
    def list_invoices_for_workspace(self, acting_user: ImmobUser):
        """Liste toutes les factures pour le workspace de l'utilisateur."""
        return Invoice.objects.filter(
            payment__contrat__workspace=acting_user.workspace
        ).select_related('payment__contrat__tenant', 'payment__contrat__property').order_by('-issue_date').values(
            'id', 'invoice_number', 'payment__reference_number', 'payment__contrat__tenant__first_name',
            'payment__contrat__tenant__last_name', 'total_amount', 'issue_date', 'status'
        )

invoice_service = InvoiceService()
