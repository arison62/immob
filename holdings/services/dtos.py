from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID
from holdings.models import Property

class AddressDTO(BaseModel):
    """Sous-modèle pour l'adresse."""
    street: str = Field(..., max_length=255)
    number: Optional[str] = Field(None, max_length=10)
    postal_code: Optional[str] = Field(None, max_length=10)
    city: str = Field(..., max_length=100)
    country: str = Field(..., max_length=100)

class BuildingPermission(BaseModel):
    user_id: UUID
    permission_name: str

class AddressUpdateDTO(BaseModel):
    street: Optional[str] = Field(None, max_length=255)
    number: Optional[str] = Field(None, max_length=10)
    postal_code: Optional[str] = Field(None, max_length=10)
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)

class BuildingCreateDTO(BaseModel):
    name: str = Field(..., max_length=255)
    address: AddressDTO 
    description: Optional[str] = None
    floor_count : Optional[int] = None
    permissions: Optional[list[BuildingPermission]]

class BuildingUpdateDTO(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    address: Optional[AddressUpdateDTO] = None
    description: Optional[str] = None
    floor_count : Optional[int] = None

class PropertyCreateDTO(BaseModel):
    building_id: UUID
    name: str = Field(..., max_length=255)
    type: str = Field(..., max_length=20)
    status: Optional[str] = Field('AVAILABLE', max_length=20)
    floor: Optional[int] = None
    door_number: Optional[str] = Field(None, max_length=20)
    surface_area: float = Field(..., gt=0)
    room_count: int = Field(..., gt=0)
    bedroom_count: Optional[int] = Field(0, ge=0)
    bathroom_count: Optional[int] = Field(1, ge=0)
    has_parking: Optional[bool] = False
    has_balcony: Optional[bool] = False
    equipment_list: Optional[list[str]] = []
    monthly_rent: float = Field(..., gt=0)
    description: Optional[str] = None

    @field_validator('type')
    def validate_type(cls, value):
        """
        Vérifie que le type de propriété est valide.
        """
        valid_types = [choice[0] for choice in Property.PropertyType.choices]
        if value not in valid_types:
            raise ValueError(f"Le type de propriété doit être l'un des suivants : {', '.join(valid_types)}")
        return value

    @field_validator('status')
    def validate_status(cls, value):
        """
        Vérifie que le statut de la propriété est valide.
        """
        valid_statuses = [choice[0] for choice in Property.PropertyStatus.choices]
        if value not in valid_statuses:
            raise ValueError(f"Le statut de la propriété doit être l'un des suivants : {', '.join(valid_statuses)}")
        return value

class PropertyUpdateDTO(BaseModel):
    id: UUID
    building_id: Optional[UUID] = None
    name: Optional[str] = Field(None, max_length=255)
    type: Optional[str] = Field(None, max_length=20)
    status: Optional[str] = Field(None, max_length=20)
    floor: Optional[int] = None
    door_number: Optional[str] = Field(None, max_length=20)
    surface_area: Optional[float] = Field(None, gt=0)
    room_count: Optional[int] = Field(None, gt=0)
    bedroom_count: Optional[int] = Field(None, ge=0)
    bathroom_count: Optional[int] = Field(None, ge=0)
    has_parking: Optional[bool] = None
    has_balcony: Optional[bool] = None
    equipment_list: Optional[list[str]] = None
    monthly_rent: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None

    @field_validator('type')
    def validate_type(cls, value):
        """
        Vérifie que le type de propriété est valide.
        """
        if value is None:
            return value
        valid_types = [choice[0] for choice in Property.PropertyType.choices]
        if value not in valid_types:
            raise ValueError(f"Le type de propriété doit être l'un des suivants : {', '.join(valid_types)}")
        return value

    @field_validator('status')
    def validate_status(cls, value):
        """
        Vérifie que le statut de la propriété est valide.
        """
        if value is None:
            return value
        valid_statuses = [choice[0] for choice in Property.PropertyStatus.choices]
        if value not in valid_statuses:
            raise ValueError(f"Le statut de la propriété doit être l'un des suivants : {', '.join(valid_statuses)}")
        return value


class PropertyPhotoDTO(BaseModel):
    property_id: UUID
    file_path: str = Field(..., max_length=500)
    is_primary: Optional[bool] = False
    display_order: Optional[int] = 0
