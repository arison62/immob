from .models import Property


def generate_reference_code(property_type):
    """Génère un code de référence unique pour une propriété"""
    from django.utils import timezone
    import random
    
    type_prefix = {
        Property.PropertyType.APARTMENT: 'APT',
        Property.PropertyType.HOUSE: 'HSE',
        Property.PropertyType.STUDIO: 'STD',
    }.get(property_type, 'PRO')
    

    date_part = timezone.now().strftime('%y%m')
    random_part = ''.join([str(random.randint(0, 9)) for _ in range(3)])
    
    return f"{type_prefix}-{date_part}{random_part}"