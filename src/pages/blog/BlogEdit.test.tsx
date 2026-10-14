import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BlogEdit from './BlogEdit';
import { api } from '../../lib/api';
import { ToastProvider } from '../../components/Toast';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

function renderComponent(initialRoute = '/blog/new') {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/blog/:id" element={<BlogEdit />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );
}

describe('BlogEdit - Markdown Editor with Live Preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.includes('/tags')) {
        return ['infrastructure', 'storage'];
      }
      return {};
    });
    vi.mocked(api.post).mockResolvedValue({});
    vi.mocked(api.put).mockResolvedValue({});
  });

  it('renders new post header and default template in editor', () => {
    renderComponent('/blog/new');
    expect(screen.getByText('Create Blog Article')).toBeDefined();
    expect(screen.getByText('MARKDOWN SOURCE')).toBeDefined();
    expect(screen.getByText('LIVE PREVIEW (WYSIWYG)')).toBeDefined();
  });

  it('auto-generates slug from title when slug is not manually edited', () => {
    renderComponent('/blog/new');
    const titleInput = screen.getByPlaceholderText(/Designing Native IPv6 Infrastructure/i);
    fireEvent.change(titleInput, { target: { value: 'Scaling Ceph Storage Clusters' } });

    const slugInput = screen.getByPlaceholderText('article-slug') as HTMLInputElement;
    expect(slugInput.value).toBe('scaling-ceph-storage-clusters');
  });

  it('allows toggling view modes between Split, Write, and Preview', () => {
    renderComponent('/blog/new');
    
    // Default is split (both visible)
    expect(screen.getByText('MARKDOWN SOURCE')).toBeDefined();
    expect(screen.getByText('LIVE PREVIEW (WYSIWYG)')).toBeDefined();

    // Click Write (edit only)
    const writeBtn = screen.getByRole('button', { name: /^Write/i });
    fireEvent.click(writeBtn);
    expect(screen.getByText('MARKDOWN SOURCE')).toBeDefined();
    expect(screen.queryByText('LIVE PREVIEW (WYSIWYG)')).toBeNull();

    // Click Preview (preview only)
    const previewBtn = screen.getByRole('button', { name: /^Preview/i });
    fireEvent.click(previewBtn);
    expect(screen.queryByText('MARKDOWN SOURCE')).toBeNull();
    expect(screen.getByText('LIVE PREVIEW (WYSIWYG)')).toBeDefined();

    // Switch back to Split
    const splitBtn = screen.getByRole('button', { name: /^Split/i });
    fireEvent.click(splitBtn);
    expect(screen.getByText('MARKDOWN SOURCE')).toBeDefined();
    expect(screen.getByText('LIVE PREVIEW (WYSIWYG)')).toBeDefined();
  });

  it('renders live markdown preview updating in real-time', () => {
    renderComponent('/blog/new');
    const textarea = screen.getByPlaceholderText(/Write your article in Markdown here.../i);

    fireEvent.change(textarea, { target: { value: '## Real-time Benchmark\n\nHigh throughput verified.' } });

    expect(screen.getByText('Real-time Benchmark')).toBeDefined();
    expect(screen.getByText('High throughput verified.')).toBeDefined();
  });

  it('saves new post via api.post when publishing', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ id: '123' });

    renderComponent('/blog/new');
    const titleInput = screen.getByPlaceholderText(/Designing Native IPv6 Infrastructure/i);
    fireEvent.change(titleInput, { target: { value: 'Zero-Trust Bastion Deployment' } });

    const publishBtn = screen.getByRole('button', { name: /Publish Article/i });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/admin/blog', expect.objectContaining({
        title: 'Zero-Trust Bastion Deployment',
        slug: 'zero-trust-bastion-deployment',
        status: 'published',
      }));
    });
  });

  it('loads existing post when editing', async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.includes('/tags')) return ['infrastructure'];
      if (url.includes('/admin/blog/post-1')) {
        return {
          id: 'post-1',
          title: 'Existing Architecture Post',
          slug: 'existing-post',
          excerpt: 'Existing excerpt description',
          image_url: 'https://example.com/hero.jpg',
          content: '### Section 1\n\nContent here.',
          status: 'published',
          tags: ['infrastructure'],
        };
      }
      return {};
    });

    renderComponent('/blog/post-1');

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/blog/post-1');
      expect(screen.getByDisplayValue('Existing Architecture Post')).toBeDefined();
      expect(screen.getByDisplayValue('existing-post')).toBeDefined();
      expect(screen.getByText('Section 1')).toBeDefined();
    });
  });
});
