import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { mockService } from '../test/utils';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('ServiceDetail', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() });
  });

  it('renders loading state', async () => {
    const ServiceDetail = (await import('./ServiceDetail')).default;
    render(
      <MemoryRouter initialEntries={['/services/svc-1']}>
        <Routes>
          <Route path="/services/:id" element={<ServiceDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading service/)).toBeDefined();
  });

  it('renders service details after load', async () => {
    mockUseApi.mockReturnValue({ data: mockService, loading: false, error: null, refetch: vi.fn() });
    const ServiceDetail = (await import('./ServiceDetail')).default;
    render(
      <MemoryRouter initialEntries={['/services/svc-1']}>
        <Routes>
          <Route path="/services/:id" element={<ServiceDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Test VPS')).toBeDefined();
    expect(screen.getByText('running')).toBeDefined();
  });

  it('renders error state', async () => {
    mockUseApi.mockReturnValue({ data: null, loading: false, error: 'Not found', refetch: vi.fn() });
    const ServiceDetail = (await import('./ServiceDetail')).default;
    render(
      <MemoryRouter initialEntries={['/services/svc-1']}>
        <Routes>
          <Route path="/services/:id" element={<ServiceDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Failed to load service/)).toBeDefined();
  });
});
