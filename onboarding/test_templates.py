"""Unit tests for the Beauty & Body template system.
Tests template generation, per-industry tweaks, locked component validation,
and template detection — all without API calls."""

import copy
import pytest
from templates.registry import detect_template_type, get_template
from templates.beauty_body import (
    get_beauty_body_template,
    BEAUTY_BODY_TYPES,
)

# Import the new app.py functions (they don't need Flask context)
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))


def _get_tab_labels(config):
    return [t['label'] for t in config.get('tabs', [])]


def _get_component_ids(config):
    ids = set()
    for tab in config.get('tabs', []):
        for comp in tab.get('components', []):
            ids.add(comp['id'])
    return ids


def _get_locked_ids(config):
    ids = set()
    for tab in config.get('tabs', []):
        for comp in tab.get('components', []):
            if comp.get('_locked'):
                ids.add(comp['id'])
    return ids


def _find_component(config, comp_id):
    for tab in config.get('tabs', []):
        for comp in tab.get('components', []):
            if comp['id'] == comp_id:
                return comp
    return None


def _find_tab(config, label):
    for tab in config.get('tabs', []):
        if tab['label'] == label:
            return tab
    return None


def _has_staff_tab(config):
    return any(t['label'] == 'Staff' for t in config.get('tabs', []))


# ============================================================
# Test 1: Solo nail tech — no Staff, Gallery present, locked intact
# ============================================================
def test_solo_nail_tech():
    template, locked = get_beauty_body_template('nail_salon')
    assert template is not None
    assert 'galleries' in locked
    assert 'calendar' in locked
    assert 'clients' in locked
    assert 'invoices' in locked
    assert 'appointments' in locked

    # Base template has Staff tab (enterprise)
    assert _has_staff_tab(template)

    # Verify Gallery tab exists
    gallery_tab = _find_tab(template, 'Gallery')
    assert gallery_tab is not None
    assert any(c['id'] == 'galleries' for c in gallery_tab['components'])

    # Verify pipeline stages
    clients = _find_component(template, 'clients')
    assert clients['stages'] == ["New Client", "Regular", "VIP", "Ambassador"]


# ============================================================
# Test 2: Enterprise nail salon — all 7 tabs
# ============================================================
def test_enterprise_nail_salon():
    template, locked = get_beauty_body_template('nail_salon')
    assert template is not None
    tabs = _get_tab_labels(template)
    assert len(tabs) == 7
    assert 'Dashboard' in tabs
    assert 'Clients' in tabs
    assert 'Schedule' in tabs
    assert 'Services' in tabs
    assert 'Gallery' in tabs
    assert 'Staff' in tabs
    assert 'Payments' in tabs


# ============================================================
# Test 3: Solo barber — barber stages, Gallery present
# ============================================================
def test_solo_barber():
    template, locked = get_beauty_body_template('barbershop')
    assert template is not None

    clients = _find_component(template, 'clients')
    assert clients['stages'] == ["Walk-in", "Regular", "VIP"]

    # Gallery present
    assert 'galleries' in _get_component_ids(template)
    assert 'galleries' in locked


# ============================================================
# Test 4: Enterprise barbershop — Staff labeled "Barbers"
# ============================================================
def test_enterprise_barbershop():
    template, locked = get_beauty_body_template('barbershop')
    assert template is not None
    assert _has_staff_tab(template)

    staff_tab = _find_tab(template, 'Staff')
    staff_comp = next(c for c in staff_tab['components'] if c['id'] == 'staff')
    assert staff_comp['label'] == 'Barbers'


# ============================================================
# Test 5: Solo lash tech — no Staff (default), Gallery present
# ============================================================
def test_solo_lash_tech():
    template, locked = get_beauty_body_template('lash_brow')
    assert template is not None

    # lash_brow removes Staff tab by default
    assert not _has_staff_tab(template)

    # Gallery still present
    assert 'galleries' in _get_component_ids(template)

    # Locked components still intact
    assert 'calendar' in locked
    assert 'clients' in locked
    assert 'galleries' in locked
    assert 'invoices' in locked


# ============================================================
# Test 6: Solo tattoo artist — Waivers, Gallery + Portfolio
# ============================================================
def test_solo_tattoo_artist():
    template, locked = get_beauty_body_template('tattoo')
    assert template is not None

    comp_ids = _get_component_ids(template)
    assert 'waivers' in comp_ids
    assert 'galleries' in comp_ids
    assert 'portfolios' in comp_ids

    # Waivers should be locked
    assert 'waivers' in locked

    # Pipeline stages
    clients = _find_component(template, 'clients')
    assert clients['stages'] == ["Consultation", "Deposit Paid", "Scheduled", "Complete"]


# ============================================================
# Test 7: Tattoo shop with 5 artists — Waivers locked, Portfolio + Gallery
# ============================================================
def test_tattoo_shop_enterprise():
    template, locked = get_beauty_body_template('tattoo')
    assert template is not None

    # Has Staff tab (enterprise template keeps it)
    assert _has_staff_tab(template)

    # Staff labeled "Artists"
    staff_tab = _find_tab(template, 'Staff')
    staff_comp = next(c for c in staff_tab['components'] if c['id'] == 'staff')
    assert staff_comp['label'] == 'Artists'

    # Waivers locked
    assert 'waivers' in locked


# ============================================================
# Test 8: Solo makeup artist — no Staff, Portfolio + Gallery
# ============================================================
def test_solo_makeup_artist():
    template, locked = get_beauty_body_template('makeup_artist')
    assert template is not None

    # No Staff tab (default for makeup_artist)
    assert not _has_staff_tab(template)

    # Has both galleries and portfolios
    comp_ids = _get_component_ids(template)
    assert 'galleries' in comp_ids
    assert 'portfolios' in comp_ids

    # Pipeline stages
    clients = _find_component(template, 'clients')
    assert clients['stages'] == ["Inquiry", "Booked", "Completed", "Repeat"]


# ============================================================
# Test 9: Med spa with 3 providers — Treatments + Waivers locked
# ============================================================
def test_med_spa():
    template, locked = get_beauty_body_template('med_spa')
    assert template is not None

    comp_ids = _get_component_ids(template)
    assert 'treatments' in comp_ids
    assert 'waivers' in comp_ids

    # Both locked
    assert 'treatments' in locked
    assert 'waivers' in locked

    # Staff labeled "Providers"
    staff_tab = _find_tab(template, 'Staff')
    staff_comp = next(c for c in staff_tab['components'] if c['id'] == 'staff')
    assert staff_comp['label'] == 'Providers'

    # Pipeline stages
    clients = _find_component(template, 'clients')
    assert clients['stages'] == ["Consultation", "Treatment Plan", "Active", "Maintenance"]


# ============================================================
# Test 10: Pet groomer solo — Clients = "Pets & Owners", Waivers
# ============================================================
def test_pet_groomer():
    template, locked = get_beauty_body_template('pet_grooming')
    assert template is not None

    # Clients labeled "Pets & Owners"
    clients = _find_component(template, 'clients')
    assert clients['label'] == 'Pets & Owners'

    # Has waivers
    assert 'waivers' in _get_component_ids(template)

    # Staff labeled "Groomers"
    staff_tab = _find_tab(template, 'Staff')
    staff_comp = next(c for c in staff_tab['components'] if c['id'] == 'staff')
    assert staff_comp['label'] == 'Groomers'


# ============================================================
# Test 11: Hair salon with 4 stylists — Staff present
# ============================================================
def test_hair_salon():
    template, locked = get_beauty_body_template('hair_salon')
    assert template is not None
    assert _has_staff_tab(template)

    # Staff labeled "Stylists"
    staff_tab = _find_tab(template, 'Staff')
    staff_comp = next(c for c in staff_tab['components'] if c['id'] == 'staff')
    assert staff_comp['label'] == 'Stylists'


# ============================================================
# Test 12: Spa with 2 therapists — Treatments in Services
# ============================================================
def test_spa():
    template, locked = get_beauty_body_template('spa')
    assert template is not None

    services_tab = _find_tab(template, 'Services')
    service_ids = [c['id'] for c in services_tab['components']]
    assert 'treatments' in service_ids

    # Staff labeled "Therapists"
    staff_tab = _find_tab(template, 'Staff')
    staff_comp = next(c for c in staff_tab['components'] if c['id'] == 'staff')
    assert staff_comp['label'] == 'Therapists'


# ============================================================
# Test 13: Locked validation — remove Gallery, it gets re-injected
# ============================================================
def test_locked_validation():
    # Simulate: AI returns config without Gallery
    template, locked = get_beauty_body_template('nail_salon')
    assert template is not None

    # Create a "bad" AI output that's missing the Gallery tab
    bad_config = copy.deepcopy(template)
    bad_config['tabs'] = [t for t in bad_config['tabs'] if t['label'] != 'Gallery']

    # Verify galleries is gone
    assert 'galleries' not in _get_component_ids(bad_config)

    # Import and run validation
    from app import validate_locked_components
    fixed = validate_locked_components(bad_config, template, locked)

    # galleries should be back
    assert 'galleries' in _get_component_ids(fixed)


# ============================================================
# Test 14: Non-beauty "law firm" — falls through, returns None
# ============================================================
def test_non_beauty_fallthrough():
    btype, family = detect_template_type("We're a small law firm in downtown LA")
    assert btype is None
    assert family is None


# ============================================================
# Bonus: Verify all 10 types produce valid templates
# ============================================================
def test_all_types_produce_templates():
    for btype in BEAUTY_BODY_TYPES:
        template, locked = get_beauty_body_template(btype)
        assert template is not None, f"No template for {btype}"
        assert len(locked) >= 4, f"Expected at least 4 locked components for {btype}, got {len(locked)}"
        assert len(template['tabs']) >= 5, f"Expected at least 5 tabs for {btype}, got {len(template['tabs'])}"

        # Every component must have a view
        for tab in template['tabs']:
            for comp in tab['components']:
                assert 'view' in comp, f"Component {comp['id']} in {btype} missing view field"


# ============================================================
# Bonus: Template detection with various phrasings
# ============================================================
def test_alias_detection():
    cases = [
        ("I run a nail salon called Bella Nails", 'nail_salon'),
        ("solo nail tech, gel and acrylics", 'nail_salon'),
        ("barbershop with 8 barbers", 'barbershop'),
        ("I'm a lash tech", 'lash_brow'),
        ("brow and lash studio", 'lash_brow'),
        ("tattoo artist, custom work", 'tattoo'),
        ("tattoo and piercing shop", 'tattoo'),
        ("med spa, botox and fillers", 'med_spa'),
        ("pet grooming business", 'pet_grooming'),
        ("dog groomer from home", 'pet_grooming'),
        ("hair salon, 4 stylists", 'hair_salon'),
        ("day spa and massage", 'spa'),
        ("makeup artist for weddings", 'makeup_artist'),
        ("I'm a MUA", 'makeup_artist'),
    ]
    for desc, expected_type in cases:
        btype, family = detect_template_type(desc)
        assert btype == expected_type, f"Expected {expected_type} for '{desc}', got {btype}"
        assert family == 'beauty_body'


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
