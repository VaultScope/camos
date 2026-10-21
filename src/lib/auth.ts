import type { AuthClaims } from './types';

const API_BASE =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'vaultscope.de' ||
    window.location.hostname.endsWith('.vaultscope.de'))
    ? '/api'
    : import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function getStoredClaims(): AuthClaims | null {
  const raw = localStorage.getItem('vs_admin_claims');
  if (!raw) return null;
  try {
    const claims: AuthClaims = JSON.parse(raw);
    if (claims.exp * 1000 < Date.now()) {
      logout();
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getStoredClaims() !== null;
}

export function hasPermission(permission: string): boolean {
  const claims = getStoredClaims();
  if (!claims) return false;
  const permissions: string[] = claims.permissions || [];
  if (permissions.includes('*') || claims.role === 'Owner') return true;
  return permissions.includes(permission);
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
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Login failed');
  }

  const data = await res.json();
  if (data.mfa_required) {
    const mfaErr: any = new Error('MFA_REQUIRED');
    mfaErr.mfaRequired = true;
    throw mfaErr;
  }

  const { token, claims } = data;
  localStorage.setItem('vs_admin_token', token);
  localStorage.setItem('vs_admin_claims', JSON.stringify(claims));
  return claims;
}

export async function devLogin(persona: string = 'admin1'): Promise<AuthClaims> {
  const res = await fetch(`${API_BASE}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ persona }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Dev login failed');
  }

  const { token, claims } = await res.json();
  localStorage.setItem('vs_admin_token', token);
  localStorage.setItem('vs_admin_claims', JSON.stringify(claims));
  return claims;
}

export function logout() {
  localStorage.removeItem('vs_admin_token');
  localStorage.removeItem('vs_admin_claims');
  window.location.href = '/login';
}
