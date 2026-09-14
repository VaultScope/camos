import { useState } from 'react';
import { Page } from '../components/Layout';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import type { InternalTool } from '../lib/types';

export default function InternalTools() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newTool, setNewTool] = useState({
    name: '', url: '', required_permission: ''
  });

  const { data: tools, loading, error, refetch } = useApi<InternalTool[]>('/admin/internal-tools');

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
    try {
      if (modalMode === 'create') {
        await api.post('/admin/internal-tools', newTool);
      } else if (editingId) {
        await api.put(`/admin/internal-tools/${editingId}`, newTool);
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to save internal tool');
    }
  };

  return (
    <Page title="Internal Tools">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Internal Tools</h1>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4" />
          Add Tool
        </button>
      </div>

      {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading tools...</div>
        ) : tools?.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No internal tools configured yet.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="p-4 font-medium text-slate-300">Name</th>
                <th className="p-4 font-medium text-slate-300">URL</th>
                <th className="p-4 font-medium text-slate-300">Required Permission</th>
                <th className="p-4 font-medium text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tools?.map(tool => (
                <tr key={tool.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="p-4 text-slate-200">{tool.name}</td>
                  <td className="p-4 text-slate-400 font-mono text-sm">{tool.url}</td>
                  <td className="p-4">
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-medium">
                      {tool.required_permission}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => openEditModal(tool)} className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(tool.id)} className="p-1 text-red-400 hover:text-red-300 bg-slate-800 hover:bg-slate-700 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">
              {modalMode === 'create' ? 'Add Internal Tool' : 'Edit Internal Tool'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  value={newTool.name}
                  onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">URL</label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono text-sm"
                  value={newTool.url}
                  onChange={(e) => setNewTool({...newTool, url: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Required Permission</label>
                <select
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
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

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
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

