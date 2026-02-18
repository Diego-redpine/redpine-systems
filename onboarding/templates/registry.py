"""Template registry — maps business descriptions to template families.

Flow: description text → detect_template_type() → (business_type, family) → get_template()
"""

from .beauty_body import get_beauty_body_template

# Maps freeform keywords found in descriptions to normalized business_type values
# Order matters: longer/more-specific aliases checked first via sorted matching
BEAUTY_BODY_ALIASES = {
    # Nail
    'nail tech': 'nail_salon',
    'nail salon': 'nail_salon',
    'nail art': 'nail_salon',
    'gel nails': 'nail_salon',
    'acrylics': 'nail_salon',
    'manicure': 'nail_salon',
    'pedicure': 'nail_salon',
    'nails': 'nail_salon',
    'nail': 'nail_salon',
    # Barber
    'barber shop': 'barbershop',
    'barbershop': 'barbershop',
    'barber': 'barbershop',
    # Hair salon
    'hair salon': 'hair_salon',
    'hair stylist': 'hair_salon',
    'hairstylist': 'hair_salon',
    'hairdresser': 'hair_salon',
    # Lash / brow
    'lash tech': 'lash_brow',
    'brow tech': 'lash_brow',
    'lash and brow': 'lash_brow',
    'lash & brow': 'lash_brow',
    'lashes': 'lash_brow',
    'lash': 'lash_brow',
    'brows': 'lash_brow',
    'brow': 'lash_brow',
    'eyelash': 'lash_brow',
    # Makeup
    'makeup artist': 'makeup_artist',
    'make up artist': 'makeup_artist',
    'makeup': 'makeup_artist',
    'mua': 'makeup_artist',
    # Tattoo / piercing
    'tattoo artist': 'tattoo',
    'tattoo shop': 'tattoo',
    'tattoo studio': 'tattoo',
    'tattoo and piercing': 'tattoo',
    'tattoo & piercing': 'tattoo',
    'piercing': 'tattoo',
    'tattoo': 'tattoo',
    # Spa / massage
    'day spa': 'spa',
    'massage therapist': 'spa',
    'massage therapy': 'spa',
    'massage': 'spa',
    'spa': 'spa',
    # Med spa
    'med spa': 'med_spa',
    'medspa': 'med_spa',
    'medical spa': 'med_spa',
    'aesthetician': 'med_spa',
    'aesthetics': 'med_spa',
    # Pet grooming
    'pet grooming': 'pet_grooming',
    'pet groomer': 'pet_grooming',
    'dog grooming': 'pet_grooming',
    'dog groomer': 'pet_grooming',
    'cat grooming': 'pet_grooming',
    'groomer': 'pet_grooming',
    # Generic salon (least specific — checked last)
    'salon': 'salon',
}

# Sort aliases longest-first so "nail salon" matches before "nail"
_SORTED_ALIASES = sorted(BEAUTY_BODY_ALIASES.keys(), key=len, reverse=True)


def detect_template_type(description):
    """Check if a business description matches a Beauty & Body template.

    Returns (business_type, 'beauty_body') if matched, or (None, None) if no match.
    """
    desc_lower = description.lower()
    for alias in _SORTED_ALIASES:
        if alias in desc_lower:
            return BEAUTY_BODY_ALIASES[alias], 'beauty_body'
    return None, None


def get_template(business_type, family):
    """Load a template config for the given business_type and family.

    Returns (template_config, locked_component_ids) or (None, None) if no template exists.
    """
    if family == 'beauty_body':
        return get_beauty_body_template(business_type)
    return None, None
