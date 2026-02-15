// Frontend API client for dashboard components
// Typed functions for calling the CRUD API routes

interface QueryParams {
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Generic fetch helper
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      return { error: json.error || 'Request failed' };
    }

    return { data: json.data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Build query string from params
function buildQueryString(params?: QueryParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// Resource types
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
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  client_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  client?: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id?: string;
  invoice_number?: string;
  amount_cents: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  paid_at?: string;
  line_items?: unknown[];
  notes?: string;
  client?: { id: string; name: string };
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
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assigned_to?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
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
  value_cents?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  client_id?: string;
  content: string;
  type: 'note' | 'email' | 'sms' | 'internal';
  is_read: boolean;
  client?: { id: string; name: string };
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
}

// API client object with methods for each resource
export const api = {
  clients: {
    list: (params?: QueryParams) =>
      apiFetch<Client[]>(`/api/clients${buildQueryString(params)}`),
    get: (id: string) =>
      apiFetch<Client>(`/api/clients/${id}`),
    create: (data: Partial<Client>) =>
      apiFetch<Client>('/api/clients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Client>) =>
      apiFetch<Client>(`/api/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/clients/${id}`, { method: 'DELETE' }),
  },

  appointments: {
    list: (params?: QueryParams) =>
      apiFetch<Appointment[]>(`/api/appointments${buildQueryString(params)}`),
    get: (id: string) =>
      apiFetch<Appointment>(`/api/appointments/${id}`),
    create: (data: Partial<Appointment>) =>
      apiFetch<Appointment>('/api/appointments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Appointment>) =>
      apiFetch<Appointment>(`/api/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/appointments/${id}`, { method: 'DELETE' }),
  },

  invoices: {
    list: (params?: QueryParams) =>
      apiFetch<Invoice[]>(`/api/invoices${buildQueryString(params)}`),
    get: (id: string) =>
      apiFetch<Invoice>(`/api/invoices/${id}`),
    create: (data: Partial<Invoice>) =>
      apiFetch<Invoice>('/api/invoices', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Invoice>) =>
      apiFetch<Invoice>(`/api/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/invoices/${id}`, { method: 'DELETE' }),
  },

  products: {
    list: (params?: QueryParams) =>
      apiFetch<Product[]>(`/api/products${buildQueryString(params)}`),
    get: (id: string) =>
      apiFetch<Product>(`/api/products/${id}`),
    create: (data: Partial<Product>) =>
      apiFetch<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Product>) =>
      apiFetch<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/products/${id}`, { method: 'DELETE' }),
  },

  tasks: {
    list: (params?: QueryParams) =>
      apiFetch<Task[]>(`/api/tasks${buildQueryString(params)}`),
    get: (id: string) =>
      apiFetch<Task>(`/api/tasks/${id}`),
    create: (data: Partial<Task>) =>
      apiFetch<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Task>) =>
      apiFetch<Task>(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
  },

  staff: {
    list: (params?: QueryParams) =>
      apiFetch<Staff[]>(`/api/staff${buildQueryString(params)}`),
    get: (id: string) =>
      apiFetch<Staff>(`/api/staff/${id}`),
    create: (data: Partial<Staff>) =>
      apiFetch<Staff>('/api/staff', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Staff>) =>
      apiFetch<Staff>(`/api/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/staff/${id}`, { method: 'DELETE' }),
  },

  leads: {
    list: (params?: QueryParams) =>
      apiFetch<Lead[]>(`/api/leads${buildQueryString(params)}`),
    get: (id: string) =>
      apiFetch<Lead>(`/api/leads/${id}`),
    create: (data: Partial<Lead>) =>
      apiFetch<Lead>('/api/leads', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Lead>) =>
      apiFetch<Lead>(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/leads/${id}`, { method: 'DELETE' }),
  },

  messages: {
    list: (params?: QueryParams) =>
      apiFetch<Message[]>(`/api/messages${buildQueryString(params)}`),
    get: (id: string) =>
      apiFetch<Message>(`/api/messages/${id}`),
    create: (data: Partial<Message>) =>
      apiFetch<Message>('/api/messages', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Message>) =>
      apiFetch<Message>(`/api/messages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/messages/${id}`, { method: 'DELETE' }),
  },

  documents: {
    list: (params?: QueryParams) =>
      apiFetch<Document[]>(`/api/documents${buildQueryString(params)}`),
    get: (id: string) =>
      apiFetch<Document>(`/api/documents/${id}`),
    create: (data: Partial<Document>) =>
      apiFetch<Document>('/api/documents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Document>) =>
      apiFetch<Document>(`/api/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/documents/${id}`, { method: 'DELETE' }),
  },
};
