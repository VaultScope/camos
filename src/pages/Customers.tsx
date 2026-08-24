import { useState } from 'react';
import { Page } from '../components/Layout';
import { Plus, Edit2, Trash2, X, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([
    { 
      id: 'acc_09f3b19a', 
      name: 'Vault Scope', 
      email: 'hello@vaultscope.de', 
      services: 3, 
      mrr: '€24.99',
      vatId: 'DE123456789',
      country: 'Germany',
      status: 'Active',
      twoFactorEnabled: true
    }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  const defaultCustomer = { 
    id: '', name: '', email: '', services: 0, mrr: '€0.00', 
    vatId: '', country: '', status: 'Active', twoFactorEnabled: false 
  };
  
  const [currentCustomer, setCurrentCustomer] = useState(defaultCustomer);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleCreate = () => {
    setCurrentCustomer(defaultCustomer);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (customer: any) => {
    setCurrentCustomer(customer);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      const newCustomer = { 
        ...currentCustomer, 
        id: `acc_${Math.random().toString(16).substring(2, 10)}`,
        services: Number(currentCustomer.services),
        mrr: currentCustomer.mrr.startsWith('€') || currentCustomer.mrr.startsWith('$') ? currentCustomer.mrr : `€${currentCustomer.mrr || '0.00'}` 
      };
      setCustomers([...customers, newCustomer]);
    } else {
      setCustomers(customers.map(c => c.id === currentCustomer.id ? {
        ...currentCustomer,
        services: Number(currentCustomer.services),
        mrr: currentCustomer.mrr.startsWith('€') || currentCustomer.mrr.startsWith('$') ? currentCustomer.mrr : `€${currentCustomer.mrr || '0.00'}`
      } : c));
    }
    setIsModalOpen(false);
  };

  const handleDisable2FA = () => {
    setCurrentCustomer({ ...currentCustomer, twoFactorEnabled: false });
  };

  const handleDelete = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vatId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Page title="Customer Management">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3 flex-1 max-w-lg">
          <input 
            type="text" 
            placeholder="Search by name, email, or VAT ID..." 
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
        <button onClick={handleCreate} className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-7 text-muted-foreground">
          <div className="col-span-2">Customer</div>
          <div>Status</div>
          <div>Services</div>
          <div>MRR</div>
          <div>Security</div>
          <div className="text-right">Actions</div>
        </div>
        {filteredCustomers.map(c => (
          <div key={c.id} className="p-4 text-sm grid grid-cols-7 items-center hover:bg-foreground/[0.02]">
            <div className="col-span-2 flex flex-col">
              <span className="font-medium">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.email}</span>
            </div>
            <div>
              <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border border-border ${c.status === 'Active' ? 'text-green-500 bg-green-500/5' : c.status === 'Suspended' ? 'text-yellow-500 bg-yellow-500/5' : 'text-red-500 bg-red-500/5'}`}>
                {c.status}
              </span>
            </div>
            <div>{c.services} Active</div>
            <div>{c.mrr}</div>
            <div>
              {c.twoFactorEnabled ? (
                <span className="text-xs border border-border px-1.5 py-0.5 bg-foreground/5 text-muted-foreground">2FA On</span>
              ) : (
                <span className="text-xs border border-border px-1.5 py-0.5 text-muted-foreground opacity-50">2FA Off</span>
              )}
            </div>
            <div className="text-right flex justify-end gap-2 items-center">
              <button className="text-xs border border-border px-3 py-1.5 hover:bg-foreground/5 transition-colors cursor-pointer">Impersonate</button>
              <button onClick={() => handleEdit(c)} className="text-xs border border-border p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer" title="Edit">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No customers match your filters.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">{modalMode === 'create' ? 'Add New Customer' : 'Edit Customer'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column: General Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">General Information</h3>
                
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Company / Full Name</label>
                  <input 
                    type="text" 
                    value={currentCustomer.name} 
                    onChange={e => setCurrentCustomer({...currentCustomer, name: e.target.value})}
                    className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Email</label>
                  <input 
                    type="email" 
                    value={currentCustomer.email} 
                    onChange={e => setCurrentCustomer({...currentCustomer, email: e.target.value})}
                    className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                    placeholder="contact@acme.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Country</label>
                    <input 
                      type="text" 
                      value={currentCustomer.country} 
                      onChange={e => setCurrentCustomer({...currentCustomer, country: e.target.value})}
                      className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                      placeholder="Germany"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">VAT ID</label>
                    <input 
                      type="text" 
                      value={currentCustomer.vatId} 
                      onChange={e => setCurrentCustomer({...currentCustomer, vatId: e.target.value})}
                      className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                      placeholder="DE123456789"
                    />
                  </div>
                </div>
                
                {/* Statistics (Readonly visually but editable for mock) */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Active Services</label>
                    <input 
                      type="number" 
                      value={currentCustomer.services} 
                      onChange={e => setCurrentCustomer({...currentCustomer, services: Number(e.target.value)})}
                      className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">MRR</label>
                    <input 
                      type="text" 
                      value={currentCustomer.mrr} 
                      onChange={e => setCurrentCustomer({...currentCustomer, mrr: e.target.value})}
                      className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Security & Danger Zone */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Account Status & Security</h3>
                
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Account Status</label>
                  <select 
                    value={currentCustomer.status}
                    onChange={e => setCurrentCustomer({...currentCustomer, status: e.target.value})}
                    className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Banned">Banned</option>
                  </select>
                </div>

                <div className="pt-6">
                  <h3 className="text-xs font-medium border-b border-border pb-2 mb-4 uppercase text-muted-foreground flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> Security Actions
                  </h3>
                  <div className="flex items-center justify-between border border-border p-3 bg-foreground/[0.02]">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Two-Factor Auth</span>
                      <span className="text-xs text-muted-foreground">
                        {currentCustomer.twoFactorEnabled ? 'Currently enabled by user.' : 'Currently disabled.'}
                      </span>
                    </div>
                    {currentCustomer.twoFactorEnabled && (
                      <button 
                        onDoubleClick={handleDisable2FA}
                        className="text-xs border border-foreground/20 hover:border-foreground px-3 py-1.5 transition-colors cursor-pointer"
                        title="Double-click to disable"
                      >
                        Disable (Dbl-Click)
                      </button>
                    )}
                  </div>
                </div>

                {modalMode === 'edit' && (
                  <div className="pt-6">
                    <h3 className="text-xs font-medium border-b border-border pb-2 mb-4 uppercase text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" /> Danger Zone
                    </h3>
                    <div className="flex items-center justify-between border border-border p-3 bg-foreground/[0.02]">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Delete Customer</span>
                        <span className="text-xs text-muted-foreground">Permanent removal.</span>
                      </div>
                      <button 
                        onDoubleClick={() => {
                          handleDelete(currentCustomer.id);
                          setIsModalOpen(false);
                        }}
                        className="text-xs border border-foreground/20 hover:border-foreground px-3 py-1.5 transition-colors cursor-pointer flex items-center gap-1"
                        title="Double-click to delete"
                      >
                        <Trash2 className="w-3 h-3" /> Delete (Dbl-Click)
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      * Dangerous actions require a double-click to confirm. No red buttons used as requested.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer border border-transparent">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer">
                {modalMode === 'create' ? 'Create Customer' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
