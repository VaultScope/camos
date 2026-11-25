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

export function hasPermission(permission: string): boolean {
  if (!isAuthenticated()) return false;
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
