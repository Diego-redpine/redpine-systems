"""Beauty & Body Services — Template Family 1

Enterprise-first templates. Each business type has its OWN complete template.
AI customizes labels, removes _removable tabs, adds user-requested components.
Locked components (_locked: True) cannot be removed by AI.

Covers: nail_salon, barbershop, hair_salon, lash_brow, makeup_artist,
        tattoo, spa, med_spa, pet_grooming, salon
"""

import copy
import json

# All business types in this family
BEAUTY_BODY_TYPES = {
    'nail_salon', 'barbershop', 'hair_salon', 'lash_brow', 'makeup_artist',
    'tattoo', 'spa', 'med_spa', 'pet_grooming', 'salon',
}


# ──────────────────────────────────────────────────────────────────────
# Enterprise Templates — one complete template per business type
# ──────────────────────────────────────────────────────────────────────

_TEMPLATES = {

    # ── NAIL SALON ─────────────────────────────────────────────────────
    'nail_salon': {
        'tabs': [
            {
                'id': 'tab_1', 'label': 'Dashboard', 'icon': 'home',
                'components': [],
            },
            {
                'id': 'tab_2', 'label': 'Clients', 'icon': 'people',
                'components': [
                    {'id': 'clients', 'label': 'Bookings', 'view': 'pipeline', '_locked': True,
                     'stages': ['Requested', 'Confirmed', 'Checked In', 'In Service', 'Completed']},
                    {'id': 'memberships', 'label': 'Members', 'view': 'pipeline',
                     'stages': ['Prospect', 'Trial', 'Active', 'Up for Renewal']},
                    {'id': 'contacts', 'label': 'Contacts', 'view': 'list'},
                ],
            },
            {
                'id': 'tab_3', 'label': 'Schedule', 'icon': 'calendar',
                'components': [
                    {'id': 'calendar', 'label': 'Schedule', 'view': 'calendar', '_locked': True},
                ],
            },
            {
                'id': 'tab_4', 'label': 'Services', 'icon': 'box',
                'components': [
                    {'id': 'packages', 'label': 'Service Menu', 'view': 'cards'},
                    {'id': 'nail_sets', 'label': 'Nail Sets & Add-Ons', 'view': 'cards'},
                    {'id': 'products', 'label': 'Retail Products', 'view': 'table'},
                ],
            },
            {
                'id': 'tab_5', 'label': 'Gallery', 'icon': 'image',
                'components': [
                    {'id': 'galleries', 'label': 'Nail Art Gallery', 'view': 'cards', '_locked': True},
                ],
            },
            {
                'id': 'tab_6', 'label': 'Staff', 'icon': 'users',
                '_removable': True,
                'components': [
                    {'id': 'staff', 'label': 'Nail Techs', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_7', 'label': 'Payments', 'icon': 'dollar',
                'components': [
                    {'id': 'invoices', 'label': 'Invoices', 'view': 'table', '_locked': True},
                    {'id': 'expenses', 'label': 'Expenses', 'view': 'table'},
                ],
            },
        ],
    },

    # ── BARBERSHOP ─────────────────────────────────────────────────────
    'barbershop': {
        'tabs': [
            {
                'id': 'tab_1', 'label': 'Dashboard', 'icon': 'home',
                'components': [],
            },
            {
                'id': 'tab_2', 'label': 'Clients', 'icon': 'people',
                'components': [
                    {'id': 'clients', 'label': 'Bookings', 'view': 'pipeline', '_locked': True,
                     'stages': ['Walk-in', 'Confirmed', 'Checked In', 'In Chair', 'Completed']},
                    {'id': 'contacts', 'label': 'Contacts', 'view': 'list'},
                ],
            },
            {
                'id': 'tab_3', 'label': 'Schedule', 'icon': 'calendar',
                'components': [
                    {'id': 'calendar', 'label': 'Schedule', 'view': 'calendar', '_locked': True},
                ],
            },
            {
                'id': 'tab_4', 'label': 'Services', 'icon': 'box',
                'components': [
                    {'id': 'packages', 'label': 'Service Menu', 'view': 'cards'},
                    {'id': 'products', 'label': 'Hair Products', 'view': 'table'},
                ],
            },
            {
                'id': 'tab_5', 'label': 'Gallery', 'icon': 'image',
                'components': [
                    {'id': 'galleries', 'label': 'Cuts & Styles', 'view': 'cards', '_locked': True},
                ],
            },
            {
                'id': 'tab_6', 'label': 'Barbers', 'icon': 'users',
                '_removable': True,
                'components': [
                    {'id': 'staff', 'label': 'Barbers', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_7', 'label': 'Payments', 'icon': 'dollar',
                'components': [
                    {'id': 'invoices', 'label': 'Invoices', 'view': 'table', '_locked': True},
                    {'id': 'expenses', 'label': 'Expenses', 'view': 'table'},
                ],
            },
        ],
    },

    # ── HAIR SALON ─────────────────────────────────────────────────────
    'hair_salon': {
        'tabs': [
            {
                'id': 'tab_1', 'label': 'Dashboard', 'icon': 'home',
                'components': [],
            },
            {
                'id': 'tab_2', 'label': 'Clients', 'icon': 'people',
                'components': [
                    {'id': 'clients', 'label': 'Bookings', 'view': 'pipeline', '_locked': True,
                     'stages': ['Requested', 'Confirmed', 'Checked In', 'In Service', 'Completed']},
                    {'id': 'contacts', 'label': 'Contacts', 'view': 'list'},
                ],
            },
            {
                'id': 'tab_3', 'label': 'Schedule', 'icon': 'calendar',
                'components': [
                    {'id': 'calendar', 'label': 'Schedule', 'view': 'calendar', '_locked': True},
                ],
            },
            {
                'id': 'tab_4', 'label': 'Services', 'icon': 'box',
                'components': [
                    {'id': 'packages', 'label': 'Service Menu', 'view': 'cards'},
                    {'id': 'color_services', 'label': 'Color Services', 'view': 'cards'},
                    {'id': 'products', 'label': 'Hair Care Products', 'view': 'table'},
                ],
            },
            {
                'id': 'tab_5', 'label': 'Gallery', 'icon': 'image',
                'components': [
                    {'id': 'galleries', 'label': 'Style Gallery', 'view': 'cards', '_locked': True},
                    {'id': 'portfolios', 'label': 'Stylist Portfolios', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_6', 'label': 'Stylists', 'icon': 'users',
                '_removable': True,
                'components': [
                    {'id': 'staff', 'label': 'Stylists', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_7', 'label': 'Payments', 'icon': 'dollar',
                'components': [
                    {'id': 'invoices', 'label': 'Invoices', 'view': 'table', '_locked': True},
                    {'id': 'expenses', 'label': 'Expenses', 'view': 'table'},
                ],
            },
        ],
    },

    # ── LASH & BROW ────────────────────────────────────────────────────
    'lash_brow': {
        'tabs': [
            {
                'id': 'tab_1', 'label': 'Dashboard', 'icon': 'home',
                'components': [],
            },
            {
                'id': 'tab_2', 'label': 'Clients', 'icon': 'people',
                'components': [
                    {'id': 'clients', 'label': 'Bookings', 'view': 'pipeline', '_locked': True,
                     'stages': ['Requested', 'Confirmed', 'Checked In', 'In Service', 'Completed']},
                    {'id': 'contacts', 'label': 'Contacts', 'view': 'list'},
                ],
            },
            {
                'id': 'tab_3', 'label': 'Schedule', 'icon': 'calendar',
                'components': [
                    {'id': 'calendar', 'label': 'Schedule', 'view': 'calendar', '_locked': True},
                ],
            },
            {
                'id': 'tab_4', 'label': 'Services', 'icon': 'box',
                'components': [
                    {'id': 'packages', 'label': 'Service Menu', 'view': 'cards'},
                    {'id': 'lash_services', 'label': 'Lash Extensions', 'view': 'cards'},
                    {'id': 'brow_services', 'label': 'Brow Services', 'view': 'cards'},
                    {'id': 'products', 'label': 'Aftercare Products', 'view': 'table'},
                ],
            },
            {
                'id': 'tab_5', 'label': 'Gallery', 'icon': 'image',
                'components': [
                    {'id': 'galleries', 'label': 'Before & After', 'view': 'cards', '_locked': True},
                ],
            },
            {
                'id': 'tab_6', 'label': 'Staff', 'icon': 'users',
                '_removable': True,
                'components': [
                    {'id': 'staff', 'label': 'Lash Techs', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_7', 'label': 'Payments', 'icon': 'dollar',
                'components': [
                    {'id': 'invoices', 'label': 'Invoices', 'view': 'table', '_locked': True},
                    {'id': 'expenses', 'label': 'Expenses', 'view': 'table'},
                ],
            },
        ],
    },

    # ── MAKEUP ARTIST ──────────────────────────────────────────────────
    'makeup_artist': {
        'tabs': [
            {
                'id': 'tab_1', 'label': 'Dashboard', 'icon': 'home',
                'components': [],
            },
            {
                'id': 'tab_2', 'label': 'Clients', 'icon': 'people',
                'components': [
                    {'id': 'clients', 'label': 'Bookings', 'view': 'pipeline', '_locked': True,
                     'stages': ['Inquiry', 'Consultation', 'Booked', 'In Progress', 'Completed']},
                    {'id': 'contacts', 'label': 'Contacts', 'view': 'list'},
                ],
            },
            {
                'id': 'tab_3', 'label': 'Schedule', 'icon': 'calendar',
                'components': [
                    {'id': 'calendar', 'label': 'Schedule', 'view': 'calendar', '_locked': True},
                ],
            },
            {
                'id': 'tab_4', 'label': 'Services', 'icon': 'box',
                'components': [
                    {'id': 'packages', 'label': 'Service Menu', 'view': 'cards'},
                    {'id': 'bridal_packages', 'label': 'Bridal Packages', 'view': 'cards'},
                    {'id': 'products', 'label': 'Makeup Products', 'view': 'table'},
                ],
            },
            {
                'id': 'tab_5', 'label': 'Portfolio', 'icon': 'image',
                'components': [
                    {'id': 'galleries', 'label': 'Looks Gallery', 'view': 'cards', '_locked': True},
                    {'id': 'portfolios', 'label': 'Portfolio', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_6', 'label': 'Staff', 'icon': 'users',
                '_removable': True,
                'components': [
                    {'id': 'staff', 'label': 'MUA Team', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_7', 'label': 'Payments', 'icon': 'dollar',
                'components': [
                    {'id': 'invoices', 'label': 'Invoices', 'view': 'table', '_locked': True},
                    {'id': 'expenses', 'label': 'Expenses', 'view': 'table'},
                ],
            },
        ],
    },

    # ── TATTOO SHOP / STUDIO ──────────────────────────────────────────
    'tattoo': {
        'tabs': [
            {
                'id': 'tab_1', 'label': 'Dashboard', 'icon': 'home',
                'components': [],
            },
            {
                'id': 'tab_2', 'label': 'Clients', 'icon': 'people',
                'components': [
                    {'id': 'clients', 'label': 'Bookings', 'view': 'pipeline', '_locked': True,
                     'stages': ['Consultation', 'Deposit Paid', 'Scheduled', 'In Session', 'Completed']},
                    {'id': 'contacts', 'label': 'Contacts', 'view': 'list'},
                ],
            },
            {
                'id': 'tab_3', 'label': 'Schedule', 'icon': 'calendar',
                'components': [
                    {'id': 'calendar', 'label': 'Schedule', 'view': 'calendar', '_locked': True},
                ],
            },
            {
                'id': 'tab_4', 'label': 'Services', 'icon': 'box',
                'components': [
                    {'id': 'custom_tattoos', 'label': 'Custom Tattoos', 'view': 'cards'},
                    {'id': 'flash_designs', 'label': 'Flash Designs', 'view': 'cards'},
                    {'id': 'cover_ups', 'label': 'Cover-Ups', 'view': 'cards'},
                    {'id': 'piercings', 'label': 'Piercings', 'view': 'cards'},
                    {'id': 'waivers', 'label': 'Waivers', 'view': 'pipeline', '_locked': True,
                     'stages': ['Draft', 'Sent', 'Viewed', 'Signed']},
                ],
            },
            {
                'id': 'tab_5', 'label': 'Gallery', 'icon': 'image',
                'components': [
                    {'id': 'galleries', 'label': 'Work Gallery', 'view': 'cards', '_locked': True},
                    {'id': 'portfolios', 'label': 'Artist Portfolios', 'view': 'cards'},
                    {'id': 'flash_gallery', 'label': 'Flash Sheet', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_6', 'label': 'Artists', 'icon': 'users',
                '_removable': True,
                'components': [
                    {'id': 'staff', 'label': 'Artists', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_7', 'label': 'Payments', 'icon': 'dollar',
                'components': [
                    {'id': 'invoices', 'label': 'Invoices', 'view': 'table', '_locked': True},
                    {'id': 'deposits', 'label': 'Deposits', 'view': 'table'},
                    {'id': 'expenses', 'label': 'Expenses', 'view': 'table'},
                ],
            },
        ],
    },

    # ── SPA / MASSAGE ─────────────────────────────────────────────────
    'spa': {
        'tabs': [
            {
                'id': 'tab_1', 'label': 'Dashboard', 'icon': 'home',
                'components': [],
            },
            {
                'id': 'tab_2', 'label': 'Guests', 'icon': 'people',
                'components': [
                    {'id': 'clients', 'label': 'Bookings', 'view': 'pipeline', '_locked': True,
                     'stages': ['Requested', 'Confirmed', 'Checked In', 'In Treatment', 'Completed']},
                    {'id': 'contacts', 'label': 'Contacts', 'view': 'list'},
                ],
            },
            {
                'id': 'tab_3', 'label': 'Schedule', 'icon': 'calendar',
                'components': [
                    {'id': 'calendar', 'label': 'Schedule', 'view': 'calendar', '_locked': True},
                ],
            },
            {
                'id': 'tab_4', 'label': 'Services', 'icon': 'box',
                'components': [
                    {'id': 'treatments', 'label': 'Treatments', 'view': 'table', '_locked': True},
                    {'id': 'packages', 'label': 'Spa Packages', 'view': 'cards'},
                    {'id': 'memberships', 'label': 'Memberships', 'view': 'cards'},
                    {'id': 'products', 'label': 'Spa Products', 'view': 'table'},
                ],
            },
            {
                'id': 'tab_5', 'label': 'Gallery', 'icon': 'image',
                'components': [
                    {'id': 'galleries', 'label': 'Spa Gallery', 'view': 'cards', '_locked': True},
                ],
            },
            {
                'id': 'tab_6', 'label': 'Therapists', 'icon': 'users',
                '_removable': True,
                'components': [
                    {'id': 'staff', 'label': 'Therapists', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_7', 'label': 'Payments', 'icon': 'dollar',
                'components': [
                    {'id': 'invoices', 'label': 'Invoices', 'view': 'table', '_locked': True},
                    {'id': 'memberships_billing', 'label': 'Membership Billing', 'view': 'table'},
                    {'id': 'expenses', 'label': 'Expenses', 'view': 'table'},
                ],
            },
        ],
    },

    # ── MED SPA / AESTHETICS ──────────────────────────────────────────
    'med_spa': {
        'tabs': [
            {
                'id': 'tab_1', 'label': 'Dashboard', 'icon': 'home',
                'components': [],
            },
            {
                'id': 'tab_2', 'label': 'Patients', 'icon': 'people',
                'components': [
                    {'id': 'clients', 'label': 'Appointments', 'view': 'pipeline', '_locked': True,
                     'stages': ['Consultation', 'Treatment Plan', 'Scheduled', 'In Treatment', 'Completed']},
                    {'id': 'contacts', 'label': 'Contacts', 'view': 'list'},
                ],
            },
            {
                'id': 'tab_3', 'label': 'Schedule', 'icon': 'calendar',
                'components': [
                    {'id': 'calendar', 'label': 'Schedule', 'view': 'calendar', '_locked': True},
                ],
            },
            {
                'id': 'tab_4', 'label': 'Services', 'icon': 'box',
                'components': [
                    {'id': 'treatments', 'label': 'Treatments', 'view': 'table', '_locked': True},
                    {'id': 'packages', 'label': 'Treatment Plans', 'view': 'cards'},
                    {'id': 'injectables', 'label': 'Injectables', 'view': 'cards'},
                    {'id': 'products', 'label': 'Skincare Products', 'view': 'table'},
                    {'id': 'waivers', 'label': 'Consent Forms', 'view': 'pipeline', '_locked': True,
                     'stages': ['Draft', 'Sent', 'Viewed', 'Signed']},
                ],
            },
            {
                'id': 'tab_5', 'label': 'Gallery', 'icon': 'image',
                'components': [
                    {'id': 'galleries', 'label': 'Before & After', 'view': 'cards', '_locked': True},
                    {'id': 'portfolios', 'label': 'Provider Portfolios', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_6', 'label': 'Providers', 'icon': 'users',
                '_removable': True,
                'components': [
                    {'id': 'staff', 'label': 'Providers', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_7', 'label': 'Payments', 'icon': 'dollar',
                'components': [
                    {'id': 'invoices', 'label': 'Invoices', 'view': 'table', '_locked': True},
                    {'id': 'expenses', 'label': 'Expenses', 'view': 'table'},
                ],
            },
        ],
    },

    # ── PET GROOMING ──────────────────────────────────────────────────
    'pet_grooming': {
        'tabs': [
            {
                'id': 'tab_1', 'label': 'Dashboard', 'icon': 'home',
                'components': [],
            },
            {
                'id': 'tab_2', 'label': 'Pets & Owners', 'icon': 'people',
                'components': [
                    {'id': 'clients', 'label': 'Bookings', 'view': 'pipeline', '_locked': True,
                     'stages': ['Drop-off', 'Checked In', 'Grooming', 'Ready for Pickup', 'Picked Up']},
                    {'id': 'contacts', 'label': 'Contacts', 'view': 'list'},
                    {'id': 'pet_profiles', 'label': 'Pet Profiles', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_3', 'label': 'Schedule', 'icon': 'calendar',
                'components': [
                    {'id': 'calendar', 'label': 'Schedule', 'view': 'calendar', '_locked': True},
                ],
            },
            {
                'id': 'tab_4', 'label': 'Services', 'icon': 'box',
                'components': [
                    {'id': 'packages', 'label': 'Groom Packages', 'view': 'cards'},
                    {'id': 'add_ons', 'label': 'Add-Ons', 'view': 'cards'},
                    {'id': 'products', 'label': 'Pet Products', 'view': 'table'},
                    {'id': 'waivers', 'label': 'Waivers', 'view': 'pipeline', '_locked': True,
                     'stages': ['Draft', 'Sent', 'Viewed', 'Signed']},
                ],
            },
            {
                'id': 'tab_5', 'label': 'Gallery', 'icon': 'image',
                'components': [
                    {'id': 'galleries', 'label': 'Pet Gallery', 'view': 'cards', '_locked': True},
                ],
            },
            {
                'id': 'tab_6', 'label': 'Groomers', 'icon': 'users',
                '_removable': True,
                'components': [
                    {'id': 'staff', 'label': 'Groomers', 'view': 'cards'},
                ],
            },
            {
                'id': 'tab_7', 'label': 'Payments', 'icon': 'dollar',
                'components': [
                    {'id': 'invoices', 'label': 'Invoices', 'view': 'table', '_locked': True},
                    {'id': 'expenses', 'label': 'Expenses', 'view': 'table'},
                ],
            },
        ],
    },
}

# Generic "salon" uses hair_salon template (most common salon type)
_TEMPLATES['salon'] = copy.deepcopy(_TEMPLATES['hair_salon'])


def get_beauty_body_template(business_type):
    """Get the full template config for a Beauty & Body business type.

    Returns (template_config, locked_component_ids) tuple.
    template_config: full JSON config with _locked flags
    locked_component_ids: set of component IDs that are locked

    Returns (None, None) if business_type is not in this family.
    """
    if business_type not in BEAUTY_BODY_TYPES:
        return None, None

    template_data = _TEMPLATES.get(business_type)
    if not template_data:
        return None, None

    template = copy.deepcopy(template_data)

    # Collect locked component IDs
    locked_ids = set()
    for tab in template['tabs']:
        for comp in tab['components']:
            if comp.get('_locked'):
                locked_ids.add(comp['id'])

    return template, locked_ids


def get_template_as_prompt_json(business_type):
    """Get the template formatted as a JSON string for injection into the AI prompt.
    Includes _locked flags so AI knows what it cannot remove."""
    template, _ = get_beauty_body_template(business_type)
    if template is None:
        return None
    return json.dumps(template, indent=2)
