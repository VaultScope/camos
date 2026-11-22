import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar, Page, MobileNavProvider } from './Layout';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Layout Components', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Sidebar', () => {
    it('renders navigation links', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar />
        </MemoryRouter>
      );

      // Main sections
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
      expect(screen.getByText('Infrastructure')).toBeInTheDocument();

      // Some specific links
      expect(screen.getByText('Accounts')).toBeInTheDocument();
      expect(screen.getAllByText('Billing').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Services').length).toBeGreaterThan(0);
    });

    it('fails closed on missing claims role instead of defaulting to Owner', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar />
        </MemoryRouter>
      );

      expect(screen.queryByText('Owner')).not.toBeInTheDocument();
      expect(screen.getByText('No Role')).toBeInTheDocument();
    });

    it('filters sidebar links by stored permissions when claims are present', () => {
      localStorage.setItem('vs_admin_token', 'jwt-support');
      localStorage.setItem('vs_admin_claims', JSON.stringify({
        sub: 'staff-2',
        email: 'support@vaultscope.de',
        role: 'Support',
        audience: 'admin',
        permissions: ['tickets.view', 'customers.view'],
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      }));

      render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar />
        </MemoryRouter>
      );

      expect(screen.getByText('Accounts')).toBeInTheDocument();
      expect(screen.getByText('Support Tickets')).toBeInTheDocument();
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
      expect(screen.queryByText('Tax Rates')).not.toBeInTheDocument();
    });
  });

  describe('Page', () => {
    it('renders title and children', () => {
      render(
        <Page title="Test Title">
          <div data-testid="page-content">Test Content</div>
        </Page>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByTestId('page-content')).toBeInTheDocument();
    });

    it('opens and closes mobile navigation drawer via TopNav button', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <MobileNavProvider>
            <Sidebar />
            <Page title="Responsive View">
              <div>Body</div>
            </Page>
          </MobileNavProvider>
        </MemoryRouter>
      );

      const nav = screen.getByLabelText('Primary navigation');
      expect(nav.className).toContain('-translate-x-full');

      fireEvent.click(screen.getByLabelText('Open navigation menu'));
      expect(nav.className).toContain('translate-x-0');

      fireEvent.click(screen.getByLabelText('Close navigation menu'));
      expect(nav.className).toContain('-translate-x-full');
    });
  });
});
