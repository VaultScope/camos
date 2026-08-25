import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Mail, AlertTriangle, ShieldAlert, ArrowLeft, Send, Plus, Users } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import type { Ticket } from '../lib/types';

function TicketsDepartments() {
  return (
    <Page title="Support Departments">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">Manage ticket departments and their associated email pipelines.</p>
        <button className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-4 text-muted-foreground">
          <div className="col-span-2">Department Name</div>
          <div>Associated Mailbox</div>
          <div className="text-right">Default Assignee</div>
        </div>
        {[
          { name: 'General Support', email: 'support@vaultscope.de', assignee: 'Unassigned', icon: Mail },
          { name: 'Abuse Desk', email: 'abuse@vaultscope.de', assignee: 'Unassigned', icon: AlertTriangle },
          { name: 'DMCA Takedowns', email: 'dmca@vaultscope.de', assignee: 'Unassigned', icon: ShieldAlert },
          { name: 'Sales & Billing', email: 'sales@vaultscope.de', assignee: 'Unassigned', icon: Users },
        ].map(d => (
          <div key={d.name} className="p-4 text-sm grid grid-cols-4 items-center hover:bg-foreground/[0.02]">
            <div className="col-span-2 flex items-center gap-3 font-medium">
              <d.icon className="w-4 h-4 text-muted-foreground" /> {d.name}
            </div>
            <div className="text-muted-foreground font-mono text-xs">{d.email}</div>
            <div className="text-right text-muted-foreground">{d.assignee}</div>
          </div>
        ))}
      </div>
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
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  return (
    <Page title="Ticket Detail">
      <Link to="/tickets" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> All Tickets
      </Link>
      <div className="border border-border bg-background p-6">
        <p className="text-sm text-muted-foreground mb-6">Ticket detail view will show the full thread once ticket messages endpoint is implemented.</p>
        <div className="border-t border-border pt-4">
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
            <button disabled={!replyText.trim()} className="px-4 self-end border border-border bg-foreground text-background text-sm py-2 hover:bg-foreground/90 disabled:opacity-50 cursor-pointer">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}

function TicketsNew() {
  return (
    <Page title="Create Ticket">
      <div className="border border-border bg-background p-6 max-w-2xl">
        <p className="text-sm text-muted-foreground">Ticket creation will be implemented once the create ticket API endpoint is added.</p>
        <Link to="/tickets" className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground">Back to tickets</Link>
      </div>
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
