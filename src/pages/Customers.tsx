import { useState } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Plus, ArrowLeft, Server, LifeBuoy, ExternalLink, Ban, Play, Shield, Mail, CheckCircle2, Copy, Check, Trash2 } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import type { Customer, Service, Ticket, ActivityLog, Role } from '../lib/types';

function CustomerList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: customers, loading, error, refetch } = useApi<Customer[]>('/admin/customers');
  const toast = useToast();

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete customer account "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/customers/${id}`);
      toast.success('Customer account deleted successfully');
      refetch();
    } catch (err) {
      toast.error(`Failed to delete customer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

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
          <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-8 text-muted-foreground">
            <div className="col-span-2">Customer</div>
            <div>Status</div>
            <div>Country</div>
            <div>Company</div>
            <div className="text-center">Active Services</div>
            <div className="text-right">Since</div>
            <div className="text-right">Actions</div>
          </div>
          {filtered.map(c => (
            <div key={c.id} className="p-4 text-sm grid grid-cols-8 items-center hover:bg-foreground/[0.02]">
              <Link to={`/customers/${c.id}`} className="col-span-2">
                <div className="font-medium hover:underline">{c.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  {c.email}
                  {c.email_verified && <span className="text-green-500 text-[10px]" title="Verified">✓</span>}
                </div>
              </Link>
              <div>
                <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border border-border ${c.status === 'active' ? 'text-green-500 bg-green-500/5' : c.status === 'suspended' ? 'text-yellow-500 bg-yellow-500/5' : 'text-red-500 bg-red-500/5'}`}>
                  {c.status}
                </span>
              </div>
              <div className="text-muted-foreground">{c.country || '-'}</div>
              <div className="text-muted-foreground">{c.company || '-'}</div>
              <div className="text-center font-medium">{(c as any).active_services || 0}</div>
              <div className="text-right text-xs text-muted-foreground">{c.created_at?.split('T')[0]}</div>
              <div className="flex justify-end gap-2">
                <Link to={`/customers/${c.id}`} className="text-xs border border-border p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer" title="Edit/View">
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeleteCustomer(c.id, c.name)}
                  className="text-xs border border-red-500/30 text-red-500 p-1.5 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete Account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
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
  const { data: customer, loading, error, refetch } = useApi<Customer>(`/admin/customers/${id}`);
  const { data: services } = useApi<Service[]>(`/admin/services?customer_id=${id}`);
  const { data: tickets } = useApi<Ticket[]>(`/admin/tickets?customer_id=${id}`);
  const { data: activity } = useApi<ActivityLog[]>(`/admin/activity?customer_id=${id}`);
  const { data: roles } = useApi<Role[]>('/admin/staff/roles');
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'services' | 'invoices' | 'tickets' | 'activity'>('services');
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [notesInitialized, setNotesInitialized] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [promoteRoleId, setPromoteRoleId] = useState('');
  const [promoteUsername, setPromoteUsername] = useState('');
  const [promotePassword, setPromotePassword] = useState('');
  const [promoting, setPromoting] = useState(false);

  const [resendingVerification, setResendingVerification] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleResendVerification = async () => {
    if (!customer || resendingVerification) return;
    setResendingVerification(true);
    try {
      const res = await api.post<{ ok: boolean; message: string; verification_token?: string; verification_link?: string }>(
        `/admin/customers/${customer.id}/resend-verification`
      );
      toast.success(res.message || 'Verification email sent!');
      refetch();
    } catch (err) {
      toast.error(`Failed to resend verification email: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setResendingVerification(false);
    }
  };

  const handleMarkVerified = async () => {
    if (!customer || verifyingEmail) return;
    if (!confirm(`Mark ${customer.name}'s email as verified manually?`)) return;
    setVerifyingEmail(true);
    try {
      await api.post(`/admin/customers/${customer.id}/verify`);
      toast.success('Customer email marked as verified!');
      refetch();
    } catch (err) {
      toast.error(`Failed to verify customer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleCopy = (text: string, type: 'link' | 'id') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
    toast.success('Copied to clipboard');
  };

  const openPromoteModal = () => {
    if (!customer) return;
    const initialUsername = customer.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
    setPromoteUsername(initialUsername);
    setPromoteRoleId(roles?.[0]?.id || '');
    setPromotePassword('');
    setIsPromoteModalOpen(true);
  };

  const handlePromote = async () => {
    if (!customer || !promoteRoleId || promoting) return;
    setPromoting(true);
    try {
      await api.post(`/admin/customers/${customer.id}/promote`, {
        role_id: promoteRoleId,
        username: promoteUsername.trim() || undefined,
        password: promotePassword.trim() || undefined,
      });
      toast.success(`${customer.name} promoted to staff member successfully!`);
      setIsPromoteModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(`Failed to make staff member: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setPromoting(false);
    }
  };

  const [deletingCustomer, setDeletingCustomer] = useState(false);

  const handleDeleteCustomer = async () => {
    if (!customer || deletingCustomer) return;
    if (!confirm(`Are you absolutely sure you want to permanently delete customer account "${customer.name}" (${customer.email})? This action cannot be undone.`)) return;
    setDeletingCustomer(true);
    try {
      await api.delete(`/admin/customers/${customer.id}`);
      toast.success('Customer account deleted successfully');
      navigate('/customers');
    } catch (err) {
      toast.error(`Failed to delete customer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDeletingCustomer(false);
    }
  };

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
  const customerTickets = tickets || [];
  const customerActivity = activity || [];

  const handleSaveNotes = async () => {
    if (!customer || updating) return;
    setUpdating(true);
    try {
      await api.put(`/admin/customers/${id}`, { notes });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
      refetch();
    } catch (err) {
      toast.error(`Failed to save notes: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'suspended') => {
    if (!customer || updating) return;
    const action = newStatus === 'suspended' ? 'suspend' : 'reactivate';
    if (!confirm(`Are you sure you want to ${action} this customer?`)) return;

    setUpdating(true);
    try {
      await api.put(`/admin/customers/${id}`, { status: newStatus });
      refetch();
    } catch (err) {
      toast.error(`Failed to ${action} customer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  const tabs = [
    { key: 'services', label: 'Services', count: customerServices.length },
    { key: 'invoices', label: 'Invoices', count: 0 },
    { key: 'tickets', label: 'Tickets', count: customerTickets.length },
    { key: 'activity', label: 'Activity', count: customerActivity.length },
  ] as const;

  return (
    <Page title="Customer Management">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> All Customers
      </button>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="border border-border bg-background p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{customer.name}</h3>
              <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border border-border ${customer.status === 'active' ? 'text-green-500 bg-green-500/5' : customer.status === 'suspended' ? 'text-yellow-500 bg-yellow-500/5' : 'text-red-500 bg-red-500/5'}`}>
                {customer.status}
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs uppercase">Email</span>
                <span className="font-mono text-xs">{customer.email}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs uppercase">Verification</span>
                <div className="flex items-center gap-1.5">
                  {customer.email_verified ? (
                    <span className="text-[10px] px-2 py-0.5 border border-green-500/30 text-green-500 bg-green-500/5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] px-2 py-0.5 border border-yellow-500/30 text-yellow-500 bg-yellow-500/5">
                        Unverified
                      </span>
                      <button
                        onClick={handleMarkVerified}
                        disabled={verifyingEmail}
                        className="text-[10px] px-1.5 py-0.5 border border-border hover:bg-foreground/5 cursor-pointer disabled:opacity-50"
                        title="Manually verify email"
                      >
                        {verifyingEmail ? '...' : 'Verify Now'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {customer.verification_token && !customer.email_verified && (
                <div className="p-2 border border-yellow-500/20 bg-yellow-500/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-medium text-yellow-500">Verification Link</span>
                    <button
                      onClick={() => handleCopy(`https://vaultscope.de/verify-email?token=${customer.verification_token}`, 'link')}
                      className="text-[10px] px-1.5 py-0.5 border border-border bg-background hover:bg-foreground/5 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-2.5 h-2.5 text-green-500" /> : <Copy className="w-2.5 h-2.5" />}
                      {copiedLink ? 'Copied' : 'Copy Link'}
                    </button>
                  </div>
                  <div className="font-mono text-[10px] truncate text-muted-foreground select-all">
                    https://vaultscope.de/verify-email?token={customer.verification_token}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs uppercase">Company</span>
                <span className="text-xs">{customer.company || '—'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs uppercase">Phone</span>
                <span className="text-xs">{customer.phone || '—'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs uppercase">Address</span>
                <span className="text-xs text-right max-w-[200px] truncate" title={customer.address}>
                  {customer.address || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs uppercase">Postal / City</span>
                <span className="text-xs">
                  {[customer.postal_code, customer.city].filter(Boolean).join(' ') || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs uppercase">Country</span>
                <span className="text-xs">{customer.country || '—'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs uppercase">VAT ID</span>
                <span className="font-mono text-xs flex items-center gap-1">
                  {customer.vat_id || '—'}
                  {customer.vat_verified && <span className="text-green-500 text-[10px]" title="VAT Verified">✓</span>}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs uppercase">Stripe ID</span>
                <span className="font-mono text-xs">{customer.stripe_customer_id || '—'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs uppercase">Customer ID</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs" title={customer.id}>{customer.id.slice(0, 8)}...</span>
                  <button
                    onClick={() => handleCopy(customer.id, 'id')}
                    className="p-1 hover:bg-foreground/5 cursor-pointer text-muted-foreground hover:text-foreground"
                    title="Copy full Customer ID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs uppercase">External ID</span>
                <span className="font-mono text-xs truncate max-w-[150px]" title={customer.external_id}>{customer.external_id || '—'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs uppercase">Registered</span>
                <span className="text-xs">{customer.created_at?.split('T')[0]}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs uppercase">Last Login</span>
                <span className="text-xs">{customer.last_login ? customer.last_login.replace('T', ' ').slice(0, 16) : 'Never'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 flex-wrap">
            {customer.two_factor_enabled ? (
              <span className="text-[10px] px-2 py-0.5 border border-green-500/30 text-green-500 bg-green-500/5">2FA Enabled</span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 border border-border text-muted-foreground">2FA Off</span>
            )}
            <span className="text-[10px] px-2 py-0.5 border border-border text-muted-foreground">
              Updated: {customer.updated_at?.split('T')[0] || '-'}
            </span>
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
              <button
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                {resendingVerification ? 'Sending Email...' : 'Resend Verification Email'}
              </button>
              {!customer.email_verified && (
                <button
                  onClick={handleMarkVerified}
                  disabled={verifyingEmail}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-green-500/30 text-green-600 hover:bg-green-500/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  {verifyingEmail ? 'Verifying...' : 'Mark Email as Verified'}
                </button>
              )}
              <button onClick={openPromoteModal} className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer">
                <Shield className="w-3.5 h-3.5 text-muted-foreground" /> Make Staff Member
              </button>
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
                <button onClick={() => handleStatusChange('suspended')} disabled={updating} className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <Ban className="w-3.5 h-3.5 text-muted-foreground" /> {updating ? 'Processing...' : 'Suspend Account'}
                </button>
              )}
              {customer.status === 'suspended' && (
                <button onClick={() => handleStatusChange('active')} disabled={updating} className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <Play className="w-3.5 h-3.5 text-muted-foreground" /> {updating ? 'Processing...' : 'Reactivate'}
                </button>
              )}
              <button
                onClick={handleDeleteCustomer}
                disabled={deletingCustomer}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> {deletingCustomer ? 'Deleting...' : 'Delete Customer Account'}
              </button>
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
            <button onClick={handleSaveNotes} disabled={updating} className="text-xs px-3 py-1.5 bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {updating ? 'Saving...' : notesSaved ? 'Saved' : 'Save Notes'}
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
          <div className="p-3 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-7 text-muted-foreground">
            <div className="col-span-2">Service</div>
            <div>IP</div>
            <div>Status</div>
            <div>Price</div>
            <div>Next Due</div>
            <div className="text-right">Actions</div>
          </div>
          {customerServices.map(s => (
            <div key={s.id} className="p-3 text-sm grid grid-cols-7 items-center hover:bg-foreground/[0.02]">
              <Link to={`/services/${s.id}`} className="col-span-2">
                <div className="font-medium hover:underline">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.hostname}</div>
              </Link>
              <div className="font-mono text-xs">{s.ip || '-'}</div>
              <div>
                <span className={`text-[10px] px-2 py-0.5 border uppercase ${s.status === 'running' ? 'border-green-500/30 text-green-500' : s.status === 'suspended' ? 'border-yellow-500/30 text-yellow-500' : s.status === 'pending' ? 'border-blue-500/30 text-blue-500' : 'border-red-500/30 text-red-500'}`}>
                  {s.status}
                </span>
              </div>
              <div>€{parseFloat(s.price || '0').toFixed(2)}/mo</div>
              <div className="text-muted-foreground">{s.next_due?.split('T')[0] || '-'}</div>
              <div className="flex justify-end gap-2">
                {s.status !== 'suspended' && s.status !== 'terminated' && (
                  <button onClick={() => { if(confirm('Force suspend this service?')) api.post(`/admin/services/${s.id}/suspend`).then(refetch) }} className="text-[10px] px-2 py-1 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 uppercase cursor-pointer" title="Force Suspend">Suspend</button>
                )}
                {s.status === 'suspended' && (
                  <button onClick={() => { if(confirm('Force reactivate this service?')) api.post(`/admin/services/${s.id}/reactivate`).then(refetch) }} className="text-[10px] px-2 py-1 border border-green-500/30 text-green-500 hover:bg-green-500/10 uppercase cursor-pointer" title="Force Reactivate">Unsuspend</button>
                )}
                {s.status !== 'terminated' && (
                  <button onClick={() => { if(confirm('Force TERMINATE this service? Data will be lost!')) api.post(`/admin/services/${s.id}/terminate`).then(refetch) }} className="text-[10px] px-2 py-1 border border-red-500/30 text-red-500 hover:bg-red-500/10 uppercase cursor-pointer" title="Force Terminate">Terminate</button>
                )}
              </div>
            </div>
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
        <div className="border border-border bg-background divide-y divide-border">
          {customerTickets.length > 0 ? (
            <>
              <div className="p-3 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-5 text-muted-foreground">
                <div className="col-span-2">Subject</div>
                <div>Category</div>
                <div>Status</div>
                <div>Created</div>
              </div>
              {customerTickets.map(t => (
                <Link key={t.id} to={`/tickets/${t.id}`} className="p-3 text-sm grid grid-cols-5 items-center hover:bg-foreground/[0.02]">
                  <div className="col-span-2 font-medium">{t.subject}</div>
                  <div className="text-muted-foreground capitalize">{t.category}</div>
                  <div>
                    <span className={`text-[10px] px-2 py-0.5 border uppercase ${t.status === 'open' ? 'border-green-500/30 text-green-500' : t.status === 'in_progress' ? 'border-blue-500/30 text-blue-500' : t.status === 'waiting_customer' ? 'border-yellow-500/30 text-yellow-500' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs">{t.created_at?.split('T')[0]}</div>
                </Link>
              ))}
            </>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">No tickets.</div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="border border-border bg-background divide-y divide-border">
          {customerActivity.length > 0 ? (
            <>
              <div className="p-3 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-4 text-muted-foreground">
                <div className="col-span-2">Activity</div>
                <div>Category</div>
                <div>Time</div>
              </div>
              {customerActivity.map((a, i) => (
                <div key={i} className="p-3 text-sm grid grid-cols-4 items-center">
                  <div className="col-span-2">
                    <span className="font-medium">{a.action}</span> {a.target}
                    {a.detail && <span className="text-muted-foreground text-xs ml-2">— {a.detail}</span>}
                  </div>
                  <div>
                    <span className="text-[10px] px-2 py-0.5 border border-border uppercase text-muted-foreground">
                      {a.category}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs">{a.created_at?.replace('T', ' ').slice(0, 16)}</div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">No recorded activity.</div>
          )}
        </div>
      )}

      {isPromoteModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Shield className="w-5 h-5 text-muted-foreground" /> Make Staff Member
              </h2>
              <button onClick={() => setIsPromoteModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Promote <span className="font-medium text-foreground">{customer.name}</span> ({customer.email}) to an administrative staff account.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Administrative Role</label>
                <select
                  value={promoteRoleId}
                  onChange={e => setPromoteRoleId(e.target.value)}
                  className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                >
                  <option value="" disabled>Select Role...</option>
                  {roles?.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Staff Username</label>
                <input
                  type="text"
                  value={promoteUsername}
                  onChange={e => setPromoteUsername(e.target.value)}
                  placeholder="e.g. johndoe"
                  className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Password (Optional)</label>
                <input
                  type="password"
                  value={promotePassword}
                  onChange={e => setPromotePassword(e.target.value)}
                  placeholder="Leave empty to use customer password"
                  className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Leave empty to retain this customer's current password for admin login.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsPromoteModalOpen(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePromote}
                disabled={!promoteRoleId || promoting}
                className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-2"
              >
                {promoting ? 'Promoting...' : 'Make Staff Member'}
              </button>
            </div>
          </div>
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
