// Centralized route importers for React.lazy code-splitting + hover prefetching

export const routeLoaders = {
  dashboard: () => import('../pages/Dashboard'),
  launchpad: () => import('../pages/Launchpad'),
  customers: () => import('../pages/Customers'),
  billing: () => import('../pages/BillingRouter'),
  coupons: () => import('../pages/CouponsNew'),
  partners: () => import('../pages/Partners'),
  tickets: () => import('../pages/Tickets'),
  services: () => import('../pages/Services'),
  blogList: () => import('../pages/blog/BlogList'),
  blogEdit: () => import('../pages/blog/BlogEdit'),
  products: () => import('../pages/Products'),
  forms: () => import('../pages/ServiceForms'),
  jobs: () => import('../pages/JobQueue'),
  emailLogs: () => import('../pages/EmailLogs'),
  staff: () => import('../pages/Staff'),
  activity: () => import('../pages/ActivityLog'),
  notifications: () => import('../pages/Notifications'),
  settings: () => import('../pages/Settings'),
  reports: () => import('../pages/Reports'),
  emailTemplates: () => import('../pages/EmailTemplates'),
  internalTools: () => import('../pages/InternalTools'),
  login: () => import('../pages/Login'),
} as const;

const prefetchedKeys = new Set<string>();

function resolveLoaderKey(path: string): keyof typeof routeLoaders | null {
  if (path === '/' || path === '') return 'dashboard';
  if (path.startsWith('/launchpad')) return 'launchpad';
  if (path.startsWith('/customers')) return 'customers';
  if (path.startsWith('/billing')) return 'billing';
  if (path.startsWith('/coupons')) return 'coupons';
  if (path.startsWith('/partners')) return 'partners';
  if (path.startsWith('/tickets')) return 'tickets';
  if (path.startsWith('/services')) return 'services';
  if (path.startsWith('/blog/')) return 'blogEdit';
  if (path.startsWith('/blog')) return 'blogList';
  if (path.startsWith('/products')) return 'products';
  if (path.startsWith('/forms')) return 'forms';
  if (path.startsWith('/jobs')) return 'jobs';
  if (path.startsWith('/email-logs')) return 'emailLogs';
  if (path.startsWith('/staff')) return 'staff';
  if (path.startsWith('/activity')) return 'activity';
  if (path.startsWith('/notifications')) return 'notifications';
  if (path.startsWith('/settings')) return 'settings';
  if (path.startsWith('/reports')) return 'reports';
  if (path.startsWith('/email-templates')) return 'emailTemplates';
  if (path.startsWith('/internal-tools')) return 'internalTools';
  return null;
}

export function prefetchRoute(path: string) {
  const key = resolveLoaderKey(path);
  if (!key || prefetchedKeys.has(key)) return;
  prefetchedKeys.add(key);
  routeLoaders[key]().catch(() => {
    prefetchedKeys.delete(key);
  });
}
