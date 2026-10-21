import { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Shield, Users, Plus, Edit2, Camera, Key, Mail, CheckCircle2, Trash2 } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import type { Staff, Role, Customer } from '../lib/types';

interface StaffWithRole extends Staff {
  role_name: string;
}

function StaffTabs() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="flex gap-4 mb-6 border-b border-border">
      <Link
        to="/staff/account"
        className={`pb-2 px-1 text-sm font-medium transition-colors cursor-pointer ${path.endsWith('/account') ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        My Account
      </Link>
      <Link
        to="/staff/members"
        className={`pb-2 px-1 text-sm font-medium transition-colors cursor-pointer ${path.endsWith('/members') ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        Staff Members
      </Link>
      <Link
        to="/staff/rbac"
        className={`pb-2 px-1 text-sm font-medium transition-colors cursor-pointer ${path.endsWith('/rbac') ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        Roles & Permissions
      </Link>
    </div>
  );
}

function StaffAccount() {
  const { data: profile, loading, error, refetch } = useApi<StaffWithRole>('/admin/staff/me');
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', username: '', email: '' });
  const [saving, setSaving] = useState(false);

  // Initialize form data when profile loads
  if (profile && !isEditing && formData.first_name === '' && formData.username === '') {
    setFormData({
      first_name: profile.first_name,
      last_name: profile.last_name,
      username: profile.username,
      email: profile.email
    });
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/staff/me', formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      refetch();
    } catch (err) {
      toast.error(`Failed to update profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Page title="Identity, Staff & RBAC"><StaffTabs /><div className="p-8 text-center text-muted-foreground text-sm">Loading profile...</div></Page>;
  if (error) return <Page title="Identity, Staff & RBAC"><StaffTabs /><div className="p-8 text-center text-red-500 text-sm">Failed to load profile: {error}</div></Page>;
  if (!profile) return null;

  return (
    <Page title="Identity, Staff & RBAC">
      <StaffTabs />
      <div className="max-w-3xl">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-border bg-background p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 border-2 border-border bg-foreground/5 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-light text-muted-foreground">
                    {profile.first_name.charAt(0)}{profile.last_name.charAt(0) || profile.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 p-1.5 border border-border bg-background hover:bg-foreground/5 transition-colors cursor-pointer">
                <Camera className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="text-sm font-medium">{profile.first_name} {profile.last_name || profile.username}</div>
            <div className="text-xs text-muted-foreground mt-0.5">@{profile.username}</div>
            <div className="mt-3 px-2.5 py-1 border border-border text-[10px] uppercase tracking-wider font-medium">
              {profile.role_name}
            </div>
            <div className="mt-4 pt-4 border-t border-border w-full text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Staff ID</span>
                <span className="font-mono">{profile.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Last Login</span>
                <span>{profile.last_login?.split('T')[0] || '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">IP</span>
                <span className="font-mono">{profile.last_login_ip || '—'}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <section className="border border-border bg-background p-5">
              <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
                <h3 className="text-sm font-medium">Profile Information</h3>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setIsEditing(false); setFormData({ first_name: profile.first_name, last_name: profile.last_name, username: profile.username, email: profile.email }); }} className="text-xs px-2 py-1 border border-border hover:bg-foreground/5">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="text-xs px-2 py-1 bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">First Name</label>
                    <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" readOnly={!isEditing} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Last Name</label>
                    <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" readOnly={!isEditing} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Username</label>
                  <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" readOnly={!isEditing} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Email</label>
                  <div className="flex gap-2">
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="flex-1 border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" readOnly={!isEditing} />
                    {profile.email_verified ? (
                      <span className="flex items-center gap-1 px-3 border border-green-500/30 text-green-500 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 border border-yellow-500/30 text-yellow-500 text-xs">
                        <Mail className="w-3.5 h-3.5" /> Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="border border-border bg-background p-5">
              <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Security</h3>
              <div className="space-y-5">
                <div className="p-4 border border-border bg-foreground/[0.02]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Assigned Role</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Managed via CAMOS RBAC — contact a Owner to change.</div>
                    </div>
                    <span className="px-2.5 py-1 border border-border text-xs font-medium">{profile.role_name}</span>
                  </div>
                </div>

                <div className="p-4 border border-border bg-foreground/[0.02]">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Password Management</div>
                      <div className="text-xs text-muted-foreground">Credentials are managed securely. Passwords can be updated by an administrator or through account settings.</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Page>
  );
}

function StaffMembers() {
  const [searchStaff, setSearchStaff] = useState('');
  const { data: staffList, loading, error, refetch } = useApi<StaffWithRole[]>('/admin/staff');
  const { data: roles } = useApi<Role[]>('/admin/staff/roles');
  const { data: customers } = useApi<Customer[]>('/admin/customers');
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [editStaff, setEditStaff] = useState({ id: '', first_name: '', last_name: '', username: '', email: '', role_id: '', password: '' });
  const [saving, setSaving] = useState(false);

  const items = staffList || [];
  const filtered = items.filter(s =>
    s.first_name.toLowerCase().includes(searchStaff.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchStaff.toLowerCase()) ||
    s.email.toLowerCase().includes(searchStaff.toLowerCase()) ||
    s.role_name.toLowerCase().includes(searchStaff.toLowerCase())
  );

  const openCreateModal = () => {
    setSelectedCustomerId('');
    setEditStaff({ id: '', first_name: '', last_name: '', username: '', email: '', role_id: roles?.[0]?.id || '', password: '' });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (s: StaffWithRole) => {
    setSelectedCustomerId('');
    setEditStaff({ id: s.id, first_name: s.first_name, last_name: s.last_name, username: s.username, email: s.email, role_id: s.role_id || roles?.[0]?.id || '', password: '' });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (!customerId) return;
    const c = customers?.find(item => item.id === customerId);
    if (c) {
      const parts = c.name.trim().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      const username = c.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
      setEditStaff(prev => ({
        ...prev,
        first_name: firstName,
        last_name: lastName,
        username,
        email: c.email,
      }));
    }
  };

  const handleSave = async () => {
    if (!editStaff.username.trim() || !editStaff.email.trim() || saving) return;
    setSaving(true);
    try {
      if (modalMode === 'create' && selectedCustomerId) {
        await api.post(`/admin/customers/${selectedCustomerId}/promote`, {
          role_id: editStaff.role_id,
          username: editStaff.username.trim() || undefined,
          password: editStaff.password.trim() || undefined,
        });
        toast.success('Customer promoted to staff successfully');
      } else if (modalMode === 'create') {
        await api.post('/admin/staff', {
          first_name: editStaff.first_name,
          last_name: editStaff.last_name,
          username: editStaff.username,
          email: editStaff.email,
          role_id: editStaff.role_id,
          password: editStaff.password.trim() || undefined,
        });
        toast.success('Staff member created successfully');
      } else {
        await api.put(`/admin/staff/${editStaff.id}`, {
          first_name: editStaff.first_name,
          last_name: editStaff.last_name,
          username: editStaff.username,
          email: editStaff.email,
          role_id: editStaff.role_id,
          password: editStaff.password.trim() || undefined,
        });
        toast.success('Staff member updated successfully');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(`Failed to save staff: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || modalMode !== 'edit') return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const apiBase =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'vaultscope.de' ||
          window.location.hostname.endsWith('.vaultscope.de'))
          ? '/api'
          : import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiBase}/admin/staff/${editStaff.id}/avatar`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vs_admin_token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to upload');
      toast.success('Avatar uploaded successfully');
      refetch();
    } catch (err) {
      toast.error('Avatar upload failed');
    }
  };

  const handleDelete = async (id: string, name: string, isFirst: boolean) => {
    if (isFirst) {
      toast.error("Cannot delete the root user.");
      return;
    }
    if (!confirm(`Delete user "${name}"?`)) return;
    try {
      await api.delete(`/admin/staff/${id}`);
      refetch();
    } catch (err) {
      toast.error(`Failed to delete user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <Page title="Identity, Staff & RBAC">
      <StaffTabs />
      <div className="flex flex-col md:flex-row gap-3 mb-4 bg-foreground/[0.02] border border-border p-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search staff by Name, Email, or Role..."
            value={searchStaff}
            onChange={e => setSearchStaff(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading staff...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load staff: {error}</div>}

      {!loading && !error && (
        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-5 text-muted-foreground">
            <div className="col-span-2">Staff Member (OIDC)</div>
            <div>Assigned Role</div>
            <div className="text-right">Last Login</div>
            <div className="text-right">Actions</div>
          </div>
          {filtered.map((s, index) => {
            const isRoot = index === 0 && !searchStaff;
            const disableDelete = isRoot || items[0]?.id === s.id;
            return (
              <div key={s.id} className="p-4 text-sm grid grid-cols-5 items-center hover:bg-foreground/[0.02]">
                <div className="col-span-2 flex items-center gap-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">{s.first_name} {s.last_name}</span>
                    <span className="text-xs text-muted-foreground">{s.email}</span>
                  </div>
                </div>
                <div><span className="px-2 py-1 border border-border text-xs">{s.role_name}</span></div>
                <div className="text-right text-muted-foreground text-xs">{s.last_login?.split('T')[0] || 'Never'}</div>
                <div className="text-right flex justify-end gap-2">
                  <button onClick={() => openEditModal(s)} className="text-xs border border-border p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(s.id, s.username, disableDelete)} className={`text-xs border p-1.5 transition-colors ${disableDelete ? 'opacity-50 cursor-not-allowed border-border text-muted-foreground' : 'border-red-500/30 text-red-500 hover:bg-red-500/5 cursor-pointer'}`} title="Delete" disabled={disableDelete}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {items.length === 0 ? 'No staff members registered.' : 'No staff match your filters.'}
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" /> {modalMode === 'create' ? 'Add User' : 'Edit User'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              {modalMode === 'create' && (
                <div className="p-3 border border-border bg-foreground/[0.02]">
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                    Import from Existing Customer (Optional)
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={e => handleSelectCustomer(e.target.value)}
                    className="w-full border border-border bg-background p-2 text-sm focus:outline-none focus:border-foreground"
                  >
                    <option value="">-- Create Fresh Staff Member --</option>
                    {customers?.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Select an existing customer to promote them and link their account.
                  </span>
                </div>
              )}
              {modalMode === 'edit' && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Upload Avatar</label>
                  <input type="file" accept=".png, .webp, .jpg, .jpeg" onChange={handleAvatarUpload} className="text-sm" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">First Name</label>
                  <input type="text" value={editStaff.first_name} onChange={e => setEditStaff({...editStaff, first_name: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Last Name</label>
                  <input type="text" value={editStaff.last_name} onChange={e => setEditStaff({...editStaff, last_name: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Username</label>
                <input type="text" value={editStaff.username} onChange={e => setEditStaff({...editStaff, username: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Email</label>
                <input type="email" value={editStaff.email} onChange={e => setEditStaff({...editStaff, email: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                  Password {modalMode === 'edit' ? '(Leave empty to keep unchanged)' : selectedCustomerId ? '(Optional - uses customer password if empty)' : '(Optional)'}
                </label>
                <input
                  type="password"
                  value={editStaff.password}
                  onChange={e => setEditStaff({...editStaff, password: e.target.value})}
                  placeholder={modalMode === 'edit' ? '••••••••' : selectedCustomerId ? 'Leave empty to use customer password' : 'Enter password...'}
                  className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Role</label>
                <select value={editStaff.role_id} onChange={e => setEditStaff({...editStaff, role_id: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
                  <option value="" disabled>Select Role...</option>
                  {roles?.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer border border-transparent">Cancel</button>
              <button
                onClick={handleSave}
                disabled={!editStaff.username || !editStaff.email || saving}
                className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {saving ? 'Saving...' : modalMode === 'create' ? 'Add User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

function StaffRbac() {
  const [searchRole, setSearchRole] = useState('');
  const { data: roles, loading, error, refetch } = useApi<Role[]>('/admin/staff/roles');
  const toast = useToast();

  const items = roles || [];
  const filtered = items.filter(r =>
    r.name.toLowerCase().includes(searchRole.toLowerCase()) ||
    r.mapped_group.toLowerCase().includes(searchRole.toLowerCase()) ||
    r.permissions.some(p => p.toLowerCase().includes(searchRole.toLowerCase()))
  );

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editRole, setEditRole] = useState({ id: '', name: '', mapped_group: '', permissions: [] as string[] });
  const [saving, setSaving] = useState(false);

  const permissionGroups = {
    Root: ['*'],
    Customers: ['customers.view', 'customers.manage', 'customers.create', 'customers.edit', 'customers.delete'],
    Billing: ['billing.view', 'billing.manage', 'invoices.view', 'invoices.manage', 'invoices.create', 'invoices.edit', 'invoices.delete', 'tax.manage', 'coupons.manage'],
    Services: ['services.view', 'services.manage', 'services.power', 'services.reinstall', 'services.suspend', 'services.terminate'],
    Jobs: ['jobs.view', 'jobs.manage'],
    Staff: ['staff.view', 'staff.manage', 'staff.delete', 'accounts.delete', 'rbac.manage'],
    Products: ['products.view', 'products.manage', 'products.create', 'products.edit', 'products.delete', 'forms.manage'],
    Tickets: ['tickets.view', 'tickets.manage', 'tickets.reply', 'departments.manage'],
    System: ['settings.manage', 'templates.manage', 'email_logs.view', 'email_logs.manage', 'activity.view', 'reports.view']
  };

  const handleTogglePerm = (perm: string) => {
    if (editRole.permissions.includes(perm)) {
      setEditRole({ ...editRole, permissions: editRole.permissions.filter(p => p !== perm) });
    } else {
      setEditRole({ ...editRole, permissions: [...editRole.permissions, perm] });
    }
  };

  const openCreateModal = () => {
    setEditRole({ id: '', name: '', mapped_group: '', permissions: [] });
    setModalMode('create');
    setIsRoleModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditRole({ id: role.id, name: role.name, mapped_group: role.mapped_group, permissions: [...role.permissions] });
    setModalMode('edit');
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!editRole.name.trim() || !editRole.mapped_group.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: editRole.name.trim(),
        mapped_group: editRole.mapped_group.trim(),
        permissions: editRole.permissions,
      };

      if (modalMode === 'create') {
        await api.post('/admin/staff/roles', payload);
      } else {
        await api.put(`/admin/staff/roles/${editRole.id}`, payload);
      }
      setIsRoleModalOpen(false);
      refetch();
    } catch (err) {
      toast.error('Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await api.delete(`/admin/staff/roles/${id}`);
      refetch();
    } catch (err) {
      toast.error('Failed to delete role');
    }
  };

  return (
    <Page title="Identity, Staff & RBAC">
      <StaffTabs />
      <div className="flex flex-col md:flex-row justify-between gap-3 mb-4 bg-foreground/[0.02] border border-border p-3">
        <div className="flex-1 max-w-lg">
          <input type="text" placeholder="Search roles by Name, OIDC Group, or Permission..." value={searchRole} onChange={e => setSearchRole(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground" />
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer whitespace-nowrap">
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading roles...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load roles: {error}</div>}

      {!loading && !error && (
        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-5 text-muted-foreground">
            <div className="col-span-2">Role Name & OIDC Mapping</div>
            <div className="col-span-2">Precise Permissions</div>
            <div className="text-right">Actions</div>
          </div>
          {filtered.map((r) => (
            <div key={r.id} className="p-4 text-sm grid grid-cols-5 items-start hover:bg-foreground/[0.02]">
              <div className="col-span-2 flex items-start gap-3">
                <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">OIDC Group: <code className="bg-foreground/5 px-1 py-0.5">{r.mapped_group}</code></span>
                </div>
              </div>
              <div className="col-span-2 flex flex-wrap gap-1.5">
                {r.permissions.map(p => (
                  <span key={p} className="text-[10px] px-1.5 py-0.5 border border-border bg-foreground/5 text-muted-foreground font-mono">
                    {p}
                  </span>
                ))}
              </div>
              <div className="text-right flex justify-end gap-2">
                <button onClick={() => openEditModal(r)} className="text-xs border border-border p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteRole(r.id)} className="text-xs border border-red-500/30 text-red-500 p-1.5 hover:bg-red-500/5 transition-colors cursor-pointer" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {items.length === 0 ? 'No roles configured.' : 'No roles match your filters.'}
            </div>
          )}
        </div>
      )}

      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Shield className="w-5 h-5 text-muted-foreground" /> {modalMode === 'create' ? 'Create Role' : 'Edit Role'}
              </h2>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Role Name</label>
                <input type="text" value={editRole.name} onChange={e => setEditRole({...editRole, name: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" placeholder="e.g. Legal Team" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">OIDC Mapped Group</label>
                <input type="text" value={editRole.mapped_group} onChange={e => setEditRole({...editRole, mapped_group: e.target.value.toLowerCase().replace(/\s+/g, '_')})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground font-mono" placeholder="e.g. legal_team" />
                <p className="text-[10px] text-muted-foreground mt-1">Users from your OIDC provider matching this group will be automatically assigned this role.</p>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-medium text-muted-foreground uppercase">Permissions</label>
                  <select
                    className="border border-border bg-transparent text-xs p-1 focus:outline-none focus:border-foreground"
                    onChange={(e) => {
                      const template = e.target.value;
                      let perms: string[] = [];
                      if (template === 'Support') perms = ['tickets.manage', 'customers.view', 'services.view'];
                      else if (template === 'Billing') perms = ['billing.manage', 'invoices.manage', 'customers.view'];
                      else if (template === 'Technical') perms = ['tickets.manage', 'services.manage', 'services.power'];
                      else if (template === 'Infrastructure Admin') perms = ['services.manage', 'services.power', 'services.reinstall'];
                      else if (template === 'Account Manager') perms = ['customers.manage', 'customers.delete', 'staff.manage', 'staff.delete', 'accounts.delete'];
                      else if (template === 'Root') perms = ['*'];
                      
                      if (template) {
                        setEditRole({ ...editRole, permissions: perms });
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Apply Template...</option>
                    <option value="Support">Support</option>
                    <option value="Billing">Billing</option>
                    <option value="Technical">Technical</option>
                    <option value="Infrastructure Admin">Infrastructure Admin</option>
                    <option value="Account Manager">Account Manager</option>
                    <option value="Root">Root</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(permissionGroups).map(([group, perms]) => (
                    <div key={group} className="space-y-2">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">{group}</h4>
                      <div className="space-y-1">
                        {perms.map(perm => (
                          <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-foreground/[0.02] p-1 border border-transparent hover:border-border">
                            <input type="checkbox" checked={editRole.permissions.includes(perm)} onChange={() => handleTogglePerm(perm)} className="accent-foreground w-4 h-4" />
                            <span className="font-mono text-xs">{perm}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <button onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer border border-transparent">Cancel</button>
              <button
                onClick={handleSaveRole}
                disabled={!editRole.name || !editRole.mapped_group || saving}
                className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {saving ? 'Saving...' : modalMode === 'create' ? 'Save Role' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export default function StaffRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="members" replace />} />
      <Route path="members" element={<StaffMembers />} />
      <Route path="rbac" element={<StaffRbac />} />
      <Route path="account" element={<StaffAccount />} />
    </Routes>
  );
}

