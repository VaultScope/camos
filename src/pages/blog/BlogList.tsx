import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';

export default function BlogList() {
  const [posts, setPosts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<any[]>('/admin/blog').then(setPosts).catch(console.error);
  }, []);

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      alert('Error deleting post');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <button
          onClick={() => navigate('/blog/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Plus size={16} /> New Post
        </button>
      </div>
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 font-medium text-muted-foreground">Title</th>
              <th className="p-4 font-medium text-muted-foreground">Status</th>
              <th className="p-4 font-medium text-muted-foreground">Published At</th>
              <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-4">{post.title}</td>
                <td className="p-4 capitalize">{post.status}</td>
                <td className="p-4 text-sm text-muted-foreground">
                  {post.published_at ? new Date(post.published_at).toLocaleString() : '—'}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => navigate(`/blog/${post.id}`)} className="p-2 hover:text-blue-500">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => deletePost(post.id)} className="p-2 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">No posts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
