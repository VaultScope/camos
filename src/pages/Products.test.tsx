import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { mockProduct } from '../test/utils';
import { HETZNER_CLOUD_PRESETS, SFTP_STORAGE_PRESETS, DEDICATED_PRESETS } from './Products';

vi.mock('../lib/hooks', () => ({ useApi: vi.fn() }));
vi.mock('../lib/auth', () => ({
  getStoredClaims: () => ({ sub: 's1', email: 'a@vs.de', role: 'admin' }),
  isAuthenticated: () => true, logout: vi.fn(), hasPermission: () => true,
}));

import { useApi } from '../lib/hooks';
const mockUseApi = vi.mocked(useApi);

describe('Products', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() });
  });

  it('renders page title', async () => {
    const Products = (await import('./Products')).default;
    render(<MemoryRouter><Products /></MemoryRouter>);
    expect(screen.getByText(/Products & Margin Tracking/)).toBeDefined();
  });

  it('renders products after load', async () => {
    mockUseApi.mockReturnValue({ data: [mockProduct], loading: false, error: null, refetch: vi.fn() });
    const Products = (await import('./Products')).default;
    render(<MemoryRouter><Products /></MemoryRouter>);
    expect(screen.getByText('VPS Pro')).toBeDefined();
  });

  it('has valid provider presets defined', () => {
    expect(HETZNER_CLOUD_PRESETS.length).toBeGreaterThan(0);
    expect(HETZNER_CLOUD_PRESETS[0].specs.cpu).toBeDefined();

    expect(SFTP_STORAGE_PRESETS.length).toBeGreaterThan(0);
    expect(SFTP_STORAGE_PRESETS[0].specs.storage_gb).toBeDefined();
    // Verify storage preset has no CPU/cores specs
    expect(SFTP_STORAGE_PRESETS[0].specs.cpu).toBeUndefined();

    expect(DEDICATED_PRESETS.length).toBeGreaterThan(0);
    expect(DEDICATED_PRESETS[0].specs.ram).toContain('RAM');
  });

  it('renders new plan wizard with provider-tailored steps', async () => {
    const Products = (await import('./Products')).default;
    render(
      <MemoryRouter initialEntries={['/new']}>
        <Products />
      </MemoryRouter>
    );

    expect(screen.getByText(/Add New Retail Plan/i)).toBeDefined();
    expect(screen.getByText(/Basics/i)).toBeDefined();
    expect(screen.getByText(/Specifications/i)).toBeDefined();
    expect(screen.getAllByText(/Pricing/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Review/i)).toBeDefined();
    expect(screen.getByText(/Quick Preset Template/i)).toBeDefined();
  });
});
