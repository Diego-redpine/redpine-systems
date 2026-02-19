"""Website section templates — maps business types to pre-built website layouts.

Generates FreeFormSaveData format that the editor understands:
- Pages with sections (blank for content, widget types for features)
- Elements positioned within blank sections (heading, text, button, contactForm)
- Widget sections (bookingWidget, galleryWidget, productGrid, reviewCarousel) render themselves

Each section type has multiple layout variants. A random variant is picked per
section at generation time, giving 432+ unique layout combinations.

Called during onboarding after dashboard config is generated.
"""

import json
import random
import uuid

# ============================================================
# HELPERS
# ============================================================

VIEWPORT_WIDTH = 1200


def _uid():
    return str(uuid.uuid4())[:8]


def _element(type, section_id, x, y, w, h, props):
    """Create a single EditorElement matching the FreeForm schema."""
    return {
        'id': f'el_{_uid()}',
        'type': type,
        'x': x,
        'y': y,
        'width': w,
        'height': h,
        'rotation': 0,
        'locked': False,
        'visible': True,
        'deletable': True,
        'properties': props,
        'breakpoints': {},
        'sectionId': section_id,
    }


def _section(type='blank', height=600, props=None):
    """Create a Section matching the FreeForm schema."""
    return {
        'id': f'sec_{_uid()}',
        'type': type,
        'height': height,
        'properties': props or {},
        'locked': False,
    }


def _split_text_midpoint(text):
    """Split text roughly in half at a sentence boundary."""
    if not text:
        return text, ''
    mid = len(text) // 2
    for offset in range(0, min(mid, 80)):
        for pos in [mid + offset, mid - offset]:
            if 0 < pos < len(text) - 1 and text[pos] == '.':
                return text[:pos + 1].strip(), text[pos + 1:].strip()
    space = text.rfind(' ', 0, mid + 20)
    return (text[:space].strip(), text[space:].strip()) if space > 0 else (text, '')


# ============================================================
# HERO VARIANTS — dark bg, 550px tall
# ============================================================

def _hero_centered(copy, colors):
    """Classic centered hero — heading, subtext, button all centered."""
    bg = colors.get('sidebar_bg', '#1A1A1A')
    accent = colors.get('buttons', '#3B82F6')
    sec = _section('blank', 550, {'backgroundColor': bg})
    sid = sec['id']
    return sec, [
        _element('heading', sid, 150, 140, 900, 80, {
            'content': copy.get('hero_headline', 'Welcome'),
            'fontSize': 56, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': '#FFFFFF', 'textAlign': 'center',
        }),
        _element('text', sid, 250, 240, 700, 60, {
            'content': copy.get('hero_subheadline', 'Your business tagline here'),
            'fontSize': 18, 'fontWeight': 400, 'fontFamily': 'Inter',
            'color': '#CBD5E1', 'textAlign': 'center',
        }),
        _element('button', sid, 490, 340, 220, 52, {
            'content': copy.get('hero_cta', 'Get Started'),
            'fontSize': 16, 'fontWeight': 600, 'fontFamily': 'Inter',
            'backgroundColor': accent, 'color': '#FFFFFF',
            'borderRadius': 8,
        }),
    ]


def _hero_left(copy, colors):
    """Left-aligned hero — everything hugs the left with 80px margin."""
    bg = colors.get('sidebar_bg', '#1A1A1A')
    accent = colors.get('buttons', '#3B82F6')
    sec = _section('blank', 550, {'backgroundColor': bg})
    sid = sec['id']
    return sec, [
        _element('heading', sid, 80, 120, 700, 80, {
            'content': copy.get('hero_headline', 'Welcome'),
            'fontSize': 56, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': '#FFFFFF', 'textAlign': 'left',
        }),
        _element('text', sid, 80, 220, 600, 60, {
            'content': copy.get('hero_subheadline', 'Your business tagline here'),
            'fontSize': 18, 'fontWeight': 400, 'fontFamily': 'Inter',
            'color': '#CBD5E1', 'textAlign': 'left',
        }),
        _element('button', sid, 80, 320, 220, 52, {
            'content': copy.get('hero_cta', 'Get Started'),
            'fontSize': 16, 'fontWeight': 600, 'fontFamily': 'Inter',
            'backgroundColor': accent, 'color': '#FFFFFF',
            'borderRadius': 8,
        }),
    ]


def _hero_split(copy, colors):
    """Split hero — heading+subtext on left, CTA button floated right."""
    bg = colors.get('sidebar_bg', '#1A1A1A')
    accent = colors.get('buttons', '#3B82F6')
    sec = _section('blank', 550, {'backgroundColor': bg})
    sid = sec['id']
    return sec, [
        _element('heading', sid, 80, 140, 600, 100, {
            'content': copy.get('hero_headline', 'Welcome'),
            'fontSize': 52, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': '#FFFFFF', 'textAlign': 'left',
        }),
        _element('text', sid, 80, 260, 500, 60, {
            'content': copy.get('hero_subheadline', 'Your business tagline here'),
            'fontSize': 18, 'fontWeight': 400, 'fontFamily': 'Inter',
            'color': '#CBD5E1', 'textAlign': 'left',
        }),
        _element('button', sid, 750, 260, 240, 52, {
            'content': copy.get('hero_cta', 'Get Started'),
            'fontSize': 16, 'fontWeight': 600, 'fontFamily': 'Inter',
            'backgroundColor': accent, 'color': '#FFFFFF',
            'borderRadius': 8,
        }),
    ]


def _hero_bottom_heavy(copy, colors):
    """Bottom-heavy hero — smaller heading at top, large subtext dominates, button bottom-left."""
    bg = colors.get('sidebar_bg', '#1A1A1A')
    accent = colors.get('buttons', '#3B82F6')
    sec = _section('blank', 550, {'backgroundColor': bg})
    sid = sec['id']
    return sec, [
        _element('heading', sid, 150, 80, 900, 70, {
            'content': copy.get('hero_headline', 'Welcome'),
            'fontSize': 44, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': '#FFFFFF', 'textAlign': 'center',
        }),
        _element('text', sid, 100, 200, 1000, 120, {
            'content': copy.get('hero_subheadline', 'Your business tagline here'),
            'fontSize': 22, 'fontWeight': 400, 'fontFamily': 'Inter',
            'color': '#CBD5E1', 'textAlign': 'center',
        }),
        _element('button', sid, 80, 380, 250, 52, {
            'content': copy.get('hero_cta', 'Get Started'),
            'fontSize': 16, 'fontWeight': 600, 'fontFamily': 'Inter',
            'backgroundColor': accent, 'color': '#FFFFFF',
            'borderRadius': 8,
        }),
    ]


_HERO_VARIANTS = [_hero_centered, _hero_left, _hero_split, _hero_bottom_heavy]


# ============================================================
# ABOUT VARIANTS — light bg
# ============================================================

def _about_centered(copy, colors):
    """Classic centered about — heading and body centered."""
    sec = _section('blank', 400, {'backgroundColor': colors.get('background', '#F5F5F5')})
    sid = sec['id']
    return sec, [
        _element('heading', sid, 150, 60, 900, 60, {
            'content': copy.get('about_title', 'About Us'),
            'fontSize': 36, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': colors.get('headings', '#111827'), 'textAlign': 'center',
        }),
        _element('text', sid, 200, 150, 800, 120, {
            'content': copy.get('about_text', 'Tell your story here.'),
            'fontSize': 16, 'fontWeight': 400, 'fontFamily': 'Inter',
            'color': colors.get('text', '#4B5563'), 'textAlign': 'center',
            'lineHeight': 1.7,
        }),
    ]


def _about_left(copy, colors):
    """Left-aligned about — heading and body left with 80px margin."""
    sec = _section('blank', 400, {'backgroundColor': colors.get('background', '#F5F5F5')})
    sid = sec['id']
    return sec, [
        _element('heading', sid, 80, 60, 700, 60, {
            'content': copy.get('about_title', 'About Us'),
            'fontSize': 36, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': colors.get('headings', '#111827'), 'textAlign': 'left',
        }),
        _element('text', sid, 80, 150, 700, 150, {
            'content': copy.get('about_text', 'Tell your story here.'),
            'fontSize': 16, 'fontWeight': 400, 'fontFamily': 'Inter',
            'color': colors.get('text', '#4B5563'), 'textAlign': 'left',
            'lineHeight': 1.7,
        }),
    ]


def _about_two_column(copy, colors):
    """Two-column about — heading spans top, body split into two columns."""
    sec = _section('blank', 480, {'backgroundColor': colors.get('background', '#F5F5F5')})
    sid = sec['id']
    text = copy.get('about_text', 'Tell your story here.')
    left_text, right_text = _split_text_midpoint(text)
    elements = [
        _element('heading', sid, 80, 50, 1040, 60, {
            'content': copy.get('about_title', 'About Us'),
            'fontSize': 36, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': colors.get('headings', '#111827'), 'textAlign': 'left',
        }),
        _element('text', sid, 80, 150, 500, 160, {
            'content': left_text,
            'fontSize': 16, 'fontWeight': 400, 'fontFamily': 'Inter',
            'color': colors.get('text', '#4B5563'), 'textAlign': 'left',
            'lineHeight': 1.7,
        }),
    ]
    if right_text:
        elements.append(_element('text', sid, 620, 150, 500, 160, {
            'content': right_text,
            'fontSize': 16, 'fontWeight': 400, 'fontFamily': 'Inter',
            'color': colors.get('text', '#4B5563'), 'textAlign': 'left',
            'lineHeight': 1.7,
        }))
    return sec, elements


def _about_offset(copy, colors):
    """Offset about — short heading on left, indented body spanning wide."""
    sec = _section('blank', 400, {'backgroundColor': colors.get('background', '#F5F5F5')})
    sid = sec['id']
    return sec, [
        _element('heading', sid, 80, 60, 400, 60, {
            'content': copy.get('about_title', 'About Us'),
            'fontSize': 36, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': colors.get('headings', '#111827'), 'textAlign': 'left',
        }),
        _element('text', sid, 200, 160, 900, 140, {
            'content': copy.get('about_text', 'Tell your story here.'),
            'fontSize': 16, 'fontWeight': 400, 'fontFamily': 'Inter',
            'color': colors.get('text', '#4B5563'), 'textAlign': 'left',
            'lineHeight': 1.7,
        }),
    ]


_ABOUT_VARIANTS = [_about_centered, _about_left, _about_two_column, _about_offset]


# ============================================================
# FEATURES VARIANTS — 3 features
# ============================================================

def _features_3col(copy, colors):
    """Classic 3-column — features side by side."""
    sec = _section('blank', 450, {'backgroundColor': colors.get('cards', '#FFFFFF')})
    sid = sec['id']
    features = copy.get('features', ['Quality Service', 'Experienced Team', 'Great Value'])
    elements = [
        _element('heading', sid, 150, 50, 900, 60, {
            'content': copy.get('features_title', 'Why Choose Us'),
            'fontSize': 36, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': colors.get('headings', '#111827'), 'textAlign': 'center',
        }),
    ]
    col_width = 300
    gap = 50
    start_x = (VIEWPORT_WIDTH - (col_width * 3 + gap * 2)) // 2
    for i, feature in enumerate(features[:3]):
        x = start_x + i * (col_width + gap)
        elements.append(_element('text', sid, x, 160, col_width, 80, {
            'content': feature,
            'fontSize': 16, 'fontWeight': 500, 'fontFamily': 'Inter',
            'color': colors.get('text', '#4B5563'), 'textAlign': 'center',
            'lineHeight': 1.6,
        }))
    return sec, elements


def _features_stacked_left(copy, colors):
    """Stacked left — features listed vertically on the left side."""
    sec = _section('blank', 550, {'backgroundColor': colors.get('cards', '#FFFFFF')})
    sid = sec['id']
    features = copy.get('features', ['Quality Service', 'Experienced Team', 'Great Value'])
    elements = [
        _element('heading', sid, 80, 50, 600, 60, {
            'content': copy.get('features_title', 'Why Choose Us'),
            'fontSize': 36, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': colors.get('headings', '#111827'), 'textAlign': 'left',
        }),
    ]
    for i, feature in enumerate(features[:3]):
        elements.append(_element('text', sid, 80, 150 + i * 100, 700, 70, {
            'content': feature,
            'fontSize': 16, 'fontWeight': 500, 'fontFamily': 'Inter',
            'color': colors.get('text', '#4B5563'), 'textAlign': 'left',
            'lineHeight': 1.6,
        }))
    return sec, elements


def _features_2plus1(copy, colors):
    """2+1 layout — two features on top row, one centered below."""
    sec = _section('blank', 500, {'backgroundColor': colors.get('cards', '#FFFFFF')})
    sid = sec['id']
    features = copy.get('features', ['Quality Service', 'Experienced Team', 'Great Value'])
    elements = [
        _element('heading', sid, 150, 50, 900, 60, {
            'content': copy.get('features_title', 'Why Choose Us'),
            'fontSize': 36, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': colors.get('headings', '#111827'), 'textAlign': 'center',
        }),
    ]
    # Top row: 2 features
    if len(features) >= 1:
        elements.append(_element('text', sid, 80, 160, 500, 80, {
            'content': features[0],
            'fontSize': 16, 'fontWeight': 500, 'fontFamily': 'Inter',
            'color': colors.get('text', '#4B5563'), 'textAlign': 'center',
            'lineHeight': 1.6,
        }))
    if len(features) >= 2:
        elements.append(_element('text', sid, 620, 160, 500, 80, {
            'content': features[1],
            'fontSize': 16, 'fontWeight': 500, 'fontFamily': 'Inter',
            'color': colors.get('text', '#4B5563'), 'textAlign': 'center',
            'lineHeight': 1.6,
        }))
    # Bottom row: 1 feature centered
    if len(features) >= 3:
        elements.append(_element('text', sid, 250, 300, 700, 80, {
            'content': features[2],
            'fontSize': 16, 'fontWeight': 500, 'fontFamily': 'Inter',
            'color': colors.get('text', '#4B5563'), 'textAlign': 'center',
            'lineHeight': 1.6,
        }))
    return sec, elements


_FEATURES_VARIANTS = [_features_3col, _features_stacked_left, _features_2plus1]


# ============================================================
# CTA VARIANTS — accent bg, 300px tall
# ============================================================

def _cta_centered(copy, colors):
    """Classic centered CTA."""
    accent = colors.get('buttons', '#3B82F6')
    sec = _section('blank', 300, {'backgroundColor': accent})
    sid = sec['id']
    return sec, [
        _element('heading', sid, 200, 60, 800, 60, {
            'content': copy.get('cta_headline', 'Ready to Get Started?'),
            'fontSize': 36, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': '#FFFFFF', 'textAlign': 'center',
        }),
        _element('text', sid, 300, 130, 600, 40, {
            'content': copy.get('cta_text', 'Book your appointment today.'),
            'fontSize': 16, 'fontWeight': 400, 'fontFamily': 'Inter',
            'color': '#FFFFFFCC', 'textAlign': 'center',
        }),
        _element('button', sid, 475, 200, 250, 52, {
            'content': copy.get('cta_button', 'Book Now'),
            'fontSize': 16, 'fontWeight': 600, 'fontFamily': 'Inter',
            'backgroundColor': '#FFFFFF', 'color': accent,
            'borderRadius': 8,
        }),
    ]


def _cta_left(copy, colors):
    """Left-aligned CTA — strong directional push."""
    accent = colors.get('buttons', '#3B82F6')
    sec = _section('blank', 300, {'backgroundColor': accent})
    sid = sec['id']
    return sec, [
        _element('heading', sid, 80, 60, 700, 60, {
            'content': copy.get('cta_headline', 'Ready to Get Started?'),
            'fontSize': 36, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': '#FFFFFF', 'textAlign': 'left',
        }),
        _element('text', sid, 80, 130, 600, 40, {
            'content': copy.get('cta_text', 'Book your appointment today.'),
            'fontSize': 16, 'fontWeight': 400, 'fontFamily': 'Inter',
            'color': '#FFFFFFCC', 'textAlign': 'left',
        }),
        _element('button', sid, 80, 200, 250, 52, {
            'content': copy.get('cta_button', 'Book Now'),
            'fontSize': 16, 'fontWeight': 600, 'fontFamily': 'Inter',
            'backgroundColor': '#FFFFFF', 'color': accent,
            'borderRadius': 8,
        }),
    ]


def _cta_right(copy, colors):
    """Right-aligned CTA — content pushed to right side."""
    accent = colors.get('buttons', '#3B82F6')
    sec = _section('blank', 300, {'backgroundColor': accent})
    sid = sec['id']
    return sec, [
        _element('heading', sid, 400, 60, 720, 60, {
            'content': copy.get('cta_headline', 'Ready to Get Started?'),
            'fontSize': 36, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': '#FFFFFF', 'textAlign': 'right',
        }),
        _element('text', sid, 500, 130, 620, 40, {
            'content': copy.get('cta_text', 'Book your appointment today.'),
            'fontSize': 16, 'fontWeight': 400, 'fontFamily': 'Inter',
            'color': '#FFFFFFCC', 'textAlign': 'right',
        }),
        _element('button', sid, 870, 200, 250, 52, {
            'content': copy.get('cta_button', 'Book Now'),
            'fontSize': 16, 'fontWeight': 600, 'fontFamily': 'Inter',
            'backgroundColor': '#FFFFFF', 'color': accent,
            'borderRadius': 8,
        }),
    ]


_CTA_VARIANTS = [_cta_centered, _cta_left, _cta_right]


# ============================================================
# CONTACT VARIANTS — light bg
# ============================================================

def _contact_form_props(accent):
    """Shared contact form properties."""
    return {
        'formTitle': '',
        'fields': [
            {'name': 'name', 'label': 'Full Name', 'type': 'text', 'required': True},
            {'name': 'email', 'label': 'Email', 'type': 'email', 'required': True},
            {'name': 'phone', 'label': 'Phone', 'type': 'tel', 'required': False},
            {'name': 'message', 'label': 'Message', 'type': 'textarea', 'required': True},
        ],
        'submitButtonText': 'Send Message',
        'submitButtonColor': accent,
    }


def _contact_centered(copy, colors):
    """Classic centered contact — heading centered, form centered below."""
    sec = _section('blank', 550, {'backgroundColor': colors.get('background', '#F5F5F5')})
    sid = sec['id']
    accent = colors.get('buttons', '#3B82F6')
    return sec, [
        _element('heading', sid, 150, 40, 900, 50, {
            'content': 'Get In Touch',
            'fontSize': 32, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': colors.get('headings', '#111827'), 'textAlign': 'center',
        }),
        _element('contactForm', sid, 300, 120, 600, 400, _contact_form_props(accent)),
    ]


def _contact_split(copy, colors):
    """Split contact — heading+subtext on left, form on right."""
    sec = _section('blank', 580, {'backgroundColor': colors.get('background', '#F5F5F5')})
    sid = sec['id']
    accent = colors.get('buttons', '#3B82F6')
    return sec, [
        _element('heading', sid, 80, 50, 400, 50, {
            'content': 'Get In Touch',
            'fontSize': 32, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': colors.get('headings', '#111827'), 'textAlign': 'left',
        }),
        _element('text', sid, 80, 120, 400, 60, {
            'content': "We'd love to hear from you. Send us a message and we'll get back to you shortly.",
            'fontSize': 15, 'fontWeight': 400, 'fontFamily': 'Inter',
            'color': '#6B7280', 'textAlign': 'left',
            'lineHeight': 1.6,
        }),
        _element('contactForm', sid, 560, 200, 560, 350, _contact_form_props(accent)),
    ]


def _contact_full_width(copy, colors):
    """Full-width contact — wide heading, wider form below."""
    sec = _section('blank', 600, {'backgroundColor': colors.get('background', '#F5F5F5')})
    sid = sec['id']
    accent = colors.get('buttons', '#3B82F6')
    return sec, [
        _element('heading', sid, 80, 40, 1040, 50, {
            'content': 'Get In Touch',
            'fontSize': 36, 'fontWeight': 700, 'fontFamily': 'Inter',
            'color': colors.get('headings', '#111827'), 'textAlign': 'left',
        }),
        _element('contactForm', sid, 200, 130, 800, 420, _contact_form_props(accent)),
    ]


_CONTACT_VARIANTS = [_contact_centered, _contact_split, _contact_full_width]


# ============================================================
# DISPATCHERS — randomly pick a variant per section
# ============================================================

def build_hero_section(copy, colors):
    """Dark hero section — randomly picks a layout variant."""
    return random.choice(_HERO_VARIANTS)(copy, colors)


def build_about_section(copy, colors):
    """About section — randomly picks a layout variant."""
    return random.choice(_ABOUT_VARIANTS)(copy, colors)


def build_features_section(copy, colors):
    """Features section — randomly picks a layout variant."""
    return random.choice(_FEATURES_VARIANTS)(copy, colors)


def build_cta_section(copy, colors):
    """CTA section — randomly picks a layout variant."""
    return random.choice(_CTA_VARIANTS)(copy, colors)


def build_contact_section(copy, colors):
    """Contact section — randomly picks a layout variant."""
    return random.choice(_CONTACT_VARIANTS)(copy, colors)


# ============================================================
# WIDGET SECTION BUILDERS — no elements, widget renders itself
# ============================================================

def build_widget_section(widget_type, height=500):
    """Create a widget section (bookingWidget, galleryWidget, productGrid, reviewCarousel)."""
    return _section(widget_type, height), []


# ============================================================
# SECTION REGISTRY — maps section name to builder
# ============================================================

SECTION_BUILDERS = {
    'hero': build_hero_section,
    'about': build_about_section,
    'features': build_features_section,
    'cta': build_cta_section,
    'contact': build_contact_section,
}

WIDGET_SECTIONS = {'bookingWidget', 'galleryWidget', 'productGrid', 'reviewCarousel'}


# ============================================================
# WEBSITE TEMPLATES — which sections each business type gets
# ============================================================

WEBSITE_TEMPLATES = {
    # Default for all businesses
    'default': {
        'pages': [{
            'title': 'Home', 'slug': 'home',
            'sections': ['hero', 'features', 'cta', 'contact'],
        }],
    },

    # Appointment-based businesses (salons, spas, tattoo, etc.)
    'appointment_based': {
        'pages': [{
            'title': 'Home', 'slug': 'home',
            'sections': ['hero', 'bookingWidget', 'galleryWidget', 'reviewCarousel', 'contact'],
        }],
    },

    # Retail / food businesses
    'retail': {
        'pages': [{
            'title': 'Home', 'slug': 'home',
            'sections': ['hero', 'productGrid', 'about', 'reviewCarousel', 'contact'],
        }],
    },

    # Professional services (legal, consulting, accounting)
    'professional': {
        'pages': [{
            'title': 'Home', 'slug': 'home',
            'sections': ['hero', 'features', 'about', 'contact'],
        }],
    },

    # Fitness / classes (gym, yoga, martial arts, dance)
    'fitness': {
        'pages': [{
            'title': 'Home', 'slug': 'home',
            'sections': ['hero', 'bookingWidget', 'features', 'reviewCarousel', 'contact'],
        }],
    },

    # Creative / portfolio (photography, art)
    'creative': {
        'pages': [{
            'title': 'Home', 'slug': 'home',
            'sections': ['hero', 'galleryWidget', 'about', 'reviewCarousel', 'contact'],
        }],
    },

    # Home services (landscaping, cleaning, plumbing, etc.)
    'home_services': {
        'pages': [{
            'title': 'Home', 'slug': 'home',
            'sections': ['hero', 'features', 'reviewCarousel', 'cta', 'contact'],
        }],
    },
}

# Map specific business_type → template key
BUSINESS_TYPE_MAP = {
    # Beauty & Body → appointment_based
    'nail_salon': 'appointment_based',
    'barbershop': 'appointment_based',
    'barber': 'appointment_based',
    'hair_salon': 'appointment_based',
    'salon': 'appointment_based',
    'spa': 'appointment_based',
    'med_spa': 'appointment_based',
    'tattoo': 'appointment_based',
    'lash_brow': 'appointment_based',
    'makeup_artist': 'appointment_based',
    'pet_grooming': 'appointment_based',

    # Fitness → fitness
    'crossfit': 'fitness',
    'fitness': 'fitness',
    'yoga': 'fitness',
    'martial_arts': 'fitness',
    'dance_studio': 'fitness',
    'music_studio': 'fitness',
    'tutoring': 'fitness',

    # Retail / food → retail
    'restaurant': 'retail',
    'cafe': 'retail',
    'bakery': 'retail',
    'catering': 'retail',
    'retail': 'retail',
    'florist': 'retail',

    # Professional → professional
    'legal': 'professional',
    'accounting': 'professional',
    'consulting': 'professional',
    'insurance': 'professional',
    'real_estate': 'professional',
    'recruiting': 'professional',
    'professional': 'professional',

    # Creative → creative
    'photography': 'creative',

    # Home services → home_services
    'landscaping': 'home_services',
    'cleaning': 'home_services',
    'plumbing': 'home_services',
    'electrical': 'home_services',
    'pest_control': 'home_services',
    'moving': 'home_services',

    # Other
    'dental': 'appointment_based',
    'veterinary': 'appointment_based',
    'property_management': 'professional',
    'hotel': 'appointment_based',
    'coworking': 'professional',
    'daycare': 'fitness',
    'event_planning': 'creative',
}


def get_template_key(business_type):
    """Get the website template key for a business type."""
    return BUSINESS_TYPE_MAP.get(business_type, 'default')


# ============================================================
# MAIN BUILDER — assembles full FreeFormSaveData
# ============================================================

def build_website_data(business_name, business_type, copy, colors):
    """Build a complete FreeFormSaveData structure from templates + AI-generated copy.

    Args:
        business_name: Business name (e.g., "Bella Nails")
        business_type: Business type (e.g., "nail_salon")
        copy: Dict from generate_website_copy() with hero_headline, about_text, etc.
        colors: Dashboard colors dict from config

    Returns:
        FreeFormSaveData dict ready to store as website_data in configs table
    """
    template_key = get_template_key(business_type)
    template = WEBSITE_TEMPLATES.get(template_key, WEBSITE_TEMPLATES['default'])

    all_pages = []
    all_elements = []

    for page_def in template['pages']:
        page_sections = []

        for section_name in page_def['sections']:
            if section_name in WIDGET_SECTIONS:
                sec, elements = build_widget_section(section_name)
            elif section_name in SECTION_BUILDERS:
                sec, elements = SECTION_BUILDERS[section_name](copy, colors)
            else:
                continue

            page_sections.append(sec)
            all_elements.extend(elements)

        all_pages.append({
            'id': page_def['slug'],
            'title': page_def['title'],
            'slug': page_def['slug'],
            'sections': page_sections,
            'headerConfig': {},
            'footerConfig': {},
            'canvasConfig': {},
        })

    return {
        'format': 'freeform',
        'version': 1,
        'pages': all_pages,
        'elements': all_elements,
        'currentPageIndex': 0,
    }
