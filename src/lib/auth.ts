import type { AuthClaims } from './types';
import { API_BASE } from './api';

export function getStoredClaims(): AuthClaims | null {
  const raw = localStorage.getItem('vs_admin_claims');
  if (!raw) return null;
  try {
    const claims: AuthClaims = JSON.parse(raw);
    if (!claims || typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now()) {
      logout();
      return null;
    }
    if (claims.audience !== 'admin') {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem('vs_admin_token');
  if (!token || !token.trim()) return false;
  const claims = getStoredClaims();
  return claims !== null && claims.audience === 'admin';
}

export function permissionSatisfies(heldPermissions: string[], requiredPerm: string): boolean {
  if (!requiredPerm) return true;
  if (heldPermissions.includes('*') || heldPermissions.includes(requiredPerm)) {
    return true;
  }

  const has = (p: string) => heldPermissions.includes(p);
  const dotIdx = requiredPerm.indexOf('.');
  if (dotIdx > 0) {
    const domain = requiredPerm.slice(0, dotIdx);
    const action = requiredPerm.slice(dotIdx + 1);
    if (has(`${domain}.manage`)) {
      const restricted =
        (domain === 'staff' && action === 'delete') ||
        (domain === 'accounts' && action === 'delete') ||
        (domain === 'services' && action === 'terminate') ||
        (domain === 'rbac' && action === 'manage');
      if (!restricted) {
        return true;
      }
    }
  }

  switch (requiredPerm) {
    case 'billing.view':
      return has('billing.manage') || has('invoices.manage') || has('reports.view');
    case 'invoices.view':
      return has('billing.view') || has('billing.manage') || has('invoices.manage');
    case 'invoices.create':
    case 'invoices.edit':
    case 'invoices.delete':
    case 'invoices.manage':
      return has('billing.manage') || has('invoices.manage');
    case 'tax.manage':
    case 'coupons.manage':
      return has('billing.manage');
    case 'departments.manage':
    case 'tickets.create':
    case 'tickets.reply':
    case 'tickets.view':
      return has('tickets.manage');
    case 'forms.manage':
      return has('products.manage');
    case 'customers.impersonate':
      return has('customers.manage') || has('customers.edit');
    case 'customers.delete':
    case 'staff.delete':
      return has('accounts.delete');
    case 'staff.view':
      return has('staff.manage') || has('rbac.manage');
    case 'email_logs.view':
    case 'mail.view':
      return has('email_logs.manage') || has('mail.manage') || has('email_logs.view') || has('mail.view');
    case 'blog.view':
    case 'blog.create':
    case 'blog.edit':
    case 'blog.delete':
      return has('blog.manage') || has('templates.manage');
    default:
      return false;
  }
}

export function syncStoredPermissions(roleName?: string, permissions?: string[]) {
  const claims = getStoredClaims();
  if (!claims || !Array.isArray(permissions)) return;
  const nextRole = roleName || claims.role;
  const prevPerms = Array.isArray(claims.permissions) ? claims.permissions : [];
  if (
    claims.role === nextRole &&
    prevPerms.length === permissions.length &&
    prevPerms.every((p, idx) => p === permissions[idx])
  ) {
    return;
  }
  const updated: AuthClaims = {
    ...claims,
    role: nextRole,
    permissions,
  };
  localStorage.setItem('vs_admin_claims', JSON.stringify(updated));
}

export function hasPermission(permission: string): boolean {
  if (!isAuthenticated()) return false;
  const claims = getStoredClaims();
  if (!claims) return false;
  if (claims.role === 'Owner' || claims.role === 'Super Admin') return true;
  const permissions: string[] = claims.permissions || [];
  return permissionSatisfies(permissions, permission);
}

export function getToken(): string | null {
  if (!isAuthenticated()) return null;
  return localStorage.getItem('vs_admin_token');
}

export async function loginWithCredentials(
  email: string,
  password: string,
  totpCode?: string
): Promise<AuthClaims> {
  const payload: Record<string, any> = { email, password, audience: 'admin' };
  if (totpCode) {
    payload.totp_code = totpCode.trim();
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Login failed');
  }

  const data = await res.json();
  if (data.mfa_enrollment_required) {
    const enrollErr: any = new Error(
      data.message ||
        'Two-factor authentication (2FA) is mandatory for CAMOS staff accounts. Redirecting to VaultScope MFA setup...'
    );
    enrollErr.mfaEnrollmentRequired = true;
    enrollErr.redirectUrl = data.redirect_url || 'https://vaultscope.de/dashboard/profile/mfa';
    throw enrollErr;
  }
  if (data.mfa_required) {
    const mfaErr: any = new Error('MFA_REQUIRED');
    mfaErr.mfaRequired = true;
    throw mfaErr;
  }

  const { token, claims } = data;
  if (!token || !claims || claims.audience !== 'admin') {
    throw new Error('Invalid admin session response');
  }
  localStorage.setItem('vs_admin_token', token);
  localStorage.setItem('vs_admin_claims', JSON.stringify(claims));
  return claims;
}

export function logout() {
  const token = localStorage.getItem('vs_admin_token');
  if (token) {
    try {
      void Promise.resolve(
        fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          keepalive: true,
        })
      ).catch(() => {});
    } catch {
      // Best-effort revocation must never block local logout
    }
  }
  localStorage.removeItem('vs_admin_token');
  localStorage.removeItem('vs_admin_claims');
  window.location.href = '/login';
}
