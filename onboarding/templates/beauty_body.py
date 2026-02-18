"""Beauty & Body Services — Template Family 1

Enterprise-first template. AI trims for solo/small operators.
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

# Enterprise base template — 7 tabs, all components included
# Solo operators get Staff tab removed by AI
_BASE_TEMPLATE = {
    "tabs": [
        {
            "id": "tab_1",
            "label": "Dashboard",
            "icon": "home",
            "components": [
                {"id": "calendar", "label": "Today", "view": "calendar", "_locked": True},
            ]
        },
        {
            "id": "tab_2",
            "label": "Clients",
            "icon": "people",
            "components": [
                {
                    "id": "clients", "label": "Clients", "view": "pipeline", "_locked": True,
                    "stages": ["New Client", "Regular", "VIP", "Ambassador"],
                },
                {"id": "contacts", "label": "Contacts", "view": "list"},
            ]
        },
        {
            "id": "tab_3",
            "label": "Schedule",
            "icon": "calendar",
            "components": [
                {"id": "calendar", "label": "Schedule", "view": "calendar", "_locked": True},
                {"id": "appointments", "label": "Appointments", "view": "table", "_locked": True},
            ]
        },
        {
            "id": "tab_4",
            "label": "Services",
            "icon": "box",
            "components": [
                {"id": "packages", "label": "Packages", "view": "cards"},
                {"id": "products", "label": "Products", "view": "table"},
            ]
        },
        {
            "id": "tab_5",
            "label": "Gallery",
            "icon": "image",
            "components": [
                {"id": "galleries", "label": "Gallery", "view": "cards", "_locked": True},
            ]
        },
        {
            "id": "tab_6",
            "label": "Staff",
            "icon": "users",
            "_removable": True,  # AI can remove this tab for solo operators
            "components": [
                {"id": "staff", "label": "Staff", "view": "cards"},
                {"id": "shifts", "label": "Shifts", "view": "table"},
            ]
        },
        {
            "id": "tab_7",
            "label": "Payments",
            "icon": "dollar",
            "components": [
                {"id": "invoices", "label": "Invoices", "view": "table", "_locked": True},
                {"id": "payments", "label": "Payments", "view": "table"},
                {"id": "expenses", "label": "Expenses", "view": "table"},
            ]
        },
    ]
}

# Per-industry tweaks applied on top of the base template
_INDUSTRY_TWEAKS = {
    'nail_salon': {
        'stages': ["New Client", "Regular", "VIP", "Ambassador"],
        # Base template as-is
    },
    'barbershop': {
        'stages': ["Walk-in", "Regular", "VIP"],
        'staff_label': 'Barbers',
    },
    'hair_salon': {
        'stages': ["Consultation", "New Client", "Regular", "VIP"],
        'staff_label': 'Stylists',
    },
    'lash_brow': {
        'stages': ["New Client", "Regular", "VIP"],
        'remove_staff': True,  # Usually solo
    },
    'makeup_artist': {
        'stages': ["Inquiry", "Booked", "Completed", "Repeat"],
        'remove_staff': True,  # Usually solo
        'add_portfolios': True,  # Add portfolios component in Gallery tab
    },
    'tattoo': {
        'stages': ["Consultation", "Deposit Paid", "Scheduled", "Complete"],
        'staff_label': 'Artists',
        'add_waivers': True,  # Locked waivers in Services tab
        'add_portfolios': True,
    },
    'spa': {
        'stages': ["New Guest", "Regular", "Member", "VIP"],
        'staff_label': 'Therapists',
        'add_treatments': True,  # Add treatments in Services tab
        'clients_label': 'Guests',
    },
    'med_spa': {
        'stages': ["Consultation", "Treatment Plan", "Active", "Maintenance"],
        'staff_label': 'Providers',
        'add_treatments': True,  # Locked
        'add_waivers': True,     # Locked
    },
    'pet_grooming': {
        'stages': ["New Pet", "Regular", "Frequent", "Premium"],
        'staff_label': 'Groomers',
        'clients_label': 'Pets & Owners',
        'add_waivers': True,
    },
    'salon': {
        # Generic "salon" → same as hair_salon
        'stages': ["Consultation", "New Client", "Regular", "VIP"],
        'staff_label': 'Stylists',
    },
}


def _apply_tweaks(template, business_type):
    """Apply per-industry tweaks to the base template."""
    tweaks = _INDUSTRY_TWEAKS.get(business_type, {})

    # Update pipeline stages on clients component
    stages = tweaks.get('stages')
    if stages:
        for tab in template['tabs']:
            for comp in tab['components']:
                if comp['id'] == 'clients' and comp.get('view') == 'pipeline':
                    comp['stages'] = stages

    # Rename clients label
    clients_label = tweaks.get('clients_label')
    if clients_label:
        for tab in template['tabs']:
            for comp in tab['components']:
                if comp['id'] == 'clients':
                    comp['label'] = clients_label

    # Rename staff label
    staff_label = tweaks.get('staff_label')
    if staff_label:
        for tab in template['tabs']:
            if tab.get('label') == 'Staff':
                for comp in tab['components']:
                    if comp['id'] == 'staff':
                        comp['label'] = staff_label

    # Remove staff tab (for solo-default industries like lash_brow, makeup_artist)
    if tweaks.get('remove_staff'):
        template['tabs'] = [t for t in template['tabs'] if t.get('label') != 'Staff']
        # Re-number tab IDs
        for i, tab in enumerate(template['tabs']):
            tab['id'] = f'tab_{i + 1}'

    # Add waivers to Services tab
    if tweaks.get('add_waivers'):
        for tab in template['tabs']:
            if tab.get('label') == 'Services':
                tab['components'].append({
                    "id": "waivers", "label": "Waivers", "view": "pipeline",
                    "stages": ["Draft", "Sent", "Viewed", "Signed"],
                    "_locked": True,
                })
                break

    # Add treatments to Services tab
    if tweaks.get('add_treatments'):
        for tab in template['tabs']:
            if tab.get('label') == 'Services':
                tab['components'].insert(0, {
                    "id": "treatments", "label": "Treatments", "view": "table",
                    "_locked": True,
                })
                break

    # Add portfolios to Gallery tab
    if tweaks.get('add_portfolios'):
        for tab in template['tabs']:
            if tab.get('label') == 'Gallery':
                tab['components'].append({
                    "id": "portfolios", "label": "Portfolio", "view": "cards",
                })
                break

    return template


def get_beauty_body_template(business_type):
    """Get the full template config for a Beauty & Body business type.

    Returns (template_config, locked_component_ids) tuple.
    template_config: full JSON config with _locked flags
    locked_component_ids: set of component IDs that are locked

    Returns (None, None) if business_type is not in this family.
    """
    if business_type not in BEAUTY_BODY_TYPES:
        return None, None

    template = copy.deepcopy(_BASE_TEMPLATE)
    template = _apply_tweaks(template, business_type)

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
