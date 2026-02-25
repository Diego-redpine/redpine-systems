/**
 * Template registry — maps business descriptions to template families.
 *
 * Flow: description text → detectTemplateType() → { businessType, family } → getTemplate()
 */

import { getBeautyBodyTemplate, type TemplateResult } from './templates/beauty-body';
import { getHealthWellnessTemplate } from './templates/health-wellness';
import { getFoodBeverageTemplate } from './templates/food-beverage';
import { getHomeFieldServicesTemplate } from './templates/home-field-services';
import { getProfessionalServicesTemplate } from './templates/professional-services';
import { getCreativeEventsTemplate } from './templates/creative-events';
import { getEducationChildcareTemplate } from './templates/education-childcare';
import { getAutomotiveTemplate } from './templates/automotive';
import { getRetailTemplate } from './templates/retail';

// Maps freeform keywords found in descriptions to normalized business_type values
// Order matters: longer/more-specific aliases checked first via sorted matching
const BEAUTY_BODY_ALIASES: Record<string, string> = {
  // Nail
  'nail tech': 'nail_salon',
  'nail salon': 'nail_salon',
  'nail art': 'nail_salon',
  'gel nails': 'nail_salon',
  'acrylics': 'nail_salon',
  'manicure': 'nail_salon',
  'pedicure': 'nail_salon',
  'nails': 'nail_salon',
  'nail': 'nail_salon',
  // Barber
  'barber shop': 'barbershop',
  'barbershop': 'barbershop',
  'barber': 'barbershop',
  // Hair salon
  'hair salon': 'hair_salon',
  'hair stylist': 'hair_salon',
  'hairstylist': 'hair_salon',
  'hairdresser': 'hair_salon',
  // Lash / brow
  'lash tech': 'lash_brow',
  'brow tech': 'lash_brow',
  'lash and brow': 'lash_brow',
  'lash & brow': 'lash_brow',
  'lashes': 'lash_brow',
  'lash': 'lash_brow',
  'brows': 'lash_brow',
  'brow': 'lash_brow',
  'eyelash': 'lash_brow',
  // Makeup
  'makeup artist': 'makeup_artist',
  'make up artist': 'makeup_artist',
  'makeup': 'makeup_artist',
  'mua': 'makeup_artist',
  // Tattoo / piercing
  'tattoo artist': 'tattoo',
  'tattoo shop': 'tattoo',
  'tattoo studio': 'tattoo',
  'tattoo and piercing': 'tattoo',
  'tattoo & piercing': 'tattoo',
  'piercing': 'tattoo',
  'tattoo': 'tattoo',
  // Spa / massage
  'day spa': 'spa',
  'massage therapist': 'spa',
  'massage therapy': 'spa',
  'massage': 'spa',
  'spa': 'spa',
  // Med spa
  'med spa': 'med_spa',
  'medspa': 'med_spa',
  'medical spa': 'med_spa',
  'aesthetician': 'med_spa',
  'aesthetics': 'med_spa',
  // Pet grooming
  'pet grooming': 'pet_grooming',
  'pet groomer': 'pet_grooming',
  'dog grooming': 'pet_grooming',
  'dog groomer': 'pet_grooming',
  'cat grooming': 'pet_grooming',
  'groomer': 'pet_grooming',
  // Generic salon (least specific — checked last)
  'salon': 'salon',
};

const HEALTH_WELLNESS_ALIASES: Record<string, string> = {
  'yoga studio': 'yoga_studio', 'yoga class': 'yoga_studio', 'yoga': 'yoga_studio',
  'pilates studio': 'pilates_studio', 'pilates': 'pilates_studio',
  'fitness studio': 'fitness_studio', 'fitness center': 'fitness_studio', 'gym': 'gym',
  'personal trainer': 'personal_trainer', 'personal training': 'personal_trainer',
  'martial arts': 'martial_arts', 'karate': 'martial_arts', 'taekwondo': 'martial_arts', 'jiu jitsu': 'martial_arts',
  'dance studio': 'dance_studio', 'dance school': 'dance_studio', 'dance class': 'dance_studio',
  'chiropractor': 'chiropractor', 'chiropractic': 'chiropractor',
  'physical therapy': 'physical_therapy', 'physical therapist': 'physical_therapy', 'physiotherapy': 'physical_therapy',
  'acupuncture': 'acupuncture', 'acupuncturist': 'acupuncture',
  'nutritionist': 'nutritionist', 'dietitian': 'nutritionist', 'nutrition': 'nutritionist',
  'therapist': 'therapist', 'counselor': 'counselor', 'therapy practice': 'therapist', 'counseling': 'counselor',
  'dentist': 'dentist', 'dental': 'dentist', 'dental office': 'dentist',
  'optometrist': 'optometrist', 'eye doctor': 'optometrist', 'optometry': 'optometrist',
  'massage therapy': 'massage_therapy', 'massage therapist': 'massage_therapy',
  'wellness center': 'wellness_center', 'wellness': 'wellness',
};

const FOOD_BEVERAGE_ALIASES: Record<string, string> = {
  'restaurant': 'restaurant', 'cafe': 'cafe', 'coffee shop': 'coffee_shop', 'coffee': 'coffee_shop',
  'bakery': 'bakery', 'food truck': 'food_truck', 'catering': 'catering', 'catering company': 'catering',
  'bar': 'bar', 'brewery': 'brewery', 'juice bar': 'juice_bar', 'smoothie bar': 'juice_bar',
  'meal prep': 'meal_prep', 'pizza shop': 'pizza_shop', 'pizzeria': 'pizza_shop',
  'ice cream shop': 'ice_cream_shop', 'ice cream': 'ice_cream_shop',
  'deli': 'deli', 'bistro': 'bistro', 'diner': 'diner', 'pub': 'pub',
  'winery': 'winery', 'distillery': 'distillery',
};

const HOME_FIELD_SERVICES_ALIASES: Record<string, string> = {
  'plumber': 'plumber', 'plumbing': 'plumber',
  'electrician': 'electrician', 'electrical': 'electrician',
  'hvac': 'hvac', 'heating and cooling': 'hvac', 'air conditioning': 'hvac',
  'landscaping': 'landscaping', 'landscaper': 'landscaping', 'lawn care': 'lawn_care', 'lawn service': 'lawn_care',
  'cleaning service': 'cleaning_service', 'cleaning company': 'cleaning_service', 'maid service': 'cleaning_service', 'house cleaning': 'cleaning_service',
  'pest control': 'pest_control', 'exterminator': 'pest_control',
  'roofing': 'roofing', 'roofer': 'roofing',
  'painting': 'painting', 'painter': 'painting', 'house painter': 'painting',
  'handyman': 'handyman', 'handy man': 'handyman',
  'moving company': 'moving_company', 'movers': 'moving_company',
  'locksmith': 'locksmith',
  'pressure washing': 'pressure_washing', 'power washing': 'pressure_washing',
  'pool service': 'pool_service', 'pool cleaning': 'pool_service',
  'general contractor': 'general_contractor', 'contractor': 'contractor',
};

const PROFESSIONAL_SERVICES_ALIASES: Record<string, string> = {
  'law firm': 'law_firm', 'lawyer': 'lawyer', 'attorney': 'lawyer', 'legal': 'lawyer',
  'accountant': 'accountant', 'accounting firm': 'accountant', 'bookkeeper': 'bookkeeper', 'bookkeeping': 'bookkeeper',
  'tax preparer': 'tax_preparer', 'tax preparation': 'tax_preparer', 'cpa': 'accountant',
  'consultant': 'consultant', 'consulting': 'consultant',
  'life coach': 'coaching', 'business coach': 'coaching', 'coaching': 'coaching',
  'real estate agent': 'real_estate_agent', 'real estate': 'real_estate_agent', 'realtor': 'real_estate_agent',
  'insurance agent': 'insurance_agent', 'insurance': 'insurance_agent',
  'financial advisor': 'financial_advisor', 'financial planner': 'financial_advisor',
  'marketing agency': 'marketing_agency', 'digital marketing': 'marketing_agency',
  'web agency': 'web_agency', 'web design': 'web_agency',
  'architecture firm': 'architecture_firm', 'architect': 'architecture_firm',
  'notary': 'notary', 'notary public': 'notary',
  'translator': 'translator', 'translation': 'translator',
  'staffing agency': 'staffing_agency', 'staffing': 'staffing_agency', 'recruiting': 'staffing_agency',
};

const CREATIVE_EVENTS_ALIASES: Record<string, string> = {
  'wedding photographer': 'wedding_photographer', 'event photographer': 'event_photographer',
  'photographer': 'photographer', 'photography': 'photographer',
  'videographer': 'videographer', 'videography': 'videographer', 'film maker': 'film_maker',
  'wedding planner': 'wedding_planner', 'wedding': 'wedding_planner',
  'event planner': 'event_planner', 'event planning': 'event_planner',
  'dj': 'dj', 'disc jockey': 'dj', 'entertainer': 'entertainer',
  'florist': 'florist', 'flower shop': 'florist',
  'graphic designer': 'graphic_designer', 'graphic design': 'graphic_designer',
  'interior designer': 'interior_designer', 'interior design': 'interior_designer',
  'musician': 'musician', 'band': 'band',
  'art studio': 'art_studio', 'art class': 'art_studio',
  'print shop': 'print_shop', 'printing': 'print_shop',
  'content creator': 'content_creator',
};

const EDUCATION_CHILDCARE_ALIASES: Record<string, string> = {
  'tutoring': 'tutoring', 'tutor': 'tutoring', 'tutoring center': 'tutoring',
  'music school': 'music_school', 'music lessons': 'music_school', 'music teacher': 'music_school',
  'daycare': 'daycare', 'child care': 'daycare', 'childcare': 'daycare',
  'preschool': 'preschool', 'pre-school': 'preschool',
  'after school': 'after_school', 'after-school program': 'after_school',
  'driving school': 'driving_school', 'driving lessons': 'driving_school',
  'language school': 'language_school', 'language classes': 'language_school', 'esl': 'language_school',
  'swim school': 'swim_school', 'swim lessons': 'swim_school', 'swimming lessons': 'swim_school',
  'test prep': 'test_prep', 'sat prep': 'test_prep',
  'cooking class': 'cooking_class', 'cooking school': 'cooking_class',
  'coding bootcamp': 'coding_bootcamp', 'coding school': 'coding_bootcamp',
};

const AUTOMOTIVE_ALIASES: Record<string, string> = {
  'auto repair': 'auto_repair', 'auto mechanic': 'auto_repair', 'car repair': 'auto_repair', 'mechanic': 'mechanic',
  'body shop': 'body_shop', 'auto body': 'auto_body', 'collision repair': 'body_shop',
  'tire shop': 'tire_shop', 'tire service': 'tire_shop',
  'oil change': 'oil_change', 'lube shop': 'oil_change',
  'car wash': 'car_wash',
  'car dealership': 'car_dealership', 'auto dealer': 'car_dealership',
  'auto detailing': 'auto_detailing', 'car detailing': 'auto_detailing',
  'motorcycle shop': 'motorcycle_shop', 'motorcycle repair': 'motorcycle_shop',
  'towing': 'towing', 'tow truck': 'towing',
  'auto glass': 'auto_glass', 'windshield repair': 'auto_glass',
  'transmission shop': 'transmission_shop', 'transmission': 'transmission_shop',
  'muffler shop': 'muffler_shop', 'exhaust shop': 'muffler_shop',
};

const RETAIL_ALIASES: Record<string, string> = {
  'retail store': 'retail_store', 'boutique': 'boutique', 'clothing store': 'boutique',
  'jewelry store': 'jewelry_store', 'jeweler': 'jewelry_store',
  'thrift store': 'thrift_store', 'consignment': 'thrift_store',
  'gift shop': 'gift_shop',
  'pet store': 'pet_store', 'pet shop': 'pet_store',
  'smoke shop': 'smoke_shop', 'vape shop': 'vape_shop',
  'supplement store': 'supplement_store', 'vitamin shop': 'supplement_store',
  'phone repair': 'phone_repair', 'cell phone repair': 'phone_repair',
  'electronics store': 'electronics_store',
  'furniture store': 'furniture_store',
  'florist shop': 'florist_shop',
  'bookstore': 'bookstore', 'book shop': 'bookstore',
};

// Combine all alias records for unified lookup
const ALL_ALIASES: Record<string, { type: string; family: TemplateFamily }> = {};

function registerAliases(aliases: Record<string, string>, family: TemplateFamily) {
  for (const [alias, businessType] of Object.entries(aliases)) {
    ALL_ALIASES[alias] = { type: businessType, family };
  }
}

registerAliases(BEAUTY_BODY_ALIASES, 'beauty_body');
registerAliases(HEALTH_WELLNESS_ALIASES, 'health_wellness');
registerAliases(FOOD_BEVERAGE_ALIASES, 'food_beverage');
registerAliases(HOME_FIELD_SERVICES_ALIASES, 'home_field_services');
registerAliases(PROFESSIONAL_SERVICES_ALIASES, 'professional_services');
registerAliases(CREATIVE_EVENTS_ALIASES, 'creative_events');
registerAliases(EDUCATION_CHILDCARE_ALIASES, 'education_childcare');
registerAliases(AUTOMOTIVE_ALIASES, 'automotive');
registerAliases(RETAIL_ALIASES, 'retail');

// Sort aliases longest-first so "nail salon" matches before "nail"
const SORTED_ALIASES = Object.keys(ALL_ALIASES).sort(
  (a, b) => b.length - a.length
);

export type TemplateFamily =
  | 'beauty_body'
  | 'health_wellness'
  | 'food_beverage'
  | 'home_field_services'
  | 'professional_services'
  | 'creative_events'
  | 'education_childcare'
  | 'automotive'
  | 'retail';

export interface DetectionResult {
  businessType: string;
  family: TemplateFamily;
}

/**
 * Check if a business description matches a known template.
 * Returns { businessType, family } if matched, or null if no match.
 */
export function detectTemplateType(description: string): DetectionResult | null {
  const descLower = description.toLowerCase();
  for (const alias of SORTED_ALIASES) {
    if (descLower.includes(alias)) {
      const match = ALL_ALIASES[alias];
      return {
        businessType: match.type,
        family: match.family,
      };
    }
  }
  return null;
}

/**
 * Load a template config for the given businessType and family.
 * Returns { template, lockedIds } or null if no template exists.
 */
export function getTemplate(
  businessType: string,
  family: TemplateFamily
): TemplateResult | null {
  switch (family) {
    case 'beauty_body': return getBeautyBodyTemplate(businessType);
    case 'health_wellness': return getHealthWellnessTemplate(businessType);
    case 'food_beverage': return getFoodBeverageTemplate(businessType);
    case 'home_field_services': return getHomeFieldServicesTemplate(businessType);
    case 'professional_services': return getProfessionalServicesTemplate(businessType);
    case 'creative_events': return getCreativeEventsTemplate(businessType);
    case 'education_childcare': return getEducationChildcareTemplate(businessType);
    case 'automotive': return getAutomotiveTemplate(businessType);
    case 'retail': return getRetailTemplate(businessType);
    default: return null;
  }
}
