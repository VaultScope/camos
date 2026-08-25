import type { AuthClaims } from './types';

const AUTHENTIK_URL = import.meta.env.VITE_AUTHENTIK_URL || 'https://auth.vaultscope.de';
const CLIENT_ID = import.meta.env.VITE_OIDC_CLIENT_ID || 'vaultscope-admin';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const REDIRECT_URI = import.meta.env.VITE_OIDC_REDIRECT_URI || `${window.location.origin}/auth/callback`;

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

export function getToken(): string | null {
  if (!isAuthenticated()) return null;
  return localStorage.getItem('vs_admin_token');
}

export function redirectToLogin() {
  const state = crypto.randomUUID();
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
  const savedState = sessionStorage.getItem('oidc_state');
  if (state !== savedState) {
    throw new Error('Invalid state parameter');
  }
  sessionStorage.removeItem('oidc_state');

  const res = await fetch(`${API_BASE}/auth/callback/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
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
