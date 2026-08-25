import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar, Page } from './Layout';
import { describe, it, expect, vi, beforeEach } from 'vitest';



describe('Layout Components', () => {
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
  });
});
