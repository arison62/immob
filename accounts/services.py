from accounts.models import ImmobUser
from django.utils import timezone
from django.db.models import Q
from django.utils.functional import cached_property
from typing import Dict

class AccessControlService:
    
    PERMISSION_HIERARCHY = [
        'can_delete',  # Index 0: Le plus fort
        'can_create',  # Index 1
        'can_update',  # Index 2
        'can_view',    # Index 3: Le plus faible
    ]

    @staticmethod
    def _get_user_permissions(user: ImmobUser):
        """
        Récupère toutes les permissions valides (non supprimées, actives et non expirées) 
        pour un utilisateur. (Filtrage de sécurité 5.3.2)
        """
        return user.property_permissions.filter( # type: ignore
            Q(expires_at__isnull=True) | Q(expires_at__gte=timezone.now()), 
            is_deleted=False,
        )

   
    @staticmethod
    def get_global_permission(user: ImmobUser) -> Dict[str, str]:
        """
        Détermine le meilleur droit maximal atteint pour chaque scope (Building et Property).
        Ceci permet au frontend de gérer l'affichage de la sidebar de manière granulaire.
        
        Renvoie : {'building_scope_perm': 'can_view' | 'none', 'property_scope_perm': 'can_create' | 'none'}
        """
        
        # Initialisation par défaut : aucun accès
        default_result = {
            'building_scope_perm': 'none',
            'property_scope_perm': 'none'
        }
        
        # 1. Cas Spécial : Rôle OWNER (Accès total sur les deux scopes)
        if user.role == ImmobUser.UserRole.OWNER:
            return {
                'building_scope_perm': 'can_delete',
                'property_scope_perm': 'can_delete'
            }

        permissions_queryset = AccessControlService._get_user_permissions(user)

        # Si aucune permission, renvoie le défaut (1 requête COUNT)
        if not permissions_queryset.exists():
            return default_result

        # 2. Requête Unique Optimisée (1 SELECT pour toutes les données pertinentes)
        has_any_permission_q = Q(can_view=True) | Q(can_update=True) | Q(can_create=True) | Q(can_delete=True)

        relevant_permissions = permissions_queryset.filter(has_any_permission_q).values(
            'building_id', 'property_id', 'can_view', 'can_update', 'can_create', 'can_delete'
        )

        if not relevant_permissions:
            return default_result
            
        # 3. Logique de Recherche du Meilleur Droit par Scope (en Python, très rapide)
        
        # On cherche l'index le plus petit (droit le plus fort)
        best_building_index = len(AccessControlService.PERMISSION_HIERARCHY) 
        best_property_index = len(AccessControlService.PERMISSION_HIERARCHY) 

        for perm_data in relevant_permissions:
            current_best_index = len(AccessControlService.PERMISSION_HIERARCHY)
            
            # 3.1. Trouver le droit le plus fort de CETTE LIGNE
            for index, action in enumerate(AccessControlService.PERMISSION_HIERARCHY):
                if perm_data.get(action, False):
                    current_best_index = index
                    break # On a trouvé le droit le plus fort pour cette ligne

            # 3.2. Mise à jour de la portée Building (permissions explicites sur Building)
            if perm_data['building_id'] is not None:
                if current_best_index < best_building_index:
                    best_building_index = current_best_index

            # 3.3. Mise à jour de la portée Property
            # Ceci inclut les permissions Property explicites (property_id is not None)
            # ET les permissions Building implicites (qui se propagent aux Properties)
            if perm_data['property_id'] is not None or perm_data['building_id'] is not None:
                if current_best_index < best_property_index:
                    best_property_index = current_best_index


        # 4. Construction du Résultat Final
        
        final_result = {}

        # Si un index a été mis à jour, on renvoie le nom de l'action, sinon 'none'
        if best_building_index < len(AccessControlService.PERMISSION_HIERARCHY):
            final_result['building_scope_perm'] = AccessControlService.PERMISSION_HIERARCHY[best_building_index]
        else:
            final_result['building_scope_perm'] = 'none'

        if best_property_index < len(AccessControlService.PERMISSION_HIERARCHY):
            final_result['property_scope_perm'] = AccessControlService.PERMISSION_HIERARCHY[best_property_index]
        else:
            final_result['property_scope_perm'] = 'none'

        return final_result