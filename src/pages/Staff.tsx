import { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Shield, Users, Plus, Edit2, Trash2 } from 'lucide-react';

function StaffTabs() {
  const location = useLocation();
  const currentTab = location.pathname.split('/').pop();
  
  return (
    <div className="flex gap-4 mb-6 border-b border-border">
      <Link 
        to="/staff/members"
        className={`pb-2 px-1 text-sm font-medium transition-colors cursor-pointer ${currentTab === 'members' ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        Staff Members
      </Link>
      <Link 
        to="/staff/rbac"
        className={`pb-2 px-1 text-sm font-medium transition-colors cursor-pointer ${currentTab === 'rbac' ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        Roles & Permissions
      </Link>
    </div>
  );
}

function StaffMembers() {
  const [searchStaff, setSearchStaff] = useState('');
  
  const [staffList] = useState([
    { name: 'Admin User', email: 'admin@vaultscope.de', role: 'Super Admin', login: '2 mins ago' },
    { name: 'Support Agent', email: 'support@vaultscope.de', role: 'Support Tier 1', login: '1 hour ago' }
  ]);

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchStaff.toLowerCase()) || 
    s.email.toLowerCase().includes(searchStaff.toLowerCase()) ||
    s.role.toLowerCase().includes(searchStaff.toLowerCase())
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
      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-4 text-muted-foreground">
          <div className="col-span-2">Staff Member (OIDC)</div>
          <div>Assigned Role</div>
          <div className="text-right">Last Login</div>
        </div>
        {filteredStaff.map(s => (
          <div key={s.email} className="p-4 text-sm grid grid-cols-4 items-center hover:bg-foreground/[0.02]">
            <div className="col-span-2 flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">{s.name}</span>
                <span className="text-xs text-muted-foreground">{s.email}</span>
              </div>
            </div>
            <div><span className="px-2 py-1 border border-border text-xs rounded-sm">{s.role}</span></div>
            <div className="text-right text-muted-foreground text-xs">{s.login}</div>
          </div>
        ))}
        {filteredStaff.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No staff match your filters.
          </div>
        )}
      </div>
    </Page>
  );
}

function StaffRbac() {
  const [searchRole, setSearchRole] = useState('');
  
  const [roles, setRoles] = useState([
    { id: 'r_1', name: 'Super Admin', mappedGroup: 'vaultscope_admins', perms: ['*', 'user.create', 'user.update', 'user.delete', 'billing.manage', 'tickets.manage', 'servers.power', 'servers.wipe', 'api.manage'] },
    { id: 'r_2', name: 'Support Tier 1', mappedGroup: 'support_t1', perms: ['tickets.manage', 'servers.power', 'user.view'] },
    { id: 'r_3', name: 'Billing Admin', mappedGroup: 'billing_team', perms: ['billing.manage', 'user.view'] },
    { id: 'r_4', name: 'Customer Success', mappedGroup: 'customer_success', perms: ['user.view', 'user.create', 'user.update'] }
  ]);

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchRole.toLowerCase()) || 
    r.mappedGroup.toLowerCase().includes(searchRole.toLowerCase()) ||
    r.perms.some(p => p.toLowerCase().includes(searchRole.toLowerCase()))
  );

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [newRole, setNewRole] = useState({ id: '', name: '', mappedGroup: '', perms: [] as string[] });

  const availablePerms = ['*', 'user.view', 'user.create', 'user.update', 'user.delete', 'billing.manage', 'tickets.manage', 'servers.power', 'servers.wipe', 'api.manage'];

  const handleTogglePerm = (perm: string) => {
    if (newRole.perms.includes(perm)) {
      setNewRole({ ...newRole, perms: newRole.perms.filter(p => p !== perm) });
    } else {
      setNewRole({ ...newRole, perms: [...newRole.perms, perm] });
    }
  };

  const openCreateModal = () => {
    setNewRole({ id: '', name: '', mappedGroup: '', perms: [] });
    setModalMode('create');
    setIsRoleModalOpen(true);
  };

  const openEditModal = (role: any) => {
    setNewRole({ ...role });
    setModalMode('edit');
    setIsRoleModalOpen(true);
  };

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const handleSaveRole = () => {
    if (modalMode === 'create') {
      setRoles([{ ...newRole, id: `r_${Date.now()}` }, ...roles]);
    } else {
      setRoles(roles.map(r => r.id === newRole.id ? { ...newRole } : r));
    }
    setIsRoleModalOpen(false);
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
      
      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-5 text-muted-foreground">
          <div className="col-span-2">Role Name & OIDC Mapping</div>
          <div className="col-span-2">Precise Permissions</div>
          <div className="text-right">Actions</div>
        </div>
        {filteredRoles.map((r) => (
          <div key={r.id} className="p-4 text-sm grid grid-cols-5 items-start hover:bg-foreground/[0.02]">
            <div className="col-span-2 flex items-start gap-3">
              <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex flex-col">
                <span className="font-medium">{r.name}</span>
                <span className="text-xs text-muted-foreground mt-1">OIDC Group: <code className="bg-foreground/5 px-1 py-0.5 rounded">{r.mappedGroup}</code></span>
              </div>
            </div>
            <div className="col-span-2 flex flex-wrap gap-1.5">
              {r.perms.map(p => (
                <span key={p} className="text-[10px] px-1.5 py-0.5 border border-border bg-foreground/5 text-muted-foreground rounded-sm font-mono">
                  {p}
                </span>
              ))}
            </div>
            <div className="text-right flex justify-end gap-2">
              <button onClick={() => openEditModal(r)} className="text-xs border border-border p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer" title="Edit">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onDoubleClick={() => handleDeleteRole(r.id)} className="text-xs border border-red-500/30 text-red-500 p-1.5 hover:bg-red-500/10 transition-colors cursor-pointer" title="Double-click to Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filteredRoles.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No roles match your filters.
          </div>
        )}
      </div>

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
                <input type="text" value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" placeholder="e.g. Legal Team" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">OIDC Mapped Group</label>
                <input type="text" value={newRole.mappedGroup} onChange={e => setNewRole({...newRole, mappedGroup: e.target.value.toLowerCase().replace(/\s+/g, '_')})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground font-mono" placeholder="e.g. legal_team" />
                <p className="text-[10px] text-muted-foreground mt-1">Users from your OIDC provider matching this group will be automatically assigned this role.</p>
              </div>

              <div className="pt-4 border-t border-border">
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-3">Permissions</label>
                <div className="grid grid-cols-2 gap-3">
                  {availablePerms.map(perm => (
                    <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-foreground/[0.02] p-1 border border-transparent hover:border-border rounded">
                      <input type="checkbox" checked={newRole.perms.includes(perm)} onChange={() => handleTogglePerm(perm)} className="accent-foreground w-4 h-4" />
                      <span className="font-mono text-xs">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <button onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer border border-transparent">Cancel</button>
              <button onClick={handleSaveRole} disabled={!newRole.name || !newRole.mappedGroup} className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
                {modalMode === 'create' ? 'Save Role' : 'Save Changes'}
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
    </Routes>
  );
}
