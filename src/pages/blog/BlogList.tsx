import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ExternalLink, 
  Calendar, 
  FileText,
  Clock
} from 'lucide-react';
import { Page } from '../../components/Layout';
import { api } from '../../lib/api';

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image_url?: string;
  content: string;
  tags?: string[];
  author_id: string;
  author_name?: string;
  author_username?: string;
  status: 'draft' | 'published';
  published_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const navigate = useNavigate();

  const fetchPosts = () => {
    setLoading(true);
    api.get<BlogPostItem[]>('/admin/blog')
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Error deleting post');
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(q)) ||
        (post.author_name && post.author_name.toLowerCase().includes(q)) ||
        (post.author_username && post.author_username.toLowerCase().includes(q)) ||
        (Array.isArray(post.tags) && post.tags.some(t => t.toLowerCase().includes(q)));

      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [posts, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;
    return { total, published, drafts };
  }, [posts]);

  return (
    <Page title="Blog & Announcement Management">
      <div className="space-y-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Blog Articles</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage platform updates, customer guides, tutorials, and announcements.
            </p>
          </div>

          <button
            onClick={() => navigate('/blog/new')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </button>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border p-4 rounded-lg">
            <span className="text-xs font-mono uppercase text-muted-foreground block">Total Articles</span>
            <span className="text-2xl font-bold text-foreground mt-1 block">{stats.total}</span>
          </div>
          <div className="bg-card border border-border p-4 rounded-lg">
            <span className="text-xs font-mono uppercase text-green-500 block">Published</span>
            <span className="text-2xl font-bold text-foreground mt-1 block">{stats.published}</span>
          </div>
          <div className="bg-card border border-border p-4 rounded-lg">
            <span className="text-xs font-mono uppercase text-amber-500 block">Drafts</span>
            <span className="text-2xl font-bold text-foreground mt-1 block">{stats.drafts}</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, slug, tag, author..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(['all', 'published', 'draft'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-colors cursor-pointer border ${
                  statusFilter === st
                    ? 'bg-foreground text-background font-semibold border-foreground'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {st} {st !== 'all' ? `(${st === 'published' ? stats.published : stats.drafts})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Fully Responsive & Wide Data Table */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px] divide-y divide-border text-sm">
              <thead className="bg-muted/40 text-xs font-mono uppercase text-muted-foreground tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold min-w-[260px]">Article</th>
                  <th className="py-3.5 px-4 font-semibold min-w-[180px]">Slug & URL</th>
                  <th className="py-3.5 px-4 font-semibold min-w-[150px]">Author / User</th>
                  <th className="py-3.5 px-4 font-semibold min-w-[160px]">Tags</th>
                  <th className="py-3.5 px-4 font-semibold min-w-[110px]">Status</th>
                  <th className="py-3.5 px-4 font-semibold min-w-[140px]">Published Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right min-w-[110px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="w-5 h-5 animate-spin text-muted-foreground" />
                        <span>Loading articles...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                      <FileText className="w-8 h-8 opacity-40 mx-auto mb-2" />
                      {posts.length === 0 ? 'No articles created yet.' : 'No articles match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map(post => (
                    <tr 
                      key={post.id} 
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Title & Excerpt */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          {post.image_url ? (
                            <img
                              src={post.image_url}
                              alt=""
                              className="w-10 h-10 rounded-md object-cover border border-border shrink-0 mt-0.5"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-muted/60 border border-border flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span 
                              onClick={() => navigate(`/blog/${post.id}`)}
                              className="font-medium text-foreground hover:text-blue-500 cursor-pointer line-clamp-1 block transition-colors"
                            >
                              {post.title}
                            </span>
                            {post.excerpt && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {post.excerpt}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[140px]">/{post.slug}</span>
                          {post.status === 'published' && (
                            <a
                              href={`https://vaultscope.de/resources/blog/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Open on Storefront"
                              className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Author / Publish User */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {(post.author_name || post.author_username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <div className="font-medium text-foreground truncate">
                              {post.author_name || (post.author_username ? `@${post.author_username}` : 'Staff')}
                            </div>
                            {post.author_username && post.author_name && (
                              <div className="text-[10px] text-muted-foreground font-mono">
                                @{post.author_username}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
                          {post.tags && post.tags.length > 0 ? (
                            post.tags.map(t => (
                              <span 
                                key={t} 
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted/60 text-muted-foreground border border-border"
                              >
                                #{t}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground/60">—</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {post.status === 'published' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Published Date */}
                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {post.published_at ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                            <span>{new Date(post.published_at).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60">Not published</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/blog/${post.id}`)}
                            title="Edit Article"
                            className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePost(post.id, post.title)}
                            title="Delete Article"
                            className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Page>
  );
}
