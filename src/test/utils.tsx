import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { ToastProvider } from '../components/Toast';

export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: { route?: string } = {}
) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>{ui}</ToastProvider>
    </MemoryRouter>
  );
}

export const mockService = {
  id: 'svc-1',
  customer_id: 'c1',
  product_id: 'p1',
  name: 'Test VPS',
  status: 'running' as const,
  provider_resource_id: 'htz-123',
  ip: '1.2.3.4',
  hostname: 'test.example.com',
  config: {},
  price: '9.99',
  next_due: '2026-09-01T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockCustomer = {
  id: 'c1',
  external_id: 'ext1',
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '+49123',
  company: 'Acme',
  address: '123 St',
  city: 'Berlin',
  country: 'DE',
  vat_id: 'DE123456789',
  status: 'active' as const,
  two_factor_enabled: false,
  email_verified: true,
  notes: '',
  stripe_customer_id: null,
  created_at: '2026-01-01T00:00:00Z',
  last_login: null,
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockProduct = {
  id: 'p1',
  name: 'VPS Pro',
  category: 'vps',
  provider: 'hetzner_cloud',
  target: '',
  specs: { server_type: 'cx22' },
  cost: '5.00',
  price: '9.99',
  setup_fee: '0',
  stock: 10,
  user_limit: 0,
  billing_cycle: 'monthly' as const,
  hidden: false,
  service_form_id: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockTicket = {
  id: 'tkt-1',
  ticket_number: 'TKT-ABC123',
  customer_id: 'c1',
  category: 'support' as const,
  subject: 'Help me',
  status: 'open' as const,
  priority: 'normal' as const,
  assignee_id: null,
  mailbox: 'support@vs.de',
  related_service_id: null,
  ip: '127.0.0.1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockInvoice = {
  id: 'inv-1',
  invoice_number: 'INV-001',
  customer_id: 'c1',
  status: 'paid' as const,
  subtotal: '8.40',
  tax_rate: '19.00',
  tax_amount: '1.60',
  total: '9.99',
  issue_date: '2026-01-15',
  due_date: '2026-02-15',
  paid_at: '2026-01-20T00:00:00Z',
  stripe_payment_intent_id: null,
  notes: '',
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-20T00:00:00Z',
};

export const mockStaff = {
  id: 'staff-1',
  external_id: 'ext-staff-1',
  username: 'admin',
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@vaultscope.de',
  email_verified: true,
  avatar_url: '',
  role_id: 'role-1',
  mfa_enabled: true,
  last_login: '2026-08-01T00:00:00Z',
  last_login_ip: '127.0.0.1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockRole = {
  id: 'role-1',
  name: 'Owner',
  permissions: ['*'],
  mapped_group: 'admins',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};


export const mockNotification = {
  id: 'notif-1',
  category: 'system',
  title: 'Service provisioned',
  detail: 'VPS Pro was provisioned successfully',
  severity: 'info' as const,
  read: false,
  resolved: false,
  actions: null,
  created_at: '2026-08-01T00:00:00Z',
};

export const mockJob = {
  id: 'job-1',
  task: 'provision',
  target_api: 'hetzner_cloud',
  customer_id: 'c1',
  service_id: 'svc-1',
  status: 'completed' as const,
  error: null,
  request_payload: {},
  response_payload: {},
  attempts: 1,
  max_attempts: 3,
  scheduled_at: '2026-01-01T00:00:00Z',
  started_at: '2026-01-01T00:00:00Z',
  completed_at: '2026-01-01T00:00:01Z',
  created_at: '2026-01-01T00:00:00Z',
};

export const mockCoupon = {
  id: 'coupon-1',
  code: 'SAVE20',
  discount_type: 'percentage' as const,
  discount_value: '20.00',
  usage_limit: 100,
  usage_count: 5,
  expires_at: '2027-01-01T00:00:00Z',
  status: 'active' as const,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockActivityLog = {
  id: 'act-1',
  actor_id: 'staff-1',
  actor_type: 'staff' as const,
  actor_name: 'Admin User',
  category: 'service',
  action: 'created',
  target: 'VPS Pro',
  detail: 'Service provisioned',
  created_at: '2026-08-01T00:00:00Z',
};

export function mockUseApiReturn<T>(data: T | null, loading = false, error: string | null = null) {
  return { data, loading, error, refetch: vi.fn() };
}
