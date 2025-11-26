from pydantic import BaseModel, Field, EmailStr, StringConstraints
from uuid import UUID
from datetime import date, datetime
from typing import Optional, Annotated
from decimal import Decimal
from finance.models import Contrat, Payment

# ============================================================================
# DTOs Locataire (Tenant)
# ============================================================================

class TenantBaseDTO(BaseModel):
    first_name: str = Field(max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: str = Field(max_length=20)
    address: str
    emergency_contact_name: str = Field(max_length=200)
    emergency_contact_phone: str = Field(max_length=20)
    id_number: Annotated[str, StringConstraints(min_length=1)]

class TenantCreateDTO(TenantBaseDTO):
    pass

class TenantUpdateDTO(TenantBaseDTO):
    first_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=200)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)
    id_number: Optional[Annotated[str, StringConstraints(min_length=1)]] = None

class TenantDetailsDTO(TenantBaseDTO):
    id: UUID
    id_number: str  # Le numéro d'ID est retourné chiffré, pour ne pas l'exposer
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============================================================================
# DTOs Contrat
# ============================================================================

class ContratBaseDTO(BaseModel):
    property_id: UUID
    tenant_id: UUID
    start_date: date
    monthly_rent: Decimal = Field(gt=0)
    security_deposit: Optional[Decimal] = Field(None, ge=0)
    charges: Optional[Decimal] = Field(None, ge=0)
    payment_frequency: Contrat.PaymentFrequency = Contrat.PaymentFrequency.MONTHLY
    terms: Optional[str] = None

class ContratCreateDTO(ContratBaseDTO):
    status: Optional[Contrat.ContratStatus] = None
    duration_in_months: int = Field(gt=0)

class ContratUpdateDTO(ContratBaseDTO):
    property_id: Optional[UUID] = None
    tenant_id: Optional[UUID] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    monthly_rent: Optional[Decimal] = Field(None, gt=0)

class ContratDetailsDTO(ContratBaseDTO):
    id: UUID
    workspace_id: UUID
    contrat_number: str
    status: Contrat.ContratStatus
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============================================================================
# DTOs Paiement (Payment)
# ============================================================================

class PaymentBaseDTO(BaseModel):
    contrat_id: UUID
    amount: Decimal = Field(gt=0)
    due_date: date
    status: Payment.PaymentStatus = Payment.PaymentStatus.PENDING

class PaymentCreateDTO(PaymentBaseDTO):
    pass # Les paiements sont générés, donc DTO simple

class PaymentUpdateDTO(BaseModel):
    status: Optional[Payment.PaymentStatus] = None
    payment_method: Optional[Payment.PaymentMethod] = None
    notes: Optional[str] = None

class PaymentDetailsDTO(PaymentBaseDTO):
    id: UUID
    payment_date: Optional[datetime]
    payment_method: Optional[Payment.PaymentMethod]
    reference_number: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True