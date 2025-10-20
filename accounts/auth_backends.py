from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from datetime import timedelta # Importation nécessaire pour timedelta

# --- Exception Personnalisée ---
class AccountLockedError(Exception):
    """Exception levée lorsque le compte est désactivé (bloqué)."""
    pass
# -----------------------------

UserModel = get_user_model()
MAX_FAILED_ATTEMPTS = getattr(settings, 'MAX_FAILED_LOGIN_ATTEMPTS', 5)
# Utiliser une valeur par défaut de 15 minutes (900 secondes)
MAX_FAILED_ATTEMPTS_TIME = getattr(settings, 'MAX_FAILED_LOGIN_ATTEMPTS_TIME', 900) 

class LockoutAuthBackend(ModelBackend):

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
        
        try:
            user = UserModel._default_manager.get_by_natural_key(username)
        except UserModel.DoesNotExist:
            return None 

        # 1. Vérification du statut de l'utilisateur (verrouillage permanent)
        if not user.is_active:
            raise AccountLockedError(_("This account has been locked due to too many failed login attempts."))
        
        # 2. Authentification réussie
        if user.check_password(password):
            # Succès : Réinitialisation complète
            if user.failed_login_attempts > 0:
                user.failed_login_attempts = 0
                user.last_failed_login = None
                user.save(update_fields=['failed_login_attempts', 'last_failed_login'])
            return user
        
        # 3. Authentification échouée (Mot de passe incorrect)
        
        
        # 3.1. Vérifier si le compteur doit être réinitialisé en raison du temps
        time_limit = timezone.now() - timedelta(seconds=MAX_FAILED_ATTEMPTS_TIME)
        
        if user.last_failed_login and user.last_failed_login < time_limit:
            # Plus de temps que la limite s'est écoulé depuis la dernière erreur.
            # Réinitialiser le compteur pour la nouvelle série de tentatives.
            user.failed_login_attempts = 0
            # Note: last_failed_login sera mis à jour juste après
        
        # 3.2. Incrémenter et mettre à jour l'horodatage pour la tentative actuelle
        user.failed_login_attempts += 1
        user.last_failed_login = timezone.now()

        # 3.3. Vérifier si la limite est atteinte et verrouiller
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.is_active = False
            # Sauvegarder l'état de verrouillage
            user.save(update_fields=['failed_login_attempts', 'last_failed_login', 'is_active'])
            
        else:
            # Sauvegarder l'incrémentation
            user.save(update_fields=['failed_login_attempts', 'last_failed_login'])

        return None