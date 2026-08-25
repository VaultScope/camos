import { useState } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Plus, ArrowLeft, Server, CreditCard, LifeBuoy, Clock, ExternalLink, Ban, Play } from 'lucide-react';
import { useApi } from '../lib/hooks';
import type { Customer, Service } from '../lib/types';

function CustomerList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: customers, loading, error } = useApi<Customer[]>('/admin/customers');

  const filtered = (customers || []).filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.vat_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Page title="Customer Management">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3 flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Search by name, email, ID, or VAT..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground w-40 shrink-0"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
        <button className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {loading && (
        <div className="p-8 text-center text-muted-foreground text-sm">Loading customers...</div>
      )}

      {error && (
        <div className="p-8 text-center text-red-500 text-sm">Failed to load customers: {error}</div>
      )}

      {!loading && !error && (
        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-7 text-muted-foreground">
            <div className="col-span-2">Customer</div>
            <div>Status</div>
            <div>Country</div>
            <div>Company</div>
            <div>Security</div>
            <div className="text-right">Since</div>
          </div>
          {filtered.map(c => (
            <Link key={c.id} to={`/customers/${c.id}`} className="p-4 text-sm grid grid-cols-7 items-center hover:bg-foreground/[0.02] transition-colors">
              <div className="col-span-2 flex flex-col">
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.email}</span>
              </div>
              <div>
                <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border border-border ${c.status === 'active' ? 'text-green-500 bg-green-500/5' : c.status === 'suspended' ? 'text-yellow-500 bg-yellow-500/5' : 'text-red-500 bg-red-500/5'}`}>
                  {c.status}
                </span>
              </div>
              <div className="text-muted-foreground">{c.country || '—'}</div>
              <div className="text-muted-foreground">{c.company || '—'}</div>
              <div>
                {c.two_factor_enabled ? (
                  <span className="text-xs border border-border px-1.5 py-0.5 bg-foreground/5 text-muted-foreground">2FA On</span>
                ) : (
                  <span className="text-xs border border-border px-1.5 py-0.5 text-muted-foreground opacity-50">2FA Off</span>
                )}
              </div>
              <div className="text-right text-xs text-muted-foreground">{c.created_at?.split('T')[0]}</div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">No customers match your filters.</div>
          )}
        </div>
      )}
    </Page>
  );
}

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: customer, loading, error } = useApi<Customer>(`/admin/customers/${id}`);
  const { data: services } = useApi<Service[]>(`/admin/services?customer_id=${id}`);
  const [activeTab, setActiveTab] = useState<'services' | 'invoices' | 'tickets' | 'activity'>('services');
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [notesInitialized, setNotesInitialized] = useState(false);

  if (!notesInitialized && customer) {
    setNotes(customer.notes || '');
    setNotesInitialized(true);
  }

  if (loading) {
    return <Page title="Customer"><div className="p-8 text-center text-muted-foreground text-sm">Loading...</div></Page>;
  }

  if (error || !customer) {
    return (
      <Page title="Customer Not Found">
        <p className="text-sm text-muted-foreground">{error || `No customer with ID ${id}.`}</p>
        <Link to="/customers" className="text-sm text-foreground hover:underline mt-2 inline-block">Back to customers</Link>
      </Page>
    );
  }

  const customerServices = services || [];

  const handleSaveNotes = () => {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const tabs = [
    { key: 'services', label: 'Services', count: customerServices.length },
    { key: 'invoices', label: 'Invoices', count: 0 },
    { key: 'tickets', label: 'Tickets', count: 0 },
    { key: 'activity', label: 'Activity', count: 0 },
  ] as const;

  return (
    <Page title="Customer Management">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> All Customers
      </button>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="border border-border bg-background p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">{customer.name}</h3>
            <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border border-border ${customer.status === 'active' ? 'text-green-500 bg-green-500/5' : customer.status === 'suspended' ? 'text-yellow-500 bg-yellow-500/5' : 'text-red-500 bg-red-500/5'}`}>
              {customer.status}
            </span>
          </div>
          {customer.company && <div className="text-sm text-muted-foreground mb-3">{customer.company}</div>}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-mono text-xs">{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{customer.phone}</span>
              </div>
            )}
            {(customer.city || customer.country) && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span>{[customer.city, customer.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {customer.vat_id && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT ID</span>
                <span className="font-mono text-xs">{customer.vat_id}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer ID</span>
              <span className="font-mono text-xs">{customer.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Since</span>
              <span>{customer.created_at?.split('T')[0]}</span>
            </div>
            {customer.last_login && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Login</span>
                <span>{customer.last_login.replace('T', ' ').slice(0, 16)}</span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 flex-wrap">
            {customer.email_verified ? (
              <span className="text-[10px] px-2 py-0.5 border border-green-500/30 text-green-500">Email Verified</span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 border border-yellow-500/30 text-yellow-500">Email Unverified</span>
            )}
            {customer.two_factor_enabled ? (
              <span className="text-[10px] px-2 py-0.5 border border-green-500/30 text-green-500">2FA Enabled</span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 border border-border text-muted-foreground">2FA Off</span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-border bg-background p-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Active Services</div>
            <div className="text-2xl font-light">{customerServices.filter(s => s.status === 'running').length}</div>
            <div className="text-xs text-muted-foreground mt-1">{customerServices.length} total</div>
          </div>
          <div className="border border-border bg-background p-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Monthly Revenue</div>
            <div className="text-2xl font-light">
              €{customerServices.reduce((sum, s) => sum + parseFloat(s.price || '0'), 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">from active services</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-border bg-background p-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer">
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" /> Impersonate
              </button>
              <Link to="/tickets/new" className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-border hover:bg-foreground/5 transition-colors">
                <LifeBuoy className="w-3.5 h-3.5 text-muted-foreground" /> Create Ticket
              </Link>
              <Link to="/services/new" className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-border hover:bg-foreground/5 transition-colors">
                <Server className="w-3.5 h-3.5 text-muted-foreground" /> Provision Service
              </Link>
              {customer.status === 'active' && (
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer">
                  <Ban className="w-3.5 h-3.5 text-muted-foreground" /> Suspend Account
                </button>
              )}
              {customer.status === 'suspended' && (
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer">
                  <Play className="w-3.5 h-3.5 text-muted-foreground" /> Reactivate
                </button>
              )}
            </div>
          </div>
          <div className="border border-border bg-background p-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Internal Notes</h4>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground resize-none mb-2"
              placeholder="Staff-only notes about this customer..."
            />
            <button onClick={handleSaveNotes} className="text-xs px-3 py-1.5 bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer">
              {notesSaved ? 'Saved' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-2 px-1 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${activeTab === t.key ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
            <span className="text-[10px] px-1.5 py-0.5 border border-border">{t.count}</span>
          </button>
        ))}
      </div>

      {activeTab === 'services' && (
        <div className="border border-border bg-background divide-y divide-border">
          <div className="p-3 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-6 text-muted-foreground">
            <div className="col-span-2">Service</div>
            <div>IP</div>
            <div>Status</div>
            <div>Price</div>
            <div>Next Due</div>
          </div>
          {customerServices.map(s => (
            <Link key={s.id} to={`/services/${s.id}`} className="p-3 text-sm grid grid-cols-6 items-center hover:bg-foreground/[0.02]">
              <div className="col-span-2">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.hostname}</div>
              </div>
              <div className="font-mono text-xs">{s.ip || '—'}</div>
              <div>
                <span className={`text-[10px] px-2 py-0.5 border uppercase ${s.status === 'running' ? 'border-green-500/30 text-green-500' : s.status === 'suspended' ? 'border-yellow-500/30 text-yellow-500' : s.status === 'pending' ? 'border-blue-500/30 text-blue-500' : 'border-red-500/30 text-red-500'}`}>
                  {s.status}
                </span>
              </div>
              <div>€{parseFloat(s.price || '0').toFixed(2)}/mo</div>
              <div className="text-muted-foreground">{s.next_due?.split('T')[0] || '—'}</div>
            </Link>
          ))}
          {customerServices.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">No services.</div>
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="border border-border bg-background p-6 text-center text-sm text-muted-foreground">
          No invoices.
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="border border-border bg-background p-6 text-center text-sm text-muted-foreground">
          No tickets.
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="border border-border bg-background p-6 text-center text-sm text-muted-foreground">
          No recorded activity.
        </div>
      )}
    </Page>
  );
}

export default function Customers() {
  return (
    <Routes>
      <Route path="/" element={<CustomerList />} />
      <Route path=":id" element={<CustomerDetail />} />
    </Routes>
  );
}
