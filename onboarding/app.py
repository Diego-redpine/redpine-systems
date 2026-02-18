from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import xmlrpc.client
import anthropic
import requests as http_requests
import os

load_dotenv(override=True)
import json
import re
import uuid
import copy
from datetime import datetime
from templates.registry import detect_template_type, get_template
from templates.beauty_body import get_template_as_prompt_json

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app, origins=[
    'http://localhost:3000',
    'https://redpine-systems.vercel.app',
    os.environ.get('DASHBOARD_URL', ''),
])

# Config storage - individual JSON files in configs folder
CONFIGS_FOLDER = os.path.join(os.path.dirname(__file__), 'configs')

def ensure_configs_folder():
    if not os.path.exists(CONFIGS_FOLDER):
        os.makedirs(CONFIGS_FOLDER)

def save_config(config, conversation_history=None):
    ensure_configs_folder()
    config_id = str(uuid.uuid4())[:8]

    # New config format with tabs array
    config_data = {
        'id': config_id,
        'created_at': datetime.now().isoformat(),
        'business_name': config.get('business_name'),
        'business_type': config.get('business_type'),
        'tabs': config.get('tabs', []),
        'colors': config.get('colors', {}),
        'platform_tabs': ['site', 'analytics', 'settings'],
        'summary': config.get('summary'),
        'conversation_history': conversation_history or []
    }
    config_path = os.path.join(CONFIGS_FOLDER, f'{config_id}.json')
    with open(config_path, 'w') as f:
        json.dump(config_data, f, indent=2)
    return config_id

# Industry-specific color defaults — used when AI generates defaults or missing colors
INDUSTRY_COLOR_DEFAULTS = {
    'restaurant': {'sidebar_bg': '#1C1917', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#EA580C', 'background': '#FFFBEB', 'buttons': '#EA580C', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'cafe': {'sidebar_bg': '#1C1917', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#D97706', 'background': '#FFFBEB', 'buttons': '#D97706', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'bakery': {'sidebar_bg': '#451A03', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#D97706', 'background': '#FFFBEB', 'buttons': '#D97706', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'barber': {'sidebar_bg': '#0F172A', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#3B82F6', 'background': '#F8FAFC', 'buttons': '#3B82F6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'salon': {'sidebar_bg': '#4C0519', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#E11D48', 'background': '#FFF1F2', 'buttons': '#E11D48', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'spa': {'sidebar_bg': '#134E4A', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#0D9488', 'background': '#F0FDFA', 'buttons': '#0D9488', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'fitness': {'sidebar_bg': '#1E1B4B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#4F46E5', 'background': '#EEF2FF', 'buttons': '#4F46E5', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'crossfit': {'sidebar_bg': '#0F172A', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#EF4444', 'background': '#FEF2F2', 'buttons': '#EF4444', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'martial_arts': {'sidebar_bg': '#4C0519', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#E11D48', 'background': '#FFF1F2', 'buttons': '#E11D48', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'yoga': {'sidebar_bg': '#134E4A', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#0D9488', 'background': '#F0FDFA', 'buttons': '#0D9488', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'landscaping': {'sidebar_bg': '#14532D', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#16A34A', 'background': '#F0FDF4', 'buttons': '#16A34A', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'plumbing': {'sidebar_bg': '#451A03', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#D97706', 'background': '#FFFBEB', 'buttons': '#D97706', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'electrical': {'sidebar_bg': '#1E293B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#F59E0B', 'background': '#FFFBEB', 'buttons': '#F59E0B', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'cleaning': {'sidebar_bg': '#0C4A6E', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#0284C7', 'background': '#F0F9FF', 'buttons': '#0284C7', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'photography': {'sidebar_bg': '#2E1065', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#8B5CF6', 'background': '#F5F3FF', 'buttons': '#8B5CF6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'tattoo': {'sidebar_bg': '#0F172A', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#475569', 'background': '#F8FAFC', 'buttons': '#475569', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'legal': {'sidebar_bg': '#1E1B4B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#7C3AED', 'background': '#FAF5FF', 'buttons': '#7C3AED', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'accounting': {'sidebar_bg': '#1E1B4B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#6366F1', 'background': '#EEF2FF', 'buttons': '#6366F1', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'consulting': {'sidebar_bg': '#0F172A', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#6366F1', 'background': '#EEF2FF', 'buttons': '#6366F1', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'real_estate': {'sidebar_bg': '#1E293B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#0EA5E9', 'background': '#F0F9FF', 'buttons': '#0EA5E9', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'property_management': {'sidebar_bg': '#1E293B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#0EA5E9', 'background': '#F0F9FF', 'buttons': '#0EA5E9', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'retail': {'sidebar_bg': '#1E1B4B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#EC4899', 'background': '#FDF4FF', 'buttons': '#EC4899', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'pet_grooming': {'sidebar_bg': '#164E63', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#14B8A6', 'background': '#F0FDFA', 'buttons': '#14B8A6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'veterinary': {'sidebar_bg': '#164E63', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#14B8A6', 'background': '#F0FDFA', 'buttons': '#14B8A6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'dental': {'sidebar_bg': '#1E3A5F', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#3B82F6', 'background': '#EFF6FF', 'buttons': '#3B82F6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'medical': {'sidebar_bg': '#1E3A5F', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#3B82F6', 'background': '#EFF6FF', 'buttons': '#3B82F6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'construction': {'sidebar_bg': '#1E293B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#F59E0B', 'background': '#FFFBEB', 'buttons': '#F59E0B', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'auto': {'sidebar_bg': '#0F172A', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#3B82F6', 'background': '#F8FAFC', 'buttons': '#3B82F6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'catering': {'sidebar_bg': '#2D1B4E', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#A855F7', 'background': '#FAF5FF', 'buttons': '#A855F7', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'event_planning': {'sidebar_bg': '#1E1B4B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#EC4899', 'background': '#FDF4FF', 'buttons': '#EC4899', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'hotel': {'sidebar_bg': '#1E293B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#0EA5E9', 'background': '#F0F9FF', 'buttons': '#0EA5E9', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'moving': {'sidebar_bg': '#1E293B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#3B82F6', 'background': '#EFF6FF', 'buttons': '#3B82F6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'tutoring': {'sidebar_bg': '#1B2E4B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#6366F1', 'background': '#EEF2FF', 'buttons': '#6366F1', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'dance_studio': {'sidebar_bg': '#1E1B4B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#A855F7', 'background': '#FAF5FF', 'buttons': '#A855F7', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'music_studio': {'sidebar_bg': '#18181B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#8B5CF6', 'background': '#F5F3FF', 'buttons': '#8B5CF6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'recruiting': {'sidebar_bg': '#0F172A', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#6366F1', 'background': '#EEF2FF', 'buttons': '#6366F1', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'food_truck': {'sidebar_bg': '#431407', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#EA580C', 'background': '#FFF7ED', 'buttons': '#EA580C', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'florist': {'sidebar_bg': '#14532D', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#16A34A', 'background': '#F0FDF4', 'buttons': '#16A34A', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'pest_control': {'sidebar_bg': '#1E293B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#059669', 'background': '#ECFDF5', 'buttons': '#059669', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'hvac': {'sidebar_bg': '#1E293B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#0284C7', 'background': '#F0F9FF', 'buttons': '#0284C7', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'coworking': {'sidebar_bg': '#18181B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#8B5CF6', 'background': '#F5F3FF', 'buttons': '#8B5CF6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'insurance': {'sidebar_bg': '#1E293B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#0EA5E9', 'background': '#F0F9FF', 'buttons': '#0EA5E9', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'professional': {'sidebar_bg': '#0F172A', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#6366F1', 'background': '#EEF2FF', 'buttons': '#6366F1', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'freelancer': {'sidebar_bg': '#18181B', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#8B5CF6', 'background': '#F5F3FF', 'buttons': '#8B5CF6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    # Beauty & Body subtypes
    'nail_salon': {'sidebar_bg': '#4C0519', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#E11D48', 'background': '#FFF1F2', 'buttons': '#E11D48', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'hair_salon': {'sidebar_bg': '#4C0519', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#E11D48', 'background': '#FFF1F2', 'buttons': '#E11D48', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'lash_brow': {'sidebar_bg': '#2E1065', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#8B5CF6', 'background': '#F5F3FF', 'buttons': '#8B5CF6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'makeup_artist': {'sidebar_bg': '#831843', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#DB2777', 'background': '#FDF2F8', 'buttons': '#DB2777', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'med_spa': {'sidebar_bg': '#134E4A', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#A0AEC0', 'sidebar_buttons': '#0D9488', 'background': '#F0FDFA', 'buttons': '#0D9488', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
    'barbershop': {'sidebar_bg': '#0F172A', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#3B82F6', 'background': '#F8FAFC', 'buttons': '#3B82F6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'},
}

# Default fallback palette for unknown business types
DEFAULT_COLOR_PALETTE = {'sidebar_bg': '#0F172A', 'sidebar_text': '#F1F5F9', 'sidebar_icons': '#94A3B8', 'sidebar_buttons': '#3B82F6', 'background': '#F8FAFC', 'buttons': '#3B82F6', 'cards': '#FFFFFF', 'text': '#1A1A1A', 'headings': '#111827', 'borders': '#E5E7EB'}

# Known default/bad colors that indicate AI didn't generate a proper palette
BAD_BUTTON_COLORS = {'#ce0707', '#CE0707', '#dc2626', '#DC2626', '#ef4444', '#EF4444', '#3b82f6', '#3B82F6'}

def validate_colors(config):
    """Ensure config has industry-appropriate colors, replacing defaults if needed"""
    colors = config.get('colors', {})
    business_type = config.get('business_type', '')

    # If no colors or buttons look like known defaults, use industry palette
    if not colors or not colors.get('buttons') or colors.get('buttons') in BAD_BUTTON_COLORS:
        industry_colors = INDUSTRY_COLOR_DEFAULTS.get(business_type, DEFAULT_COLOR_PALETTE)
        # Merge: keep any non-default AI-generated values, fill in from industry defaults
        merged = dict(industry_colors)
        for key, val in colors.items():
            if val and val not in BAD_BUTTON_COLORS and key != 'buttons':
                merged[key] = val
        config['colors'] = merged

    return config

def load_config(config_id):
    config_path = os.path.join(CONFIGS_FOLDER, f'{config_id}.json')
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            return json.load(f)
    return None

ODOO_URL = 'http://localhost:8069'
ODOO_DB = 'redpine_dev'
ODOO_USER = 'admin'
ODOO_PASS = 'admin'

api_key = os.environ.get('ANTHROPIC_API_KEY', '')
print(f"API Key loaded: {api_key[:20]}..." if api_key else "NO API KEY FOUND")

claude = anthropic.Anthropic(api_key=api_key)

def get_odoo_connection():
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_PASS, {})
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
    return uid, models

def configure_odoo(config):
    uid, models = get_odoo_connection()
    if config.get('business_name'):
        models.execute_kw(ODOO_DB, uid, ODOO_PASS, 'res.company', 'write', [[1], {'name': config['business_name']}])
    if config.get('sample_contacts'):
        for contact in config['sample_contacts']:
            models.execute_kw(ODOO_DB, uid, ODOO_PASS, 'res.partner', 'create', [contact])
    return True

CALENDAR_COMPONENT_IDS = {'calendar', 'appointments', 'schedules', 'shifts', 'classes', 'reservations'}

REDUNDANT_WITH_CALENDAR = {'appointments', 'schedules', 'shifts', 'classes', 'reservations'}
MAX_TABS = 8  # Including Dashboard


def consolidate_calendars(config):
    """Enforce ONE calendar-view component across the ENTIRE config.
    Dashboard is now a platform-managed tab — clear its components.
    All other tabs: only ONE calendar total. Extras become table view.
    Strip redundant calendar-entity sub-tabs from tabs that have a calendar."""

    # PASS 0: Clear Dashboard components — Dashboard is platform-managed (empty for now)
    for tab in config.get('tabs', []):
        is_dashboard = tab.get('label', '').lower() == 'dashboard' or tab.get('id', '') == 'tab_1'
        if is_dashboard:
            tab['components'] = []

    # PASS 1: Enforce ONE calendar-view component (existing logic)
    has_non_dashboard_calendar = False
    for tab in config.get('tabs', []):
        is_dashboard = tab.get('label', '').lower() == 'dashboard' or tab.get('id', '') == 'tab_1'
        comps = tab.get('components', [])
        seen_calendar_in_tab = False
        for comp in comps:
            comp_id = comp.get('id', '')
            comp_view = comp.get('view', '')
            is_calendar = comp_view == 'calendar' or (not comp_view and comp_id in CALENDAR_COMPONENT_IDS)
            if is_calendar:
                if is_dashboard and not seen_calendar_in_tab:
                    seen_calendar_in_tab = True
                    if not comp_view:
                        comp['view'] = 'calendar'
                elif not is_dashboard and not has_non_dashboard_calendar and not seen_calendar_in_tab:
                    has_non_dashboard_calendar = True
                    seen_calendar_in_tab = True
                    if not comp_view:
                        comp['view'] = 'calendar'
                else:
                    comp['view'] = 'table'

    # PASS 2: Strip redundant calendar-entity sub-components from tabs that have a calendar.
    # The calendar's filter chips (All | Appointments | Classes | Shifts) already handle these.
    # Keep non-calendar entities (rooms, equipment, treatments) as valid sub-tabs.
    for tab in config.get('tabs', []):
        comps = tab.get('components', [])
        has_calendar_view = any(c.get('view') == 'calendar' for c in comps)
        if has_calendar_view and len(comps) > 1:
            tab['components'] = [
                c for c in comps
                if c.get('id') not in REDUNDANT_WITH_CALENDAR
            ]

    return config


def enforce_tab_limit(config):
    """Cap tabs at MAX_TABS total. AI orders by importance so we keep the first ones."""
    tabs = config.get('tabs', [])
    if len(tabs) <= MAX_TABS:
        return config
    config['tabs'] = tabs[:MAX_TABS]
    return config


# Industries that MUST have a gallery or portfolio component
GALLERY_REQUIRED_TYPES = {
    'salon', 'barber', 'barbershop', 'nails', 'nail_tech', 'lash', 'brows',
    'tattoo', 'piercing', 'photography', 'photographer', 'creative',
    'landscaping', 'cleaning', 'auto', 'auto_detailing', 'detailing', 'car_wash',
    'restaurant', 'bakery', 'food_truck', 'cafe', 'catering',
    'florist', 'wedding', 'wedding_planner', 'event_planner',
    'interior_design', 'architecture', 'design',
    'spa', 'beauty', 'makeup', 'hair', 'pet_grooming',
}

GALLERY_COMPONENT_IDS = {'galleries', 'images', 'portfolios'}


def ensure_gallery(config):
    """Post-processing: inject a galleries component for visual industries
    that the AI missed. Similar to consolidate_calendars — enforces a rule
    the AI sometimes ignores."""
    btype = (config.get('business_type') or '').lower().replace(' ', '_')

    # Check if this business type requires a gallery
    needs_gallery = any(t in btype for t in GALLERY_REQUIRED_TYPES)
    if not needs_gallery:
        return config

    # Check if any gallery/images/portfolios component already exists
    for tab in config.get('tabs', []):
        for comp in tab.get('components', []):
            if comp.get('id', '') in GALLERY_COMPONENT_IDS:
                return config  # Already has one — done

    # Missing gallery — find the best tab to add it to, or create a new tab
    # Prefer a tab with 'portfolio', 'gallery', 'photo', 'work', 'services' in the label
    best_tab = None
    for tab in config.get('tabs', []):
        label = tab.get('label', '').lower()
        if any(kw in label for kw in ('portfolio', 'gallery', 'photo', 'work', 'service')):
            best_tab = tab
            break

    if best_tab:
        best_tab['components'].append({
            'id': 'galleries',
            'label': 'Gallery',
            'view': 'cards',
        })
    else:
        # No suitable tab — add a Gallery tab before Settings
        tabs = config.get('tabs', [])
        new_tab = {
            'id': f'tab_{len(tabs) + 1}',
            'label': 'Gallery',
            'icon': 'image',
            'components': [
                {'id': 'galleries', 'label': 'Gallery', 'view': 'cards'},
            ],
        }
        # Insert before last tab (Settings) if it exists
        if tabs and tabs[-1].get('label', '').lower() == 'settings':
            tabs.insert(-1, new_tab)
        else:
            tabs.append(new_tab)

    return config


PIPELINE_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#EC4899']

# Color words → hex mapping for stage color inference
STAGE_COLOR_WORDS = {
    'white': '#E5E7EB', 'yellow': '#FDE047', 'orange': '#FB923C',
    'green': '#22C55E', 'blue': '#3B82F6', 'purple': '#8B5CF6',
    'brown': '#92400E', 'red': '#EF4444', 'black': '#1A1A1A',
    'bronze': '#CD7F32', 'silver': '#C0C0C0', 'gold': '#FFD700',
    'platinum': '#E5E4E2', 'pink': '#EC4899', 'teal': '#14B8A6',
    'gray': '#6B7280', 'grey': '#6B7280', 'coral': '#F97316',
    'navy': '#1E3A5F', 'crimson': '#DC2626', 'emerald': '#059669',
    'ruby': '#E11D48', 'sapphire': '#2563EB', 'diamond': '#93C5FD',
    'amber': '#F59E0B', 'jade': '#059669', 'ivory': '#FFFFF0',
}


# Dual-color stages — martial arts stripes, poom, and other split-color ranks
# Maps pattern → (primary_color, secondary_color)
# Checked BEFORE single-color inference so "white stripe" doesn't just return white
# Stripe belts default to color/black — varies per studio, users can edit via Stage Manager
DUAL_COLOR_STAGES = {
    # Stripe belts (base color + black stripe — most universal default)
    'white stripe':   ('#E5E7EB', '#1A1A1A'),   # white / black
    'yellow stripe':  ('#FDE047', '#1A1A1A'),    # yellow / black
    'green stripe':   ('#22C55E', '#1A1A1A'),    # green / black
    'blue stripe':    ('#3B82F6', '#1A1A1A'),    # blue / black
    'red stripe':     ('#EF4444', '#1A1A1A'),    # red / black
    # Poom (junior black belt) — red/black
    'poom':           ('#EF4444', '#1A1A1A'),
    # Camo belt (some styles)
    'camo':           ('#22C55E', '#92400E'),    # green / brown
    # Tiger stripe
    'tiger':          ('#FB923C', '#1A1A1A'),    # orange / black
}

def infer_color_from_stage_name(name):
    """Infer color(s) from a stage name.
    Returns (color, color_secondary) tuple — color_secondary is None for single-color stages.
    Returns (None, None) if no color word found."""
    name_lower = name.lower()

    # Check dual-color patterns first (more specific)
    for pattern, (primary, secondary) in DUAL_COLOR_STAGES.items():
        if pattern in name_lower:
            return (primary, secondary)

    # Fall back to single-color inference
    for color_word, hex_color in STAGE_COLOR_WORDS.items():
        if color_word in name_lower:
            return (hex_color, None)

    return (None, None)

def transform_pipeline_stages(config):
    """Convert simple stages arrays to full pipeline objects expected by frontend.
    Supports both string stages and dict stages with optional color_secondary.
    Always enforces color inference from stage names containing color words."""
    for tab in config.get('tabs', []):
        for comp in tab.get('components', []):
            # Case 1: AI generated top-level 'stages' array — convert to pipeline object
            if comp.get('view') == 'pipeline' and 'stages' in comp:
                raw_stages = comp.pop('stages', [])
                if isinstance(raw_stages, list) and len(raw_stages) > 0:
                    stages = []
                    for i, item in enumerate(raw_stages):
                        if isinstance(item, dict):
                            name = item.get('name', f'Stage {i+1}')
                            inferred_primary, inferred_secondary = infer_color_from_stage_name(name)
                            stage = {
                                'id': f'stage_{i+1}',
                                'name': name,
                                'color': inferred_primary or item.get('color') or PIPELINE_COLORS[i % len(PIPELINE_COLORS)],
                                'order': i,
                            }
                            # Dual-color: inferred secondary wins, then AI-provided secondary
                            if inferred_secondary:
                                stage['color_secondary'] = inferred_secondary
                            elif item.get('color_secondary'):
                                stage['color_secondary'] = item['color_secondary']
                            stages.append(stage)
                        else:
                            name = str(item)
                            inferred_primary, inferred_secondary = infer_color_from_stage_name(name)
                            stage = {
                                'id': f'stage_{i+1}',
                                'name': name,
                                'color': inferred_primary or PIPELINE_COLORS[i % len(PIPELINE_COLORS)],
                                'order': i,
                            }
                            if inferred_secondary:
                                stage['color_secondary'] = inferred_secondary
                            stages.append(stage)
                    comp['pipeline'] = {
                        'stages': stages,
                        'default_stage_id': 'stage_1',
                    }

            # Case 2: AI generated full pipeline object — enforce color inference on existing stages
            elif comp.get('pipeline') and isinstance(comp['pipeline'], dict):
                existing_stages = comp['pipeline'].get('stages', [])
                if isinstance(existing_stages, list):
                    for i, stage in enumerate(existing_stages):
                        if isinstance(stage, dict) and stage.get('name'):
                            inferred_primary, inferred_secondary = infer_color_from_stage_name(stage['name'])
                            if inferred_primary:
                                stage['color'] = inferred_primary
                            if inferred_secondary:
                                stage['color_secondary'] = inferred_secondary
    return config


def analyze_with_template(description, template, business_type):
    """Use AI to customize a template for a specific business.
    Much shorter prompt than analyze_business since the template provides the skeleton."""
    print(f"Template path: customizing {business_type} template")

    template_json = json.dumps(template, indent=2)

    prompt = f"""You are customizing a business platform template for a specific business.

Business description: {description}
Business type: {business_type}

Here is the starting template (JSON):
{template_json}

Your job is to CUSTOMIZE this template for the specific business described above. Return ONLY valid JSON.

## RULES:
1. **NEVER remove components with "_locked": true** — these are essential and must stay
2. **You CAN remove tabs marked "_removable": true** if the business is solo (no staff/team mentioned)
3. **Customize labels** to match the business (e.g. "Staff" → "Barbers", "Clients" → "Pets & Owners")
4. **Add components** the user specifically mentioned that aren't in the template
5. **Remove unlocked components** the user clearly doesn't need
6. **Keep the tab structure** — don't reorganize tabs, just add/remove within them
7. **Set pipeline stages** if the user described specific progression (belt ranks, loyalty tiers, etc.)
8. **Extract the business name** from the description — keep it in the SAME LANGUAGE the user wrote in
9. **Tab and component labels should be in English** — the dashboard UI is English, only business_name stays in the user's language

## OUTPUT FORMAT:
Return the FULL config as JSON (same structure as template):
{{
    "business_name": "extracted business name",
    "business_type": "{business_type}",
    "tabs": [ ... customized tabs ... ],
    "summary": "one sentence about what was configured"
}}

Do NOT include "colors" — colors are handled separately.
Keep "_locked" and "_removable" flags on components — they'll be stripped later.
Every component MUST have a "view" field."""

    response = claude.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )
    raw_response = response.content[0].text
    print(f"Template customization response: {raw_response[:200]}...")

    # Strip markdown code blocks if present
    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r'^```json?\n?', '', cleaned)
        cleaned = re.sub(r'\n?```$', '', cleaned)

    return json.loads(cleaned)


def validate_locked_components(config, template, locked_ids):
    """Re-inject any locked components the AI accidentally removed.
    Compares config output against template and locked_ids set."""
    if not locked_ids:
        return config

    # Build a map of which locked components exist in the output
    existing_ids = set()
    for tab in config.get('tabs', []):
        for comp in tab.get('components', []):
            if comp.get('id') in locked_ids:
                existing_ids.add(comp['id'])

    missing = locked_ids - existing_ids
    if not missing:
        return config

    print(f"Re-injecting missing locked components: {missing}")

    # For each missing locked component, find it in the template and re-inject
    for template_tab in template.get('tabs', []):
        for template_comp in template_tab.get('components', []):
            comp_id = template_comp.get('id')
            if comp_id not in missing:
                continue

            # Find the matching tab in the output config (by label)
            target_tab = None
            for tab in config.get('tabs', []):
                if tab.get('label') == template_tab.get('label'):
                    target_tab = tab
                    break

            if target_tab:
                # Add to existing tab
                target_tab['components'].append(copy.deepcopy(template_comp))
            else:
                # Tab was removed — create it
                new_tab = {
                    'id': f'tab_{len(config.get("tabs", [])) + 1}',
                    'label': template_tab.get('label', 'Restored'),
                    'icon': template_tab.get('icon', 'box'),
                    'components': [copy.deepcopy(template_comp)],
                }
                # Insert before last tab (Payments is usually last)
                tabs = config.get('tabs', [])
                tabs.insert(max(0, len(tabs) - 1), new_tab)

            missing.discard(comp_id)

    return config


def strip_locked_flags(config):
    """Remove _locked and _removable flags from config before sending to frontend."""
    for tab in config.get('tabs', []):
        tab.pop('_removable', None)
        for comp in tab.get('components', []):
            comp.pop('_locked', None)
    return config


def analyze_business(description):
    print(f"Analyzing: {description}")

    prompt = f"""Analyze this business and create a custom dashboard configuration.

Business description: {description}

LANGUAGE: The description may be in any language. Extract the business_name in the user's original language. All tab labels and component labels should be in English (the dashboard UI is English).

Return ONLY valid JSON (no markdown, no code blocks):
{{
    "business_name": "extracted or generated name",
    "business_type": "barber, barbershop, salon, hair_salon, nail_salon, lash_brow, makeup_artist, med_spa, landscaping, restaurant, cafe, retail, fitness, auto, cleaning, photography, tutoring, pet_grooming, dental, construction, real_estate, freelancer, martial_arts, legal, professional, accounting, consulting, medical, veterinary, plumbing, electrical, catering, event_planning, hotel, spa, bakery, florist, daycare, moving, pest_control, hvac, roofing, tattoo, music_studio, dance_studio, yoga, crossfit, coworking, property_management, insurance, recruiting, other",
    "colors": {{
        "sidebar_bg": "#1A1A2E",
        "sidebar_icons": "#A0AEC0",
        "sidebar_buttons": "#3B82F6",
        "sidebar_text": "#E2E8F0",
        "background": "#F5F5F5",
        "buttons": "#3B82F6",
        "cards": "#FFFFFF",
        "text": "#1A1A1A",
        "headings": "#111827",
        "borders": "#E5E7EB"
    }},
    "tabs": [
        {{
            "id": "tab_1",
            "label": "Dashboard",
            "icon": "home",
            "components": [{{ "id": "calendar", "label": "Today", "view": "calendar" }}]
        }},
        ... more tabs (each component MUST include "view" field) ...
    ],
    "summary": "one sentence describing what was configured"
}}

## COLOR GENERATION RULES

Generate a cohesive color palette that matches the business personality. The sidebar_bg is the dominant brand color.

**Industry color guidance:**
- Barber/tattoo/auto: Dark & bold — sidebar_bg: #1A1A2E or #0F172A, buttons: electric blue/red
- Salon/spa/yoga: Soft & elegant — sidebar_bg: #2D2B3D or #1E293B, buttons: rose/purple/teal
- Medical/dental: Clean & trustworthy — sidebar_bg: #1E3A5F or #0F4C81, buttons: #3B82F6 blue
- Landscaping/garden: Natural & earthy — sidebar_bg: #1B4332 or #14532D, buttons: #22C55E green
- Restaurant/bakery/cafe: Warm & inviting — sidebar_bg: #3C1518 or #1C1917, buttons: #F59E0B amber
- Construction/electrical/plumbing: Industrial & sturdy — sidebar_bg: #1E293B or #0C1222, buttons: #F59E0B or #EF4444
- Legal/accounting/consulting: Professional & refined — sidebar_bg: #1E293B or #0F172A, buttons: #6366F1 indigo
- Fitness/martial arts/crossfit: Energetic & bold — sidebar_bg: #0F172A or #1A1A2E, buttons: #EF4444 red or #F97316 orange
- Photography/creative: Modern & minimal — sidebar_bg: #18181B or #1C1917, buttons: #8B5CF6 purple
- Real estate: Sophisticated — sidebar_bg: #1E293B, buttons: #0EA5E9 sky blue
- Retail: Inviting & commercial — sidebar_bg: #1E1B4B or #0F172A, buttons: #8B5CF6 or #EC4899
- Pet/vet: Friendly & warm — sidebar_bg: #1E3A3A or #164E63, buttons: #14B8A6 teal
- Events/catering: Celebratory — sidebar_bg: #2D1B4E or #1E1B4B, buttons: #A855F7 purple or #EC4899 pink
- Moving/cleaning: Dependable — sidebar_bg: #1E293B, buttons: #3B82F6 blue
- Education/tutoring/dance: Inspiring — sidebar_bg: #1E293B or #1B2E4B, buttons: #6366F1 indigo
- Property management: Professional — sidebar_bg: #1E293B, buttons: #0EA5E9

**Rules:**
- NEVER use #ce0707, #DC2626, or #EF4444 as the buttons color — these are generic defaults. Each business MUST get a unique, industry-appropriate accent color from the guidance above.
- sidebar_bg should ALWAYS be dark (near-black with a color tint)
- sidebar_text should ALWAYS be light (#E2E8F0 or #F1F5F9)
- sidebar_icons should be muted light (#A0AEC0 or #94A3B8)
- background should be light gray (#F5F5F5 or #F8FAFC)
- cards should be white (#FFFFFF)
- text should be dark (#1A1A1A or #111827)
- buttons should be the ONE accent color that defines the brand — pick from the industry guidance above, do NOT default to red
- sidebar_buttons should match or complement the buttons color

## VIEW ASSIGNMENT RULES

Every component in a tab MUST have a "view" field. Use these defaults:
- **pipeline**: clients, leads, jobs, workflows, cases, tickets, waivers (when tracking status flow). Clients should ALWAYS default to pipeline — every business has a client journey (new → active → loyal, belt stages, rewards tiers, etc.). Use "contacts" component with "list" view for the general address book.
- **calendar**: calendar, appointments, schedules, shifts, classes, reservations, social_media
- **cards**: staff, equipment, fleet, tables, rooms, menus, recipes, courses, packages, venues, portfolios, galleries, listings, images, reviews
- **list**: contacts, todos, messages, notes, announcements, checklists, knowledge, community, chat_widget
- **route**: routes (map view with territory polygons and stop lists — only for field service businesses like landscaping, plumbing, cleaning, pest control, delivery)
- **table**: everything else (products, inventory, invoices, payments, expenses, payroll, estimates, vendors, assets, contracts, documents, uploads, forms, signatures, orders, membership_plans, attendance, inspections, permits, prescriptions, treatments, properties, guests, campaigns, loyalty, surveys, subscriptions, time_tracking, reputation, portal)

## PIPELINE STAGES

When a component uses "view": "pipeline", also include a "stages" array with 3-6 industry-specific stage names.

**clients pipeline stages by industry (REQUIRED — every clients component must have stages):**
- Martial arts: ["White Belt", "Yellow Belt", "Orange Belt", "Green Belt", "Blue Belt", "Brown Belt", "Black Belt"]
- Salon/spa: ["New Client", "Regular", "VIP", "Ambassador"]
- Fitness/gym: ["Trial", "New Member", "Active", "Loyal", "Champion"]
- Retail: ["First Purchase", "Returning", "Regular", "Gold Member", "VIP"]
- Restaurant/cafe: ["First Visit", "Returning", "Regular", "Loyalty Member"]
- Real estate: ["Prospect", "Showing", "Offer", "Under Contract", "Closed"]
- Medical/dental: ["New Patient", "Active", "Ongoing Care", "Recall"]
- Contractor/landscaping: ["Estimate", "Scheduled", "In Progress", "Complete", "Recurring"]
- Legal/accounting: ["Prospect", "Onboarding", "Active Client", "Retainer"]
- Pet grooming/vet: ["New Pet", "Regular", "Frequent", "Premium"]
- Photography: ["Inquiry", "Booked", "Shoot Complete", "Delivered"]
- Education/tutoring: ["Enrolled", "In Progress", "Advanced", "Graduated"]
- General: ["New", "Active", "Loyal", "VIP"]

**leads stages by industry:**
- General: ["New", "Contacted", "Qualified", "Proposal", "Won"]
- Contractor: ["Inquiry", "Estimate Sent", "Approved", "Scheduled", "Complete"]
- Salon/fitness: ["Inquiry", "Consulted", "Trial", "Member"]
- Real estate: ["New Lead", "Showing", "Offer", "Under Contract", "Closed"]

**jobs/work orders stages:**
- General: ["New", "In Progress", "Review", "Complete", "Invoiced"]
- Contractor: ["Estimated", "Approved", "Scheduled", "In Progress", "Complete", "Invoiced"]

**cases stages:**
- Legal: ["Filed", "Discovery", "Negotiation", "Trial", "Closed"]
- Recruiting: ["Sourced", "Screening", "Interview", "Offer", "Placed"]

**tickets stages:**
- General: ["New", "In Progress", "Waiting", "Resolved"]

**waivers stages:**
- General: ["Draft", "Sent", "Viewed", "Signed"]

Example component with pipeline:
{{ "id": "clients", "label": "Students", "view": "pipeline", "stages": ["White Belt", "Yellow Belt", "Green Belt", "Blue Belt", "Brown Belt", "Black Belt"] }}
{{ "id": "leads", "label": "Prospects", "view": "pipeline", "stages": ["Inquiry", "Consulted", "Trial", "Member"] }}

## COMPONENT REGISTRY (68 components available)

**People - Managing contacts and relationships:**
- clients: Client pipeline — tracks client journey through stages (belt ranks, loyalty tiers, sales stages). Use this for your PRIMARY customer/member/student/patient list.
- contacts: Contact directory — every name, phone number, and email in your CRM. Use this as the general address book alongside the clients pipeline.
- leads: Leads pipeline, prospect tracking, conversion funnel
- staff: Staff cards, employee management, roles
- vendors: Vendor list, supplier contacts, ordering
- guests: Guest list with RSVP status, party size, dietary preferences

**Things - Physical items and inventory:**
- products: Product catalog with SKU, stock levels, pricing
- inventory: Stock tracking, low stock alerts, reorder points
- equipment: Equipment list, maintenance tracking, assignments
- assets: Asset management, depreciation, location tracking
- listings: Property listings with address, price, bedrooms, status
- properties: Rental property management, tenants, leases
- venues: Venue management with capacity, address, amenities

**Time - Scheduling and calendar:**
- calendar: Calendar view (day/week/month), event management
- appointments: Appointment booking, availability, confirmations
- schedules: Schedule grid, recurring events, team schedules
- shifts: Shift scheduler, staff assignments, coverage
- time_tracking: Employee hours, billable time, project tracking

**Money - Financial management:**
- invoices: Invoice creation, tracking, payment status
- payments: Payment processing, transaction history
- expenses: Expense logging, categories, receipts
- payroll: Payroll management, pay periods, deductions
- estimates: Quotes, proposals, estimate-to-invoice conversion
- packages: Service packages, pricing bundles, included items
- subscriptions: Recurring subscription management, billing cycles

**Tasks - Work management:**
- todos: Task checklists, due dates, priorities
- jobs: Job cards, work orders, job tracking
- projects: Project boards, milestones, team assignments
- workflows: Workflow automation, process templates
- cases: Legal case management, case tracking, court dates
- checklists: Task checklists with completion tracking, assignees

**Communication - Messaging and notes:**
- messages: Message inbox, client communication
- notes: Notes editor, internal memos
- announcements: Announcement feed, team updates
- reviews: Review management, reputation tracking
- campaigns: Marketing campaigns (email/social/ad), reach, conversions
- loyalty: Loyalty programs, points, tiers, rewards
- surveys: Customer surveys, responses, completion rates
- tickets: Support tickets with priority, status, assignee
- knowledge: FAQ articles, help docs, categories
- community: Member forum, discussions, events
- chat_widget: Website live chat, lead capture, auto-responses
- social_media: Social media scheduling, content calendar, analytics
- reputation: Review aggregation from Google, Yelp, Facebook

**Files - Document management:**
- documents: File manager, folders, sharing
- contracts: Contract management, signatures, renewals
- images: Image gallery, before/after photos
- uploads: Upload manager, file attachments
- portfolios: Portfolio showcase, case studies, project gallery
- galleries: Photo galleries with client access, proofing

**Signing & Compliance:**
- waivers: Waiver templates, digital signatures, print copies, expiry tracking
- forms: Custom forms, intake forms, questionnaires, submissions
- signatures: E-signature tracking, signed documents, countersigning

**Hospitality & Food:**
- reservations: Table/room/resource reservations with date/time
- tables: Restaurant table status (open/occupied/reserved), capacity
- menus: Menu items, categories, pricing, dietary flags
- orders: Order management, customer, items, total, status
- rooms: Room management for hotels/spas/studios, hourly rates
- recipes: Recipe management, ingredients, portions, cost, prep time

**Education & Programs:**
- classes: Class schedules, enrollment, instructors, capacity
- membership_plans: Membership tiers/plans — name, price, interval (monthly/yearly/one-time), features, status. Use cards view.
- membership_members: People subscribed to plans — client name, plan, status pipeline (Prospect/Trial/Active/Past Due/Cancelled), payment status. Use pipeline view. Always pair with membership_plans as adjacent sub-tabs.
- courses: Course catalog, modules, duration, progress
- attendance: Check-in logs, participation tracking

**Field Service:**
- inspections: Inspection checklists, inspector, pass/fail results
- routes: Service routes, stops, driver, vehicle, ETAs
- fleet: Vehicle fleet, make/model, mileage, next service
- permits: Building/work permits, authority, status, expiry

**Health & Medical:**
- prescriptions: Medication prescriptions, dosage, frequency, refills
- treatments: Treatment plans, provider, follow-up care

**Digital & Online:**
- client_portal: Client-facing portal for schedule, billing, progress, documents, account

## AVAILABLE ICONS

home, people, box, clock, dollar, check, chat, folder, briefcase, star, tool, calendar, mail, file, target, truck, users, grid, calculator, wallet, edit, megaphone, image, upload, layout, clipboard, archive, rotate, settings, chart, zap, heart, shield, globe, package, book, shopping-cart, map

## INDUSTRY TEMPLATES (use as starting points, customize based on details)

**Barber/Salon:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients, view: pipeline, stages: ["New Client", "Regular", "VIP", "Ambassador"]), loyalty (Rewards)
- Schedule: calendar (Schedule, view: calendar)
- Payments: payments (Payments), invoices (Receipts), packages (Packages)
- Staff: staff (Barbers/Stylists), shifts (Shifts, view: table) [if multiple staff]

**Landscaping:**
- Dashboard: (empty — platform-managed)
- Customers: clients (Customers, view: pipeline, stages: ["Estimate", "Scheduled", "In Progress", "Complete", "Recurring"]), leads (Leads)
- Jobs: calendar (Schedule, view: calendar), jobs (Jobs), estimates (Estimates), routes (Routes)
- Crew: staff (Crew), shifts (Assignments, view: table), equipment (Equipment), fleet (Vehicles)
- Billing: invoices (Invoices), payments (Payments), expenses (Expenses)

**Restaurant/Cafe:**
- Dashboard: (empty — platform-managed)
- Reservations: calendar (Schedule, view: calendar), tables (Table Layout), waitlist (Waitlist)
- Menu: menus (Menu Items), recipes (Recipes), inventory (Inventory)
- Orders: orders (Online Orders), loyalty (Loyalty Program)
- Team: staff (Staff, view: cards), shifts (Shifts, view: table), tip_pools (Tips)
- Finances: payments (Sales), invoices (Invoices), expenses (Expenses), suppliers (Suppliers)

**Martial Arts Studio:**
- Dashboard: (empty — platform-managed)
- Students: clients (Students, view: pipeline, stages: use belt stages user provides e.g. ["White Belt", "Yellow Belt", "Orange Belt", "Green Belt", "Blue Belt", "Brown Belt", "Black Belt"]), contacts (Families, view: list)
- Schedule: calendar (Schedule, view: calendar)
- Programs: classes (Class Types, view: cards), membership_plans (Membership Plans, view: cards), membership_members (Members, view: pipeline, stages: ["Prospect", "Trial", "Active", "Past Due", "Cancelled"]), waivers (Waivers, view: pipeline), client_portal (Client Portal)
- Team: staff (Instructors), shifts (Staff Shifts, view: table)
- Billing: payments (Payments), invoices (Invoices)

**Fitness Studio/Gym:**
- Dashboard: (empty — platform-managed)
- Members: clients (Members, view: pipeline, stages: ["Trial", "New Member", "Active", "Loyal", "Champion"]), leads (Prospects)
- Schedule: calendar (Schedule, view: calendar)
- Programs: classes (Class Types, view: cards), membership_plans (Membership Plans, view: cards), membership_members (Members, view: pipeline, stages: ["Prospect", "Trial", "Active", "Past Due", "Cancelled"]), waivers (Waivers), client_portal (Client Portal)
- Team: staff (Trainers), shifts (Staff Schedule, view: table)
- Billing: payments (Payments), invoices (Invoices)

**Real Estate:**
- Dashboard: (empty — platform-managed)
- Leads: leads (Leads), clients (Clients)
- Properties: listings (Listings), properties (Properties), images (Photos)
- Pipeline: jobs (Deals), todos (Tasks)
- Documents: documents (Documents), contracts (Contracts), signatures (Signatures)

**Freelancer/Consultant:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients), leads (Prospects), client_portal (Client Portal)
- Projects: projects (Projects), time_tracking (Time Tracking)
- Billing: invoices (Invoices), payments (Payments), estimates (Quotes)
- Files: documents (Documents), contracts (Contracts)

**Retail Store:**
- Dashboard: (empty — platform-managed)
- Products: products (Products), inventory (Inventory), orders (Orders)
- Customers: clients (Customers, view: pipeline, stages: ["First Purchase", "Returning", "Regular", "Gold Member", "VIP"]), leads (Leads), loyalty (Loyalty Program)
- Sales: invoices (Invoices), payments (Payments)
- Staff: staff (Staff), shifts (Shifts)

**Auto Shop:**
- Dashboard: (empty — platform-managed)
- Customers: clients (Customers)
- Schedule: calendar (Schedule, view: calendar), jobs (Work Orders)
- Parts: inventory (Parts), products (Products), inspections (Inspections)
- Billing: invoices (Invoices), payments (Payments), estimates (Estimates)

**Cleaning Service:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients), leads (Leads)
- Jobs: jobs (Jobs), routes (Routes), checklists (Checklists)
- Team: staff (Cleaners), shifts (Assignments), fleet (Vehicles)
- Billing: invoices (Invoices), payments (Payments), subscriptions (Subscriptions)

**Photography/Creative:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients), leads (Inquiries)
- Schedule: calendar (Schedule, view: calendar)
- Gallery: galleries (Client Galleries), portfolios (Portfolio), images (Photos)
- Business: invoices (Invoices), contracts (Contracts), payments (Payments)

**Tutoring/Education:**
- Dashboard: (empty — platform-managed)
- Students: clients (Students), leads (Inquiries), attendance (Attendance), client_portal (Student Portal)
- Schedule: calendar (Schedule, view: calendar)
- Materials: documents (Curriculum), notes (Session Notes), courses (Courses)
- Billing: invoices (Invoices), payments (Payments), membership_plans (Plans, view: cards), membership_members (Students Enrolled, view: pipeline, stages: ["Prospect", "Trial", "Active", "Past Due", "Cancelled"])

**Pet Grooming/Veterinary:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Pet Parents), notes (Pet Profiles)
- Schedule: calendar (Schedule, view: calendar)
- Medical: treatments (Treatments), prescriptions (Prescriptions) [vet only]
- Team: staff (Groomers/Vets), shifts (Schedule, view: table)
- Payments: payments (Payments), invoices (Receipts)

**Dental/Medical:**
- Dashboard: (empty — platform-managed)
- Patients: clients (Patients), forms (Intake Forms), client_portal (Patient Portal)
- Schedule: calendar (Schedule, view: calendar)
- Clinical: treatments (Treatment Plans), prescriptions (Prescriptions), notes (Notes)
- Records: documents (Records), waivers (Consent Forms), signatures (Signatures)
- Billing: invoices (Invoices), payments (Payments)
- Staff: staff (Staff), shifts (Schedule, view: table)

**Construction/Electrical/Plumbing:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients), leads (Leads)
- Projects: jobs (Work Orders), schedules (Timeline), estimates (Estimates)
- Resources: staff (Crew), equipment (Equipment), fleet (Vehicles), inventory (Materials)
- Compliance: inspections (Inspections), permits (Permits), checklists (Safety Checklists)
- Billing: invoices (Invoices), payments (Payments), expenses (Expenses)

**Event Planning/Catering:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients), leads (Inquiries), guests (Guest Lists)
- Events: calendar (Schedule, view: calendar), venues (Venues)
- Vendors: vendors (Vendors), menus (Menus) [catering]
- Business: invoices (Invoices), payments (Payments), contracts (Contracts)

**Legal/Accounting:**
- Dashboard: (empty — platform-managed)
- Clients: clients (Clients), leads (Prospects), client_portal (Client Portal)
- Cases: cases (Cases), documents (Documents), contracts (Contracts)
- Work: time_tracking (Time Tracking), todos (Tasks)
- Billing: invoices (Invoices), payments (Payments), estimates (Proposals)

**Hotel/Spa:**
- Dashboard: (empty — platform-managed)
- Guests: clients (Guests), reservations (Reservations, view: table), client_portal (Guest Portal)
- Schedule: calendar (Schedule, view: calendar), rooms (Rooms)
- Services: treatments (Treatments), packages (Packages)
- Staff: staff (Staff), shifts (Shifts, view: table)
- Billing: invoices (Invoices), payments (Payments)

## RULES FOR GOOD CONFIGS

1. **ONE universal calendar — NO redundant sub-tabs.** The calendar component has built-in filter chips (All | Appointments | Classes | Shifts) and a view toggle (calendar/list). It already shows ALL time-based events with color coding (Appointment=blue, Class=purple, Shift=green).
   Do NOT add appointments, classes, shifts, schedules, or reservations as sub-components on the same tab as a calendar — they are REDUNDANT because the calendar already displays them via filter chips.
   Non-time entities (rooms, tables, equipment, venues, jobs) are fine alongside the calendar.
   The ONLY component that should have view: "calendar" is the "calendar" component itself.
   If you need a class-type catalog or shift management, put them on a SEPARATE tab (e.g., Programs for class types, Team for shifts).
   Example for a fitness Schedule tab — just the calendar, nothing else:
   - {{"id": "calendar", "label": "Schedule", "view": "calendar"}}
2. **ALWAYS start with a Dashboard tab** but with EMPTY components: `[]`. Dashboard is platform-managed and will be populated by the system. The AI should include the Dashboard tab entry (for nav) but with no components.
3. **Use 3-5 user tabs** (plus Dashboard = 4-6 total) - small businesses need simplicity
4. **Each tab should have 1-4 components** - don't overwhelm
5. **Use industry-appropriate labels:**
   - Barber: "Clients" not "Customers"
   - Restaurant: "Guests" or "Reservations" not "Clients"
   - Fitness: "Members" not "Clients"
   - Medical: "Patients" not "Clients"
   - Construction: "Projects" not "Jobs"
6. **Solo operators don't need Staff tabs** - only add if they mention employees/team
7. **Match complexity to business size (tab counts EXCLUDE Dashboard):**
   - Solo: 3 tabs + Dashboard = 4 total, 4-6 components
   - Small team (2-5): 4 tabs + Dashboard = 5 total, 6-10 components
   - Larger team: 5-6 tabs + Dashboard = 6-7 total, 8-14 components
8. **Group logically by workflow, not by component category**
9. **Use industry-specific components when relevant:**
   - Restaurant/cafe: reservations, tables, menus, orders, recipes
   - Fitness/martial arts: classes, membership_plans, membership_members, waivers, attendance
   - Medical/dental: treatments, prescriptions, forms (intake)
   - Construction/electrical/plumbing: inspections, permits, fleet, checklists
   - Real estate: listings, properties
   - Photography/creative: galleries, portfolios
   - Events/catering: venues, guests, menus
   - Legal: cases, time_tracking
   - Salon/barber: loyalty, packages, galleries (showcase cuts/styles)
   - Nail tech/lash/brows: galleries (showcase work)
   - Tattoo artist: portfolios or galleries (showcase art)
   - Landscaping/cleaning/detailing: galleries (before/after photos)
   - Restaurant/bakery/food truck: galleries (food photos)
   - Florist/wedding planner: galleries (arrangements/events)
   - Interior design/architecture: portfolios (project showcase)
   - Service businesses with vehicles: fleet, routes
10. **Waivers are important for physical activities** - martial arts, fitness, sports, adventure
11. **ALWAYS prefer industry-specific components over generic ones:**
    - Restaurant with food = MUST use menus, recipes (not just products)
    - Hotel with spa = MUST use rooms, treatments (not just appointments)
    - Moving company = MUST use fleet, routes, checklists (not just jobs)
    - Catering = MUST use menus, recipes, guests (not just products, clients)
    - Property mgmt = MUST use properties, inspections (not just clients, tickets)
    - Recruiting = MUST use cases for placements, time_tracking for billing
    - Tattoo/piercing = MUST use waivers, portfolios or galleries
    - Nail tech/lash/brows/salon/barber = MUST use galleries (to showcase work on website)
    - Landscaping/cleaning/auto detailing = MUST use galleries (before/after photos)
    - Restaurant/bakery/food truck = MUST use galleries (food photos)
    - Florist/wedding/event planner = MUST use galleries (arrangements/events)
    - Interior design/architecture = MUST use portfolios (project showcase)
    - Any business that showcases visual work = MUST use galleries or portfolios (connects to website gallery widget automatically)
    - Any business with vehicles/trucks = MUST use fleet
    - Any business with food/cooking = MUST use recipes
    - Any business with class schedules = MUST use classes (not just appointments)
12. **Pipeline stages MUST reflect what the user describes:**
    - If user mentions belt stages (white, yellow, orange, green, blue, brown, black) → use THOSE as stages, not generic CRM stages
    - If user mentions tiers (Bronze, Silver, Gold) → use those
    - If user describes their own process → use their words
    - The system auto-colors stages based on color words in the name (e.g. "White Belt" → white, "Gold Plan" → gold, "Black Belt" → black)
    - Generic CRM stages (New, Active, Loyal, VIP) are ONLY for businesses with no specific progression described
    - ALWAYS include the stages array on pipeline components: {{"id": "clients", "label": "Students", "view": "pipeline", "stages": ["White Belt", "Yellow Belt", "Orange Belt", "Green Belt", "Blue Belt", "Brown Belt", "Black Belt"]}}
13. **Membership programs use TWO paired components** — always add both together:
    - `membership_plans` (view: cards) — the plans/tiers you sell (Basic, Premium, VIP, etc.)
    - `membership_members` (view: pipeline, stages: ["Prospect", "Trial", "Active", "Past Due", "Cancelled"]) — people subscribed + their lifecycle
    - These replace the old `memberships` component. NEVER use `memberships` for new configs.
    - Any business with recurring memberships (fitness, martial arts, salon, spa, tutoring, yoga, dance) should use this pair.
14. **Kids/family businesses need Families, not Prospects:**
    - Kids martial arts, daycare, tutoring, dance → use contacts as "Families" or "Parents & Guardians" (view: list)
    - Do NOT add leads/prospects pipeline for businesses that primarily serve families with children
    - The parent/guardian is the one paying, signing waivers, and communicating — so family contact info is essential
    - Only add leads/prospects if the user specifically mentions needing a sales pipeline
15. **Client Portal sub-tab for client-facing businesses:**
    - Studios (martial arts, dance, yoga, fitness, boxing, music) → add `client_portal` sub-tab in the Programs tab
    - Professional services (legal, accounting, consulting, medical, dental, spa) → add `client_portal` sub-tab in the Clients tab
    - DO NOT add portal for: restaurants, cafes, retail, food trucks, bars (no repeat-client portal needed)
    - The portal lets clients view their schedule, billing, progress, documents, and account
    - Example: {{"id": "client_portal", "label": "Client Portal", "view": "route"}}
16. **Programs tab should default to pipeline view:**
    - Programs represent client journeys (belt progression, membership tiers, course levels)
    - Use pipeline view as the default for the main component in Programs tab
    - Example for martial arts: {{"id": "programs", "label": "Programs", "view": "pipeline", "stages": ["White Belt", "Yellow Belt", "Green Belt", "Blue Belt", "Red Belt", "Black Belt"]}}
17. **Maximum 7 user-configured tabs** (+ Dashboard = 8 total). If more are needed, consolidate related functions into one tab with sub-components.

## GOOD vs BAD CONFIG EXAMPLES

**GOOD - Solo Barber "Tony's Cuts":**
{{
    "tabs": [
        {{ "id": "tab_1", "label": "Dashboard", "icon": "home", "components": [] }},
        {{ "id": "tab_2", "label": "Clients", "icon": "people", "components": [{{ "id": "clients", "label": "Clients", "view": "pipeline" }}] }},
        {{ "id": "tab_3", "label": "Schedule", "icon": "calendar", "components": [{{ "id": "calendar", "label": "Schedule", "view": "calendar" }}] }},
        {{ "id": "tab_4", "label": "Payments", "icon": "dollar", "components": [{{ "id": "payments", "label": "Payments", "view": "table" }}] }}
    ]
}}
Why it's good: Simple, 4 tabs, Dashboard empty (platform-managed), ONE calendar on Schedule (no redundant appointments sub-tab), all views explicit.

**BAD - Same barber:**
{{
    "tabs": [
        {{ "id": "tab_1", "label": "People", "icon": "people", "components": [{{ "id": "clients", "label": "Clients" }}, {{ "id": "leads", "label": "Leads" }}, {{ "id": "staff", "label": "Staff" }}, {{ "id": "vendors", "label": "Vendors" }}] }},
        {{ "id": "tab_2", "label": "Money", "icon": "dollar", "components": [{{ "id": "invoices", "label": "Invoices" }}, {{ "id": "payments", "label": "Payments" }}, {{ "id": "expenses", "label": "Expenses" }}, {{ "id": "payroll", "label": "Payroll" }}, {{ "id": "estimates", "label": "Estimates" }}] }}
    ]
}}
Why it's bad: Generic labels, too many components, includes Staff/Payroll for a solo barber, no Dashboard tab.

**GOOD - Landscaping company with 5 crew:**
{{
    "tabs": [
        {{ "id": "tab_1", "label": "Dashboard", "icon": "home", "components": [] }},
        {{ "id": "tab_2", "label": "Customers", "icon": "people", "components": [{{ "id": "clients", "label": "Customers", "view": "pipeline" }}, {{ "id": "leads", "label": "Leads", "view": "pipeline" }}] }},
        {{ "id": "tab_3", "label": "Jobs", "icon": "briefcase", "components": [{{ "id": "calendar", "label": "Schedule", "view": "calendar" }}, {{ "id": "jobs", "label": "Jobs", "view": "pipeline" }}, {{ "id": "estimates", "label": "Estimates", "view": "table" }}] }},
        {{ "id": "tab_4", "label": "Crew", "icon": "users", "components": [{{ "id": "staff", "label": "Crew", "view": "cards" }}, {{ "id": "shifts", "label": "Assignments", "view": "table" }}] }},
        {{ "id": "tab_5", "label": "Billing", "icon": "dollar", "components": [{{ "id": "invoices", "label": "Invoices", "view": "table" }}, {{ "id": "payments", "label": "Payments", "view": "table" }}] }}
    ]
}}
Why it's good: Dashboard empty (platform-managed), ONE calendar on Jobs tab, no redundant sub-tabs alongside calendar, shifts on Crew tab (not calendar tab), all views explicit.

Now analyze the business description and create a perfect config."""

    response = claude.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )
    raw_response = response.content[0].text
    print(f"Claude response: {raw_response}")

    # Strip markdown code blocks if present
    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r'^```json?\n?', '', cleaned)
        cleaned = re.sub(r'\n?```$', '', cleaned)

    print(f"Cleaned JSON: {cleaned}")
    return json.loads(cleaned)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/form')
def form():
    return render_template('form.html')

@app.route('/examples')
def examples():
    return render_template('examples.html')

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat messages for clarifying vague business descriptions.
    Uses Haiku for cost efficiency (~10x cheaper than Sonnet).
    Capped at 10 messages to prevent runaway conversations."""
    data = request.json
    messages = data.get('messages', [])

    # Cap at 10 user messages — force READY_TO_BUILD after that
    user_message_count = sum(1 for m in messages if m.get('role') == 'user')
    if user_message_count >= 10:
        return jsonify({'success': True, 'response': 'READY_TO_BUILD'})

    system_prompt = """You're a CTO helping someone build their business platform. Short, casual, helpful.

LANGUAGE RULE: Always respond in the SAME LANGUAGE the user writes in. If they write in Spanish, respond in Spanish. If they write in French, respond in French. If they write in English, respond in English. Match their language exactly throughout the entire conversation.

You need to gather these details (ask about them one at a time, across multiple messages):
1. Business name
2. What they do — specific services, products, or programs they offer
3. Who their customers are (clients, students, patients, members, pet owners, etc.)
4. Team size — solo, small team, or larger. Who works there? (instructors, techs, stylists, etc.)
5. What's their biggest headache right now? (scheduling chaos, lost leads, manual invoicing, etc.)
6. Do they track any kind of progression or stages? (client journey, belt ranks, loyalty tiers, project phases, etc.)

Your style:
- One short question at a time — never ask multiple questions in the same message
- Show genuine interest in their business. Relate to what they share.
- If they mention a pain point, briefly explain how the platform fixes it, then move to the next question
- If they're just starting out, help them think through what they'll need
- No fluff, no corporate talk
- NEVER rush — ask at least 4 questions before deciding you have enough info

IMPORTANT: Do NOT say READY_TO_BUILD until you have gathered at least 5 of the 6 details above. The more context you gather, the better system you can build. Be thorough.

When you genuinely have enough detail (at least 5 items covered across the conversation), respond with EXACTLY: "READY_TO_BUILD"

Examples:
- "Nice! What's the business called?"
- "Cool — so what kind of services do you offer there?"
- "And who are your typical customers? Families, individuals, businesses?"
- "Got it. Is it just you running things, or do you have a team?"
- "What's the biggest pain point right now? Like what takes up too much of your time?"
- "Do your clients go through any kind of stages or progression? Like new → regular → VIP, or belt ranks, or anything like that?"
"""

    try:
        response = claude.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=256,
            system=system_prompt,
            messages=messages
        )
        return jsonify({'success': True, 'response': response.content[0].text})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/check-input', methods=['POST'])
def check_input():
    """Check if input is detailed enough or needs clarification"""
    data = request.json
    description = data.get('description', '')

    prompt = f"""Analyze this business description and determine if it has enough detail to configure a business platform.

Description: "{description}"

A DETAILED description must include ALL of these:
- Business name (a specific name, not just the type)
- Specific services or products offered
- Who their customers are
- Team size or structure
- At least one workflow detail (how they handle clients, scheduling, billing, etc.)

If ANY of these is missing, respond "VAGUE". Only respond "DETAILED" if the description is truly comprehensive with all 5 elements.

Most single-sentence descriptions should be "VAGUE" — we want to ask follow-up questions to build a better system.

Respond with ONLY one word: "DETAILED" or "VAGUE" """

    try:
        response = claude.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=10,
            messages=[{"role": "user", "content": prompt}]
        )
        result = response.content[0].text.strip().upper()
        is_detailed = "DETAILED" in result
        return jsonify({'success': True, 'detailed': is_detailed})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/configure', methods=['POST'])
def configure():
    data = request.json
    description = data.get('description', '')
    conversation_history = data.get('conversation_history', [])
    print(f"Received request: {description}")

    try:
        # Try template path first — Beauty & Body industries get consistent configs
        business_type, family = detect_template_type(description)
        if business_type and family:
            print(f"Template matched: {business_type} (family: {family})")
            template, locked_ids = get_template(business_type, family)
            if template:
                config = analyze_with_template(description, template, business_type)
                config = validate_locked_components(config, template, locked_ids)
                config = strip_locked_flags(config)
            else:
                # Template family matched but no template for this type — fallback
                config = analyze_business(description)
        else:
            # No template match — use original build-from-scratch
            config = analyze_business(description)

        config = validate_colors(config)
        config = consolidate_calendars(config)
        config = enforce_tab_limit(config)
        config = ensure_gallery(config)
        config = transform_pipeline_stages(config)
        print(f"Config: {config}")

        # Save config to local JSON file (backup)
        local_config_id = save_config(config, conversation_history)
        print(f"Saved local config with ID: {local_config_id}")

        # Also save to dashboard's Supabase via API
        dashboard_base = os.environ.get('DASHBOARD_URL', 'http://localhost:3000')
        config_id = local_config_id  # fallback
        try:
            dashboard_resp = http_requests.post(
                f'{dashboard_base}/api/config',
                json={
                    'businessName': config.get('business_name'),
                    'businessType': config.get('business_type'),
                    'tabs': config.get('tabs', []),
                    'colors': config.get('colors', {}),
                },
                timeout=10
            )
            dashboard_data = dashboard_resp.json()
            if dashboard_data.get('success') and dashboard_data.get('data', {}).get('id'):
                config_id = dashboard_data['data']['id']
                print(f"Saved to Supabase with ID: {config_id}")
            else:
                print(f"Dashboard API returned: {dashboard_data}")
        except Exception as e:
            print(f"Failed to save to dashboard API (using local ID): {e}")

        # Build redirect URL with business info in params (fallback if Supabase config not found)
        from urllib.parse import quote
        biz_name = quote(config.get('business_name', ''))
        biz_type = quote(config.get('business_type', ''))
        redirect_url = f'{dashboard_base}/preview?config_id={config_id}&business_name={biz_name}&business_type={biz_type}'

        return jsonify({
            'success': True,
            'config': config,
            'config_id': config_id,
            'redirect_url': redirect_url
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/config/<config_id>', methods=['GET'])
def get_config(config_id):
    """Retrieve a saved config by ID"""
    config = load_config(config_id)
    if config:
        return jsonify({'success': True, 'config': config})
    return jsonify({'success': False, 'error': 'Config not found'}), 404

@app.route('/config/<config_id>', methods=['PUT'])
def update_config(config_id):
    """Update an existing config by ID"""
    # Load existing config
    config = load_config(config_id)
    if not config:
        return jsonify({'success': False, 'error': 'Config not found'}), 404

    # Get changes from request
    changes = request.json or {}

    # New format: tabs array
    if 'tabs' in changes:
        config['tabs'] = changes['tabs']

    # Other fields
    if 'business_name' in changes:
        config['business_name'] = changes['business_name']
    if 'business_type' in changes:
        config['business_type'] = changes['business_type']

    # Legacy format support (for backwards compatibility)
    if 'labels' in changes:
        config['labels'] = changes['labels']
    if 'visible_tabs' in changes:
        config['visible_tabs'] = changes['visible_tabs']
    if 'sub_items' in changes:
        config['sub_items'] = changes['sub_items']

    # Save back to file
    config_path = os.path.join(CONFIGS_FOLDER, f'{config_id}.json')
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)

    return jsonify({'success': True, 'config': config})

@app.route('/signup', methods=['POST'])
def signup():
    """Create a Supabase auth user for the onboarding flow.
    Returns auth tokens so the frontend can redirect with a live session."""
    data = request.json or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({'success': False, 'error': 'Name, email, and password are required.'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'error': 'Password must be at least 6 characters.'}), 400

    supabase_url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

    if not supabase_url or not supabase_key:
        return jsonify({'success': False, 'error': 'Server misconfiguration.'}), 500

    try:
        # 1. Create Supabase auth user via admin API
        create_resp = http_requests.post(
            f'{supabase_url}/auth/v1/admin/users',
            headers={
                'Authorization': f'Bearer {supabase_key}',
                'apikey': supabase_key,
                'Content-Type': 'application/json',
            },
            json={
                'email': email,
                'password': password,
                'email_confirm': True,  # Auto-confirm since they're signing up right now
                'user_metadata': {'full_name': name},
            },
            timeout=10,
        )

        if create_resp.status_code == 422:
            return jsonify({'success': False, 'error': 'An account with this email already exists.'}), 409

        if create_resp.status_code not in (200, 201):
            err_msg = create_resp.json().get('msg', create_resp.text[:200])
            return jsonify({'success': False, 'error': f'Failed to create account: {err_msg}'}), 500

        user_data = create_resp.json()
        user_id = user_data.get('id')

        # 2. Sign in to get auth tokens
        anon_key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY', supabase_key)
        signin_resp = http_requests.post(
            f'{supabase_url}/auth/v1/token?grant_type=password',
            headers={
                'apikey': anon_key,
                'Content-Type': 'application/json',
            },
            json={
                'email': email,
                'password': password,
            },
            timeout=10,
        )

        if signin_resp.status_code != 200:
            # User was created but sign-in failed — still return success without tokens
            return jsonify({
                'success': True,
                'auth': {'user_id': user_id, 'access_token': None, 'refresh_token': None},
            })

        tokens = signin_resp.json()

        return jsonify({
            'success': True,
            'auth': {
                'user_id': user_id,
                'access_token': tokens.get('access_token'),
                'refresh_token': tokens.get('refresh_token'),
            },
        })

    except http_requests.Timeout:
        return jsonify({'success': False, 'error': 'Request timed out. Please try again.'}), 504
    except Exception as e:
        print(f'Signup error: {e}')
        return jsonify({'success': False, 'error': 'An unexpected error occurred.'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
