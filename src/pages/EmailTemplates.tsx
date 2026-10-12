import { useState } from 'react';
import { Page } from '../components/Layout';
import { ArrowLeft, Eye, Save, ToggleLeft, ToggleRight, Copy, Send, Mail, X } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import type { EmailTemplate } from '../lib/types';
import { WysiwygEditor } from '../components/WysiwygEditor';
import { useToast } from '../components/Toast';

const GLOBAL_VARIABLES = [
  { key: 'company_name', label: 'Company Name' },
  { key: 'company_address', label: 'Company Address' },
  { key: 'company_email', label: 'Company Email' },
  { key: 'company_phone', label: 'Company Phone' },
  { key: 'tos_url', label: 'Terms of Service URL' },
  { key: 'privacy_url', label: 'Privacy Policy URL' },
  { key: 'refund_url', label: 'Refund Policy URL' },
  { key: 'imprint_url', label: 'Imprint URL' },
  { key: 'storefront_url', label: 'Storefront URL' },
  { key: 'current_year', label: 'Current Year' },
];

const categoryLabels: Record<string, string> = {
  billing: 'Billing',
  tickets: 'Tickets',
  services: 'Services',
  account: 'Account',
  system: 'System',
};

export default function EmailTemplatesPage() {
  const { data: templates, loading, error, refetch } = useApi<EmailTemplate[]>('/admin/email-templates');
  const { data: mailboxes } = useApi<any[]>('/admin/mailboxes');
  const toast = useToast();
  const [editing, setEditing] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editMailboxId, setEditMailboxId] = useState<string>('');
  const [previewing, setPreviewing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const items = templates || [];

  const startEdit = (t: EmailTemplate) => {
    setEditing(t.id);
    setEditSubject(t.subject);
    setEditBody(t.body);
    setEditMailboxId(t.mailbox_id || '');
    setPreviewing(false);
    setTestResult(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    await api.put(`/admin/email-templates/${editing}`, { subject: editSubject, body: editBody, mailbox_id: editMailboxId || null });
    setSaved(true);
    refetch();
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestSend = async () => {
    if (!testRecipient.trim() || !editing) return;
    setTestSending(true);
    try {
      const res = await api.post(`/admin/email-templates/${editing}/test`, {
        recipient: testRecipient.trim()
      });
      setTestResult(res);
      toast.success(`Test email dispatched to ${testRecipient}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dispatch test email');
    } finally {
      setTestSending(false);
    }
  };

  const toggleEnabled = async (t: EmailTemplate) => {
    await api.put(`/admin/email-templates/${t.id}`, { enabled: !t.enabled });
    refetch();
  };

  const copyVar = (varKey: string) => {
    const text = `{{${varKey}}}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`Copied ${text} to clipboard`);
    });
  };

  const currentTemplate = items.find(t => t.id === editing);
  const filtered = filterCategory === 'all' ? items : items.filter(t => t.category === filterCategory);
  const grouped = Object.entries(categoryLabels).map(([key, label]) => ({
    key,
    label,
    items: filtered.filter(t => t.category === key),
  })).filter(g => g.items.length > 0);

  if (editing && currentTemplate) {
    const templateVars: string[] = Array.isArray(currentTemplate.variables)
      ? currentTemplate.variables
      : [];

    return (
      <Page title="Email Templates" requiredPermission="templates.manage">
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to templates
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">{currentTemplate.name}</h3>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{categoryLabels[currentTemplate.category] || currentTemplate.category}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowTestModal(true); setTestResult(null); }}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4 text-blue-400" /> Send Test
            </button>
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
              <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>

        {previewing ? (
          <div className="border border-border bg-background">
            <div className="p-4 border-b border-border bg-foreground/5">
              <div className="text-xs text-muted-foreground uppercase mb-1">Subject</div>
              <div className="text-sm font-medium">{editSubject}</div>
            </div>
            <div className="p-6 text-sm whitespace-pre-wrap leading-relaxed prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: editBody }} />
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Editor */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Mailbox Override</label>
                  <select
                    value={editMailboxId}
                    onChange={e => setEditMailboxId(e.target.value)}
                    className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground"
                  >
                    <option value="">Default Mailbox</option>
                    {mailboxes?.map(mb => (
                      <option key={mb.id} value={mb.id}>{mb.name} ({mb.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Body</label>
                <WysiwygEditor content={editBody} onChange={setEditBody} />
              </div>
            </div>

            {/* Variables Sidebar */}
            <div className="w-72 shrink-0 space-y-4">
              <div className="border border-border bg-background p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Global Variables</h4>
                <p className="text-xs text-muted-foreground mb-3">Available in all templates. Click to copy.</p>
                <div className="space-y-1.5">
                  {GLOBAL_VARIABLES.map(v => (
                    <button
                      key={v.key}
                      onClick={() => copyVar(v.key)}
                      className="w-full flex items-center justify-between px-2 py-1.5 border border-border hover:bg-foreground/5 transition-colors cursor-pointer group text-left"
                    >
                      <span className="font-mono text-xs text-foreground">{`{{${v.key}}}`}</span>
                      <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {templateVars.length > 0 && (
                <div className="border border-border bg-background p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Template Variables</h4>
                  <p className="text-xs text-muted-foreground mb-3">Specific to this template.</p>
                  <div className="space-y-1.5">
                    {templateVars.map((v: string) => (
                      <button
                        key={v}
                        onClick={() => copyVar(v)}
                        className="w-full flex items-center justify-between px-2 py-1.5 border border-border hover:bg-foreground/5 transition-colors cursor-pointer group text-left"
                      >
                        <span className="font-mono text-xs text-foreground">{`{{${v}}}`}</span>
                        <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showTestModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border shadow-lg p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" /> Send Test Email
                </h3>
                <button onClick={() => setShowTestModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Dispatches a test message of <strong>{currentTemplate.name}</strong> with sample variable substitution.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Recipient Address</label>
                  <input
                    type="email"
                    value={testRecipient}
                    onChange={e => setTestRecipient(e.target.value)}
                    placeholder="e.g. admin@vaultscope.de"
                    className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                  />
                </div>
                {testResult && (
                  <div className="p-3 border border-green-500/30 bg-green-500/5 text-xs space-y-2">
                    <div className="text-green-500 font-medium">Test Dispatched Successfully!</div>
                    <div><strong>Subject:</strong> {testResult.rendered_subject}</div>
                    <div className="font-mono text-[11px] max-h-32 overflow-y-auto bg-background p-2 border border-border whitespace-pre-wrap">
                      {testResult.rendered_body}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowTestModal(false)} className="px-4 py-2 border border-border text-sm hover:bg-foreground/5 cursor-pointer">
                  Close
                </button>
                <button
                  onClick={handleTestSend}
                  disabled={!testRecipient.trim() || testSending}
                  className="px-4 py-2 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> {testSending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Page>
    );
  }

  return (
    <Page title="Email Templates" requiredPermission="templates.manage">
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
