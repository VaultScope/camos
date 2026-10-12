import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStoredClaims, isAuthenticated, getToken, hasPermission, logout, loginWithCredentials } from './auth';
import type { AuthClaims } from './types';

const validClaims: AuthClaims = {
  sub: '550e8400-e29b-41d4-a716-446655440000',
  email: 'admin@vaultscope.de',
  role: 'Owner',
  audience: 'admin',
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
  permissions: ['*'],
};

const staffClaims: AuthClaims = {
  ...validClaims,
  role: 'Support',
  permissions: ['tickets.view', 'tickets.manage', 'customers.view'],
};

const expiredClaims: AuthClaims = {
  ...validClaims,
  exp: Math.floor(Date.now() / 1000) - 3600,
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('getStoredClaims', () => {
  it('returns null when no claims stored', () => {
    expect(getStoredClaims()).toBeNull();
  });

  it('returns claims when valid and not expired', () => {
    localStorage.setItem('vs_admin_claims', JSON.stringify(validClaims));
    const result = getStoredClaims();
    expect(result).toEqual(validClaims);
  });

  it('returns null and clears storage when claims are expired', () => {
    localStorage.setItem('vs_admin_claims', JSON.stringify(expiredClaims));
    localStorage.setItem('vs_admin_token', 'some-token');
    const result = getStoredClaims();
    expect(result).toBeNull();
    expect(localStorage.getItem('vs_admin_token')).toBeNull();
  });

  it('returns null for corrupt JSON', () => {
    localStorage.setItem('vs_admin_claims', '{broken');
    expect(getStoredClaims()).toBeNull();
  });
});

describe('isAuthenticated', () => {
  it('returns false with no claims', () => {
    expect(isAuthenticated()).toBe(false);
  });

  it('returns true with valid claims', () => {
    localStorage.setItem('vs_admin_claims', JSON.stringify(validClaims));
    expect(isAuthenticated()).toBe(true);
  });
});

describe('hasPermission', () => {
  it('returns false when not authenticated', () => {
    expect(hasPermission('tickets.view')).toBe(false);
  });

  it('returns true for Owner role (wildcard)', () => {
    localStorage.setItem('vs_admin_claims', JSON.stringify(validClaims));
    expect(hasPermission('anything.here')).toBe(true);
  });

  it('returns true for matching permission', () => {
    localStorage.setItem('vs_admin_claims', JSON.stringify(staffClaims));
    expect(hasPermission('tickets.view')).toBe(true);
    expect(hasPermission('tickets.manage')).toBe(true);
  });

  it('returns false for non-matching permission', () => {
    localStorage.setItem('vs_admin_claims', JSON.stringify(staffClaims));
    expect(hasPermission('products.edit')).toBe(false);
    expect(hasPermission('staff.manage')).toBe(false);
  });
});

describe('getToken', () => {
  it('returns null when not authenticated', () => {
    expect(getToken()).toBeNull();
  });

  it('returns token when authenticated', () => {
    localStorage.setItem('vs_admin_claims', JSON.stringify(validClaims));
    localStorage.setItem('vs_admin_token', 'jwt-admin-token');
    expect(getToken()).toBe('jwt-admin-token');
  });
});

describe('logout', () => {
  it('clears admin tokens from storage', () => {
    localStorage.setItem('vs_admin_token', 'token');
    localStorage.setItem('vs_admin_claims', JSON.stringify(validClaims));
    logout();
    expect(localStorage.getItem('vs_admin_token')).toBeNull();
    expect(localStorage.getItem('vs_admin_claims')).toBeNull();
  });
});

describe('loginWithCredentials', () => {
  it('stores tokens on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'admin-jwt', claims: validClaims }),
    });

    const result = await loginWithCredentials('test@example.com', 'password');
    expect(result).toEqual(validClaims);
    expect(localStorage.getItem('vs_admin_token')).toBe('admin-jwt');
    expect(JSON.parse(localStorage.getItem('vs_admin_claims')!)).toEqual(validClaims);
    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      body: JSON.stringify({ email: 'test@example.com', password: 'password', audience: 'admin' }),
    }));
  });

  it('throws on API failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Login failed' }),
    });

    await expect(loginWithCredentials('bad@example.com', 'badpass')).rejects.toThrow('Login failed');
  });
});
