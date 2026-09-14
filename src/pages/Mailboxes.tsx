import { useState } from 'react';
import { Page } from '../components/Layout';
import { Plus, Edit, Trash2, ArrowLeft, Save, Star, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import type { Mailbox } from '../lib/types';

export default function Mailboxes() {
  const { data: mailboxes, loading, error, refetch } = useApi<Mailbox[]>('/admin/mailboxes');
  const [editing, setEditing] = useState<Partial<Mailbox> | null>(null);
  const [testState, setTestState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const isNew = editing && !editing.id;
  const canSave = !isNew || testState === 'success';

  const handleTest = async () => {
    if (!editing) return;
    setTestState('testing');
    setTestError('');
    try {
      await api.post('/admin/mailboxes/test', {
        smtp_host: editing.host,
        smtp_port: editing.port || 587,
        smtp_user: editing.user_name,
        smtp_pass: editing.password,
        email: editing.user_name,
        test_to: testEmail || editing.user_name,
      });
      setTestState('success');
    } catch (e: any) {
      setTestState('error');
      setTestError(e.message || 'Connection failed');
    }
  };

  const handleSave = async () => {
    if (!editing || !canSave) return;
    setSaving(true);
    try {
      if (isNew) {
        await api.post('/admin/mailboxes', editing);
      } else {
        await api.put(`/admin/mailboxes/${editing.id}`, editing);
      }
      refetch();
      setEditing(null);
      setTestState('idle');
    } catch (e: any) {
      alert(e.message || 'Failed to save mailbox');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mailbox?')) return;
    try {
      await api.delete(`/admin/mailboxes/${id}`);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.put(`/admin/mailboxes/${id}/default`, {});
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const updateField = (field: keyof Mailbox, value: any) => {
    if (editing) {
      setEditing({ ...editing, [field]: value });
      if (isNew) setTestState('idle'); // reset test on any change
    }
  };

  if (editing) {
    return (
      <Page title={isNew ? 'New Mailbox' : 'Edit Mailbox'} requiredPermission="mail.manage">
        <button onClick={() => { setEditing(null); setTestState('idle'); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to mailboxes
        </button>

        <div className="max-w-2xl border border-border bg-background p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Name</label>
                <input type="text" value={editing.name || ''} onChange={e => updateField('name', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="e.g. Support" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">SMTP User / From Address</label>
                <input type="text" value={editing.user_name || ''} onChange={e => updateField('user_name', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" placeholder="support@example.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">SMTP Host</label>
                <input type="text" value={editing.host || ''} onChange={e => updateField('host', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" placeholder="smtp.example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">SMTP Port</label>
                <input type="number" value={editing.port || 587} onChange={e => updateField('port', parseInt(e.target.value) || 587)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">SMTP Password</label>
              <input type="password" value={editing.password || ''} onChange={e => updateField('password', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
            </div>

            {/* Test Connection */}
            <div className="border border-border p-4 bg-foreground/[0.02]">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Test Connection</h4>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  placeholder="Send test email to... (optional)"
                  className="flex-1 border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground font-mono"
                />
                <button
                  onClick={handleTest}
                  disabled={testState === 'testing' || !editing.host || !editing.user_name}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {testState === 'testing' ? <Loader className="w-4 h-4 animate-spin" /> : null}
                  {testState === 'testing' ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
              {testState === 'success' && (
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <CheckCircle className="w-4 h-4" /> Connection successful! You can now save.
                </div>
              )}
              {testState === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <XCircle className="w-4 h-4" /> {testError || 'Connection failed'}
                </div>
              )}
              {isNew && testState === 'idle' && (
                <p className="text-xs text-muted-foreground">You must test the connection successfully before saving a new mailbox.</p>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving || !canSave}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-50"
                title={isNew && testState !== 'success' ? 'Test connection first' : ''}
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Mailbox'}
              </button>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Mailboxes" requiredPermission="mail.manage">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">Manage your inbound and outbound mailboxes for tickets and system emails.</p>
        <button onClick={() => setEditing({ port: 587 })} className="flex items-center gap-2 px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add Mailbox
        </button>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
      {error && <div className="text-sm text-red-500">Error: {error}</div>}

      {!loading && !error && mailboxes && (
        <div className="border border-border bg-background divide-y divide-border">
          {mailboxes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No mailboxes configured.</div>
          ) : (
            mailboxes.map(mb => (
              <div key={mb.id} className="flex items-center justify-between p-4 hover:bg-foreground/[0.02] transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{mb.name}</span>
                    {mb.is_default && <span className="text-[10px] px-1.5 py-0.5 border border-border text-muted-foreground uppercase">Default</span>}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">{mb.host}:{mb.port} · {mb.user_name}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!mb.is_default && (
                    <button onClick={() => handleSetDefault(mb.id)} className="p-2 text-muted-foreground hover:text-foreground cursor-pointer" title="Set as Default">
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setEditing(mb)} className="p-2 text-muted-foreground hover:text-foreground cursor-pointer" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(mb.id)} className="p-2 text-muted-foreground hover:text-red-500 cursor-pointer" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Page>
  );
}
