// Data entity types for F4 CRUD API

export type RecurrenceFrequency = 'none' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurrenceFields {
  recurrence?: RecurrenceFrequency;
  recurrence_end_date?: string;
  recurring_template_id?: string;
  is_recurring_template?: boolean;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment extends RecurrenceFields {
  id: string;
  user_id: string;
  client_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: string;
  location?: string;
  all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice extends RecurrenceFields {
  id: string;
  user_id: string;
  client_id?: string;
  invoice_number?: string;
  amount_cents: number;
  status: string;
  due_date?: string;
  paid_at?: string;
  line_items?: Array<{
    description: string;
    quantity: number;
    unit_price_cents: number;
  }>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  price_cents?: number;
  sku?: string;
  quantity: number;
  category?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assigned_to?: string;
  tags?: string[];
  stage_id?: string; // F1-B: Pipeline stage for pipeline view
  created_at: string;
  updated_at: string;
}

export type StaffModel = 'independent' | 'employee' | 'instructor';
export type PayType = 'commission' | 'booth_rental' | 'hourly' | 'salary' | 'per_class';

export interface StaffAvailability {
  [day: string]: { enabled: boolean; start: string; end: string };
}

export interface Staff {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  hourly_rate_cents?: number;
  is_active: boolean;
  notes?: string;
  staff_model?: StaffModel;
  pay_type?: PayType;
  pay_rate_cents?: number;
  commission_percent?: number;
  availability?: StaffAvailability;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  stage_id?: string; // F1-B: Pipeline stage for pipeline view
  value_cents?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  client_id?: string;
  subject?: string;
  content: string;
  type: 'note' | 'email' | 'sms' | 'internal';
  is_read: boolean;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  file_type?: string;
  file_size_bytes?: number;
  folder: string;
  created_at: string;
  updated_at: string;
}

// Reviews
export interface Review {
  id: string;
  user_id: string;
  customer: string;
  email?: string;
  rating: number;
  comment?: string;
  source: 'direct' | 'google' | 'yelp' | 'facebook' | 'email_request';
  status: 'new' | 'published' | 'hidden' | 'replied';
  response?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

// Form builder types
export type FormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'radio' | 'file' | 'signature' | 'heading' | 'paragraph';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For dropdown, radio, checkbox
  description?: string;
}

export type FormType = 'intake' | 'survey' | 'contact' | 'lead_capture' | 'medical' | 'feedback' | 'booking' | 'custom';

export interface Form {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: FormType;
  fields: FormField[];
  status: 'active' | 'draft' | 'archived';
  submissions: number;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  user_id: string;
  data: Record<string, unknown>;
  submitted_by_name?: string;
  submitted_by_email?: string;
  created_at: string;
}

// Waivers
export interface Waiver {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  template_content?: string;
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'declined';
  client?: string;
  client_email?: string;
  date_signed?: string;
  expiry?: string;
  signature_data?: string;
  signature_image_url?: string;
  stage_id?: string;
  created_at: string;
  updated_at: string;
}

// Signatures
export interface Signature {
  id: string;
  user_id: string;
  document: string;
  document_id?: string;
  signer: string;
  signer_email?: string;
  status: 'pending' | 'completed' | 'declined' | 'expired';
  signature_data?: string;
  signature_image_url?: string;
  signed_at?: string;
  method: 'digital' | 'in_person' | 'email';
  ip_address?: string;
  created_at: string;
  updated_at: string;
}

// Automations / Workflows
export type TriggerType = 'manual' | 'record_created' | 'record_updated' | 'record_deleted' | 'field_changed' | 'status_changed' | 'schedule' | 'form_submitted';
export type ActionType = 'send_email' | 'send_sms' | 'create_record' | 'update_record' | 'create_task' | 'send_notification' | 'webhook' | 'wait';

export interface WorkflowAction {
  id: string;
  type: ActionType;
  label: string;
  config: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  trigger_config: Record<string, unknown>;
  actions: WorkflowAction[];
  status: 'active' | 'paused' | 'draft';
  enabled: boolean;
  last_run?: string;
  run_count: number;
  stage_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  user_id: string;
  trigger_event?: string;
  trigger_data?: Record<string, unknown>;
  status: 'running' | 'completed' | 'failed';
  actions_completed: number;
  actions_total: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface MembershipPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  price_cents: number;
  interval: 'monthly' | 'yearly' | 'one_time';
  features?: string[];
  status: 'active' | 'archived';
  max_members?: number;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface MembershipMember {
  id: string;
  user_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  plan_id?: string;
  plan_name?: string;
  status: 'prospect' | 'trial' | 'active' | 'past_due' | 'cancelled';
  start_date?: string;
  end_date?: string;
  payment_status?: 'pending' | 'current' | 'past_due' | 'cancelled';
  notes?: string;
  stage_id?: string;
  created_at: string;
  updated_at: string;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}
