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

  it('sanitizes XSS payloads in markdown preview', () => {
    const { container } = renderComponent('/blog/new');
    const textarea = screen.getByPlaceholderText(/Write your article in Markdown here.../i);

    fireEvent.change(textarea, {
      target: {
        value:
          '<script>alert(1)</script><img src="x" onerror="alert(1)">\n\n[Bad](javascript:alert(1)) [Good](https://vaultscope.de)',
      },
    });

    const preview = container.querySelector('.markdown-preview');
    expect(preview).not.toBeNull();
    expect(preview!.querySelector('script')).toBeNull();
    const img = preview!.querySelector('img');
    expect(img?.getAttribute('onerror')).toBeNull();
    const links = Array.from(preview!.querySelectorAll('a'));
    expect(links.some(a => (a.getAttribute('href') || '').toLowerCase().startsWith('javascript:'))).toBe(false);
    expect(links.some(a => a.getAttribute('href') === 'https://vaultscope.de')).toBe(true);
  });

  it('rejects unsafe URLs in insertLink, insertImagePrompt, and cover image field', async () => {
    renderComponent('/blog/new');
    const titleInput = screen.getByPlaceholderText(/Designing Native IPv6 Infrastructure/i);
    fireEvent.change(titleInput, { target: { value: 'Security Test' } });

    // Reject javascript: in insertLink
    const promptSpy = vi.spyOn(window, 'prompt')
      .mockReturnValueOnce('Click me')
      .mockReturnValueOnce('javascript:alert(1)');
    fireEvent.click(screen.getByTitle('Insert Link (Ctrl+K)'));
    const textarea = screen.getByPlaceholderText(/Write your article in Markdown here.../i) as HTMLTextAreaElement;
    expect(textarea.value).not.toContain('javascript:alert(1)');

    // Reject data: in insertImagePrompt
    promptSpy.mockReturnValueOnce('Alt').mockReturnValueOnce('data:text/html,<script>alert(1)</script>');
    fireEvent.click(screen.getByTitle('Insert Image from External URL'));
    expect(textarea.value).not.toContain('data:text/html');

    // Reject javascript: cover image URL from previewing and saving
    const coverInput = screen.getByPlaceholderText(/https:\/\/\.\.\. or click Upload/i);
    fireEvent.change(coverInput, { target: { value: 'javascript:alert(1)' } });
    expect(screen.queryByAltText('Thumbnail preview')).toBeNull();
    expect(screen.getByText(/Cover image URL must start with/i)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Publish Article/i }));
    await waitFor(() => {
      expect(api.post).not.toHaveBeenCalled();
    });
    promptSpy.mockRestore();
  });
});
