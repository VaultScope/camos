import { useState } from 'react';
import { Page } from '../components/Layout';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import { isSafeHttpUrl } from '../lib/url';
import { useToast } from '../components/Toast';
import type { InternalTool } from '../lib/types';

export default function InternalTools() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newTool, setNewTool] = useState({
    name: '', url: '', required_permission: ''
  });

  const { data: tools, loading, error, refetch } = useApi<InternalTool[]>('/admin/internal-tools');
  const toast = useToast();

  const openCreateModal = () => {
    setNewTool({ name: '', url: '', required_permission: '' });
    setModalMode('create');
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tool: InternalTool) => {
    setNewTool({
      name: tool.name,
      url: tool.url,
      required_permission: tool.required_permission
    });
    setModalMode('edit');
    setEditingId(tool.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;
    try {
      await api.delete(`/admin/internal-tools/${id}`);
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to delete tool');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = newTool.url.trim();
    if (!isSafeHttpUrl(trimmedUrl)) {
      toast.error('Invalid URL. Only http:// and https:// URLs are allowed.');
      return;
    }
    const payload = {
      name: newTool.name.trim(),
      url: trimmedUrl,
      required_permission: newTool.required_permission.trim(),
    };
    try {
      if (modalMode === 'create') {
        await api.post('/admin/internal-tools', payload);
      } else if (editingId) {
        await api.put(`/admin/internal-tools/${editingId}`, payload);
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save internal tool');
    }
  };

  return (
    <Page title="Internal Tools" requiredPermission="internal_tools.manage">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-semibold text-foreground">Internal Tools</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-foreground hover:bg-foreground/90 text-background px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Tool
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl mb-6 text-sm">{error}</div>}

      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading tools...</div>
        ) : tools?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No internal tools configured yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead className="bg-foreground/[0.03] border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">URL</th>
                  <th className="p-4 font-medium">Required Permission</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {tools?.map(tool => (
                  <tr key={tool.id} className="hover:bg-foreground/[0.025] transition-colors">
                    <td className="p-4 font-medium text-foreground">{tool.name}</td>
                    <td className="p-4 text-muted-foreground font-mono text-xs">{tool.url}</td>
                    <td className="p-4">
                      <span className="bg-foreground/5 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full text-xs font-mono">
                        {tool.required_permission}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(tool)}
                        className="p-1.5 text-muted-foreground hover:text-foreground border border-border hover:bg-foreground/5 rounded-xl transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tool.id)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 border border-red-500/30 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-ui-fade">
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto animate-ui-scale">
            <h2 className="text-lg font-semibold text-foreground mb-5">
              {modalMode === 'create' ? 'Add Internal Tool' : 'Edit Internal Tool'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1.5">Name</label>
                <input
                  required
                  type="text"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                  value={newTool.name}
                  onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1.5">URL</label>
                <input
                  required
                  type="url"
                  placeholder="https://grafana.vaultscope.de"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                  value={newTool.url}
                  onChange={(e) => setNewTool({...newTool, url: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1.5">Required Permission</label>
                <select
                  required
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                  value={newTool.required_permission}
                  onChange={(e) => setNewTool({...newTool, required_permission: e.target.value})}
                >
                  <option value="" disabled>Select permission</option>
                  <option value="admin.super">admin.super</option>
                  <option value="internal_tools.view">internal_tools.view</option>
                  <option value="internal_tools.manage">internal_tools.manage</option>
                  <option value="staff.manage">staff.manage</option>
                  <option value="customers.manage">customers.manage</option>
                  <option value="invoices.manage">invoices.manage</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-foreground hover:bg-foreground/90 text-background text-sm font-medium cursor-pointer"
                >
                  {modalMode === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Page>
  );
}
