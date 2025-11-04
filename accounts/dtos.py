from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from accounts.models import ImmobUser

class UserCreateDTO(BaseModel):
    """
    Data Transfer Object (DTO) pour la création d'un ImmobUser.
    Utilisé par TeamService.create_user.
    """
    email: EmailStr
    password: str = Field(min_length=8)
    first_name: str = Field(max_length=150)
    last_name: str = Field(max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    role: str = Field(default=ImmobUser.UserRole.VIEWER) # MANAGER ou VIEWER pour l'équipe

    @field_validator('role')
    def validate_role(cls, value):
        """
        Vérifie que le rôle fourni est valide et autorisé pour la création d'équipe.
        """
        valid_roles = [ImmobUser.UserRole.MANAGER, ImmobUser.UserRole.VIEWER]
        if value not in valid_roles:
            raise ValueError(f"Le rôle doit être l'un des suivants : {', '.join(valid_roles)}")
        return value

class UserUpdateDTO(BaseModel):
    """
    Data Transfer Object (DTO) pour la mise à jour d'un ImmobUser.
    Utilisé par TeamService.update_user.
    """
    first_name: Optional[str] = Field(None, max_length=150)
    last_name: Optional[str] = Field(None, max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    role: Optional[str] = None # MANAGER ou VIEWER pour l'équipe

    @field_validator('role')
    def validate_role(cls, value):
        """
        Vérifie que si un rôle est fourni, il est valide (MANAGER ou VIEWER).
        """
        if value is not None:
            from accounts.models import ImmobUser
            valid_roles = [ImmobUser.UserRole.MANAGER, ImmobUser.UserRole.VIEWER]
            if value not in valid_roles:
                raise ValueError(f"Le rôle doit être l'un des suivants : {', '.join(valid_roles)}")
        return value