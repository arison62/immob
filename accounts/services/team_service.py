from accounts.models import ImmobUser
from accounts.dtos import UserCreateDTO, UserUpdateDTO
from core.services.audit_log_service import AuditLogService
from core.models import AuditLog
from django.db import transaction
from uuid import UUID

class TeamService:
    """
    Gère toute la logique métier liée aux membres de l'équipe (MANAGER, VIEWER).
    """

    @transaction.atomic
    def create_user(self, acting_user: ImmobUser, user_data: UserCreateDTO, request=None) -> ImmobUser:
        """
        Crée un nouveau membre de l'équipe après validation des données et vérification des permissions.

        :param acting_user: L'utilisateur qui exécute l'action (doit être OWNER).
        :param user_data: Les données d'entrée validées par Pydantic (DTO).
        :param request: L'objet HttpRequest pour l'audit (IP, User-Agent).
        :return: L'objet ImmobUser créé.
        """
        
        # --- 1. Vérification des Permissions ---
        if acting_user.role != ImmobUser.UserRole.OWNER:
            
            AuditLogService.log_action(
                user=acting_user,
                action=AuditLog.AuditAction.ACCESS_DENIED,
                entity_type='ImmobUser',
                entity_id='N/A (Tentative de création)',
                request=request
            )
            raise PermissionError("Seul un Owner peut créer de nouveaux membres d'équipe.")
                
        # --- 2. Création Sécurisée de l'Utilisateur ---
       
        user = ImmobUser.objects.create_user(
            username=user_data.email,
            email=user_data.email,
            password=user_data.password, # Hashage géré ici par Django
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
            role=user_data.role,
            created_by=acting_user, # Trace qui a créé le compte
        )

        # --- 3. Audit Log ---
        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.CREATE,
            entity_type='ImmobUser',
            entity_id=str(user.id),
            new_values=user_data.model_dump(exclude=["password"]), # Ne pas loguer le mot de passe # type: ignore
            request=request
        )

        return user
    

    @transaction.atomic
    def update_user(self, acting_user: ImmobUser, user_id: UUID, user_data : UserUpdateDTO, request=None) -> ImmobUser:
        """
        Met à jour un membre de l'équipe existant après validation des données.

        :param acting_user: L'utilisateur qui exécute l'action (doit être OWNER).
        :param user_id: L'ID de l'utilisateur à mettre à jour.
        :param user_data: Les données d'entrée validées par Pydantic (DTO).
        :param request: L'objet HttpRequest pour l'audit (IP, User-Agent).
        :return: L'objet ImmobUser mis à jour.
        """
        
        user_to_update = ImmobUser.objects.get(id=user_id)
        
        if not user_to_update:
            raise ValueError("Utilisateur non trouvé.")
        
        if acting_user.role != ImmobUser.UserRole.OWNER:
            
            AuditLogService.log_action(
                user=acting_user,
                action=AuditLog.AuditAction.ACCESS_DENIED,
                entity_type='ImmobUser',
                entity_id=str(user_id),
                request=request
            )
            raise PermissionError("Seul un Owner peut mettre à jour les membres d'équipe.")
        # Preparation des données pour l'audit
        update_data = user_data.model_dump(exclude=["password"], exclude_unset=True) # type: ignore
        if not update_data:
            return user_to_update  # Rien à mettre à jour
        
        old_values  = {key: getattr(user_to_update, key) for key in update_data.keys()}
        for key, value in update_data.items():
            setattr(user_to_update, key, value)
            user_to_update.full_clean()  # Valide les champs selon les contraintes du modèle
        user_to_update.save()
        # --- Audit Log ---
        AuditLogService.log_action(
            user=acting_user,
            action=AuditLog.AuditAction.UPDATE,
            entity_type='ImmobUser',
            entity_id=str(user_id),
            old_values=old_values,
            new_values=update_data,
            request=request
        )
        return user_to_update
    
    def get_user_by_id(self, acting_user: ImmobUser, user_id: UUID) -> ImmobUser:
        """
        Récupère un membre de l'équipe par son ID.

        :param acting_user: L'utilisateur qui exécute l'action (doit être OWNER).
        :param user_id: L'ID de l'utilisateur à récupérer.
        :return: L'objet ImmobUser correspondant.
        """
        if acting_user.role != ImmobUser.UserRole.OWNER and acting_user.pk != user_id:
            raise PermissionError("Seul un Owner peut accéder aux membres de l'équipe.")
        
        user = ImmobUser.objects.get(id=user_id, is_deleted=False)
        if not user:
            raise ValueError("Utilisateur non trouvé.")
        
        return user
    
    def list_team_members(self, acting_user: ImmobUser):
        """
        Liste tous les membres de l'équipe.

        :param acting_user: L'utilisateur qui exécute l'action (doit être OWNER).
        :return: Une liste d'objets ImmobUser.
        """
        if acting_user.role != ImmobUser.UserRole.OWNER:
            raise PermissionError("Seul un Owner peut lister les membres de l'équipe.")
        
        return ImmobUser.objects.filter(is_deleted=False).exclude(role=ImmobUser.UserRole.OWNER)
# Initialisation du Service pour l'export

team_service = TeamService()