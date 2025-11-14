from accounts.models import ImmobUser, UserBuildingPermission
from holdings.models import Building
from .dtos import AddressUpdateDTO, BuildingCreateDTO, BuildingUpdateDTO, AddressDTO
from core.services.audit_log_service import AuditLogService, AuditLog
from django.db import transaction
from django.db.models.query import QuerySet
from django.db.models import OuterRef, Subquery, CharField, IntegerField, Value, Case, When
from django.utils import timezone
from django.db.models import Q
from django.shortcuts import get_object_or_404
from uuid import UUID
from typing import Literal, Optional, List, Dict, Any



SCORE_MAPPING: Dict[str, int] = {
    UserBuildingPermission.PermissionLevel.DELETE: 4,
    UserBuildingPermission.PermissionLevel.UPDATE: 3,
    UserBuildingPermission.PermissionLevel.CREATE: 2,
    UserBuildingPermission.PermissionLevel.VIEW: 1,
}

DEFAULT_SCORE = 0

class BuildingService:
    
   
    @staticmethod
    def _log_access_denied(user: ImmobUser, entity_id: UUID, request: Optional[Any] = None):
        """Logue l'échec d'accès"""
        
        AuditLogService.log_action(
            user=user,
            action=AuditLog.AuditAction.ACCESS_DENIED,
            entity_type='Building',
            entity_id=str(entity_id) if entity_id else str(UUID(int=0)),
            request=request,
        )


    def get_building_for_user(
        self, 
        acting_user: ImmobUser, 
        building_id: UUID, 
        required_permission: UserBuildingPermission.PermissionLevel,
        request: Optional[Any] = None
    ) -> Building:
        """
        Récupère un Building s'il existe et si l'utilisateur y a le niveau de permission requis.
        (Implémentation de la vérification de périmètre par score numérique)
        
        :raises PermissionError: Si l'utilisateur n'a pas le droit.
        """
        
        required_score = SCORE_MAPPING.get(required_permission, DEFAULT_SCORE)
        
        try:
            building = Building.objects.get(id=building_id)
        except Building.DoesNotExist:
            self._log_access_denied(acting_user, building_id, request)
            raise PermissionError("Accès refusé ou ressource non trouvée.")

        # L'OWNER a un accès illimité
        if acting_user.role == ImmobUser.UserRole.OWNER:
            return building
            
        # Les autres rôles (MANAGER/VIEWER) doivent avoir une permission explicite
        
        best_permission = UserBuildingPermission.objects.filter(
            user=acting_user,
            building=building,
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gte=timezone.now()) # Permissions valides
        ).order_by('-permission_level_score').first() # Ordonne par le score le plus élevé
        
        # Détermine le score de l'utilisateur sur ce Building
        user_score = best_permission.permission_level_score if best_permission else DEFAULT_SCORE

        # Règle 3: Comparaison des scores
        if user_score < required_score:
            self._log_access_denied(acting_user, building_id, request)
            raise PermissionError(f"Permission insuffisante.")

        return building


    @transaction.atomic
    def create_building(self, acting_user: ImmobUser, building_data: BuildingCreateDTO, request=None) -> Building:
        """
        Crée un nouveau Building (réservé aux Owners).
        """
        
       
        if acting_user.role != ImmobUser.UserRole.OWNER:
            self._log_access_denied(acting_user, UUID(int=0), request) 
            raise PermissionError("Accès refusé. Seul un Owner est autorisé à créer un nouveau bâtiment.")
        
        data_to_create = building_data.model_dump(exclude_none=True)
        address_dto: AddressDTO = data_to_create.pop('address')
        
        address_fields = address_dto.model_dump(exclude_none=True)
        
        # Ajout des champs d'adresse + des placeholders pour la géolocalisation
        data_to_create = {
            **data_to_create, 
            **address_fields, 
            'latitude': None, 
            'longitude': None
        }

       
        building = Building.objects.create(
            created_by=acting_user,
            **data_to_create
        )

        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.CREATE,
            entity_type='Building',
            entity_id=str(building.id),
            new_values=data_to_create,
            request=request,
        )

        return building

    @transaction.atomic
    def update_building(
        self, 
        acting_user: ImmobUser, 
        building_id: UUID, 
        building_data: BuildingUpdateDTO, 
        request=None
    ) -> Building:
        """Met à jour un Building existant."""

        # CONTRÔLE D'ACCÈS (Délégation de périmètre et permission)
        building_to_update = self.get_building_for_user(
            acting_user, 
            building_id, 
            UserBuildingPermission.PermissionLevel.UPDATE,
            request=request
        )

        # Préparation et Collecte des Données pour l'Audit
        update_data = building_data.model_dump(exclude_none=True)
        
        if not update_data:
            return building_to_update

        # Gérer la mise à jour de l'adresse séparément (si présente)
        new_address_dto: Optional[AddressUpdateDTO] = update_data.pop('address', None)
        
        old_values: Dict[str, Any] = {}
        
        # FUSION DES CHAMPS D'ADRESSE
        if new_address_dto:
            # Récupère les champs de l'AddressDTO à mettre à jour
            address_updates = new_address_dto.model_dump(exclude_none=True)
            
            # Fusionne les champs d'adresse avec les autres champs à mettre à jour
            update_data = {**update_data, **address_updates}

        # Application des Modifications (Champs plats)
        for key, value in update_data.items():
            # Collecte l'ancienne valeur avant la modification
            old_values[key] = getattr(building_to_update, key)
            setattr(building_to_update, key, value)
            
        building_to_update.full_clean()
        building_to_update.save()
        
        # Note: update_data contient maintenant tous les champs mis à jour, y compris ceux de l'adresse
        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.UPDATE,
            entity_type='Building',
            entity_id=str(building_to_update.id),
            old_values=old_values,
            new_values=update_data,
            request=request
        )

        return building_to_update

    def list_buildings_for_user(self, acting_user: ImmobUser):
        """
        Retourne la liste des Buildings auxquels l'utilisateur a accès.
        Implémente le filtrage par périmètre.
        """
        
        if acting_user.role == ImmobUser.UserRole.OWNER:
            return Building.objects.all().annotate(
                user_best_permission=Value(
                    str(UserBuildingPermission.PermissionLevel.DELETE),
                    output_field=CharField()
                )
            ).values(
                'id', 
                'name', 
                'user_best_permission',
                'street',
                'city', 
                'postal_code', 
                'country', 
                'latitude', 
                'longitude',
                'floor_count',
                'description'
            )
        
        valid_user_permissions = UserBuildingPermission.objects.filter(
            user=acting_user,
            building=OuterRef('pk')
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gte=timezone.now())
        ).order_by('-permission_level_score')
        
        single_score_subquery = valid_user_permissions.values('permission_level_score')[:1]
        
        SCORE_TO_PERMISSION_MAP = {v: k for k, v in SCORE_MAPPING.items()}
        permission_case = Case(
            *[
                When(user_best_score=score, then=Value(permission_str))
                for score, permission_str in SCORE_TO_PERMISSION_MAP.items()
            ],
            default=Value('none'),
            output_field=CharField()
        )
        
        buildings_qs = Building.objects.filter(
            id__in=valid_user_permissions.values('building')
        ).distinct().annotate(
           user_best_score=Subquery(
               single_score_subquery, output_field=IntegerField()
           )
        )
        
        buildings_qs = buildings_qs.annotate(
            user_best_permission=permission_case
        ).values(
            'id', 
            'name', 
            'user_best_permission',
            'street',
            'city', 
            'postal_code', 
            'country', 
            'latitude', 
            'longitude',
            'floor_count',
            'description'
        )
        
        return buildings_qs

building_service = BuildingService()