/**
 * Form Template Library — Google Forms-style templates for small businesses
 *
 * Ready-to-use form definitions organized by industry. Each template includes
 * realistic field definitions with proper types, placeholders, and options.
 *
 * Used by the "Docs" tab (Smart Files) and the form builder.
 */

// ============================================================
// Types
// ============================================================

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'signature'
  | 'number'
  | 'radio';

export type DocType =
  | 'intake'
  | 'waiver'
  | 'contract'
  | 'survey'
  | 'invoice'
  | 'consent'
  | 'checklist';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  docType: DocType;
  fields: FormField[];
}

// ============================================================
// Doc Type Colors
// ============================================================

export const DOC_TYPE_COLORS: Record<DocType, { bg: string; text: string; label: string }> = {
  intake:    { bg: '#f3f4f6', text: '#374151', label: 'Intake' },
  waiver:    { bg: '#fef3c7', text: '#92400e', label: 'Waiver' },
  contract:  { bg: '#dbeafe', text: '#1e40af', label: 'Contract' },
  survey:    { bg: '#dcfce7', text: '#166534', label: 'Survey' },
  invoice:   { bg: '#fee2e2', text: '#991b1b', label: 'Invoice' },
  consent:   { bg: '#f3e8ff', text: '#7c3aed', label: 'Consent' },
  checklist: { bg: '#ccfbf1', text: '#115e59', label: 'Checklist' },
};

// ============================================================
// Templates — Beauty & Wellness
// ============================================================

const beautyWellnessTemplates: FormTemplate[] = [
  {
    id: 'beauty-new-client-intake',
    name: 'New Client Intake',
    description: 'Collect essential info from first-time salon, spa, or beauty clients.',
    category: 'Beauty & Wellness',
    icon: '\u{1F485}',
    docType: 'intake',
    fields: [
      { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
      { id: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'jane@example.com' },
      { id: 'phone', label: 'Phone Number', type: 'phone', required: true, placeholder: '(555) 123-4567' },
      { id: 'birthday', label: 'Date of Birth', type: 'date', required: false },
      { id: 'referred_by', label: 'How Were You Referred?', type: 'select', required: false, options: ['Friend or Family', 'Instagram', 'Google Search', 'Facebook', 'TikTok', 'Yelp', 'Walk-in', 'Other'] },
      { id: 'allergies', label: 'Do you have any known allergies or skin sensitivities?', type: 'textarea', required: true, placeholder: 'List any allergies to products, latex, adhesives, fragrances, etc.' },
      { id: 'nail_shape_preference', label: 'Preferred Nail Shape', type: 'select', required: false, options: ['Round', 'Square', 'Squoval', 'Oval', 'Almond', 'Coffin/Ballerina', 'Stiletto', 'No Preference'] },
      { id: 'current_products', label: 'Products You Currently Use', type: 'textarea', required: false, placeholder: 'Moisturizers, treatments, brands, etc.' },
      { id: 'medical_conditions', label: 'Any medical conditions we should know about?', type: 'textarea', required: false, placeholder: 'Diabetes, pregnancy, blood thinners, etc.' },
    ],
  },
  {
    id: 'beauty-lash-brow-consent',
    name: 'Lash & Brow Consent',
    description: 'Consent and allergy screening for lash extensions, lifts, and brow services.',
    category: 'Beauty & Wellness',
    icon: '\u{1F441}\uFE0F',
    docType: 'consent',
    fields: [
      { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
      { id: 'date', label: 'Date', type: 'date', required: true },
      { id: 'service_type', label: 'Service Being Performed', type: 'select', required: true, options: ['Lash Extensions — Classic', 'Lash Extensions — Volume', 'Lash Extensions — Hybrid', 'Lash Lift & Tint', 'Brow Lamination', 'Brow Tint', 'Brow Wax & Tint'] },
      { id: 'eye_conditions', label: 'Do you have any eye conditions?', type: 'checkbox', required: false, options: ['Dry eyes', 'Watery eyes', 'Blepharitis', 'Stye history', 'Eye surgery (past 6 months)', 'Contact lenses', 'None'] },
      { id: 'allergies', label: 'Known allergies to adhesives, dyes, or latex?', type: 'textarea', required: true, placeholder: 'Describe any known reactions or type "None"' },
      { id: 'patch_test', label: 'Have you had a patch test in the last 12 months?', type: 'radio', required: true, options: ['Yes', 'No', 'First time client'] },
      { id: 'pregnant_nursing', label: 'Are you currently pregnant or nursing?', type: 'radio', required: true, options: ['Yes', 'No'] },
      { id: 'consent_acknowledgement', label: 'I understand the risks involved and consent to the above service', type: 'checkbox', required: true, options: ['I agree'] },
      { id: 'signature', label: 'Signature', type: 'signature', required: true },
    ],
  },
  {
    id: 'beauty-allergy-screening',
    name: 'Allergy Screening Form',
    description: 'Pre-service allergy and sensitivity screening for chemical treatments.',
    category: 'Beauty & Wellness',
    icon: '\u{1F9EA}',
    docType: 'intake',
    fields: [
      { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
      { id: 'date', label: 'Date', type: 'date', required: true },
      { id: 'service_requested', label: 'Service Requested', type: 'text', required: true, placeholder: 'e.g., Hair color, keratin treatment, chemical peel' },
      { id: 'known_allergies', label: 'List all known allergies', type: 'textarea', required: true, placeholder: 'Include food, drug, environmental, and product allergies' },
      { id: 'previous_reactions', label: 'Have you had a reaction to any beauty product or treatment before?', type: 'radio', required: true, options: ['Yes', 'No', 'Unsure'] },
      { id: 'reaction_details', label: 'If yes, please describe the reaction', type: 'textarea', required: false, placeholder: 'What product/treatment and what happened?' },
      { id: 'medications', label: 'Current medications (including topical)', type: 'textarea', required: false, placeholder: 'Accutane, Retin-A, antibiotics, blood thinners, etc.' },
      { id: 'skin_conditions', label: 'Any active skin conditions?', type: 'checkbox', required: false, options: ['Eczema', 'Psoriasis', 'Rosacea', 'Acne', 'Dermatitis', 'Open wounds/cuts', 'Sunburn', 'None'] },
      { id: 'patch_test_consent', label: 'I agree to a patch test if recommended by the technician', type: 'checkbox', required: true, options: ['I agree'] },
      { id: 'signature', label: 'Signature', type: 'signature', required: true },
    ],
  },
];

// ============================================================
// Templates — Fitness
// ============================================================

const fitnessTemplates: FormTemplate[] = [
  {
    id: 'fitness-waiver',
    name: 'Fitness Liability Waiver',
    description: 'Standard liability waiver for gyms, studios, and personal training.',
    category: 'Fitness',
    icon: '\u{1F3CB}\uFE0F',
    docType: 'waiver',
    fields: [
      { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Smith' },
      { id: 'date', label: 'Date', type: 'date', required: true },
      { id: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
      { id: 'phone', label: 'Phone Number', type: 'phone', required: true, placeholder: '(555) 123-4567' },
      { id: 'emergency_contact_name', label: 'Emergency Contact Name', type: 'text', required: true, placeholder: 'Full name of emergency contact' },
      { id: 'emergency_contact_phone', label: 'Emergency Contact Phone', type: 'phone', required: true, placeholder: '(555) 987-6543' },
      { id: 'medical_clearance', label: 'Has a physician cleared you for physical exercise?', type: 'radio', required: true, options: ['Yes', 'No', 'Not applicable'] },
      { id: 'conditions', label: 'Do you have any of the following conditions?', type: 'checkbox', required: false, options: ['Heart disease', 'High blood pressure', 'Asthma', 'Diabetes', 'Joint/bone issues', 'Recent surgery', 'Pregnancy', 'None of the above'] },
      { id: 'waiver_acknowledgement', label: 'I voluntarily assume all risks of injury associated with participation in fitness activities at this facility', type: 'checkbox', required: true, options: ['I understand and agree'] },
      { id: 'signature', label: 'Signature', type: 'signature', required: true },
    ],
  },
  {
    id: 'fitness-health-questionnaire',
    name: 'Health & Fitness Questionnaire',
    description: 'Pre-assessment questionnaire to tailor training programs and identify limitations.',
    category: 'Fitness',
    icon: '\u{1F4CB}',
    docType: 'intake',
    fields: [
      { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Smith' },
      { id: 'age', label: 'Age', type: 'number', required: true, placeholder: '30' },
      { id: 'height', label: 'Height', type: 'text', required: true, placeholder: '5\'10" or 178 cm' },
      { id: 'weight', label: 'Current Weight', type: 'text', required: true, placeholder: '170 lbs or 77 kg' },
      { id: 'fitness_goals', label: 'What are your primary fitness goals?', type: 'checkbox', required: true, options: ['Weight loss', 'Muscle gain', 'Improve endurance', 'Increase flexibility', 'Sports performance', 'General health', 'Injury recovery', 'Stress relief'] },
      { id: 'activity_level', label: 'Current Activity Level', type: 'radio', required: true, options: ['Sedentary (little to no exercise)', 'Light (1-2 days/week)', 'Moderate (3-4 days/week)', 'Active (5-6 days/week)', 'Very Active (daily, intense)'] },
      { id: 'exercise_history', label: 'Describe your exercise history', type: 'textarea', required: false, placeholder: 'Types of exercise, how long, how often, any past training programs...' },
      { id: 'injuries_limitations', label: 'Any current injuries or physical limitations?', type: 'textarea', required: false, placeholder: 'Bad knee, lower back pain, shoulder impingement, etc.' },
      { id: 'preferred_training_time', label: 'Preferred Training Time', type: 'select', required: false, options: ['Early morning (5-7 AM)', 'Morning (7-10 AM)', 'Midday (10 AM-1 PM)', 'Afternoon (1-4 PM)', 'Evening (4-7 PM)', 'Late evening (7-9 PM)', 'Flexible'] },
    ],
  },
  {
    id: 'fitness-membership-agreement',
    name: 'Membership Agreement',
    description: 'Gym or studio membership contract with terms, billing, and cancellation policy.',
    category: 'Fitness',
    icon: '\u{1F4DD}',
    docType: 'contract',
    fields: [
      { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Smith' },
      { id: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
      { id: 'phone', label: 'Phone Number', type: 'phone', required: true, placeholder: '(555) 123-4567' },
      { id: 'address', label: 'Mailing Address', type: 'textarea', required: true, placeholder: '123 Main St, City, State ZIP' },
      { id: 'membership_type', label: 'Membership Plan', type: 'select', required: true, options: ['Monthly — Basic', 'Monthly — Premium', 'Monthly — Unlimited', 'Annual — Basic', 'Annual — Premium', 'Annual — Unlimited', 'Class Pack (10 classes)', 'Class Pack (20 classes)', 'Drop-in'] },
      { id: 'start_date', label: 'Membership Start Date', type: 'date', required: true },
      { id: 'billing_day', label: 'Preferred Billing Day of Month', type: 'number', required: false, placeholder: '1' },
      { id: 'terms_agreement', label: 'I have read and agree to the membership terms, cancellation policy, and facility rules', type: 'checkbox', required: true, options: ['I agree'] },
      { id: 'auto_renew', label: 'I authorize automatic renewal at the end of my term', type: 'checkbox', required: true, options: ['I authorize auto-renewal'] },
      { id: 'signature', label: 'Signature', type: 'signature', required: true },
    ],
  },
];

// ============================================================
// Templates — Medical / Dental
// ============================================================

const medicalDentalTemplates: FormTemplate[] = [
  {
    id: 'medical-history-form',
    name: 'Medical History Form',
    description: 'Comprehensive medical history intake for healthcare and dental practices.',
    category: 'Medical / Dental',
    icon: '\u{1FA7A}',
    docType: 'intake',
    fields: [
      { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Patient full name' },
      { id: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
      { id: 'phone', label: 'Phone Number', type: 'phone', required: true, placeholder: '(555) 123-4567' },
      { id: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'patient@example.com' },
      { id: 'current_medications', label: 'List all current medications and dosages', type: 'textarea', required: true, placeholder: 'Include prescriptions, over-the-counter drugs, and supplements' },
      { id: 'allergies', label: 'Known drug or material allergies', type: 'textarea', required: true, placeholder: 'Penicillin, latex, iodine, etc. or "None known"' },
      { id: 'medical_conditions', label: 'Check all that apply', type: 'checkbox', required: false, options: ['Heart disease', 'High blood pressure', 'Diabetes', 'Asthma', 'Thyroid disorder', 'Epilepsy/seizures', 'Bleeding disorder', 'Hepatitis', 'HIV/AIDS', 'Cancer', 'Kidney disease', 'Liver disease', 'Arthritis', 'Mental health condition', 'None of the above'] },
      { id: 'surgical_history', label: 'Previous surgeries or hospitalizations', type: 'textarea', required: false, placeholder: 'Type, date, and any complications' },
      { id: 'primary_physician', label: 'Primary Care Physician', type: 'text', required: false, placeholder: 'Dr. Name, Practice Name' },
      { id: 'insurance_provider', label: 'Insurance Provider', type: 'text', required: false, placeholder: 'Company name and member ID' },
    ],
  },
  {
    id: 'medical-hipaa-consent',
    name: 'HIPAA Consent Form',
    description: 'Patient consent for use and disclosure of protected health information.',
    category: 'Medical / Dental',
    icon: '\u{1F512}',
    docType: 'consent',
    fields: [
      { id: 'patient_name', label: 'Patient Name', type: 'text', required: true, placeholder: 'Full legal name' },
      { id: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
      { id: 'date', label: 'Date', type: 'date', required: true },
      { id: 'authorized_persons', label: 'Persons authorized to receive your health information', type: 'textarea', required: false, placeholder: 'Name(s) and relationship (e.g., "Maria Doe — Spouse")' },
      { id: 'communication_preference', label: 'Preferred method of communication for appointments and results', type: 'select', required: true, options: ['Phone call', 'Text message', 'Email', 'Patient portal only', 'Mail'] },
      { id: 'voicemail_consent', label: 'May we leave detailed messages on your voicemail?', type: 'radio', required: true, options: ['Yes', 'No — callback number only'] },
      { id: 'hipaa_acknowledgement', label: 'I acknowledge that I have received and reviewed the Notice of Privacy Practices', type: 'checkbox', required: true, options: ['I acknowledge'] },
      { id: 'consent_to_treatment', label: 'I consent to the use and disclosure of my health information for treatment, payment, and healthcare operations', type: 'checkbox', required: true, options: ['I consent'] },
      { id: 'signature', label: 'Patient Signature', type: 'signature', required: true },
    ],
  },
  {
    id: 'medical-patient-intake',
    name: 'Patient Intake Form',
    description: 'New patient registration form with demographics, insurance, and visit reason.',
    category: 'Medical / Dental',
    icon: '\u{1F3E5}',
    docType: 'intake',
    fields: [
      { id: 'full_name', label: 'Full Legal Name', type: 'text', required: true, placeholder: 'First Middle Last' },
      { id: 'preferred_name', label: 'Preferred Name', type: 'text', required: false, placeholder: 'What should we call you?' },
      { id: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
      { id: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'patient@example.com' },
      { id: 'phone', label: 'Phone Number', type: 'phone', required: true, placeholder: '(555) 123-4567' },
      { id: 'address', label: 'Home Address', type: 'textarea', required: true, placeholder: 'Street, City, State, ZIP' },
      { id: 'emergency_contact', label: 'Emergency Contact Name & Phone', type: 'text', required: true, placeholder: 'Name — (555) 987-6543' },
      { id: 'insurance_provider', label: 'Insurance Provider', type: 'text', required: false, placeholder: 'Company name' },
      { id: 'insurance_id', label: 'Insurance Member ID', type: 'text', required: false, placeholder: 'Member/Policy number' },
      { id: 'reason_for_visit', label: 'Reason for Today\'s Visit', type: 'textarea', required: true, placeholder: 'Describe your symptoms, concerns, or the reason for your appointment' },
    ],
  },
];

// ============================================================
// Templates — Home Services
// ============================================================

const homeServicesTemplates: FormTemplate[] = [
  {
    id: 'home-property-access',
    name: 'Property Access Form',
    description: 'Collect property access details for home service visits when the owner may not be present.',
    category: 'Home Services',
    icon: '\u{1F3E0}',
    docType: 'intake',
    fields: [
      { id: 'client_name', label: 'Client Name', type: 'text', required: true, placeholder: 'Homeowner full name' },
      { id: 'phone', label: 'Phone Number', type: 'phone', required: true, placeholder: '(555) 123-4567' },
      { id: 'service_address', label: 'Service Address', type: 'textarea', required: true, placeholder: 'Full street address including unit/apt number' },
      { id: 'access_method', label: 'How should we access the property?', type: 'select', required: true, options: ['Owner will be home', 'Lockbox — code provided', 'Hidden key — location provided', 'Garage code', 'Doorman/Concierge', 'Property manager on-site', 'Other — see notes'] },
      { id: 'access_details', label: 'Access Code or Instructions', type: 'textarea', required: false, placeholder: 'Lockbox code, key location, gate code, buzzer number, etc.' },
      { id: 'alarm_code', label: 'Alarm System Code (if applicable)', type: 'text', required: false, placeholder: 'Enter code or "No alarm"' },
      { id: 'pets', label: 'Are there pets on the property?', type: 'radio', required: true, options: ['No pets', 'Yes — friendly, free roaming', 'Yes — will be secured', 'Yes — please be cautious'] },
      { id: 'pet_details', label: 'Pet Details', type: 'text', required: false, placeholder: 'Type, name, and any instructions' },
      { id: 'special_notes', label: 'Special Instructions', type: 'textarea', required: false, placeholder: 'Parking, which door to use, areas to avoid, etc.' },
    ],
  },
  {
    id: 'home-service-agreement',
    name: 'Service Agreement',
    description: 'Scope of work agreement for contractors, cleaners, landscapers, and tradespeople.',
    category: 'Home Services',
    icon: '\u{1F4CB}',
    docType: 'contract',
    fields: [
      { id: 'client_name', label: 'Client Name', type: 'text', required: true, placeholder: 'Full name' },
      { id: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'client@example.com' },
      { id: 'phone', label: 'Phone Number', type: 'phone', required: true, placeholder: '(555) 123-4567' },
      { id: 'service_address', label: 'Service Address', type: 'textarea', required: true, placeholder: 'Full address of the property' },
      { id: 'service_description', label: 'Description of Services', type: 'textarea', required: true, placeholder: 'Detailed description of work to be performed' },
      { id: 'estimated_cost', label: 'Estimated Cost', type: 'text', required: true, placeholder: '$0.00' },
      { id: 'payment_terms', label: 'Payment Terms', type: 'select', required: true, options: ['Due on completion', '50% deposit, 50% on completion', 'Net 15', 'Net 30', 'Payment plan — see notes', 'Prepaid in full'] },
      { id: 'estimated_timeline', label: 'Estimated Completion Timeline', type: 'text', required: true, placeholder: 'e.g., 2-3 business days, 1 week, same day' },
      { id: 'terms_agreement', label: 'I agree to the scope of work, pricing, and terms described above', type: 'checkbox', required: true, options: ['I agree'] },
      { id: 'signature', label: 'Client Signature', type: 'signature', required: true },
    ],
  },
  {
    id: 'home-job-completion-checklist',
    name: 'Job Completion Checklist',
    description: 'Post-job sign-off checklist for verifying work quality and client satisfaction.',
    category: 'Home Services',
    icon: '\u{2705}',
    docType: 'checklist',
    fields: [
      { id: 'client_name', label: 'Client Name', type: 'text', required: true, placeholder: 'Homeowner name' },
      { id: 'technician_name', label: 'Technician / Crew Lead', type: 'text', required: true, placeholder: 'Name of person who performed the work' },
      { id: 'job_date', label: 'Date of Service', type: 'date', required: true },
      { id: 'service_address', label: 'Service Address', type: 'text', required: true, placeholder: 'Property address' },
      { id: 'work_completed', label: 'Work Completed', type: 'checkbox', required: true, options: ['All listed tasks performed', 'Work area cleaned up', 'Materials/debris removed', 'Client walkthrough completed', 'All fixtures/appliances tested', 'Photos taken of completed work'] },
      { id: 'issues_found', label: 'Issues or Additional Work Needed', type: 'textarea', required: false, placeholder: 'Note anything discovered during the job that needs follow-up' },
      { id: 'client_satisfaction', label: 'Client Satisfaction Rating', type: 'radio', required: true, options: ['Very satisfied', 'Satisfied', 'Neutral', 'Unsatisfied', 'Very unsatisfied'] },
      { id: 'client_notes', label: 'Client Comments', type: 'textarea', required: false, placeholder: 'Any feedback from the client' },
      { id: 'client_signature', label: 'Client Signature', type: 'signature', required: true },
      { id: 'technician_signature', label: 'Technician Signature', type: 'signature', required: true },
    ],
  },
];

// ============================================================
// Templates — General Business
// ============================================================

const generalBusinessTemplates: FormTemplate[] = [
  {
    id: 'general-satisfaction-survey',
    name: 'Client Satisfaction Survey',
    description: 'Post-service survey to measure client satisfaction and identify improvement areas.',
    category: 'General Business',
    icon: '\u{2B50}',
    docType: 'survey',
    fields: [
      { id: 'client_name', label: 'Your Name (optional)', type: 'text', required: false, placeholder: 'Your name' },
      { id: 'service_date', label: 'Date of Service', type: 'date', required: false },
      { id: 'service_received', label: 'What service did you receive?', type: 'text', required: true, placeholder: 'e.g., Haircut, Deep clean, Consultation' },
      { id: 'overall_rating', label: 'Overall Experience', type: 'radio', required: true, options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'] },
      { id: 'staff_rating', label: 'How was the staff?', type: 'radio', required: true, options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'] },
      { id: 'value_rating', label: 'How would you rate the value for the price?', type: 'radio', required: true, options: ['Excellent value', 'Good value', 'Fair', 'Somewhat overpriced', 'Overpriced'] },
      { id: 'what_we_did_well', label: 'What did we do well?', type: 'textarea', required: false, placeholder: 'Tell us what you liked most...' },
      { id: 'what_to_improve', label: 'What could we improve?', type: 'textarea', required: false, placeholder: 'Your honest feedback helps us grow...' },
      { id: 'would_recommend', label: 'Would you recommend us to a friend?', type: 'radio', required: true, options: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not'] },
      { id: 'additional_comments', label: 'Anything else you\'d like to share?', type: 'textarea', required: false, placeholder: 'Open comments...' },
    ],
  },
  {
    id: 'general-feedback-form',
    name: 'Quick Feedback Form',
    description: 'Short, easy feedback form for gathering quick impressions after any service.',
    category: 'General Business',
    icon: '\u{1F4AC}',
    docType: 'survey',
    fields: [
      { id: 'name', label: 'Name (optional)', type: 'text', required: false, placeholder: 'Your name' },
      { id: 'email', label: 'Email (optional)', type: 'email', required: false, placeholder: 'your@email.com' },
      { id: 'visit_date', label: 'Date of Visit', type: 'date', required: false },
      { id: 'experience_rating', label: 'How was your experience?', type: 'radio', required: true, options: ['Amazing', 'Great', 'OK', 'Could be better', 'Not good'] },
      { id: 'feedback', label: 'Tell us more', type: 'textarea', required: false, placeholder: 'What went well? What could be better?' },
      { id: 'follow_up', label: 'Would you like us to follow up with you?', type: 'radio', required: false, options: ['Yes, please reach out', 'No, just sharing feedback'] },
    ],
  },
  {
    id: 'general-photo-video-release',
    name: 'Photo / Video Release',
    description: 'Client consent to use photos or videos for marketing, social media, and portfolio.',
    category: 'General Business',
    icon: '\u{1F4F8}',
    docType: 'consent',
    fields: [
      { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Full legal name' },
      { id: 'date', label: 'Date', type: 'date', required: true },
      { id: 'email', label: 'Email Address', type: 'email', required: false, placeholder: 'your@email.com' },
      { id: 'usage_consent', label: 'I grant permission to use my photo/video for', type: 'checkbox', required: true, options: ['Social media (Instagram, Facebook, TikTok)', 'Website and portfolio', 'Printed marketing materials', 'Online advertising', 'Before & after showcases', 'All of the above'] },
      { id: 'name_usage', label: 'May we use your first name alongside the photo/video?', type: 'radio', required: true, options: ['Yes', 'First name and last initial only', 'No — keep anonymous'] },
      { id: 'duration', label: 'This release is valid for', type: 'radio', required: true, options: ['Indefinitely', '1 year', '6 months', 'One-time use only'] },
      { id: 'revocation_understanding', label: 'I understand I may revoke this consent in writing at any time, but revocation will not apply to materials already published', type: 'checkbox', required: true, options: ['I understand'] },
      { id: 'signature', label: 'Signature', type: 'signature', required: true },
    ],
  },
  {
    id: 'general-new-client-registration',
    name: 'New Client Registration',
    description: 'Universal new client form suitable for any service-based business.',
    category: 'General Business',
    icon: '\u{1F464}',
    docType: 'intake',
    fields: [
      { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'First and last name' },
      { id: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'client@example.com' },
      { id: 'phone', label: 'Phone Number', type: 'phone', required: true, placeholder: '(555) 123-4567' },
      { id: 'address', label: 'Address', type: 'textarea', required: false, placeholder: 'Street, City, State, ZIP' },
      { id: 'date_of_birth', label: 'Date of Birth', type: 'date', required: false },
      { id: 'how_did_you_hear', label: 'How did you hear about us?', type: 'select', required: false, options: ['Google Search', 'Instagram', 'Facebook', 'TikTok', 'Yelp', 'Friend/Family referral', 'Walk-by/Drive-by', 'Existing client referral', 'Other'] },
      { id: 'services_interested', label: 'What services are you interested in?', type: 'textarea', required: false, placeholder: 'List the services you\'re looking for' },
      { id: 'preferred_contact', label: 'Preferred Contact Method', type: 'radio', required: false, options: ['Phone call', 'Text message', 'Email'] },
      { id: 'notes', label: 'Anything else we should know?', type: 'textarea', required: false, placeholder: 'Special requests, scheduling preferences, etc.' },
    ],
  },
  {
    id: 'general-cancellation-policy',
    name: 'Cancellation Policy Acknowledgement',
    description: 'Have clients acknowledge your cancellation and no-show policy before booking.',
    category: 'General Business',
    icon: '\u{1F6AB}',
    docType: 'consent',
    fields: [
      { id: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Full legal name' },
      { id: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'client@example.com' },
      { id: 'phone', label: 'Phone Number', type: 'phone', required: true, placeholder: '(555) 123-4567' },
      { id: 'date', label: 'Date', type: 'date', required: true },
      { id: 'cancel_notice', label: 'I understand that cancellations must be made at least 24 hours before the scheduled appointment', type: 'checkbox', required: true, options: ['I understand'] },
      { id: 'late_cancel_fee', label: 'I understand that late cancellations (less than 24 hours) may result in a cancellation fee', type: 'checkbox', required: true, options: ['I understand'] },
      { id: 'no_show_fee', label: 'I understand that no-shows may be charged the full service amount', type: 'checkbox', required: true, options: ['I understand'] },
      { id: 'card_on_file', label: 'I authorize my card on file to be charged for applicable cancellation or no-show fees', type: 'checkbox', required: true, options: ['I authorize'] },
      { id: 'signature', label: 'Signature', type: 'signature', required: true },
    ],
  },
  {
    id: 'general-referral-form',
    name: 'Referral Submission',
    description: 'Let clients refer friends and track who sent them for referral rewards.',
    category: 'General Business',
    icon: '\u{1F91D}',
    docType: 'intake',
    fields: [
      { id: 'referrer_name', label: 'Your Name (the referrer)', type: 'text', required: true, placeholder: 'Your full name' },
      { id: 'referrer_email', label: 'Your Email', type: 'email', required: true, placeholder: 'your@email.com' },
      { id: 'referrer_phone', label: 'Your Phone', type: 'phone', required: false, placeholder: '(555) 123-4567' },
      { id: 'friend_name', label: 'Friend\'s Name', type: 'text', required: true, placeholder: 'Who are you referring?' },
      { id: 'friend_email', label: 'Friend\'s Email', type: 'email', required: false, placeholder: 'friend@email.com' },
      { id: 'friend_phone', label: 'Friend\'s Phone', type: 'phone', required: true, placeholder: '(555) 987-6543' },
      { id: 'services_recommended', label: 'What service(s) would you recommend for them?', type: 'textarea', required: false, placeholder: 'Help us give them the right experience' },
      { id: 'relationship', label: 'How do you know this person?', type: 'select', required: false, options: ['Friend', 'Family member', 'Coworker', 'Neighbor', 'Other'] },
    ],
  },
];

// ============================================================
// Combined Template Array
// ============================================================

export const FORM_TEMPLATES: FormTemplate[] = [
  ...beautyWellnessTemplates,
  ...fitnessTemplates,
  ...medicalDentalTemplates,
  ...homeServicesTemplates,
  ...generalBusinessTemplates,
];

// ============================================================
// Helpers
// ============================================================

/** Returns templates grouped by category */
export function getTemplatesByCategory(): Record<string, FormTemplate[]> {
  const grouped: Record<string, FormTemplate[]> = {};
  for (const template of FORM_TEMPLATES) {
    if (!grouped[template.category]) {
      grouped[template.category] = [];
    }
    grouped[template.category].push(template);
  }
  return grouped;
}

/** Finds a single template by ID, returns undefined if not found */
export function getTemplateById(id: string): FormTemplate | undefined {
  return FORM_TEMPLATES.find((t) => t.id === id);
}
