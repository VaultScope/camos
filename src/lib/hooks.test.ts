import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from './hooks';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from './api';
const mockGet = vi.mocked(api.get);

describe('useApi', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('returns loading=true initially then data when resolved', async () => {
    mockGet.mockResolvedValue([{ id: '1', name: 'Service A' }]);

    const { result } = renderHook(() => useApi<any[]>('/admin/services'));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([{ id: '1', name: 'Service A' }]);
    expect(result.current.error).toBeNull();
  });

  it('sets error when request fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useApi<any[]>('/admin/services'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('refetch triggers a new request', async () => {
    mockGet
      .mockResolvedValueOnce([{ id: '1' }])
      .mockResolvedValueOnce([{ id: '1' }, { id: '2' }]);

    const { result } = renderHook(() => useApi<any[]>('/admin/services'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(1);

    result.current.refetch();

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('refetches when path changes', async () => {
    mockGet.mockResolvedValue({ id: '1', name: 'Item' });

    const { result, rerender } = renderHook(
      ({ path }) => useApi<any>(path),
      { initialProps: { path: '/admin/services/1' } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGet).toHaveBeenCalledWith('/admin/services/1');

    mockGet.mockResolvedValue({ id: '2', name: 'Other' });
    rerender({ path: '/admin/services/2' });

    await waitFor(() => expect(result.current.data?.id).toBe('2'));
    expect(mockGet).toHaveBeenCalledWith('/admin/services/2');
  });
});
