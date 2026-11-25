import { useState } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Plus, ArrowLeft, Server, LifeBuoy, ExternalLink, Ban, Play, Shield, Mail, CheckCircle2, Copy, Check, Trash2, Edit2, UserCheck, X } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import { hasPermission } from '../lib/auth';
import { useToast } from '../components/Toast';
import { HelpTooltip } from '../components/HelpTooltip';
import type { Customer, Service, Ticket, ActivityLog, Role, Invoice } from '../lib/types';

const EU_COUNTRIES: Array<{ code: string; name: string }> = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czechia' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
];

function CustomerList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: customers, loading, error, refetch } = useApi<Customer[]>('/admin/customers');
  const toast = useToast();

  const canCreate = hasPermission('customers.create');
  const canDelete = hasPermission('customers.delete');
  const canImpersonate = hasPermission('customers.impersonate');

  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    username: '',
    company: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    country: 'DE',
    vat_id: '',
  });

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.email.trim() || creating) return;
    setCreating(true);
    try {
      await api.post('/admin/customers', {
        name: newCustomer.name.trim(),
        email: newCustomer.email.trim(),
        username: newCustomer.username.trim() || undefined,
        company: newCustomer.company.trim() || undefined,
        phone: newCustomer.phone.trim() || undefined,
        address: newCustomer.address.trim() || undefined,
        postal_code: newCustomer.postal_code.trim() || undefined,
        city: newCustomer.city.trim() || undefined,
        country: newCustomer.country || 'DE',
        vat_id: newCustomer.vat_id.trim() || undefined,
      });
      toast.success('Customer account created');
      setShowAddModal(false);
      setNewCustomer({
        name: '',
        email: '',
        username: '',
        company: '',
        phone: '',
        address: '',
        postal_code: '',
        city: '',
        country: 'DE',
        vat_id: '',
      });
      refetch();
    } catch (err) {
      toast.error(`Failed to create customer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const handleImpersonateRow = async (c: Customer) => {
    try {
      const res = await api.post<{ impersonation_url: string }>(`/admin/customers/${c.id}/impersonate`);
      if (res?.impersonation_url) {
        window.open(res.impersonation_url, '_blank', 'noopener,noreferrer');
        toast.success(`Impersonation session opened for ${c.name}`);
      }
    } catch (err) {
      toast.error(`Failed to impersonate: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

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
    <Page title="Customer Management" requiredPermission="customers.view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-card border border-border rounded-2xl p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 items-center">
          <input
            type="text"
            placeholder="Search by name, email, ID, or VAT..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:flex-1 rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50 sm:w-40 shrink-0 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
          <HelpTooltip content="Search and filter customer accounts across all EU member states. Click any customer row to manage services, invoices, tickets, or impersonate their dashboard." />
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        )}
      </div>

      {loading && (
        <div className="p-8 text-center text-muted-foreground text-sm">Loading customers...</div>
      )}

      {error && (
        <div className="p-8 text-center text-red-500 text-sm">Failed to load customers: {error}</div>
      )}

      {!loading && !error && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[820px] divide-y divide-border">
              <div className="p-4 bg-foreground/[0.03] text-xs font-medium uppercase tracking-wider grid grid-cols-8 text-muted-foreground">
                <div className="col-span-2">Customer</div>
                <div>Status</div>
                <div>Country</div>
                <div>Company</div>
                <div className="text-center">Active Services</div>
                <div className="text-right">Since</div>
                <div className="text-right">Actions</div>
              </div>
              {filtered.map(c => (
                <div key={c.id} className="p-4 text-sm grid grid-cols-8 items-center hover:bg-foreground/[0.025] transition-colors">
                  <Link to={`/customers/${c.id}`} className="col-span-2 min-w-0 pr-2">
                    <div className="font-medium hover:underline truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <span className="truncate">{c.email}</span>
                      {c.email_verified && <span className="text-green-500 text-[10px] shrink-0" title="Verified">✓</span>}
                    </div>
                  </Link>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${c.status === 'active' ? 'border-green-500/30 text-green-500 bg-green-500/10' : c.status === 'suspended' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' : 'border-red-500/30 text-red-500 bg-red-500/10'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="text-muted-foreground truncate">{c.country || '-'}</div>
                  <div className="text-muted-foreground truncate pr-2">{c.company || '-'}</div>
                  <div className="text-center font-medium tabular-nums">{(c as any).active_services || 0}</div>
                  <div className="text-right text-xs font-mono text-muted-foreground">{c.created_at?.split('T')[0]}</div>
                  <div className="flex justify-end gap-1.5">
                    {canImpersonate && (
                      <button
                        type="button"
                        onClick={() => handleImpersonateRow(c)}
                        className="text-xs rounded-xl border border-border p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer"
                        title="Impersonate Customer"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}
                    <Link to={`/customers/${c.id}`} className="text-xs rounded-xl border border-border p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer" title="Edit/View">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomer(c.id, c.name)}
                        className="text-xs rounded-xl border border-red-500/30 text-red-500 p-1.5 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">No customers match your filters.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-ui-fade">
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-5 sm:p-6 w-full max-w-lg max-h-[90dvh] overflow-y-auto animate-ui-scale">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Add Customer</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="jane@example.eu"
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Username</label>
                  <input
                    type="text"
                    value={newCustomer.username}
                    onChange={e => setNewCustomer({ ...newCustomer, username: e.target.value })}
                    placeholder="janedoe"
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="+49 ..."
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Company</label>
                  <input
                    type="text"
                    value={newCustomer.company}
                    onChange={e => setNewCustomer({ ...newCustomer, company: e.target.value })}
                    placeholder="Company GmbH"
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">VAT ID</label>
                  <input
                    type="text"
                    value={newCustomer.vat_id}
                    onChange={e => setNewCustomer({ ...newCustomer, vat_id: e.target.value })}
                    placeholder="DE123456789"
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="Musterstraße 1"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={newCustomer.postal_code}
                    onChange={e => setNewCustomer({ ...newCustomer, postal_code: e.target.value })}
                    placeholder="10115"
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={newCustomer.city}
                    onChange={e => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    placeholder="Berlin"
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Country (EU)</label>
                  <select
                    value={newCustomer.country}
                    onChange={e => setNewCustomer({ ...newCustomer, country: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  >
                    {EU_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomer}
                disabled={!newCustomer.name.trim() || !newCustomer.email.trim() || creating}
                className="px-4 py-2 rounded-xl text-sm bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
              >
                {creating ? 'Creating...' : 'Create Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

function CustomerDetail() {
  const { id } = useParams();
  const encodedId = id ? encodeURIComponent(id) : '';
  const navigate = useNavigate();
  const { data: customer, loading, error, refetch } = useApi<Customer>(encodedId ? `/admin/customers/${encodedId}` : '');
  const { data: services } = useApi<Service[]>(encodedId ? `/admin/services?customer_id=${encodedId}` : '');
  const { data: customerInvoices, refetch: refetchInvoices } = useApi<Invoice[]>(encodedId ? `/admin/invoices?customer_id=${encodedId}` : '');
  const { data: tickets } = useApi<Ticket[]>(encodedId ? `/admin/tickets?customer_id=${encodedId}` : '');
  const { data: activity } = useApi<ActivityLog[]>(encodedId ? `/admin/activity?customer_id=${encodedId}` : '');
  const { data: roles } = useApi<Role[]>('/admin/staff/roles');
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'services' | 'invoices' | 'tickets' | 'activity'>('services');
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [notesInitialized, setNotesInitialized] = useState(false);
  const [updating, setUpdating] = useState(false);

  const canEdit = hasPermission('customers.edit');
  const canDelete = hasPermission('customers.delete');
  const canImpersonate = hasPermission('customers.impersonate');
  const canManageStaff = hasPermission('staff.manage') || hasPermission('customers.edit');
  const canDeleteInvoices = hasPermission('invoices.delete');

  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [promoteRoleId, setPromoteRoleId] = useState('');
  const [promoteUsername, setPromoteUsername] = useState('');
  const [promoting, setPromoting] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    username: '',
    company: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    country: 'DE',
    vat_id: '',
    vat_verified: false,
  });

  const [resendingVerification, setResendingVerification] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const openEditModal = () => {
    if (!customer) return;
    setEditForm({
      name: customer.name || '',
      email: customer.email || '',
      username: (customer as any).username || '',
      company: customer.company || '',
      phone: customer.phone || '',
      address: customer.address || '',
      postal_code: customer.postal_code || '',
      city: customer.city || '',
      country: customer.country || 'DE',
      vat_id: customer.vat_id || '',
      vat_verified: Boolean(customer.vat_verified),
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!customer || savingEdit || !editForm.name.trim() || !editForm.email.trim()) return;
    setSavingEdit(true);
    try {
      await api.put(`/admin/customers/${customer.id}`, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        username: editForm.username.trim() || undefined,
        company: editForm.company.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        postal_code: editForm.postal_code.trim(),
        city: editForm.city.trim(),
        country: editForm.country || 'DE',
        vat_id: editForm.vat_id.trim(),
        vat_verified: editForm.vat_verified,
      });
      toast.success('Customer profile updated');
      setIsEditModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(`Failed to update customer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleImpersonate = async () => {
    if (!customer || impersonating) return;
    setImpersonating(true);
    try {
      const res = await api.post<{ impersonation_url: string }>(`/admin/customers/${customer.id}/impersonate`);
      if (res?.impersonation_url) {
        window.open(res.impersonation_url, '_blank', 'noopener,noreferrer');
        toast.success(`Impersonation session opened for ${customer.name}`);
      }
    } catch (err) {
      toast.error(`Failed to impersonate customer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setImpersonating(false);
    }
  };

  const handleDeleteCustomerInvoice = async (inv: Invoice) => {
    if (!confirm(`Delete invoice ${inv.invoice_number} (${inv.status})? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/invoices/${inv.id}`);
      toast.success(`Invoice ${inv.invoice_number} deleted`);
      refetchInvoices();
    } catch (err) {
      toast.error(`Failed to delete invoice: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleResendVerification = async () => {
    if (!customer || resendingVerification) return;
    setResendingVerification(true);
    try {
      const res = await api.post<{ ok: boolean; message: string }>(
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    toast.success('Copied to clipboard');
  };

  const openPromoteModal = () => {
    if (!customer) return;
    const initialUsername = customer.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
    setPromoteUsername(initialUsername);
    setPromoteRoleId(roles?.[0]?.id || '');
    setIsPromoteModalOpen(true);
  };

  const handlePromote = async () => {
    if (!customer || !promoteRoleId || promoting) return;
    setPromoting(true);
    try {
      await api.post(`/admin/customers/${customer.id}/promote`, {
        role_id: promoteRoleId,
        username: promoteUsername.trim() || undefined,
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
    return <Page title="Customer" requiredPermission="customers.view"><div className="p-8 text-center text-muted-foreground text-sm">Loading...</div></Page>;
  }

  if (error || !customer) {
    return (
      <Page title="Customer Not Found" requiredPermission="customers.view">
        <p className="text-sm text-muted-foreground">{error || `No customer with ID ${id}.`}</p>
        <Link to="/customers" className="text-sm text-foreground hover:underline mt-2 inline-block">Back to customers</Link>
      </Page>
    );
  }

  const customerServices = services || [];
  const invoicesList = customerInvoices || [];
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
    { key: 'invoices', label: 'Invoices', count: invoicesList.length },
    { key: 'tickets', label: 'Tickets', count: customerTickets.length },
    { key: 'activity', label: 'Activity', count: customerActivity.length },
  ] as const;

  return (
    <Page title="Customer Management" requiredPermission="customers.view">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> All Customers
        </button>
        {canEdit && (
          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border border-border hover:bg-foreground/5 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Customer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="rounded-2xl border border-border bg-card shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-lg font-medium truncate">{customer.name}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border shrink-0 ${customer.status === 'active' ? 'border-green-500/30 text-green-500 bg-green-500/10' : customer.status === 'suspended' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' : 'border-red-500/30 text-red-500 bg-red-500/10'}`}>
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
                      {canEdit && (
                        <button
                          onClick={handleMarkVerified}
                          disabled={verifyingEmail}
                          className="text-[10px] px-1.5 py-0.5 border border-border hover:bg-foreground/5 cursor-pointer disabled:opacity-50"
                          title="Manually verify email"
                        >
                          {verifyingEmail ? '...' : 'Verify Now'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

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
                    onClick={() => handleCopy(customer.id)}
                    className="p-1 hover:bg-foreground/5 cursor-pointer text-muted-foreground hover:text-foreground"
                    title="Copy full Customer ID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
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
              <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-green-500/30 text-green-500 bg-green-500/10">2FA Enabled</span>
            ) : (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-border text-muted-foreground">2FA Off</span>
            )}
            <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-border text-muted-foreground">
              Updated: {customer.updated_at?.split('T')[0] || '-'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card shadow-xs p-5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Active Services</div>
            <div className="text-2xl font-light tabular-nums">{customerServices.filter(s => s.status === 'running').length}</div>
            <div className="text-xs text-muted-foreground mt-1">{customerServices.length} total</div>
          </div>
          <div className="rounded-2xl border border-border bg-card shadow-xs p-5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Monthly Revenue</div>
            <div className="text-2xl font-light tabular-nums">
              €{customerServices.reduce((sum, s) => sum + parseFloat(s.price || '0'), 0).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">from active services</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card shadow-xs p-5">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              Quick Actions
              <HelpTooltip content="Perform administrative operations on this customer account. Impersonate opens a temporary 1-hour Storefront session in a new tab." />
            </h4>
            <div className="space-y-2">
              {canEdit && (
                <button
                  onClick={openEditModal}
                  className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" /> Edit Customer Details
                </button>
              )}
              {canEdit && (
                <button
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  {resendingVerification ? 'Sending Email...' : 'Resend Verification Email'}
                </button>
              )}
              {!customer.email_verified && canEdit && (
                <button
                  onClick={handleMarkVerified}
                  disabled={verifyingEmail}
                  className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm border border-green-500/30 text-green-600 hover:bg-green-500/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  {verifyingEmail ? 'Verifying...' : 'Mark Email as Verified'}
                </button>
              )}
              {canManageStaff && (
                <button onClick={openPromoteModal} className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground" /> Make Staff Member
                </button>
              )}
              {canImpersonate && (
                <button
                  onClick={handleImpersonate}
                  disabled={impersonating}
                  className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  {impersonating ? 'Opening Session...' : 'Impersonate'}
                </button>
              )}
              <Link to="/tickets/new" className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm border border-border hover:bg-foreground/5 transition-colors">
                <LifeBuoy className="w-3.5 h-3.5 text-muted-foreground" /> Create Ticket
              </Link>
              <Link to="/services/new" className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm border border-border hover:bg-foreground/5 transition-colors">
                <Server className="w-3.5 h-3.5 text-muted-foreground" /> Provision Service
              </Link>
              {canEdit && customer.status === 'active' && (
                <button onClick={() => handleStatusChange('suspended')} disabled={updating} className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <Ban className="w-3.5 h-3.5 text-muted-foreground" /> {updating ? 'Processing...' : 'Suspend Account'}
                </button>
              )}
              {canEdit && customer.status === 'suspended' && (
                <button onClick={() => handleStatusChange('active')} disabled={updating} className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm border border-border hover:bg-foreground/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <Play className="w-3.5 h-3.5 text-muted-foreground" /> {updating ? 'Processing...' : 'Reactivate'}
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDeleteCustomer}
                  disabled={deletingCustomer}
                  className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {deletingCustomer ? 'Deleting...' : 'Delete Customer Account'}
                </button>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card shadow-xs p-5">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Internal Notes</h4>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              disabled={!canEdit}
              className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50 resize-none mb-2.5 disabled:opacity-60"
              placeholder="Staff-only notes about this customer..."
            />
            {canEdit && (
              <button onClick={handleSaveNotes} disabled={updating} className="text-xs px-3.5 py-2 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {updating ? 'Saving...' : notesSaved ? 'Saved' : 'Save Notes'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border mb-4 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${activeTab === t.key ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}
          >
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === t.key ? 'bg-background/20 text-background' : 'border border-border'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {activeTab === 'services' && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[740px] divide-y divide-border">
              <div className="p-3.5 bg-foreground/[0.03] text-xs font-medium uppercase tracking-wider grid grid-cols-7 text-muted-foreground">
                <div className="col-span-2">Service</div>
                <div>IP</div>
                <div>Status</div>
                <div>Price</div>
                <div>Next Due</div>
                <div className="text-right">Actions</div>
              </div>
              {customerServices.map(s => (
                <div key={s.id} className="p-3.5 text-sm grid grid-cols-7 items-center hover:bg-foreground/[0.025] transition-colors">
                  <Link to={`/services/${s.id}`} className="col-span-2 min-w-0 pr-2">
                    <div className="font-medium hover:underline truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.hostname}</div>
                  </Link>
                  <div className="font-mono text-xs">{s.ip || '-'}</div>
                  <div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase ${s.status === 'running' ? 'border-green-500/30 bg-green-500/10 text-green-500' : s.status === 'suspended' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500' : s.status === 'pending' ? 'border-blue-500/30 bg-blue-500/10 text-blue-500' : 'border-red-500/30 bg-red-500/10 text-red-500'}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="tabular-nums">€{parseFloat(s.price || '0').toFixed(2)}/mo</div>
                  <div className="text-muted-foreground font-mono text-xs">{s.next_due?.split('T')[0] || '-'}</div>
                  <div className="flex justify-end gap-1.5 flex-wrap">
                    {s.status !== 'suspended' && s.status !== 'terminated' && (
                      <button onClick={() => { if(confirm('Force suspend this service?')) api.post(`/admin/services/${s.id}/suspend`).then(refetch) }} className="text-[10px] px-2 py-1 rounded-lg border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 uppercase cursor-pointer" title="Force Suspend">Suspend</button>
                    )}
                    {s.status === 'suspended' && (
                      <button onClick={() => { if(confirm('Force reactivate this service?')) api.post(`/admin/services/${s.id}/reactivate`).then(refetch) }} className="text-[10px] px-2 py-1 rounded-lg border border-green-500/30 text-green-500 hover:bg-green-500/10 uppercase cursor-pointer" title="Force Reactivate">Unsuspend</button>
                    )}
                    {s.status !== 'terminated' && (
                      <button onClick={() => { if(confirm('Force TERMINATE this service? Data will be lost!')) api.post(`/admin/services/${s.id}/terminate`).then(refetch) }} className="text-[10px] px-2 py-1 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 uppercase cursor-pointer" title="Force Terminate">Terminate</button>
                    )}
                  </div>
                </div>
              ))}
              {customerServices.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">No services.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          {invoicesList.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[640px] divide-y divide-border">
                <div className="p-3.5 bg-foreground/[0.03] text-xs font-medium uppercase tracking-wider grid grid-cols-5 text-muted-foreground">
                  <div>Invoice #</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>Due Date</div>
                  <div className="text-right">Actions</div>
                </div>
                {invoicesList.map(inv => (
                  <div key={inv.id} className="p-3.5 text-sm grid grid-cols-5 items-center hover:bg-foreground/[0.025] transition-colors">
                    <div className="font-mono text-xs">{inv.invoice_number}</div>
                    <div className="font-medium tabular-nums">€{parseFloat(inv.total || '0').toFixed(2)}</div>
                    <div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase ${inv.status === 'paid' ? 'border-green-500/30 bg-green-500/10 text-green-500' : inv.status === 'pending' ? 'border-blue-500/30 bg-blue-500/10 text-blue-500' : inv.status === 'overdue' ? 'border-red-500/30 bg-red-500/10 text-red-500' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-muted-foreground font-mono text-xs">{inv.due_date}</div>
                    <div className="flex justify-end gap-1.5">
                      <Link to="/billing/invoices" className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-foreground/5">
                        View
                      </Link>
                      {canDeleteInvoices && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomerInvoice(inv)}
                          className="text-xs px-2.5 py-1 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">No invoices.</div>
          )}
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          {customerTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[600px] divide-y divide-border">
                <div className="p-3.5 bg-foreground/[0.03] text-xs font-medium uppercase tracking-wider grid grid-cols-5 text-muted-foreground">
                  <div className="col-span-2">Subject</div>
                  <div>Category</div>
                  <div>Status</div>
                  <div>Created</div>
                </div>
                {customerTickets.map(t => (
                  <Link key={t.id} to={`/tickets/${t.id}`} className="p-3.5 text-sm grid grid-cols-5 items-center hover:bg-foreground/[0.025] transition-colors">
                    <div className="col-span-2 font-medium truncate pr-2">{t.subject}</div>
                    <div className="text-muted-foreground capitalize">{t.category}</div>
                    <div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase ${t.status === 'open' ? 'border-green-500/30 bg-green-500/10 text-green-500' : t.status === 'in_progress' ? 'border-blue-500/30 bg-blue-500/10 text-blue-500' : t.status === 'waiting_customer' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-xs font-mono">{t.created_at?.split('T')[0]}</div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">No tickets.</div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          {customerActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-[580px] divide-y divide-border">
                <div className="p-3.5 bg-foreground/[0.03] text-xs font-medium uppercase tracking-wider grid grid-cols-4 text-muted-foreground">
                  <div className="col-span-2">Activity</div>
                  <div>Category</div>
                  <div>Time</div>
                </div>
                {customerActivity.map((a, i) => (
                  <div key={i} className="p-3.5 text-sm grid grid-cols-4 items-center">
                    <div className="col-span-2 pr-2">
                      <span className="font-medium">{a.action}</span> {a.target}
                      {a.detail && <span className="text-muted-foreground text-xs ml-2">— {a.detail}</span>}
                    </div>
                    <div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-border uppercase text-muted-foreground">
                        {a.category}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-xs font-mono">{a.created_at?.replace('T', ' ').slice(0, 16)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">No recorded activity.</div>
          )}
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-ui-fade">
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-5 sm:p-6 w-full max-w-lg max-h-[90dvh] overflow-y-auto animate-ui-scale">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-muted-foreground" /> Edit Customer
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Company</label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">VAT ID</label>
                  <input
                    type="text"
                    value={editForm.vat_id}
                    onChange={e => setEditForm({ ...editForm, vat_id: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={editForm.postal_code}
                    onChange={e => setEditForm({ ...editForm, postal_code: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Country (EU)</label>
                  <select
                    value={editForm.country}
                    onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
                  >
                    {EU_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editForm.vat_verified}
                  onChange={e => setEditForm({ ...editForm, vat_verified: e.target.checked })}
                  className="w-4 h-4 accent-foreground rounded"
                />
                VAT ID Verified (EU VIES / Reverse Charge eligible)
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editForm.name.trim() || !editForm.email.trim() || savingEdit}
                className="px-4 py-2 rounded-xl text-sm bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPromoteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-ui-fade">
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-5 sm:p-6 w-full max-w-md max-h-[90dvh] overflow-y-auto animate-ui-scale">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Shield className="w-5 h-5 text-muted-foreground" /> Make Staff Member
              </h2>
              <button onClick={() => setIsPromoteModalOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Promote <span className="font-medium text-foreground">{customer.name}</span> ({customer.email}) to an administrative staff account.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1.5">Administrative Role</label>
                <select
                  value={promoteRoleId}
                  onChange={e => setPromoteRoleId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                >
                  <option value="" disabled>Select Role...</option>
                  {roles?.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1.5">Staff Username</label>
                <input
                  type="text"
                  value={promoteUsername}
                  onChange={e => setPromoteUsername(e.target.value)}
                  placeholder="e.g. johndoe"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50 font-mono"
                />
              </div>

              <div className="rounded-xl border border-border bg-foreground/[0.03] p-3 text-xs text-muted-foreground">
                This staff member will automatically use their existing VaultScope account credentials and 2FA settings.
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setIsPromoteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePromote}
                disabled={!promoteRoleId || promoting}
                className="px-4 py-2 rounded-xl text-sm bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-2"
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
