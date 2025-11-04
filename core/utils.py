from typing import List, Dict, Any
from pydantic_core import ErrorDetails
def format_pydantic_errors(errors: List[ErrorDetails]) -> Dict[str, List[str]]:
    """
    Transforme la liste d'erreurs Pydantic en un dictionnaire
    regroupant les messages d'erreur par champ.

    Exemple d'entrée :
    [
        {'loc': ('password',), 'msg': 'String should have at least 8 characters'},
        {'loc': ('phone',), 'msg': 'String should have at most 20 characters'}
    ]

    Exemple de sortie :
    {
        'password': ['String should have at least 8 characters'],
        'phone': ['String should have at most 20 characters']
    }
    """
    formatted = {}
    for err in errors:
        # On récupère la clé (loc peut être un tuple, on prend le premier élément)
        loc = err.get("loc")
        if not loc:
            continue
        field = loc[0] if isinstance(loc, (list, tuple)) else loc
        msg = err.get("msg", "Unknown error")

        formatted.setdefault(field, []).append(msg)
    return formatted
