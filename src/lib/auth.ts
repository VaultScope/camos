import type { AuthClaims } from './types';

const AUTHENTIK_URL = import.meta.env.VITE_AUTHENTIK_URL || 'https://auth.vaultscope.de';
const CLIENT_ID = import.meta.env.VITE_OIDC_CLIENT_ID || 'vaultscope-admin';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const REDIRECT_URI = import.meta.env.VITE_OIDC_REDIRECT_URI || `/auth/callback`;

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

export async function redirectToLogin() {
  // SEC-001: Fetch state from backend for CSRF protection
  const res = await fetch(`${API_BASE}/auth/init-login`, {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Failed to initialize login');
  }

  const { state } = await res.json();

  // Store state for callback verification
  sessionStorage.setItem('oidc_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'openid profile email',
    state,
  });

  window.location.href = `${AUTHENTIK_URL}/application/o/authorize/?${params}`;
}

export async function handleCallback(code: string, state: string): Promise<AuthClaims> {
  // Client-side validation (defense in depth)
  const savedState = sessionStorage.getItem('oidc_state');
  if (state !== savedState) {
    throw new Error('Invalid state parameter');
  }
  sessionStorage.removeItem('oidc_state');

  // SEC-001: Send state to backend for validation
  const res = await fetch(`${API_BASE}/auth/callback/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirect_uri: REDIRECT_URI, state }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Authentication failed');
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
