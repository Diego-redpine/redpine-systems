// Entity Field Mappings - Maps each data entity to fields for each view type
// This is the contract between the data layer and the view renderers

export type EntityFieldConfig = {
  card: { title: string; subtitle?: string; badge?: string; meta: string[] };
  list: { primary: string; secondary?: string; trailing?: string; checkbox?: boolean; boldWhen?: { field: string; value: unknown } };
  table: { columns: string[] };
  calendar: { title: string; startField: string; endField?: string; colorField?: string } | null;
  pipeline: { title: string; subtitle?: string; valueField?: string | null } | null;
  route?: { title: string; subtitle?: string; statusField?: string; stopsField?: string } | null;
};

export const ENTITY_FIELDS: Record<string, EntityFieldConfig> = {
  clients: {
    card: { title: 'name', subtitle: 'email', badge: 'type', meta: ['phone', 'status'] },
    list: { primary: 'name', secondary: 'email', trailing: 'status' },
    table: { columns: ['name', 'email', 'phone', 'type', 'status'] },
    calendar: null,
    pipeline: { title: 'name', subtitle: 'email', valueField: null },
  },

  contacts: {
    card: { title: 'name', subtitle: 'email', badge: 'type', meta: ['phone'] },
    list: { primary: 'name', secondary: 'phone', trailing: 'email' },
    table: { columns: ['name', 'email', 'phone', 'type'] },
    calendar: null,
    pipeline: null,
  },

  appointments: {
    card: { title: 'title', subtitle: 'location', badge: 'status', meta: ['start_time'] },
    list: { primary: 'title', secondary: 'location', trailing: 'start_time' },
    table: { columns: ['title', 'start_time', 'end_time', 'location', 'status', 'recurrence', 'recurrence_end_date'] },
    calendar: { title: 'title', startField: 'start_time', endField: 'end_time', colorField: 'color_primary' },
    pipeline: null,
  },

  invoices: {
    card: { title: 'contact_id', badge: 'status', meta: ['amount', 'due_date'] },
    list: { primary: 'contact_id', secondary: 'amount', trailing: 'status' },
    table: { columns: ['contact_id', 'amount', 'status', 'due_date', 'recurrence', 'recurrence_end_date'] },
    calendar: null,
    pipeline: null,
  },

  products: {
    card: { title: 'name', subtitle: 'category', badge: 'quantity', meta: ['price', 'sku'] },
    list: { primary: 'name', secondary: 'category', trailing: 'price' },
    table: { columns: ['name', 'price', 'sku', 'quantity', 'category'] },
    calendar: null,
    pipeline: null,
  },


  staff: {
    card: { title: 'name', subtitle: 'role', badge: 'staff_model', meta: ['email', 'phone'] },
    list: { primary: 'name', secondary: 'role', trailing: 'staff_model' },
    table: { columns: ['name', 'role', 'email', 'phone', 'staff_model', 'status'] },
    calendar: null,
    pipeline: null,
  },

  leads: {
    card: { title: 'name', subtitle: 'source', badge: 'status', meta: ['email', 'value'] },
    list: { primary: 'name', secondary: 'source', trailing: 'value' },
    table: { columns: ['name', 'email', 'source', 'status', 'value'] },
    calendar: null,
    pipeline: { title: 'name', subtitle: 'source', valueField: 'value' },
  },

  messages: {
    card: { title: 'subject', subtitle: 'from_contact', meta: ['created_at'] },
    list: { primary: 'subject', secondary: 'from_contact', trailing: 'created_at', boldWhen: { field: 'is_read', value: false } },
    table: { columns: ['subject', 'from_contact', 'is_read', 'created_at'] },
    calendar: null,
    pipeline: null,
  },

  documents: {
    card: { title: 'name', subtitle: 'folder', badge: 'file_type', meta: ['size_bytes'] },
    list: { primary: 'name', secondary: 'folder', trailing: 'file_type' },
    table: { columns: ['name', 'file_type', 'size_bytes', 'folder'] },
    calendar: null,
    pipeline: null,
  },

  payments: {
    card: { title: 'contact_id', badge: 'status', meta: ['amount', 'method'] },
    list: { primary: 'contact_id', secondary: 'amount', trailing: 'status' },
    table: { columns: ['contact_id', 'amount', 'method', 'status', 'staff_id', 'paid_at'] },
    calendar: null,
    pipeline: null,
  },

  expenses: {
    card: { title: 'description', badge: 'category', meta: ['amount', 'date'] },
    list: { primary: 'description', secondary: 'category', trailing: 'amount' },
    table: { columns: ['description', 'amount', 'category', 'date', 'status'] },
    calendar: null,
    pipeline: null,
  },

  estimates: {
    card: { title: 'contact_id', badge: 'status', meta: ['amount', 'valid_until'] },
    list: { primary: 'contact_id', secondary: 'amount', trailing: 'status' },
    table: { columns: ['contact_id', 'amount', 'status', 'valid_until', 'created_at'] },
    calendar: null,
    pipeline: null,
  },

  payroll: {
    card: { title: 'employee', badge: 'status', meta: ['amount', 'period'] },
    list: { primary: 'employee', secondary: 'period', trailing: 'amount' },
    table: { columns: ['employee', 'amount', 'period', 'status', 'paid_at'] },
    calendar: null,
    pipeline: null,
  },

  inventory: {
    card: { title: 'name', subtitle: 'category', badge: 'quantity', meta: ['sku', 'location'] },
    list: { primary: 'name', secondary: 'category', trailing: 'quantity' },
    table: { columns: ['name', 'sku', 'quantity', 'category', 'location'] },
    calendar: null,
    pipeline: null,
  },

  equipment: {
    card: { title: 'name', subtitle: 'type', badge: 'status', meta: ['serial_number', 'location'] },
    list: { primary: 'name', secondary: 'type', trailing: 'status' },
    table: { columns: ['name', 'type', 'serial_number', 'status', 'location'] },
    calendar: null,
    pipeline: null,
  },

  assets: {
    card: { title: 'name', subtitle: 'category', badge: 'status', meta: ['value', 'location'] },
    list: { primary: 'name', secondary: 'category', trailing: 'value' },
    table: { columns: ['name', 'category', 'value', 'status', 'location'] },
    calendar: null,
    pipeline: null,
  },

  vendors: {
    card: { title: 'name', subtitle: 'category', badge: 'status', meta: ['email', 'phone'] },
    list: { primary: 'name', secondary: 'category', trailing: 'status' },
    table: { columns: ['name', 'email', 'phone', 'category', 'status'] },
    calendar: null,
    pipeline: null,
  },

  schedules: {
    card: { title: 'title', subtitle: 'location', badge: 'status', meta: ['start_time'] },
    list: { primary: 'title', secondary: 'location', trailing: 'start_time' },
    table: { columns: ['title', 'start_time', 'end_time', 'location', 'status'] },
    calendar: { title: 'title', startField: 'start_time', endField: 'end_time', colorField: 'color_primary' },
    pipeline: null,
  },

  shifts: {
    card: { title: 'employee', subtitle: 'role', badge: 'status', meta: ['start_time', 'end_time'] },
    list: { primary: 'employee', secondary: 'role', trailing: 'start_time' },
    table: { columns: ['employee', 'role', 'start_time', 'end_time', 'status'] },
    calendar: { title: 'employee', startField: 'start_time', endField: 'end_time', colorField: 'color_primary' },
    pipeline: null,
  },

  calendar: {
    card: { title: 'title', subtitle: 'location', badge: 'status', meta: ['start_time'] },
    list: { primary: 'title', secondary: 'location', trailing: 'start_time' },
    table: { columns: ['title', 'start_time', 'end_time', 'location', 'status'] },
    calendar: { title: 'title', startField: 'start_time', endField: 'end_time', colorField: 'color_primary' },
    pipeline: null,
  },

  todos: {
    card: { title: 'title', badge: 'priority', meta: ['status', 'due_date'] },
    list: { primary: 'title', secondary: 'due_date', trailing: 'priority', checkbox: true, boldWhen: { field: 'status', value: 'pending' } },
    table: { columns: ['title', 'status', 'priority', 'due_date', 'assigned_to'] },
    calendar: null,
    pipeline: null,
  },

  jobs: {
    card: { title: 'title', subtitle: 'client', badge: 'status', meta: ['value', 'due_date'] },
    list: { primary: 'title', secondary: 'client', trailing: 'status' },
    table: { columns: ['title', 'client', 'status', 'value', 'due_date'] },
    calendar: null,
    pipeline: { title: 'title', subtitle: 'client', valueField: 'value' },
  },

  projects: {
    card: { title: 'name', subtitle: 'client', badge: 'status', meta: ['budget', 'deadline'] },
    list: { primary: 'name', secondary: 'client', trailing: 'status' },
    table: { columns: ['name', 'client', 'status', 'budget', 'deadline'] },
    calendar: null,
    pipeline: { title: 'name', subtitle: 'client', valueField: 'budget' },
  },

  workflows: {
    card: { title: 'name', subtitle: 'trigger', badge: 'status', meta: ['last_run'] },
    list: { primary: 'name', secondary: 'trigger', trailing: 'status' },
    table: { columns: ['name', 'trigger', 'status', 'last_run', 'run_count'] },
    calendar: null,
    pipeline: { title: 'name', subtitle: 'trigger', valueField: null },
  },

  notes: {
    card: { title: 'title', subtitle: 'author', meta: ['created_at'] },
    list: { primary: 'title', secondary: 'author', trailing: 'created_at' },
    table: { columns: ['title', 'author', 'category', 'created_at'] },
    calendar: null,
    pipeline: null,
  },

  announcements: {
    card: { title: 'title', subtitle: 'author', badge: 'status', meta: ['publish_date'] },
    list: { primary: 'title', secondary: 'author', trailing: 'publish_date' },
    table: { columns: ['title', 'author', 'status', 'publish_date'] },
    calendar: null,
    pipeline: null,
  },

  reviews: {
    card: { title: 'customer', subtitle: 'source', badge: 'rating', meta: ['created_at'] },
    list: { primary: 'customer', secondary: 'source', trailing: 'rating' },
    table: { columns: ['customer', 'rating', 'source', 'status', 'comment', 'created_at'] },
    calendar: null,
    pipeline: null,
  },

  contracts: {
    card: { title: 'title', subtitle: 'client', badge: 'status', meta: ['value', 'end_date'] },
    list: { primary: 'title', secondary: 'client', trailing: 'status' },
    table: { columns: ['title', 'client', 'value', 'status', 'end_date'] },
    calendar: null,
    pipeline: null,
  },

  images: {
    card: { title: 'name', subtitle: 'album', badge: 'file_type', meta: ['size'] },
    list: { primary: 'name', secondary: 'album', trailing: 'file_type' },
    table: { columns: ['name', 'album', 'file_type', 'size', 'uploaded_at'] },
    calendar: null,
    pipeline: null,
  },

  uploads: {
    card: { title: 'name', subtitle: 'folder', badge: 'file_type', meta: ['size'] },
    list: { primary: 'name', secondary: 'folder', trailing: 'file_type' },
    table: { columns: ['name', 'file_type', 'size', 'folder', 'uploaded_at'] },
    calendar: null,
    pipeline: null,
  },

  // Signing & Compliance
  waivers: {
    card: { title: 'name', subtitle: 'client', badge: 'status', meta: ['date_signed', 'expiry'] },
    list: { primary: 'name', secondary: 'client', trailing: 'status' },
    table: { columns: ['name', 'client', 'status', 'date_signed', 'expiry'] },
    calendar: null,
    pipeline: { title: 'name', subtitle: 'client', valueField: null },
  },
  forms: {
    card: { title: 'name', subtitle: 'type', badge: 'submissions', meta: ['created_at', 'status'] },
    list: { primary: 'name', secondary: 'type', trailing: 'submissions' },
    table: { columns: ['name', 'type', 'submissions', 'status', 'created_at'] },
    calendar: null,
    pipeline: null,
  },
  signatures: {
    card: { title: 'document', subtitle: 'signer', badge: 'status', meta: ['signed_at'] },
    list: { primary: 'document', secondary: 'signer', trailing: 'status' },
    table: { columns: ['document', 'signer', 'status', 'signed_at', 'method'] },
    calendar: null,
    pipeline: null,
  },

  // Hospitality & Food
  reservations: {
    card: { title: 'guest_name', subtitle: 'date', badge: 'status', meta: ['party_size', 'time'] },
    list: { primary: 'guest_name', secondary: 'date', trailing: 'status' },
    table: { columns: ['guest_name', 'date', 'time', 'party_size', 'status'] },
    calendar: { title: 'guest_name', startField: 'date', endField: 'end_time' },
    pipeline: null,
  },
  tables: {
    card: { title: 'table_number', subtitle: 'section', badge: 'status', meta: ['capacity', 'server'] },
    list: { primary: 'table_number', secondary: 'section', trailing: 'status' },
    table: { columns: ['table_number', 'capacity', 'section', 'status', 'server'] },
    calendar: null,
    pipeline: null,
  },
  menus: {
    card: { title: 'name', subtitle: 'category', badge: 'price', meta: ['description'] },
    list: { primary: 'name', secondary: 'category', trailing: 'price' },
    table: { columns: ['name', 'category', 'price', 'dietary', 'available'] },
    calendar: null,
    pipeline: null,
  },
  orders: {
    card: { title: 'order_number', subtitle: 'customer', badge: 'status', meta: ['total', 'items'] },
    list: { primary: 'order_number', secondary: 'customer', trailing: 'status' },
    table: { columns: ['order_number', 'customer', 'total', 'status', 'created_at'] },
    calendar: null,
    pipeline: { title: 'order_number', subtitle: 'customer', valueField: 'total' },
  },
  rooms: {
    card: { title: 'name', subtitle: 'type', badge: 'status', meta: ['capacity', 'rate'] },
    list: { primary: 'name', secondary: 'type', trailing: 'status' },
    table: { columns: ['name', 'type', 'capacity', 'rate', 'status'] },
    calendar: null,
    pipeline: null,
  },
  recipes: {
    card: { title: 'name', subtitle: 'category', badge: 'prep_time', meta: ['cost', 'portions'] },
    list: { primary: 'name', secondary: 'category', trailing: 'prep_time' },
    table: { columns: ['name', 'category', 'prep_time', 'cost', 'portions'] },
    calendar: null,
    pipeline: null,
  },
  waitlist: {
    card: { title: 'customer_name', subtitle: 'customer_phone', badge: 'status', meta: ['party_size', 'wait_time'] },
    list: { primary: 'customer_name', secondary: 'customer_phone', trailing: 'status' },
    table: { columns: ['customer_name', 'customer_phone', 'party_size', 'status', 'wait_time', 'created_at'] },
    calendar: null,
    pipeline: null,
  },
  tip_pools: {
    card: { title: 'date', subtitle: 'total_tips', badge: 'distributed', meta: ['foh_share', 'boh_share'] },
    list: { primary: 'date', secondary: 'total_tips', trailing: 'distributed' },
    table: { columns: ['date', 'total_tips', 'foh_share_percent', 'boh_share_percent', 'distributed'] },
    calendar: null,
    pipeline: null,
  },
  waste_log: {
    card: { title: 'item_name', subtitle: 'reason', badge: 'quantity', meta: ['estimated_cost', 'logged_by'] },
    list: { primary: 'item_name', secondary: 'reason', trailing: 'quantity' },
    table: { columns: ['item_name', 'quantity', 'unit', 'reason', 'estimated_cost', 'logged_by', 'created_at'] },
    calendar: null,
    pipeline: null,
  },
  suppliers: {
    card: { title: 'name', subtitle: 'contact_name', badge: 'category', meta: ['email', 'phone'] },
    list: { primary: 'name', secondary: 'contact_name', trailing: 'category' },
    table: { columns: ['name', 'contact_name', 'email', 'phone', 'category'] },
    calendar: null,
    pipeline: null,
  },
  purchase_orders: {
    card: { title: 'po_number', subtitle: 'supplier', badge: 'status', meta: ['total', 'expected_delivery'] },
    list: { primary: 'po_number', secondary: 'supplier', trailing: 'status' },
    table: { columns: ['po_number', 'supplier', 'total', 'status', 'expected_delivery', 'created_at'] },
    calendar: null,
    pipeline: null,
  },

  // Education & Programs
  classes: {
    card: { title: 'name', subtitle: 'instructor', badge: 'enrolled', meta: ['schedule', 'capacity'] },
    list: { primary: 'name', secondary: 'instructor', trailing: 'schedule' },
    table: { columns: ['name', 'instructor', 'schedule', 'enrolled', 'capacity'] },
    calendar: { title: 'name', startField: 'start_time', endField: 'end_time' },
    pipeline: null,
  },
  memberships: {
    card: { title: 'client_name', subtitle: 'plan_name', badge: 'status', meta: ['start_date', 'payment_status'] },
    list: { primary: 'client_name', secondary: 'plan_name', trailing: 'status' },
    table: { columns: ['client_name', 'plan_name', 'status', 'start_date', 'end_date', 'payment_status'] },
    calendar: null,
    pipeline: { title: 'client_name', subtitle: 'plan_name', valueField: null },
  },
  courses: {
    card: { title: 'name', subtitle: 'instructor', badge: 'enrolled', meta: ['duration', 'modules'] },
    list: { primary: 'name', secondary: 'instructor', trailing: 'enrolled' },
    table: { columns: ['name', 'instructor', 'duration', 'enrolled', 'status'] },
    calendar: null,
    pipeline: null,
  },
  attendance: {
    card: { title: 'member', subtitle: 'class', badge: 'checked_in', meta: ['date', 'time_in'] },
    list: { primary: 'member', secondary: 'class', trailing: 'date' },
    table: { columns: ['member', 'class', 'date', 'time_in', 'checked_in'] },
    calendar: null,
    pipeline: null,
  },

  // Field Service
  inspections: {
    card: { title: 'location', subtitle: 'inspector', badge: 'result', meta: ['date', 'type'] },
    list: { primary: 'location', secondary: 'inspector', trailing: 'result' },
    table: { columns: ['location', 'inspector', 'type', 'result', 'date'] },
    calendar: null,
    pipeline: null,
  },
  routes: {
    card: { title: 'name', subtitle: 'driver', badge: 'status', meta: ['stops', 'vehicle'] },
    list: { primary: 'name', secondary: 'driver', trailing: 'status' },
    table: { columns: ['name', 'driver', 'vehicle', 'stops', 'status'] },
    calendar: null,
    pipeline: null,
    route: { title: 'name', subtitle: 'driver', statusField: 'status', stopsField: 'stops' },
  },
  fleet: {
    card: { title: 'vehicle', subtitle: 'make_model', badge: 'status', meta: ['mileage', 'assigned_to'] },
    list: { primary: 'vehicle', secondary: 'make_model', trailing: 'status' },
    table: { columns: ['vehicle', 'make_model', 'mileage', 'next_service', 'status'] },
    calendar: null,
    pipeline: null,
  },
  checklists: {
    card: { title: 'name', subtitle: 'assigned_to', badge: 'completion', meta: ['items', 'due_date'] },
    list: { primary: 'name', secondary: 'assigned_to', trailing: 'completion', checkbox: true },
    table: { columns: ['name', 'assigned_to', 'items', 'completion', 'due_date'] },
    calendar: null,
    pipeline: null,
  },
  permits: {
    card: { title: 'permit_type', subtitle: 'authority', badge: 'status', meta: ['issued', 'expiry'] },
    list: { primary: 'permit_type', secondary: 'authority', trailing: 'status' },
    table: { columns: ['permit_type', 'authority', 'status', 'issued', 'expiry'] },
    calendar: null,
    pipeline: null,
  },

  // Health & Medical
  prescriptions: {
    card: { title: 'medication', subtitle: 'patient', badge: 'refills', meta: ['dosage', 'prescriber'] },
    list: { primary: 'medication', secondary: 'patient', trailing: 'refills' },
    table: { columns: ['medication', 'patient', 'dosage', 'frequency', 'refills'] },
    calendar: null,
    pipeline: null,
  },
  treatments: {
    card: { title: 'treatment', subtitle: 'patient', badge: 'status', meta: ['provider', 'date'] },
    list: { primary: 'treatment', secondary: 'patient', trailing: 'status' },
    table: { columns: ['treatment', 'patient', 'provider', 'date', 'status'] },
    calendar: null,
    pipeline: null,
  },

  // Creative
  portfolios: {
    card: { title: 'project', subtitle: 'category', badge: 'client', meta: ['date'] },
    list: { primary: 'project', secondary: 'category', trailing: 'client' },
    table: { columns: ['project', 'category', 'client', 'date', 'status'] },
    calendar: null,
    pipeline: null,
  },
  galleries: {
    card: { title: 'name', subtitle: 'client', badge: 'photos', meta: ['shared', 'created_at'] },
    list: { primary: 'name', secondary: 'client', trailing: 'photos' },
    table: { columns: ['name', 'client', 'photos', 'shared', 'created_at'] },
    calendar: null,
    pipeline: null,
  },

  // Real Estate
  listings: {
    card: { title: 'address', subtitle: 'price', badge: 'status', meta: ['bedrooms', 'sqft'] },
    list: { primary: 'address', secondary: 'price', trailing: 'status' },
    table: { columns: ['address', 'price', 'bedrooms', 'sqft', 'status'] },
    calendar: null,
    pipeline: null,
  },
  properties: {
    card: { title: 'address', subtitle: 'tenant', badge: 'status', meta: ['rent', 'lease_end'] },
    list: { primary: 'address', secondary: 'tenant', trailing: 'rent' },
    table: { columns: ['address', 'tenant', 'rent', 'lease_end', 'status'] },
    calendar: null,
    pipeline: null,
  },

  // Legal
  cases: {
    card: { title: 'case_name', subtitle: 'client', badge: 'status', meta: ['type', 'filed_date'] },
    list: { primary: 'case_name', secondary: 'client', trailing: 'status' },
    table: { columns: ['case_name', 'client', 'type', 'status', 'filed_date'] },
    calendar: null,
    pipeline: { title: 'case_name', subtitle: 'client', valueField: null },
  },

  // Events
  venues: {
    card: { title: 'name', subtitle: 'address', badge: 'capacity', meta: ['rate', 'amenities'] },
    list: { primary: 'name', secondary: 'address', trailing: 'capacity' },
    table: { columns: ['name', 'address', 'capacity', 'rate', 'availability'] },
    calendar: null,
    pipeline: null,
  },
  guests: {
    card: { title: 'name', subtitle: 'event', badge: 'rsvp', meta: ['party_size', 'dietary'] },
    list: { primary: 'name', secondary: 'event', trailing: 'rsvp' },
    table: { columns: ['name', 'event', 'rsvp', 'party_size', 'dietary'] },
    calendar: null,
    pipeline: null,
  },

  // Marketing
  campaigns: {
    card: { title: 'name', subtitle: 'channel', badge: 'status', meta: ['reach', 'conversions'] },
    list: { primary: 'name', secondary: 'channel', trailing: 'status' },
    table: { columns: ['name', 'channel', 'status', 'reach', 'conversions'] },
    calendar: null,
    pipeline: null,
  },
  loyalty: {
    card: { title: 'member', subtitle: 'tier', badge: 'points', meta: ['join_date', 'last_activity'] },
    list: { primary: 'member', secondary: 'tier', trailing: 'points' },
    table: { columns: ['member', 'tier', 'points', 'join_date', 'last_activity'] },
    calendar: null,
    pipeline: null,
  },
  surveys: {
    card: { title: 'name', subtitle: 'status', badge: 'responses', meta: ['completion_rate', 'created_at'] },
    list: { primary: 'name', secondary: 'status', trailing: 'responses' },
    table: { columns: ['name', 'responses', 'completion_rate', 'status', 'created_at'] },
    calendar: null,
    pipeline: null,
  },

  // Support
  tickets: {
    card: { title: 'subject', subtitle: 'requester', badge: 'priority', meta: ['status', 'assigned_to'] },
    list: { primary: 'subject', secondary: 'requester', trailing: 'priority' },
    table: { columns: ['subject', 'requester', 'priority', 'status', 'assigned_to'] },
    calendar: null,
    pipeline: { title: 'subject', subtitle: 'requester', valueField: null },
  },
  knowledge: {
    card: { title: 'title', subtitle: 'category', badge: 'views', meta: ['updated_at'] },
    list: { primary: 'title', secondary: 'category', trailing: 'views' },
    table: { columns: ['title', 'category', 'views', 'status', 'updated_at'] },
    calendar: null,
    pipeline: null,
  },

  // Business Operations
  packages: {
    card: { title: 'name', subtitle: 'services', badge: 'price', meta: ['duration', 'popular'] },
    list: { primary: 'name', secondary: 'services', trailing: 'price' },
    table: { columns: ['name', 'services', 'price', 'duration', 'status'] },
    calendar: null,
    pipeline: null,
  },
  subscriptions: {
    card: { title: 'subscriber', subtitle: 'plan', badge: 'status', meta: ['amount', 'next_billing'] },
    list: { primary: 'subscriber', secondary: 'plan', trailing: 'status' },
    table: { columns: ['subscriber', 'plan', 'amount', 'next_billing', 'status'] },
    calendar: null,
    pipeline: null,
  },
  time_tracking: {
    card: { title: 'employee', subtitle: 'project', badge: 'hours', meta: ['date', 'billable'] },
    list: { primary: 'employee', secondary: 'project', trailing: 'hours' },
    table: { columns: ['employee', 'project', 'hours', 'date', 'billable'] },
    calendar: null,
    pipeline: null,
  },

  // Digital & Online
  social_media: {
    card: { title: 'post_title', subtitle: 'platform', badge: 'status', meta: ['scheduled_at', 'engagement'] },
    list: { primary: 'post_title', secondary: 'platform', trailing: 'status' },
    table: { columns: ['post_title', 'platform', 'scheduled_at', 'status', 'engagement'] },
    calendar: { title: 'post_title', startField: 'scheduled_at' },
    pipeline: null,
  },
  reputation: {
    card: { title: 'reviewer', subtitle: 'platform', badge: 'rating', meta: ['date', 'replied'] },
    list: { primary: 'reviewer', secondary: 'platform', trailing: 'rating' },
    table: { columns: ['reviewer', 'platform', 'rating', 'date', 'replied'] },
    calendar: null,
    pipeline: null,
  },
  portal: {
    card: { title: 'client', subtitle: 'access_level', badge: 'status', meta: ['last_login', 'features'] },
    list: { primary: 'client', secondary: 'access_level', trailing: 'status' },
    table: { columns: ['client', 'access_level', 'last_login', 'status', 'features'] },
    calendar: null,
    pipeline: null,
  },
  community: {
    card: { title: 'topic', subtitle: 'author', badge: 'replies', meta: ['created_at', 'category'] },
    list: { primary: 'topic', secondary: 'author', trailing: 'replies' },
    table: { columns: ['topic', 'author', 'category', 'replies', 'created_at'] },
    calendar: null,
    pipeline: null,
  },
  chat_widget: {
    card: { title: 'visitor', subtitle: 'page', badge: 'status', meta: ['started_at', 'messages'] },
    list: { primary: 'visitor', secondary: 'page', trailing: 'status' },
    table: { columns: ['visitor', 'page', 'status', 'started_at', 'messages'] },
    calendar: null,
    pipeline: null,
  },
};

// Helper functions

/**
 * Get field configuration for a specific entity and view type
 */
export function getFieldsForView(entityType: string, viewType: string): EntityFieldConfig[keyof EntityFieldConfig] | null {
  const entity = ENTITY_FIELDS[entityType];
  if (!entity) return null;
  return entity[viewType as keyof EntityFieldConfig] ?? null;
}

/**
 * Get card view field configuration for an entity
 */
export function getCardFields(entityType: string): EntityFieldConfig['card'] | null {
  const entity = ENTITY_FIELDS[entityType];
  return entity?.card ?? null;
}

/**
 * Get calendar view field configuration for an entity
 * Returns null if entity doesn't support calendar view
 */
export function getCalendarFields(entityType: string): EntityFieldConfig['calendar'] {
  const entity = ENTITY_FIELDS[entityType];
  return entity?.calendar ?? null;
}

/**
 * Get pipeline view field configuration for an entity
 * Returns null if entity doesn't support pipeline view
 */
export function getPipelineFields(entityType: string): EntityFieldConfig['pipeline'] {
  const entity = ENTITY_FIELDS[entityType];
  return entity?.pipeline ?? null;
}

/**
 * Get list view field configuration for an entity
 */
export function getListFields(entityType: string): EntityFieldConfig['list'] | null {
  const entity = ENTITY_FIELDS[entityType];
  return entity?.list ?? null;
}

/**
 * Get table view field configuration for an entity
 */
export function getTableFields(entityType: string): EntityFieldConfig['table'] | null {
  const entity = ENTITY_FIELDS[entityType];
  return entity?.table ?? null;
}

export function getRouteFields(entityType: string): EntityFieldConfig['route'] | null {
  const entity = ENTITY_FIELDS[entityType];
  return entity?.route ?? null;
}

// Type guards

/**
 * Check if an entity supports calendar view
 */
export function isCalendarEntity(entityType: string): boolean {
  const entity = ENTITY_FIELDS[entityType];
  return entity?.calendar !== null && entity?.calendar !== undefined;
}

/**
 * Check if an entity supports pipeline view
 */
export function isPipelineEntity(entityType: string): boolean {
  const entity = ENTITY_FIELDS[entityType];
  return entity?.pipeline !== null && entity?.pipeline !== undefined;
}
