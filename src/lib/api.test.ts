import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiClient (CAMOS)', () => {
  let api: any;

  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    mockFetch.mockReset();
    const module = await import('./api');
    api = module.api;
  });

  describe('GET requests', () => {
    it('sends GET to correct API path', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve([{ id: '1' }]),
      });

      const result = await api.get('/admin/services');
      expect(result).toEqual([{ id: '1' }]);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/services'),
        expect.objectContaining({ credentials: 'include' })
      );
    });

    it('attaches admin token when present', async () => {
      localStorage.setItem('vs_admin_token', 'admin-jwt');
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.get('/admin/dashboard/stats');
      const call = mockFetch.mock.calls[0];
      expect(call[1].headers['Authorization']).toBe('Bearer admin-jwt');
    });

    it('omits Authorization when no admin token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await api.get('/admin/dashboard/stats');
      const call = mockFetch.mock.calls[0];
      expect(call[1].headers['Authorization']).toBeUndefined();
    });
  });

  describe('mutations (POST/PUT/DELETE)', () => {
    it('fetches CSRF token before POST', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: 'csrf-admin-123' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'new-service' }),
        });

      await api.post('/admin/services', { customer_id: 'c1', product_id: 'p1', price: 9.99 });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      const csrfCall = mockFetch.mock.calls[0];
      expect(csrfCall[0]).toContain('/csrf');
      const postCall = mockFetch.mock.calls[1];
      expect(postCall[1].method).toBe('POST');
      expect(postCall[1].headers['x-csrf-token']).toBe('csrf-admin-123');
    });

    it('reuses cached CSRF token on subsequent mutations', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ token: 'csrf-cached' }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ok: true }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ok: true }) });

      await api.post('/admin/services/abc/suspend', {});
      await api.delete('/admin/invoices/xyz');

      expect(mockFetch).toHaveBeenCalledTimes(3);
      const deleteCall = mockFetch.mock.calls[2];
      expect(deleteCall[1].headers['x-csrf-token']).toBe('csrf-cached');
    });

    it('PUT sends body with CSRF', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ token: 'csrf-put' }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ok: true }) });

      await api.put('/admin/settings', [{ key: 'k', value: 'v' }]);
      const putCall = mockFetch.mock.calls[1];
      expect(putCall[1].method).toBe('PUT');
      expect(JSON.parse(putCall[1].body)).toEqual([{ key: 'k', value: 'v' }]);
    });
  });

  describe('error handling', () => {
    it('throws with error from response body', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ error: 'Insufficient permissions' }),
      });

      await expect(api.get('/admin/staff')).rejects.toThrow('Insufficient permissions');
    });

    it('redirects to /login and clears tokens on 401', async () => {
      localStorage.setItem('vs_admin_token', 'expired');
      localStorage.setItem('vs_admin_claims', '{}');

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      await expect(api.get('/admin/services')).rejects.toThrow('Unauthorized');
      expect(localStorage.getItem('vs_admin_token')).toBeNull();
      expect(localStorage.getItem('vs_admin_claims')).toBeNull();
    });

    it('handles non-JSON error responses gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: () => Promise.reject(new Error('not json')),
      });

      await expect(api.get('/admin/services')).rejects.toThrow('Bad Gateway');
    });
  });
});
