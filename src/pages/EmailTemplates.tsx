import { useState } from 'react';
import { Page } from '../components/Layout';
import { ArrowLeft, Eye, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import type { EmailTemplate } from '../lib/types';

const categoryLabels: Record<string, string> = {
  billing: 'Billing',
  tickets: 'Tickets',
  services: 'Services',
  account: 'Account',
  system: 'System',
};

export default function EmailTemplatesPage() {
  const { data: templates, loading, error, refetch } = useApi<EmailTemplate[]>('/admin/email-templates');
  const [editing, setEditing] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const items = templates || [];

  const startEdit = (t: EmailTemplate) => {
    setEditing(t.id);
    setEditSubject(t.subject);
    setEditBody(t.body);
    setPreviewing(false);
  };

  const handleSave = async () => {
    if (!editing) return;
    await api.put(`/admin/email-templates/${editing}`, { subject: editSubject, body: editBody });
    setSaved(true);
    refetch();
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleEnabled = async (t: EmailTemplate) => {
    await api.put(`/admin/email-templates/${t.id}`, { enabled: !t.enabled });
    refetch();
  };

  const currentTemplate = items.find(t => t.id === editing);
  const filtered = filterCategory === 'all' ? items : items.filter(t => t.category === filterCategory);
  const grouped = Object.entries(categoryLabels).map(([key, label]) => ({
    key,
    label,
    items: filtered.filter(t => t.category === key),
  })).filter(g => g.items.length > 0);

  if (editing && currentTemplate) {
    return (
      <Page title="Email Templates">
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to templates
        </button>

        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium">{currentTemplate.name}</h3>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{categoryLabels[currentTemplate.category] || currentTemplate.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewing(!previewing)}
                className={`flex items-center gap-2 px-3 py-2 text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer ${previewing ? 'bg-foreground/5' : ''}`}
              >
                <Eye className="w-4 h-4" /> {previewing ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" /> {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          {previewing ? (
            <div className="border border-border bg-background">
              <div className="p-4 border-b border-border bg-foreground/5">
                <div className="text-xs text-muted-foreground uppercase mb-1">Subject</div>
                <div className="text-sm font-medium">{editSubject}</div>
              </div>
              <div className="p-6 text-sm whitespace-pre-wrap leading-relaxed">{editBody}</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Subject Line</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={e => setEditSubject(e.target.value)}
                  className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Body</label>
                <textarea
                  value={editBody}
                  onChange={e => setEditBody(e.target.value)}
                  rows={16}
                  className="w-full border border-border bg-transparent p-3 text-sm focus:outline-none focus:border-foreground font-mono leading-relaxed resize-y"
                />
              </div>
              {Array.isArray(currentTemplate.variables) && currentTemplate.variables.length > 0 && (
                <div className="border border-border p-4 bg-foreground/[0.02]">
                  <div className="text-xs font-medium text-muted-foreground uppercase mb-2">Template Variables</div>
                  <div className="flex flex-wrap gap-2">
                    {currentTemplate.variables.map(v => (
                      <code key={v} className="text-xs px-2 py-1 border border-border bg-background font-mono">{`{{${v}}}`}</code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Page>
    );
  }

  return (
    <Page title="Email Templates">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">Manage transactional email templates sent to customers.</p>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
        >
          <option value="all">All Categories</option>
          {Object.entries(categoryLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading templates...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load templates: {error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="p-8 text-center text-muted-foreground text-sm border border-border bg-background">
          No email templates configured. Seed the database with templates to get started.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.key}>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{group.label}</h3>
              <div className="border border-border bg-background divide-y divide-border">
                {group.items.map(t => (
                  <div key={t.id} className="flex items-center justify-between px-5 py-4 hover:bg-foreground/[0.02] transition-colors">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => startEdit(t)}>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${!t.enabled ? 'text-muted-foreground line-through' : ''}`}>{t.name}</span>
                        {!t.enabled && <span className="text-[10px] px-1.5 py-0.5 border border-border text-muted-foreground">Disabled</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-mono truncate">{t.subject}</div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[10px] text-muted-foreground">{t.updated_at?.split('T')[0]}</span>
                      <button onClick={() => toggleEnabled(t)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                        {t.enabled ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
