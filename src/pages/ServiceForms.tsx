import { useState } from 'react';
import { Page } from '../components/Layout';
import { Plus, Settings, Trash2, Edit2, X, GripVertical, Check } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';

export default function ServiceForms() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const [searchQuery, setSearchQuery] = useState('');

  const { data: forms, refetch } = useApi<any[]>('/admin/service-forms');

  const [currentForm, setCurrentForm] = useState({
    id: '',
    name: '',
    description: '',
    fields: [] as any[]
  });

  const filteredForms = (forms || []).filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setCurrentForm({ id: `f_${Date.now()}`, name: '', description: '', fields: [] });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (form: any) => {
    setCurrentForm(JSON.parse(JSON.stringify(form)));
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAddField = () => {
    setCurrentForm({
      ...currentForm,
      fields: [
        ...currentForm.fields,
        { id: `f_${Date.now()}_${Math.random()}`, label: '', variable: '', type: 'text', required: true, options: '' }
      ]
    });
  };

  const handleUpdateField = (id: string, key: string, value: any) => {
    setCurrentForm({
      ...currentForm,
      fields: currentForm.fields.map(f => f.id === id ? { ...f, [key]: value } : f)
    });
  };

  const handleRemoveField = (id: string) => {
    setCurrentForm({
      ...currentForm,
      fields: currentForm.fields.filter(f => f.id !== id)
    });
  };

  const handleSaveForm = async () => {
    try {
      const payload = {
        name: currentForm.name,
        description: currentForm.description,
        fields: currentForm.fields
      };
      if (modalMode === 'create') {
        await api.post('/admin/service-forms', payload);
      } else {
        await api.put(`/admin/service-forms/${currentForm.id}`, payload);
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + JSON.stringify(err.message || err));
    }
  };

  const handleDeleteForm = async (id: string) => {
    try {
      await api.delete(`/admin/service-forms/${id}`);
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to delete service form');
    }
  };

  return (
    <Page title="Service Forms & Variables" requiredPermission="forms.manage">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-border pb-5">
        <p className="text-sm text-muted-foreground">Build custom forms and configuration options shown to customers during checkout.</p>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Form
        </button>
      </div>

      <div className="mb-6 bg-card border border-border rounded-2xl p-3 shadow-xs">
        <input
          type="text"
          placeholder="Search forms..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
        />
      </div>

      <div className="grid gap-5">
        {filteredForms.map((form) => (
          <div key={form.id} className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="p-4 sm:px-5 border-b border-border bg-foreground/[0.025] flex justify-between items-start gap-3">
              <div className="min-w-0">
                <h3 className="font-medium text-base flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground shrink-0" /> {form.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEditModal(form)} className="text-xs rounded-xl border border-border p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer" title="Edit Form">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onDoubleClick={() => handleDeleteForm(form.id)} className="text-xs rounded-xl border border-red-500/30 text-red-500 p-1.5 hover:bg-red-500/10 transition-colors cursor-pointer" title="Double-click to delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="px-4 py-2.5 bg-foreground/[0.03] text-xs font-medium uppercase tracking-wider grid grid-cols-12 gap-4 text-muted-foreground">
                  <div className="col-span-3">Label</div>
                  <div className="col-span-3">Variable Key</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-1">Req</div>
                  <div className="col-span-3">Options</div>
                </div>
                <div className="divide-y divide-border">
                  {form.fields.map((field: any) => (
                    <div key={field.id} className="px-4 py-3 text-sm grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3 font-medium">{field.label}</div>
                      <div className="col-span-3 font-mono text-xs text-muted-foreground">{field.variable}</div>
                      <div className="col-span-2">
                        <span className="px-2.5 py-0.5 rounded-full border border-border bg-foreground/[0.03] text-xs">{field.type}</span>
                      </div>
                      <div className="col-span-1">
                        {field.required ? <Check className="w-4 h-4 text-green-500" /> : <span className="text-muted-foreground">-</span>}
                      </div>
                      <div className="col-span-3 text-xs text-muted-foreground truncate" title={field.options}>
                        {field.options || '-'}
                      </div>
                    </div>
                  ))}
                  {form.fields.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">No fields configured.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredForms.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm rounded-2xl border border-border bg-card">
            No forms match your search.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-ui-fade">
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-5 sm:p-6 w-full max-w-4xl max-h-[90dvh] overflow-y-auto animate-ui-scale">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Settings className="w-5 h-5 text-muted-foreground" /> {modalMode === 'create' ? 'Create Service Form' : 'Edit Service Form'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1.5">Form Name</label>
                  <input
                    type="text"
                    value={currentForm.name}
                    onChange={e => setCurrentForm({ ...currentForm, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                    placeholder="e.g. VPS Checkout Options"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1.5">Description</label>
                  <input
                    type="text"
                    value={currentForm.description}
                    onChange={e => setCurrentForm({ ...currentForm, description: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                    placeholder="Short description..."
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-medium text-muted-foreground uppercase">Form Fields</label>
                  <button onClick={handleAddField} className="text-xs flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 hover:bg-foreground/5 transition-colors cursor-pointer">
                    <Plus className="w-3 h-3" /> Add Field
                  </button>
                </div>

                <div className="rounded-xl border border-border divide-y divide-border overflow-x-auto">
                  <div className="p-3 bg-foreground/[0.03] text-xs font-medium uppercase tracking-wider grid grid-cols-12 gap-3 text-muted-foreground min-w-[700px]">
                    <div className="col-span-1"></div>
                    <div className="col-span-3">Display Label</div>
                    <div className="col-span-2">Variable Key</div>
                    <div className="col-span-2">Input Type</div>
                    <div className="col-span-3">Options (Comma separated)</div>
                    <div className="col-span-1 text-center">Req</div>
                  </div>
                  {currentForm.fields.map((field, index) => (
                    <div key={field.id} className="p-3 grid grid-cols-12 gap-3 items-start bg-background min-w-[700px]">
                      <div className="col-span-1 flex flex-col items-center gap-2 pt-2 text-muted-foreground">
                        <GripVertical className="w-4 h-4 cursor-grab" />
                        <span className="text-xs">{index + 1}</span>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={field.label}
                          onChange={e => handleUpdateField(field.id, 'label', e.target.value)}
                          className="w-full rounded-lg border border-border bg-transparent p-1.5 text-sm focus:outline-none focus:border-foreground"
                          placeholder="e.g. Operating System"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={field.variable}
                          onChange={e => handleUpdateField(field.id, 'variable', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                          className="w-full rounded-lg border border-border bg-transparent p-1.5 text-sm focus:outline-none focus:border-foreground font-mono"
                          placeholder="os_image"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={field.type}
                          onChange={e => handleUpdateField(field.id, 'type', e.target.value)}
                          className="w-full rounded-lg border border-border bg-background p-1.5 text-sm focus:outline-none focus:border-foreground"
                        >
                          <option value="text">Text Input</option>
                          <option value="password">Password Input</option>
                          <option value="number">Number</option>
                          <option value="select">Dropdown Select</option>
                          <option value="ssh_key_selector">SSH Key Selector</option>
                          <option value="checkbox">Checkbox (Boolean)</option>
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={field.options}
                          onChange={e => handleUpdateField(field.id, 'options', e.target.value)}
                          disabled={field.type !== 'select'}
                          className="w-full rounded-lg border border-border bg-transparent p-1.5 text-sm focus:outline-none focus:border-foreground disabled:opacity-30"
                          placeholder="Ubuntu, Debian, Fedora"
                        />
                      </div>
                      <div className="col-span-1 flex flex-col items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={e => handleUpdateField(field.id, 'required', e.target.checked)}
                          className="accent-foreground w-4 h-4 cursor-pointer rounded"
                        />
                        <button onClick={() => handleRemoveField(field.id)} className="text-red-500 hover:text-red-400 mt-1 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {currentForm.fields.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Click "Add Field" to start building this form.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleSaveForm}
                disabled={!currentForm.name}
                className="px-4 py-2 rounded-xl text-sm bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {modalMode === 'create' ? 'Save Form' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
