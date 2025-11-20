from typing import List, Dict, Any
from pydantic_core import ErrorDetails
from django.conf import settings
from cryptography.fernet import Fernet, InvalidToken
import base64

# ============================================================================
# GESTION DES ERREURS
# ============================================================================

def format_pydantic_errors(errors: List[ErrorDetails]) -> Dict[str, List[str]]:
    """
    Transforme la liste d'erreurs Pydantic en un dictionnaire
    regroupant les messages d'erreur par champ.
    """
    formatted: Dict[str, List[str]] = {}
    for err in errors:
        loc = err.get("loc")
        if not loc:
            continue
        field = str(loc[0]) if isinstance(loc, (list, tuple)) else str(loc)
        msg = err.get("msg", "Unknown error")
        formatted.setdefault(field, []).append(msg)
    return formatted


# ============================================================================
# CRYPTOGRAPHIE (pour les données sensibles)
# ============================================================================

def get_cipher_suite():
    """
    Initialise la suite de chiffrement Fernet à partir de la clé dans les settings.
    """
    key = settings.SENSITIVE_DATA_KEY
    if not key:
        raise ValueError("SENSITIVE_DATA_KEY n'est pas définie dans les settings.")

    return Fernet(key.encode('utf-8'))

def encrypt_data(data: str) -> str:
    """
    Chiffre une chaîne de caractères et retourne le résultat encodé en base64.
    """
    if not data:
        return ""
    cipher_suite = get_cipher_suite()
    encrypted_bytes = cipher_suite.encrypt(data.encode('utf-8'))
    return encrypted_bytes.decode('utf-8')

def decrypt_data(encrypted_data: str) -> str:
    """
    Déchiffre une chaîne de caractères encodée en base64.
    Retourne une chaîne vide si le déchiffrement échoue.
    """
    if not encrypted_data:
        return ""

    cipher_suite = get_cipher_suite()
    try:
        decrypted_bytes = cipher_suite.decrypt(encrypted_data.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except (InvalidToken, TypeError, ValueError):
        # En cas d'erreur de déchiffrement (ex: token invalide, format incorrect)
        # On peut logger l'erreur ici si nécessaire
        return ""