def generate_contract_number():
    """Génère un numéro de contrat unique"""
    from django.utils import timezone
    import random
    
    date_part = timezone.now().strftime('%Y%m%d')
    random_part = ''.join([str(random.randint(0, 9)) for _ in range(4)])
    return f"CTR-{date_part}-{random_part}"
