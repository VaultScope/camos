import { useState } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout';
import { ArrowLeft, Send, Plus } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import type { Ticket, TicketMessage, Department, Customer, Staff } from '../lib/types';

const getStaffDisplayName = (staff: Staff) => {
  if (staff.first_name || staff.last_name) {
    return `${staff.first_name} ${staff.last_name}`.trim();
  }
  return staff.username;
};

function TicketsDepartments() {
  const { data: departments, loading, error, refetch } = useApi<Department[]>('/admin/departments');
  const { data: staff } = useApi<Staff[]>('/admin/staff');
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    mailbox: '',
    default_assignee_id: '',
  });

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingId(dept.id);
      setForm({
        name: dept.name,
        mailbox: dept.mailbox,
        default_assignee_id: dept.default_assignee_id || '',
      });
    } else {
      setEditingId(null);
      setForm({ name: '', mailbox: '', default_assignee_id: '' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.mailbox.trim() || saving) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        mailbox: form.mailbox.trim(),
        default_assignee_id: form.default_assignee_id || null,
      };

      if (editingId) {
        await api.put(`/admin/departments/${editingId}`, payload);
      } else {
        await api.post('/admin/departments', payload);
      }

      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error(`Failed to save department: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete department "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      refetch();
    } catch (err) {
      toast.error(`Failed to delete department: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const getStaffName = (id: string | null) => {
    if (!id) return 'Unassigned';
    const member = (staff || []).find(s => s.id === id);
    return member ? getStaffDisplayName(member) : 'Unknown';
  };

  return (
    <Page title="Support Departments">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">Manage ticket departments and their associated email pipelines.</p>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load departments: {error}</div>}

      {!loading && !error && (
        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-5 text-muted-foreground">
            <div className="col-span-2">Department Name</div>
            <div>Mailbox</div>
            <div>Default Assignee</div>
            <div className="text-right">Actions</div>
          </div>
          {(departments || []).map(d => (
            <div key={d.id} className="p-4 text-sm grid grid-cols-5 items-center hover:bg-foreground/[0.02]">
              <div className="col-span-2 font-medium">{d.name}</div>
              <div className="text-muted-foreground font-mono text-xs">{d.mailbox}</div>
              <div className="text-muted-foreground">{getStaffName(d.default_assignee_id)}</div>
              <div className="text-right space-x-2">
                <button onClick={() => handleOpenModal(d)} className="text-xs px-2 py-1 border border-border hover:bg-foreground/5">
                  Edit
                </button>
                <button onClick={() => handleDelete(d.id, d.name)} className="text-xs px-2 py-1 border border-red-500/30 text-red-500 hover:bg-red-500/5">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {(departments || []).length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">No departments yet.</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">{editingId ? 'Edit Department' : 'New Department'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                  placeholder="e.g. General Support"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mailbox *</label>
                <input
                  type="email"
                  value={form.mailbox}
                  onChange={e => setForm({...form, mailbox: e.target.value})}
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                  placeholder="e.g. support@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Default Assignee</label>
                <select
                  value={form.default_assignee_id}
                  onChange={e => setForm({...form, default_assignee_id: e.target.value})}
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                >
                  <option value="">Unassigned</option>
                  {(staff || []).map(s => (
                    <option key={s.id} value={s.id}>{getStaffDisplayName(s)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={!form.name.trim() || !form.mailbox.trim() || saving} className="px-4 py-2 bg-foreground text-background text-sm hover:bg-foreground/90 disabled:opacity-50 cursor-pointer">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-border text-sm hover:bg-foreground/5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

function TicketsList() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: tickets, loading, error } = useApi<Ticket[]>('/admin/tickets');

  const items = tickets || [];
  const filtered = items.filter(t => {
    const matchesTab = activeTab === 'all' || t.category === activeTab;
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesTab && matchesSearch && matchesStatus;
  });

  const tabs = [
    { key: 'all', label: 'All', count: items.length },
    { key: 'support', label: 'Support', count: items.filter(t => t.category === 'support').length },
    { key: 'abuse', label: 'Abuse', count: items.filter(t => t.category === 'abuse').length },
    { key: 'dmca', label: 'DMCA', count: items.filter(t => t.category === 'dmca').length },
  ];

  return (
    <Page title="Support Tickets">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3 flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Search by subject or ticket number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground w-44 shrink-0"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_customer">Waiting</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <Link to="/tickets/new" className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors">
          <Plus className="w-4 h-4" /> New Ticket
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider border transition-colors cursor-pointer ${
              activeTab === tab.key ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label} <span className="ml-1 opacity-60">{tab.count}</span>
          </button>
        ))}
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading tickets...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load tickets: {error}</div>}

      {!loading && !error && (
        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-7 text-muted-foreground">
            <div>Number</div>
            <div className="col-span-2">Subject</div>
            <div>Category</div>
            <div>Priority</div>
            <div>Status</div>
            <div className="text-right">Created</div>
          </div>
          {filtered.map(t => (
            <Link key={t.id} to={`/tickets/${t.id}`} className="p-4 text-sm grid grid-cols-7 items-center hover:bg-foreground/[0.02] transition-colors">
              <div className="font-mono text-xs">{t.ticket_number}</div>
              <div className="col-span-2 font-medium truncate">{t.subject}</div>
              <div>
                <span className={`text-[10px] px-2 py-0.5 border uppercase ${
                  t.category === 'abuse' ? 'border-red-500/30 text-red-500' :
                  t.category === 'dmca' ? 'border-purple-500/30 text-purple-500' :
                  'border-border text-muted-foreground'
                }`}>
                  {t.category}
                </span>
              </div>
              <div>
                <span className={`text-[10px] px-2 py-0.5 border uppercase ${
                  t.priority === 'critical' ? 'border-red-500/30 text-red-500' :
                  t.priority === 'high' ? 'border-yellow-500/30 text-yellow-500' :
                  'border-border text-muted-foreground'
                }`}>
                  {t.priority}
                </span>
              </div>
              <div>
                <span className={`text-[10px] px-2 py-0.5 border uppercase ${
                  t.status === 'open' ? 'border-yellow-500/30 text-yellow-500' :
                  t.status === 'in_progress' ? 'border-blue-500/30 text-blue-500' :
                  t.status === 'closed' ? 'border-border text-muted-foreground' :
                  'border-orange-500/30 text-orange-500'
                }`}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-right text-xs text-muted-foreground">{t.created_at?.split('T')[0]}</div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {items.length === 0 ? 'No tickets yet.' : 'No tickets match your filters.'}
            </div>
          )}
        </div>
      )}
    </Page>
  );
}

function TicketDetail() {
  const { id } = useParams();
  const { data: ticket, loading, error, refetch } = useApi<Ticket>(`/admin/tickets/${id}`);
  const { data: messages, refetch: refetchMessages } = useApi<TicketMessage[]>(`/admin/tickets/${id}/messages`);
  const { data: staff } = useApi<Staff>('/admin/staff/me');
  const toast = useToast();
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSendReply = async () => {
    if (!replyText.trim() || !staff || sending) return;
    setSending(true);
    try {
      await api.post(`/admin/tickets/${id}/messages`, {
        author_id: staff.id,
        author_type: 'staff',
        content: replyText.trim(),
        internal: isInternal,
      });
      setReplyText('');
      setIsInternal(false);
      refetchMessages();
      refetch();
    } catch (err) {
      toast.error(`Failed to send reply: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <Page title="Ticket"><div className="p-8 text-center text-muted-foreground text-sm">Loading...</div></Page>;
  }

  if (error || !ticket) {
    return (
      <Page title="Ticket Not Found">
        <p className="text-sm text-muted-foreground">{error || 'Ticket not found.'}</p>
        <Link to="/tickets" className="text-sm text-foreground hover:underline mt-2 inline-block">Back to tickets</Link>
      </Page>
    );
  }

  const thread = messages || [];

  return (
    <Page title="Ticket Detail">
      <Link to="/tickets" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> All Tickets
      </Link>

      <div className="border border-border bg-background divide-y divide-border">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-medium">{ticket.subject}</h2>
                <span className={`text-[10px] px-2 py-0.5 border uppercase ${ticket.status === 'open' ? 'border-green-500/30 text-green-500' : ticket.status === 'in_progress' ? 'border-blue-500/30 text-blue-500' : ticket.status === 'waiting_customer' ? 'border-yellow-500/30 text-yellow-500' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className={`text-[10px] px-2 py-0.5 border uppercase ${ticket.priority === 'critical' ? 'border-red-500/30 text-red-500' : ticket.priority === 'high' ? 'border-orange-500/30 text-orange-500' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                  {ticket.priority}
                </span>
              </div>
              <div className="text-xs text-muted-foreground space-x-3">
                <span>#{ticket.ticket_number}</span>
                <span>•</span>
                <span className="capitalize">{ticket.category}</span>
                <span>•</span>
                <span>{ticket.created_at.replace('T', ' ').slice(0, 16)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {thread.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">No messages yet.</div>
          )}
          {thread.map(msg => (
            <div key={msg.id} className={`p-4 border border-border ${msg.internal ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-background'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium capitalize">{msg.author_type}</span>
                {msg.internal && <span className="text-[10px] px-1.5 py-0.5 border border-yellow-500/30 text-yellow-500 uppercase">Internal</span>}
                <span className="text-xs text-muted-foreground ml-auto">{msg.created_at.replace('T', ' ').slice(0, 16)}</span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="accent-foreground" />
              Internal Note
            </label>
          </div>
          <div className="flex gap-2">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              rows={3}
              className="flex-1 border border-border bg-transparent p-3 text-sm focus:outline-none focus:border-foreground resize-none"
              placeholder={isInternal ? 'Add internal note (not visible to customer)...' : 'Type your reply...'}
            />
            <button onClick={handleSendReply} disabled={!replyText.trim() || sending} className="px-4 self-end border border-border bg-foreground text-background text-sm py-2 hover:bg-foreground/90 disabled:opacity-50 cursor-pointer">
              {sending ? '...' : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}

function TicketsNew() {
  const navigate = useNavigate();
  const { data: customers } = useApi<Customer[]>('/admin/customers');
  const { data: staff } = useApi<Staff[]>('/admin/staff');
  const toast = useToast();
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    customer_id: '',
    category: 'support' as 'support' | 'abuse' | 'dmca',
    subject: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'critical',
    assignee_id: '',
    mailbox: 'support@example.com',
    related_service_id: '',
    ip: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id || !form.subject.trim() || creating) return;

    setCreating(true);
    try {
      const payload = {
        customer_id: form.customer_id,
        category: form.category,
        subject: form.subject.trim(),
        priority: form.priority,
        assignee_id: form.assignee_id || null,
        mailbox: form.mailbox,
        related_service_id: form.related_service_id || null,
        ip: form.ip || undefined,
      };
      const ticket = await api.post<Ticket>('/admin/tickets', payload);
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      toast.error(`Failed to create ticket: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setCreating(false);
    }
  };

  return (
    <Page title="Create Ticket">
      <Link to="/tickets" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> All Tickets
      </Link>

      <form onSubmit={handleSubmit} className="border border-border bg-background p-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Customer *</label>
          <select
            value={form.customer_id}
            onChange={e => setForm({...form, customer_id: e.target.value})}
            required
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          >
            <option value="">Select customer...</option>
            {(customers || []).map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value as typeof form.category})}
              className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
            >
              <option value="support">Support</option>
              <option value="abuse">Abuse</option>
              <option value="dmca">DMCA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={e => setForm({...form, priority: e.target.value as typeof form.priority})}
              className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subject *</label>
          <input
            type="text"
            value={form.subject}
            onChange={e => setForm({...form, subject: e.target.value})}
            required
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
            placeholder="Brief description of the issue..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Assign To</label>
          <select
            value={form.assignee_id}
            onChange={e => setForm({...form, assignee_id: e.target.value})}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          >
            <option value="">Unassigned</option>
            {(staff || []).map(s => (
              <option key={s.id} value={s.id}>{getStaffDisplayName(s)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mailbox</label>
          <input
            type="email"
            value={form.mailbox}
            onChange={e => setForm({...form, mailbox: e.target.value})}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={!form.customer_id || !form.subject.trim() || creating} className="px-4 py-2 bg-foreground text-background text-sm hover:bg-foreground/90 disabled:opacity-50 cursor-pointer">
            {creating ? 'Creating...' : 'Create Ticket'}
          </button>
          <Link to="/tickets" className="px-4 py-2 border border-border text-sm hover:bg-foreground/5">
            Cancel
          </Link>
        </div>
      </form>
    </Page>
  );
}

export default function TicketsRouter() {
  return (
    <Routes>
      <Route path="/" element={<TicketsList />} />
      <Route path="new" element={<TicketsNew />} />
      <Route path="departments" element={<TicketsDepartments />} />
      <Route path=":id" element={<TicketDetail />} />
    </Routes>
  );
}
