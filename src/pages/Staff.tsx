import { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Shield, Users, Plus, Edit2, Camera, Key, ShieldCheck, Mail, CheckCircle2, Trash2 } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import type { Staff, Role } from '../lib/types';

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
  const { data: profile, loading, error } = useApi<StaffWithRole>('/admin/staff/me');

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
              <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">First Name</label>
                    <input type="text" defaultValue={profile.first_name} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Last Name</label>
                    <input type="text" defaultValue={profile.last_name} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" readOnly />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Username</label>
                  <input type="text" defaultValue={profile.username} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" readOnly />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Email</label>
                  <div className="flex gap-2">
                    <input type="email" defaultValue={profile.email} className="flex-1 border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" readOnly />
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
                <div className="flex items-center justify-between p-4 border border-border bg-foreground/[0.02]">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={`w-5 h-5 ${profile.mfa_enabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <div>
                      <div className="text-sm font-medium">Multi-Factor Authentication</div>
                      <div className="text-xs text-muted-foreground">
                        {profile.mfa_enabled ? 'Enabled via Authentik' : 'Not configured'}
                      </div>
                    </div>
                  </div>
                  {profile.mfa_enabled ? (
                    <span className="text-xs px-2.5 py-1 border border-green-500/30 text-green-500">Active</span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 border border-yellow-500/30 text-yellow-500">Inactive</span>
                  )}
                </div>

                <div className="p-4 border border-border bg-foreground/[0.02]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Assigned Role</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Managed via CAMOS RBAC — contact a Super Admin to change.</div>
                    </div>
                    <span className="px-2.5 py-1 border border-border text-xs font-medium">{profile.role_name}</span>
                  </div>
                </div>

                <div className="p-4 border border-border bg-foreground/[0.02]">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Password Management</div>
                      <div className="text-xs text-muted-foreground">Passwords are managed through Authentik. Use your identity provider to change credentials.</div>
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
  const { data: staffList, loading, error } = useApi<StaffWithRole[]>('/admin/staff');

  const items = staffList || [];
  const filtered = items.filter(s =>
    s.first_name.toLowerCase().includes(searchStaff.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchStaff.toLowerCase()) ||
    s.email.toLowerCase().includes(searchStaff.toLowerCase()) ||
    s.role_name.toLowerCase().includes(searchStaff.toLowerCase())
  );

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
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading staff...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load staff: {error}</div>}

      {!loading && !error && (
        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-4 text-muted-foreground">
            <div className="col-span-2">Staff Member (OIDC)</div>
            <div>Assigned Role</div>
            <div className="text-right">Last Login</div>
          </div>
          {filtered.map(s => (
            <div key={s.id} className="p-4 text-sm grid grid-cols-4 items-center hover:bg-foreground/[0.02]">
              <div className="col-span-2 flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">{s.first_name} {s.last_name}</span>
                  <span className="text-xs text-muted-foreground">{s.email}</span>
                </div>
              </div>
              <div><span className="px-2 py-1 border border-border text-xs">{s.role_name}</span></div>
              <div className="text-right text-muted-foreground text-xs">{s.last_login?.split('T')[0] || 'Never'}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {items.length === 0 ? 'No staff members registered.' : 'No staff match your filters.'}
            </div>
          )}
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

  const availablePerms = ['*', 'user.view', 'user.create', 'user.update', 'user.delete', 'billing.manage', 'tickets.manage', 'servers.power', 'servers.wipe', 'api.manage'];

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

  const handleSave = async () => {
    if (!editRole.name.trim() || !editRole.mapped_group.trim() || saving) return;

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
      toast.error(`Failed to save role: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete role "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/staff/roles/${id}`);
      refetch();
    } catch (err) {
      toast.error(`Failed to delete role: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
                <button onClick={() => handleDelete(r.id, r.name)} className="text-xs border border-red-500/30 text-red-500 p-1.5 hover:bg-red-500/5 transition-colors cursor-pointer" title="Delete">
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
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-3">Permissions</label>
                <div className="grid grid-cols-2 gap-3">
                  {availablePerms.map(perm => (
                    <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-foreground/[0.02] p-1 border border-transparent hover:border-border">
                      <input type="checkbox" checked={editRole.permissions.includes(perm)} onChange={() => handleTogglePerm(perm)} className="accent-foreground w-4 h-4" />
                      <span className="font-mono text-xs">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <button onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer border border-transparent">Cancel</button>
              <button
                onClick={handleSave}
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
