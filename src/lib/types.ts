export interface Customer {
  id: string;
  external_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  country: string;
  vat_id: string;
  status: 'active' | 'suspended' | 'banned';
  two_factor_enabled: boolean;
  email_verified: boolean;
  notes: string;
  stripe_customer_id: string | null;
  created_at: string;
  last_login: string | null;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  provider: string;
  target: string;
  specs: Record<string, unknown>;
  cost: string;
  price: string;
  setup_fee: string;
  stock: number;
  user_limit: number;
  billing_cycle: 'monthly' | 'yearly' | 'one_time';
  hidden: boolean;
  service_form_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  customer_id: string;
  product_id: string;
  connector_id: string | null;
  name: string;
  status: 'running' | 'suspended' | 'pending' | 'terminated';
  provider_resource_id: string;
  ip: string;
  hostname: string;
  config: Record<string, unknown>;
  price: string;
  next_due: string | null;
  created_at: string;
  updated_at: string;
}

export interface Connector {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'error' | 'not_configured';
  last_tested_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  customer_id: string;
  category: 'support' | 'abuse' | 'dmca';
  subject: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'critical';
  assignee_id: string | null;
  mailbox: string;
  related_service_id: string | null;
  ip: string;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  author_id: string;
  author_type: 'staff' | 'customer' | 'system';
  content: string;
  internal: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  mailbox: string;
  default_assignee_id: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'void';
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  total: string;
  issue_date: string;
  due_date: string;
  paid_at: string | null;
  stripe_payment_intent_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: string;
  total: string;
  service_id: string | null;
  sort_order: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  usage_limit: number | null;
  usage_count: number;
  expires_at: string | null;
  status: 'active' | 'exhausted' | 'expired' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface TaxRate {
  id: string;
  name: string;
  country: string;
  rate: string;
  created_at: string;
}

export interface Setting {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface Job {
  id: string;
  task: string;
  target_api: string;
  connector_id: string | null;
  customer_id: string | null;
  service_id: string | null;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  error: string | null;
  request_payload: unknown;
  response_payload: unknown;
  attempts: number;
  max_attempts: number;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Staff {
  id: string;
  external_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  email_verified: boolean;
  avatar_url: string;
  role_id: string;
  mfa_enabled: boolean;
  last_login: string | null;
  last_login_ip: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  mapped_group: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  actor_type: 'staff' | 'system' | 'customer';
  actor_name: string;
  category: string;
  action: string;
  target: string;
  detail: string;
  created_at: string;
}

export interface Notification {
  id: string;
  category: string;
  title: string;
  detail: string;
  severity: 'critical' | 'warning' | 'info';
  read: boolean;
  resolved: boolean;
  actions: unknown;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  enabled: boolean;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthClaims {
  sub: string;
  email: string;
  role: string;
  audience: 'admin' | 'storefront';
  exp: number;
  iat: number;
}
