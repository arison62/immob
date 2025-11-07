from accounts.models import ImmobUser, UserBuildingPermission
from django.utils import timezone
from django.db.models import Q
from typing import Dict

class AccessControlService:
    
    # Nous mappons les niveaux de permission à un score, du plus fort au plus faible.
    PERMISSION_HIERARCHY = {
        UserBuildingPermission.PermissionLevel.DELETE: 4,
        UserBuildingPermission.PermissionLevel.UPDATE: 3,
        UserBuildingPermission.PermissionLevel.CREATE: 2,
        UserBuildingPermission.PermissionLevel.VIEW: 1,
    }
    
    # 2. Map inversée (pour convertir le score en string à la fin)
    HIERARCHY_TO_STRING = {
        4: UserBuildingPermission.PermissionLevel.DELETE,
        3: UserBuildingPermission.PermissionLevel.UPDATE,
        2: UserBuildingPermission.PermissionLevel.CREATE,
        1: UserBuildingPermission.PermissionLevel.VIEW,
        0: 'none', # Le score 0 signifie 'aucun droit'
    }

    @staticmethod
    def _get_user_permissions_queryset(user: ImmobUser):
        """
        Récupère le QuerySet de base pour toutes les permissions de bâtiment 
        valides (actives et non expirées) pour un utilisateur.
        (Filtrage de sécurité 5.3.2)
        """
        return UserBuildingPermission.objects.filter(
            user=user,
        ).filter(
            # La permission est valide si elle n'expire pas OU si elle n'a pas encore expiré
            Q(expires_at__isnull=True) | Q(expires_at__gte=timezone.now())
        )

   
    @staticmethod
    def get_global_permission(user: ImmobUser) -> Dict[str, str]:
        """
        Détermine le meilleur droit maximal (le plus fort) atteint par l'utilisateur 
        sur l'ensemble de son périmètre (scope).
        
        Conformément à notre architecture (CDC 5.3.2), le périmètre est défini
        au niveau 'Building', et ce droit cascade aux 'Property'.
        
        Renvoie : {'building_scope_perm': 'VIEW' | 'UPDATE' | ... | 'none'}
        """
        
        # 1. Cas Spécial : Rôle OWNER (Accès total, le plus haut niveau)
        if user.role == ImmobUser.UserRole.OWNER:
            return {
                'building_scope_perm': UserBuildingPermission.PermissionLevel.DELETE,
            }

        # 2. Récupérer le QuerySet des permissions valides
        permissions_queryset = AccessControlService._get_user_permissions_queryset(user)

        # 3. Extraire les niveaux de permission distincts (Optimisation)
        # 1 seule requête DB pour obtenir la liste des droits (ex: ['VIEW', 'UPDATE'])
        distinct_levels = permissions_queryset.values_list('permission_level', flat=True).distinct()

        if not distinct_levels:
            # L'utilisateur (MANAGER/VIEWER) n'a aucune permission valide
            return {
                'building_scope_perm': 'none',
            }

        # 4. Logique de Recherche du Meilleur Droit (en Python, très rapide)
        # Nous trouvons le score le plus élevé parmi les permissions de l'utilisateur
        best_level_score = 0
        for level in distinct_levels:
            score = AccessControlService.PERMISSION_HIERARCHY.get(level, 0)
            if score > best_level_score:
                best_level_score = score

        # 5. Construction du Résultat Final
        # Convertit le meilleur score trouvé (ex: 3) en string (ex: 'UPDATE')
        final_permission_str = AccessControlService.HIERARCHY_TO_STRING.get(best_level_score, 'none')

        # Le scope est unifié : la permission globale sur Building EST la permission 
        # globale sur Property, car elle reflète le droit maximal de l'utilisateur.
        return {
            'building_scope_perm': final_permission_str,
        }