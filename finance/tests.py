import json
from uuid import uuid4
from django.test import TestCase
from django.urls import reverse
from unittest.mock import patch, MagicMock
from decimal import Decimal
from datetime import date

from accounts.models import ImmobUser, Workspace
from finance.models import Tenant, Contrat, Payment
from holdings.models import Property, Building
from finance.services.dtos import TenantCreateDTO, TenantUpdateDTO
from core.utils import encrypt_data, decrypt_data
from cryptography.fernet import Fernet

class FinanceModuleTests(TestCase):

    def setUp(self):
        self.admin_user = ImmobUser.objects.create_user(
            username="admin@example.com",
            email="admin@example.com",
            password="password123",
            role=ImmobUser.UserRole.OWNER
        )
        self.workspace = Workspace.objects.create(
            admin=self.admin_user,
            company_name="Test Workspace"
        )
        self.user = ImmobUser.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="password123",
            workspace=self.workspace
        )
        self.client.force_login(self.user)

        self.building = Building.objects.create(workspace=self.workspace, name="Test Building")
        self.property = Property.objects.create(
            building=self.building,
            name="Test Property",
            workspace=self.workspace,
            surface_area=50.0,
            room_count=2,
            monthly_rent=1200.00,
            status=Property.PropertyStatus.AVAILABLE
        )

        self.tenant = Tenant.objects.create(
            workspace=self.workspace,
            first_name="Jane",
            phone="111222333",
            address="456 Oak Ave",
            emergency_contact_name="John Smith",
            emergency_contact_phone="444555666",
            id_number=encrypt_data("SECUREID")
        )

    # ============================================================================
    # TENANT TESTS
    # ============================================================================

    @patch('core.services.audit_log_service.AuditLogService.log_action')
    def test_create_tenant_api(self, mock_log_action):
        tenant_data = {
            "workspace_id": str(self.workspace.id),
            "first_name": "John", "last_name": "Doe", "email": "john.doe@example.com",
            "phone": "1234567890", "address": "123 Main St",
            "emergency_contact_name": "Jane Doe", "emergency_contact_phone": "0987654321",
            "id_number": "ID12345"
        }
        response = self.client.post(reverse('dashboard:tenants'), data=json.dumps(tenant_data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Tenant.objects.filter(first_name="John").exists())
        created_tenant = Tenant.objects.get(first_name="John")
        self.assertEqual(decrypt_data(created_tenant.id_number), "ID12345")
        mock_log_action.assert_called_once()

    def test_get_tenant_details_api(self):
        response = self.client.get(reverse('dashboard:tenants'), HTTP_X_INERTIA=True, HTTP_X_INERTIA_PARTIAL_COMPONENT='dashboard/Tenants', HTTP_X_INERTIA_PARTIAL_DATA='tenants')
        self.assertEqual(response.status_code, 200)
        page_props = json.loads(response.content)['props']
        self.assertIn('tenants', page_props)

    # ============================================================================
    # CONTRAT TESTS
    # ============================================================================

    @patch('core.services.audit_log_service.AuditLogService.log_action')
    def test_create_contrat_api(self, mock_log_action):
        contrat_data = {
            "property_id": str(self.property.id),
            "tenant_id": str(self.tenant.id),
            "start_date": "2024-01-01",
            "duration_in_months": 12,
            "monthly_rent": "1200.00",
            "security_deposit": "2400.00",
            "charges": "50.00",
            "status": "ACTIVE"
        }
        response = self.client.post(reverse('dashboard:contrats'), data=json.dumps(contrat_data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Contrat.objects.filter(property=self.property, tenant=self.tenant).exists())
        mock_log_action.assert_called_once()

        # Vérifier que les paiements ont bien été créés
        new_contrat = Contrat.objects.get(property=self.property, tenant=self.tenant)
        self.assertEqual(new_contrat.contrat_payments.count(), 12)

    def test_get_contrat_details_api(self):
        Contrat.objects.create(
            workspace=self.workspace, property=self.property, tenant=self.tenant,
            start_date=date(2024, 1, 1), end_date=date(2024, 12, 31),
            monthly_rent=Decimal("1200.00"), contrat_number="C123"
        )
        response = self.client.get(reverse('dashboard:contrats'), HTTP_X_INERTIA=True, HTTP_X_INERTIA_PARTIAL_COMPONENT='dashboard/Contrats', HTTP_X_INERTIA_PARTIAL_DATA='contrats')
        self.assertEqual(response.status_code, 200)
        page_props = json.loads(response.content)['props']
        self.assertIn('contrats', page_props)

    # ============================================================================
    # PAYMENT TESTS
    # ============================================================================
    def test_no_duplicate_payments_on_save(self):
        """Vérifie qu'activer un contrat génère les paiements une seule fois."""
        contrat = Contrat.objects.create(
            workspace=self.workspace,
            property=self.property,
            tenant=self.tenant,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 3, 31),
            monthly_rent=Decimal("1000.00"),
            charges=Decimal("50.00"),
            contrat_number="TEST-DUP-001",
            status=Contrat.ContratStatus.DRAFT,
            payment_frequency=Contrat.PaymentFrequency.MONTHLY
        )
        self.assertEqual(contrat.contrat_payments.count(), 0)

        # Activer le contrat
        contrat.status = Contrat.ContratStatus.ACTIVE
        contrat.save()

        self.assertEqual(contrat.contrat_payments.count(), 3)
        self.assertEqual(contrat.contrat_payments.first().amount, Decimal("1050.00"))

        # Sauvegarder à nouveau le contrat ne devrait pas créer de doublons
        contrat.save()
        self.assertEqual(contrat.contrat_payments.count(), 3)

    def test_list_payments_for_contrat_api(self):
        contrat = Contrat.objects.create(
            workspace=self.workspace, property=self.property, tenant=self.tenant,
            start_date=date(2024, 1, 1), end_date=date(2024, 12, 31),
            monthly_rent=Decimal("1200.00"), contrat_number="C456"
        )
        Payment.objects.create(contrat=contrat, amount=Decimal("1250.00"), due_date=date(2024, 2, 1), reference_number="P001")

        response = self.client.get(reverse('dashboard:payments'), HTTP_X_INERTIA=True, HTTP_X_INERTIA_PARTIAL_COMPONENT='dashboard/Payments', HTTP_X_INERTIA_PARTIAL_DATA='payments')
        self.assertEqual(response.status_code, 200)
        page_props = json.loads(response.content)['props']
        self.assertIn('payments', page_props)

    @patch('core.services.audit_log_service.AuditLogService.log_action')
    def test_update_payment_status_api(self, mock_log_action):
        contrat = Contrat.objects.create(
            workspace=self.workspace, property=self.property, tenant=self.tenant,
            start_date=date(2024, 1, 1), end_date=date(2024, 12, 31),
            monthly_rent=Decimal("1200.00"), contrat_number="C789"
        )
        payment = Payment.objects.create(contrat=contrat, amount=Decimal("1250.00"), due_date=date(2024, 2, 1), reference_number="P003")

        update_data = {
            "id": str(payment.id),
            "status": "PAID",
            "payment_method": "BANK_TRANSFER"
        }

        response = self.client.put(reverse('dashboard:payments'), data=json.dumps(update_data), content_type='application/json')
        self.assertEqual(response.status_code, 302)
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.PaymentStatus.PAID)
        self.assertEqual(payment.payment_method, Payment.PaymentMethod.BANK_TRANSFER)
        mock_log_action.assert_called_once()
