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
        self.workspace = Workspace.objects.create(name="Test Workspace")
        self.user = ImmobUser.objects.create_user(
            email="test@example.com",
            password="password123",
            workspace=self.workspace
        )
        self.client.force_login(self.user)

        self.building = Building.objects.create(workspace=self.workspace, name="Test Building")
        self.property = Property.objects.create(building=self.building, name="Test Property", workspace=self.workspace)

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
        response = self.client.post(reverse('finance:tenant-list-create'), data=json.dumps(tenant_data), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Tenant.objects.filter(first_name="John").exists())
        created_tenant = Tenant.objects.get(first_name="John")
        self.assertEqual(decrypt_data(created_tenant.id_number), "ID12345")
        mock_log_action.assert_called_once()

    def test_get_tenant_details_api(self):
        response = self.client.get(reverse('finance:tenant-detail', args=[self.tenant.id]))
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(response_data['first_name'], "Jane")
        self.assertEqual(response_data['id_number'], "SECUREID")

    # ============================================================================
    # CONTRAT TESTS
    # ============================================================================

    @patch('core.services.audit_log_service.AuditLogService.log_action')
    @patch('holdings.services.property_service.property_service.get_property_for_user')
    def test_create_contrat_api(self, mock_get_property, mock_log_action):
        mock_get_property.return_value = self.property

        contrat_data = {
            "property_id": str(self.property.id),
            "tenant_id": str(self.tenant.id),
            "start_date": "2024-01-01",
            "end_date": "2024-12-31",
            "monthly_rent": "1200.00",
            "security_deposit": "2400.00",
            "charges": "50.00",
        }
        response = self.client.post(reverse('finance:contrat-create'), data=json.dumps(contrat_data), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Contrat.objects.filter(property=self.property, tenant=self.tenant).exists())
        mock_log_action.assert_called_once()

    @patch('holdings.services.property_service.property_service.get_property_for_user')
    def test_get_contrat_details_api(self, mock_get_property):
        mock_get_property.return_value = self.property

        contrat = Contrat.objects.create(
            workspace=self.workspace, property=self.property, tenant=self.tenant,
            start_date=date(2024, 1, 1), end_date=date(2024, 12, 31),
            monthly_rent=Decimal("1200.00"), contrat_number="C123"
        )
        response = self.client.get(reverse('finance:contrat-detail', args=[contrat.id]))
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(response_data['contrat_number'], "C123")

    # ============================================================================
    # PAYMENT TESTS
    # ============================================================================

    @patch('holdings.services.property_service.property_service.get_property_for_user')
    def test_list_payments_for_contrat_api(self, mock_get_property):
        mock_get_property.return_value = self.property

        contrat = Contrat.objects.create(
            workspace=self.workspace, property=self.property, tenant=self.tenant,
            start_date=date(2024, 1, 1), end_date=date(2024, 12, 31),
            monthly_rent=Decimal("1200.00"), contrat_number="C456"
        )
        Payment.objects.create(contrat=contrat, amount=Decimal("1250.00"), due_date=date(2024, 2, 1), reference_number="P001")
        Payment.objects.create(contrat=contrat, amount=Decimal("1250.00"), due_date=date(2024, 3, 1), reference_number="P002")

        response = self.client.get(reverse('finance:payment-list-for-contrat', args=[contrat.id]))
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(len(response_data), 2)

    @patch('core.services.audit_log_service.AuditLogService.log_action')
    @patch('holdings.services.property_service.property_service.get_property_for_user')
    def test_update_payment_status_api(self, mock_get_property, mock_log_action):
        mock_get_property.return_value = self.property

        contrat = Contrat.objects.create(
            workspace=self.workspace, property=self.property, tenant=self.tenant,
            start_date=date(2024, 1, 1), end_date=date(2024, 12, 31),
            monthly_rent=Decimal("1200.00"), contrat_number="C789"
        )
        payment = Payment.objects.create(contrat=contrat, amount=Decimal("1250.00"), due_date=date(2024, 2, 1), reference_number="P003")

        update_data = {
            "status": "PAID",
            "payment_method": "BANK_TRANSFER"
        }

        response = self.client.put(reverse('finance:payment-detail', args=[payment.id]), data=json.dumps(update_data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.PaymentStatus.PAID)
        self.assertEqual(payment.payment_method, Payment.PaymentMethod.BANK_TRANSFER)
        mock_log_action.assert_called_once()
