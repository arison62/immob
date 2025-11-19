from accounts.models import ImmobUser, UserBuildingPermission
from holdings.models import Building, Property
from .dtos import PropertyCreateDTO, PropertyUpdateDTO # DTOs de la session précédente
from core.services.audit_log_service import AuditLogService, AuditLog
from holdings.services.building_service import building_service, SCORE_MAPPING, DEFAULT_SCORE # Importe le service et les constantes

from django.db import transaction
from django.db.models.query import QuerySet
from django.db.models import OuterRef, Subquery, CharField, IntegerField, Value, Case, When
from django.utils import timezone
from django.db.models import Q
from django.shortcuts import get_object_or_404
from uuid import UUID
from holdings.utils import generate_reference_code
from typing import Literal, Optional, List, Dict, Any

class PropertyService:
    
    @staticmethod
    def _log_access_denied(user: ImmobUser, entity_id: UUID, request: Optional[Any] = None):
        """Logue l'échec d'accès (CDC 5.3.4)"""
        
        AuditLogService.log_action(
            user=user,
            action=AuditLog.AuditAction.ACCESS_DENIED,
            entity_type='Property',
            entity_id=str(entity_id) if entity_id else str(UUID(int=0)),
            request=request,
        )

    def get_property_for_user(
        self, 
        acting_user: ImmobUser, 
        property_id: UUID, 
        required_permission: UserBuildingPermission.PermissionLevel,
        request: Optional[Any] = None
    ) -> Property:
        """
        Méthode de sécurité interne : Récupère une propriété ET vérifie les droits 
        sur son bâtiment parent en une seule fois.
        """
        
        # 1. Récupérer la propriété et son bâtiment (optimisé)
        try:
            prop = Property.objects.select_related('building').get(id=property_id, is_deleted=False)
        except Property.DoesNotExist:
            self._log_access_denied(acting_user, property_id, request)
            raise PermissionError("Propriété non trouvée.")

        # 2. Délégation du contrôle d'accès au BuildingService
        # Lève une PermissionError si l'accès est refusé sur le bâtiment parent
        building_service.get_building_for_user(
            acting_user=acting_user,
            building_id=prop.building.id, # type: ignore
            required_permission=required_permission,
            request=request
        )
        
        # 3. Retourner la propriété si le contrôle est passé
        return prop

    @transaction.atomic
    def create_property(self, acting_user: ImmobUser, property_data: PropertyCreateDTO, request=None) -> Property:
        """
        Crée une nouvelle propriété après avoir vérifié les droits CREATE
        sur le bâtiment parent.
        """
        
        # 1. CONTRÔLE D'ACCÈS (Délégation au BuildingService)
        # L'utilisateur doit avoir le droit 'CREATE' sur le bâtiment parent
        try:
            parent_building = building_service.get_building_for_user(
                acting_user,
                property_data.building_id,
                UserBuildingPermission.PermissionLevel.CREATE,
                request
            )
        except (AttributeError, TypeError):
             raise PermissionError("Un building_id est requis pour créer une propriété.")


        # 2. CRÉATION
        data_to_create = property_data.model_dump(exclude={'building_id'})
        
        prop = Property.objects.create(
            reference_code = generate_reference_code(property_data.type),
            workspace = acting_user.workspace,
            building=parent_building,
            **data_to_create
        )

        # 3. AUDIT LOG (CDC 5.3.4)
        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.CREATE,
            entity_type='Property',
            entity_id=str(prop.id),
            new_values=data_to_create,
            request=request,
        )

        return prop

    @transaction.atomic
    def update_property(
        self, 
        acting_user: ImmobUser, 
        property_id: UUID, 
        property_data: PropertyUpdateDTO, 
        request=None
    ) -> Property:
        """Met à jour une propriété existante."""

        # 1. CONTRÔLE D'ACCÈS (via la méthode helper)
        # Vérifie que la propriété existe ET que l'utilisateur a le droit UPDATE
        prop_to_update = self.get_property_for_user(
            acting_user,
            property_id,
            UserBuildingPermission.PermissionLevel.UPDATE,
            request
        )

        # 2. MISE À JOUR
        update_data = property_data.model_dump(exclude_none=True, exclude={'id', 'building_id'})
        
        if not update_data:
            return prop_to_update

        old_values: Dict[str, Any] = {}
        
        for key, value in update_data.items():
            old_values[key] = getattr(prop_to_update, key)
            setattr(prop_to_update, key, value)
            
        prop_to_update.full_clean()
        prop_to_update.save()
        
        # 3. AUDIT LOG (CDC 5.3.4)
        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.UPDATE,
            entity_type='Property',
            entity_id=str(prop_to_update.id),
            old_values=old_values,
            new_values=update_data,
            request=request
        )

        return prop_to_update
        
    @transaction.atomic
    def delete_property(self, acting_user: ImmobUser, property_id: UUID, request=None):
        """Supprime logiquement une propriété."""
        
        # 1. CONTRÔLE D'ACCÈS (via la méthode helper)
        # Vérifie que la propriété existe ET que l'utilisateur a le droit DELETE
        prop_to_delete = self.get_property_for_user(
            acting_user,
            property_id,
            UserBuildingPermission.PermissionLevel.DELETE,
            request
        )
        
        # 2. SOFT DELETE
        prop_to_delete.is_deleted = True
        prop_to_delete.save()
        
        # 3. AUDIT LOG (CDC 5.3.4)
        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.DELETE,
            entity_type='Property',
            entity_id=str(prop_to_delete.id),
            request=request
        )

    def list_properties_for_building(self, acting_user: ImmobUser, building_id: UUID, request=None):
        """
        Liste toutes les propriétés d'un bâtiment spécifique, si l'utilisateur
        a le droit de le voir.
        """
        
        # 1. CONTRÔLE D'ACCÈS (Délégation)
        # Vérifie que l'utilisateur a au moins le droit VIEW sur le bâtiment parent
        building_service.get_building_for_user(
            acting_user,
            building_id,
            UserBuildingPermission.PermissionLevel.VIEW,
            request
        )
        
        # 2. Requête (Lazy QuerySet)
        return Property.objects.filter(
            building_id=building_id, 
            is_deleted=False
        ).values()


    def list_all_properties_for_user(self, acting_user: ImmobUser):
        """
        Liste TOUTES les propriétés (et leur droit parent) auxquelles 
        l'utilisateur a accès, optimisé pour la DB.
        """
        
        # Cas 1: OWNER
        if acting_user.role == ImmobUser.UserRole.OWNER:
            return Property.objects.filter(is_deleted=False).annotate(
                building_permission=Value(
                    str(UserBuildingPermission.PermissionLevel.DELETE),
                    output_field=CharField()
                )
            ).values() # .values() est optionnel mais suit le style demandé

        # Cas 2: MANAGER/VIEWER
        
        # Sous-requête des permissions valides (exactement comme dans BuildingService)
        valid_user_permissions = UserBuildingPermission.objects.filter(
            user=acting_user
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gte=timezone.now())
        )
        
        # Filtre les bâtiments auxquels l'utilisateur a au moins le droit VIEW
        buildings_with_view_access = valid_user_permissions.filter(
            permission_level_score__gte=SCORE_MAPPING[UserBuildingPermission.PermissionLevel.VIEW]
        ).values_list('building_id', flat=True)

        # Requête principale : Obtenir les propriétés de ces bâtiments
        properties_qs = Property.objects.filter(
            building_id__in=buildings_with_view_access,
            is_deleted=False
        )

        # Annotation : Ajoute le niveau de permission du bâtiment parent à chaque propriété
        
        # Subquery pour le score
        score_subquery = valid_user_permissions.filter(
            building_id=OuterRef('building_id')
        ).values('permission_level_score')[:1]
        
        # Case pour le mapping score -> str
        SCORE_TO_PERMISSION_MAP = {v: k for k, v in SCORE_MAPPING.items()}
        permission_case = Case(
            *[
                When(building_permission_score=score, then=Value(permission_str))
                for score, permission_str in SCORE_TO_PERMISSION_MAP.items()
            ],
            default=Value('none'),
            output_field=CharField()
        )

        # Applique l'annotation
        properties_qs = properties_qs.annotate(
            building_permission_score=Subquery(score_subquery, output_field=IntegerField())
        ).annotate(
            building_permission=permission_case
        )
        
        # Retourne les valeurs pour le frontend
        return properties_qs.values(
            'id', 
            'name', 
            'building_id', 
            'building__name', 
            'building_permission', # Le droit sur le bâtiment parent
            'type',
            'status',
            'floor',
            'door_number',
            'surface_area',
            'room_count',
            'bedroom_count',
            'bathroom_count',
            'has_parking',
            'has_balcony',
            'equipment_list',
            'monthly_rent',
            'description'
        ) #
           
        


property_service = PropertyService()