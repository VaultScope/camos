import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Columns2, 
  FileText, 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  ListTodo, 
  Quote, 
  Code, 
  SquareCode, 
  Link2, 
  Image as ImageIcon, 
  Table as TableIcon, 
  Minus, 
  Check, 
  Copy, 
  Sparkles, 
  Clock, 
  Calendar, 
  AlertCircle, 
  RefreshCw,
  Globe,
  HelpCircle,
  X,
  Tag,
  Upload
} from 'lucide-react';
import { marked } from 'marked';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';

// Configure marked for GitHub-flavored markdown
marked.setOptions({
  gfm: true,
  breaks: true,
});

const DEFAULT_MARKDOWN_TEMPLATE = `# Building Resilient Cloud Infrastructure

Write announcements, product updates, guides, or articles here using **Markdown**.

## Architecture Overview

VaultScope infrastructure leverages native European datacenters with automated provisioning, dual-stack IPv6 routing, and zero-trust security.

### Core Capabilities

- **Distributed Storage**: Ceph and ZFS backed NVMe pools with real-time audit hashing
- **Carrier Neutrality**: Multi-homed 100G uplinks connected to DE-CIX and Tier-1 transits
- **Zero Lock-In**: Direct POSIX compatibility and open standard API interfaces

\`\`\`bash
# Verify kernel network throughput
curl -sS https://vaultscope.de/api/health
\`\`\`

> "High-durability infrastructure should be predictable, resilient, and transparent."

| Specification | Target | Status |
| :--- | :--- | :--- |
| Uptime SLA | 99.99% | Verified |
| Storage Replication | 3x NVMe Mesh | Active |
| Failover Convergence | < 350ms | Automated |

- [x] Initial infrastructure provisioning
- [x] Kernel networking tuned
- [ ] Multi-region sync complete
`;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BlogEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [content, setContent] = useState(isNew ? DEFAULT_MARKDOWN_TEMPLATE : '');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch available tags for quick re-use
  useEffect(() => {
    api.get<string[]>('/admin/blog/tags')
      .then(t => setAvailableTags(Array.isArray(t) ? t : []))
      .catch(() => {});
  }, []);

  // Fetch post if editing existing post
  useEffect(() => {
    if (!isNew && id) {
      api.get<any>(`/admin/blog/${id}`)
        .then(post => {
          setTitle(post.title || '');
          setSlug(post.slug || '');
          setIsSlugManuallyEdited(true);
          setExcerpt(post.excerpt || '');
          setImageUrl(post.image_url || '');
          setStatus(post.status === 'published' ? 'published' : 'draft');
          setContent(post.content || '');
          setTags(Array.isArray(post.tags) ? post.tags : []);
        })
        .catch(err => {
          console.error(err);
          setErrorMsg('Failed to load blog post. It may have been removed.');
          toast.error('Failed to load blog post');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isNew]);

  // Tag management helpers
  const handleAddTag = (rawTag: string) => {
    const formatted = rawTag.toLowerCase().trim().replace(/[^\w-]/g, '');
    if (formatted && !tags.includes(formatted)) {
      setTags([...tags, formatted]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  // Handle title changes and auto-generate slug unless manually modified
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(newTitle));
    }
  };

  // Regeneration of slug from current title
  const handleRegenerateSlug = () => {
    const generated = slugify(title);
    setSlug(generated);
    setIsSlugManuallyEdited(false);
    toast.info('Slug regenerated from title');
  };

  // Copy article public URL
  const handleCopySlug = () => {
    const url = `https://vaultscope.de/resources/blog/${slug || 'untitled'}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  // Helper to insert markdown format at cursor or wrap current selection
  const insertFormat = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = content;
    const hasSelection = start !== end;
    const selectedText = currentVal.substring(start, end);

    let newContent = '';
    let newCursorStart = 0;
    let newCursorEnd = 0;

    if (hasSelection) {
      newContent = currentVal.substring(0, start) + prefix + selectedText + suffix + currentVal.substring(end);
      newCursorStart = start + prefix.length;
      newCursorEnd = newCursorStart + selectedText.length;
    } else {
      const placeholder = defaultText || 'text';
      newContent = currentVal.substring(0, start) + prefix + placeholder + suffix + currentVal.substring(end);
      newCursorStart = start + prefix.length;
      newCursorEnd = newCursorStart + placeholder.length;
    }

    setContent(newContent);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    }, 0);
  };

  // Helper to prepend markdown prefix to current line(s)
  const insertLinePrefix = (linePrefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentVal = content;

    // Find the beginning of the current line
    const lastNewline = currentVal.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const newContent = currentVal.substring(0, lineStart) + linePrefix + currentVal.substring(lineStart);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + linePrefix.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Insert code block
  const insertCodeBlock = () => {
    insertFormat('```typescript\n', '\n```', '// Your code here');
  };

  // Insert table
  const insertTable = () => {
    const tableTemplate = `\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Value 1 | Value 2 | Value 3 |\n| Value 4 | Value 5 | Value 6 |\n`;
    insertFormat('', tableTemplate, '');
  };

  // Insert link with prompt
  const insertLink = () => {
    const textarea = textareaRef.current;
    const selectedText = textarea ? content.substring(textarea.selectionStart, textarea.selectionEnd) : '';
    const linkText = window.prompt('Link title / anchor text:', selectedText || 'Link text');
    if (linkText === null) return;
    const url = window.prompt('Destination URL:', 'https://');
    if (url === null) return;
    insertFormat(`[${linkText || 'link'}](${url})`, '', '');
  };

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const editorFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingEditorImage, setUploadingEditorImage] = useState(false);

  const uploadImageFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subfolder', 'blog');
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('vs_admin_token') || '';

    const csrfRes = await fetch(`${apiBase}/csrf`, { credentials: 'include' }).then(r => r.json()).catch(() => ({}));
    const csrfToken = csrfRes?.token || '';

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (csrfToken) headers['x-csrf-token'] = csrfToken;

    const res = await fetch(`${apiBase}/admin/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Upload failed (${res.status})`);
    }

    const data = await res.json();
    return data.url;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadImageFile(file);
      setImageUrl(url);
      toast.success('Cover image uploaded and converted to WebP');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload cover image');
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  const handleEditorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEditorImage(true);
    try {
      const url = await uploadImageFile(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, ' ');
      insertFormat(`![${cleanName}](${url})`, '', '');
      toast.success('Image uploaded and inserted as WebP');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload editor image');
    } finally {
      setUploadingEditorImage(false);
      if (editorFileInputRef.current) editorFileInputRef.current.value = '';
    }
  };

  // Insert image: open file picker, with prompt fallback
  const insertImage = () => {
    editorFileInputRef.current?.click();
  };

  const insertImagePrompt = () => {
    const altText = window.prompt('Image description (Alt text):', 'Image description');
    if (altText === null) return;
    const url = window.prompt('Image URL (https://...):', 'https://');
    if (url === null) return;
    insertFormat(`![${altText || 'image'}](${url})`, '', '');
  };

  // Handle Tab key and common shortcuts inside the editor textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 2 spaces
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      insertFormat('**', '**', 'bold text');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      insertFormat('*', '*', 'italic text');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      insertLink();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const rawText = content.replace(/<[^>]+>/g, '').replace(/[#*_`~>[\]()|-]/g, ' ');
    const words = rawText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = content.length;
    const lineCount = content.split('\n').length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    return { wordCount, charCount, lineCount, readingTime };
  }, [content]);

  // Live parsed HTML preview
  const renderedHtml = useMemo(() => {
    if (!content.trim()) return '';
    try {
      return marked.parse(content) as string;
    } catch {
      return '<p class="text-red-500">Error parsing markdown.</p>';
    }
  }, [content]);

  // Save / Publish post
  const handleSave = async (explicitStatus?: 'draft' | 'published') => {
    const targetStatus = explicitStatus || status;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error('Please enter a post title');
      return;
    }

    const finalSlug = (slug.trim() || slugify(trimmedTitle)).toLowerCase();
    if (!finalSlug) {
      toast.error('Please provide a valid slug');
      return;
    }

    if (!content.trim()) {
      toast.error('Article content cannot be empty');
      return;
    }

    // Auto-generate clean excerpt if empty
    let finalExcerpt = excerpt.trim();
    if (!finalExcerpt) {
      const plainText = content
        .replace(/#+\s+/g, '')
        .replace(/[*_`~>[\]()|-]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
      finalExcerpt = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
    }

    setIsSaving(true);
    setErrorMsg(null);

    const payload = {
      title: trimmedTitle,
      slug: finalSlug,
      excerpt: finalExcerpt,
      image_url: imageUrl.trim() || null,
      content,
      status: targetStatus,
      tags,
    };

    try {
      if (isNew) {
        await api.post('/admin/blog', payload);
        toast.success(`Post created successfully as ${targetStatus}!`);
      } else {
        await api.put(`/admin/blog/${id}`, payload);
        toast.success(`Post updated successfully (${targetStatus})!`);
      }
      navigate('/blog');
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || 'Failed to save blog post. Please check all fields.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-muted-foreground space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm font-mono">Loading blog post details...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Link to="/blog" className="hover:text-foreground inline-flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Blog Posts</span>
            </Link>
            <span>/</span>
            <span className="text-foreground">{isNew ? 'New Post' : (title || 'Edit Post')}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {isNew ? 'Create Blog Article' : 'Edit Blog Article'}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
              status === 'published' 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              {status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* View Mode & Save Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-card border border-border rounded-lg p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'split' 
                  ? 'bg-foreground/10 text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Side-by-side Editor & Preview"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'edit' 
                  ? 'bg-foreground/10 text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Full width Markdown Editor"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'preview' 
                  ? 'bg-foreground/10 text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Full width Live Preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="px-3.5 py-1.5 text-xs border border-border text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('draft')}
            className="px-3.5 py-1.5 text-xs border border-border text-foreground hover:bg-muted/50 rounded-lg transition-colors font-medium flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('published')}
            className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{status === 'published' ? 'Update & Publish' : 'Publish Article'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Post Metadata Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Title */}
          <div className="lg:col-span-8 space-y-1.5">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Article Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="e.g., Designing Native IPv6 Infrastructure for Low-Latency Cloud"
              className="w-full bg-background border border-border px-3.5 py-2.5 rounded-lg text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Status selector */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Publication Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full bg-background border border-border px-3.5 py-2.5 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="draft">Draft (Private, not listed)</option>
              <option value="published">Published (Visible on storefront)</option>
            </select>
          </div>
        </div>

        {/* Slug Bar & Excerpt */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Slug */}
          <div className="lg:col-span-6 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                URL Slug <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  title="Regenerate slug from current title"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Slug</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySlug}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  title="Copy full URL"
                >
                  {copiedSlug ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSlug ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary">
              <span className="px-3 py-2 text-xs font-mono text-muted-foreground bg-muted/40 border-r border-border select-none">
                /resources/blog/
              </span>
              <input
                type="text"
                value={slug}
                onChange={e => {
                  setSlug(e.target.value);
                  setIsSlugManuallyEdited(true);
                }}
                placeholder="article-slug"
                className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Hero Image URL */}
          <div className="lg:col-span-6 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Cover Image <span className="text-muted-foreground font-normal">(Optional, WebP optimized)</span>
              </label>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://... or click Upload to select image"
                className="flex-1 bg-background border border-border px-3 py-2 rounded-lg text-xs font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={uploadingCover}
                className="flex items-center gap-1.5 px-3 py-2 border border-border bg-foreground/5 hover:bg-foreground/10 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title="Upload image file (will be compressed to WebP)"
              >
                <Upload className={`w-3.5 h-3.5 ${uploadingCover ? 'animate-bounce' : ''}`} />
                <span>{uploadingCover ? 'Uploading...' : 'Upload Image'}</span>
              </button>
              {imageUrl && (
                <div className="w-10 h-8 rounded border border-border overflow-hidden shrink-0 bg-muted">
                  <img src={imageUrl} alt="Thumbnail preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Excerpt */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Excerpt / Summary <span className="text-muted-foreground font-normal">(Meta description & card overview)</span>
            </label>
            <span className="text-[11px] font-mono text-muted-foreground">
              {excerpt.length} / 240 chars
            </span>
          </div>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={2}
            placeholder="A concise executive summary of this post for search engines and social cards..."
            className="w-full bg-background border border-border px-3.5 py-2 rounded-lg text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
          />
        </div>

        {/* Tags Section */}
        <div className="space-y-2.5 pt-3 border-t border-border/60">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              <span>Article Tags</span>
              <span className="text-muted-foreground font-normal">(Custom tags or choose from existing)</span>
            </label>
            <span className="text-[11px] font-mono text-muted-foreground">
              {tags.length} active tags
            </span>
          </div>

          {/* Active Tag Chips */}
          <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-blue-500/10 text-blue-500 border border-blue-500/20 font-medium"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-500 hover:bg-red-500/10 rounded-full p-0.5 transition-colors cursor-pointer"
                  title={`Remove #${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {tags.length === 0 && (
              <span className="text-xs text-muted-foreground/60 italic font-mono">
                No tags added yet. Type below or select from existing tags.
              </span>
            )}
          </div>

          {/* Add Tag Input & Suggested Tags */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary max-w-sm">
              <span className="px-2.5 py-1.5 text-xs text-muted-foreground bg-muted/40 border-r border-border font-mono select-none">
                #
              </span>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="New tag (press Enter)..."
                className="px-2.5 py-1.5 text-xs bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none w-44 font-mono"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground font-medium border-l border-border transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Quick Re-use Suggestions */}
            {Array.isArray(availableTags) && availableTags.filter(t => !tags.includes(t)).length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-muted-foreground font-mono">Existing tags:</span>
                {availableTags.filter(t => !tags.includes(t)).slice(0, 10).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleAddTag(t)}
                    className="px-2 py-0.5 rounded-full text-[11px] font-mono border border-border bg-background hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30 text-muted-foreground transition-colors cursor-pointer flex items-center gap-1"
                    title={`Click to add #${t}`}
                  >
                    <span>+</span>
                    <span>#{t}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Markdown Toolbar */}
        <div className="border-b border-border bg-foreground/[0.02] p-2 flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1">
            {/* Headers */}
            <div className="flex items-center border-r border-border pr-1 mr-1 gap-0.5">
              <button
                type="button"
                onClick={() => insertLinePrefix('# ')}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground text-xs font-bold"
                title="Heading 1 (#)"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertLinePrefix('## ')}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground text-xs font-semibold"
                title="Heading 2 (##)"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertLinePrefix('### ')}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground text-xs"
                title="Heading 3 (###)"
              >
                <Heading3 className="w-4 h-4" />
              </button>
            </div>

            {/* Inline Formatting */}
            <div className="flex items-center border-r border-border pr-1 mr-1 gap-0.5">
              <button
                type="button"
                onClick={() => insertFormat('**', '**', 'bold text')}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('*', '*', 'italic text')}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('~~', '~~', 'strikethrough')}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground"
                title="Strikethrough (~~text~~)"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('`', '`', 'code')}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground"
                title="Inline Code (`code`)"
              >
                <Code className="w-4 h-4" />
              </button>
            </div>

            {/* Blocks & Lists */}
            <div className="flex items-center border-r border-border pr-1 mr-1 gap-0.5">
              <button
                type="button"
                onClick={() => insertLinePrefix('> ')}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground"
                title="Quote Block (>)"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={insertCodeBlock}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground"
                title="Fenced Code Block (```)"
              >
                <SquareCode className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertLinePrefix('- ')}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground"
                title="Bullet List (-)"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertLinePrefix('1. ')}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground"
                title="Numbered List (1.)"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertLinePrefix('- [ ] ')}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground"
                title="Task Checklist (- [ ])"
              >
                <ListTodo className="w-4 h-4" />
              </button>
            </div>

            {/* Inserts: Link, Image, Table, HR */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={insertLink}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground"
                title="Insert Link (Ctrl+K)"
              >
                <Link2 className="w-4 h-4" />
              </button>
              <input
                ref={editorFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleEditorImageUpload}
              />
              <button
                type="button"
                onClick={insertImage}
                disabled={uploadingEditorImage}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground relative"
                title="Upload & Insert Image (optimized to WebP)"
              >
                <ImageIcon className={`w-4 h-4 ${uploadingEditorImage ? 'animate-bounce text-primary' : ''}`} />
              </button>
              <button
                type="button"
                onClick={insertImagePrompt}
                className="p-1 rounded hover:bg-muted text-foreground/60 hover:text-foreground text-[10px] font-mono"
                title="Insert Image from External URL"
              >
                URL
              </button>
              <button
                type="button"
                onClick={insertTable}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground"
                title="Insert Table"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('\n---\n', '', '')}
                className="p-1.5 rounded hover:bg-muted text-foreground/80 hover:text-foreground"
                title="Horizontal Rule (---)"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Help & Cheat Sheet Toggle */}
          <button
            type="button"
            onClick={() => setShowCheatSheet(!showCheatSheet)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors font-mono"
            title="Toggle Markdown shortcuts reference"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Markdown Cheatsheet</span>
          </button>
        </div>

        {/* Optional Cheatsheet drawer */}
        {showCheatSheet && (
          <div className="bg-muted/30 border-b border-border p-3 text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
            <div><span className="text-foreground"># Heading 1</span></div>
            <div><span className="text-foreground">**bold**</span></div>
            <div><span className="text-foreground">[text](url)</span></div>
            <div><span className="text-foreground">- [ ] Task</span></div>
            <div><span className="text-foreground">## Heading 2</span></div>
            <div><span className="text-foreground">*italic*</span></div>
            <div><span className="text-foreground">![alt](url)</span></div>
            <div><span className="text-foreground">```code```</span></div>
          </div>
        )}

        {/* Workspace Body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border min-h-[580px]">
          {/* Editor Side */}
          {(viewMode === 'split' || viewMode === 'edit') && (
            <div className={`flex flex-col bg-background ${viewMode === 'edit' ? 'col-span-2' : ''}`}>
              <div className="px-4 py-2 bg-muted/20 border-b border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3 h-3" />
                  <span>MARKDOWN SOURCE</span>
                </span>
                <span>Tab inserts 2 spaces</span>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your article in Markdown here..."
                className="w-full flex-1 min-h-[520px] p-4 bg-transparent font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none select-text"
                spellCheck={false}
              />
            </div>
          )}

          {/* Live Preview Side */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div className={`flex flex-col bg-foreground/[0.01] ${viewMode === 'preview' ? 'col-span-2' : ''}`}>
              <div className="px-4 py-2 bg-muted/20 border-b border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />
                  <span>LIVE PREVIEW (WYSIWYG)</span>
                </span>
                <span>Matches Storefront View</span>
              </div>

              <div className="p-6 overflow-y-auto max-h-[700px] space-y-6">
                {/* Header Mock */}
                <header className="border-b border-border pb-6 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {tags.map(t => (
                      <span key={t} className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/10 text-blue-500 border border-blue-500/20 font-medium">
                        #{t}
                      </span>
                    ))}
                    <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" />
                      {metrics.readingTime} min read
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                    {title || 'Untitled Article'}
                  </h1>

                  {excerpt && (
                    <p className="text-sm text-foreground/70 font-light leading-relaxed">
                      {excerpt}
                    </p>
                  )}

                  {imageUrl && (
                    <div className="mt-4 w-full h-48 rounded-lg overflow-hidden border border-border">
                      <img src={imageUrl} alt={title || 'Cover'} className="w-full h-full object-cover" />
                    </div>
                  )}
                </header>

                {/* Rendered HTML */}
                {renderedHtml ? (
                  <div 
                    className="markdown-preview" 
                    dangerouslySetInnerHTML={{ __html: renderedHtml }} 
                  />
                ) : (
                  <div className="py-12 text-center text-muted-foreground font-mono text-xs">
                    Nothing to preview yet. Start typing markdown on the left.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Metrics Status Bar */}
        <div className="border-t border-border bg-foreground/[0.02] px-4 py-2.5 flex flex-wrap items-center justify-between text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{metrics.wordCount} words</span>
            <span>{metrics.charCount} chars</span>
            <span>{metrics.lineCount} lines</span>
            <span>~{metrics.readingTime} min read</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px]">
              <Globe className="w-3 h-3" />
              <span>/resources/blog/{slug || 'untitled'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
