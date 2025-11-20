from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class TenantCreateDTO(BaseModel):
    first_name: str = Field(..., max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: str = Field(..., max_length=20)
    id_number: str = Field(..., max_length=255)
    address: str
    emergency_contact_name: str = Field(..., max_length=200)
    emergency_contact_phone: str = Field(..., max_length=20)
