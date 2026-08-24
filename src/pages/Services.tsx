import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Plus, Power, Edit2, Server, User, Calendar } from 'lucide-react';

function ServicesNew({ onSave }: { onSave: (s: any) => void }) {
  const navigate = useNavigate();
  const [newService, setNewService] = useState({
    customerId: 'CUST-001',
    productId: 'prod_vps_pro',
    status: 'Running',
    expiresAt: '2026-12-31'
  });

  const handleSave = () => {
    const srv = {
      id: `srv_${Math.random().toString(36).substring(2, 8)}`,
      customer: newService.customerId === 'CUST-001' ? 'Vault Scope' : 'John Doe',
      product: newService.productId === 'prod_vps_pro' ? 'VaultScope VPS Pro' : 'Dedicated AX41',
      status: newService.status,
      expiresAt: newService.expiresAt
    };
    onSave(srv);
    navigate('/services');
  };

  return (
    <Page title="Provision New Service">
      <div className="bg-background border border-border p-6 w-full max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Customer</label>
            <select 
              value={newService.customerId}
              onChange={e => setNewService({...newService, customerId: e.target.value})}
              className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
            >
              <option value="CUST-001">Vault Scope</option>
              <option value="CUST-002">John Doe</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Product</label>
            <select 
              value={newService.productId}
              onChange={e => setNewService({...newService, productId: e.target.value})}
              className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
            >
              <option value="prod_vps_pro">VaultScope VPS Pro</option>
              <option value="prod_dedi">Dedicated AX41</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Status</label>
              <select 
                value={newService.status}
                onChange={e => setNewService({...newService, status: e.target.value})}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
              >
                <option value="Running">Running</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Expires At</label>
              <input 
                type="date" 
                value={newService.expiresAt}
                onChange={e => setNewService({...newService, expiresAt: e.target.value})}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
          <Link to="/services" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer border border-transparent">Cancel</Link>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer">
            Provision Service
          </button>
        </div>
      </div>
    </Page>
  );
}

function ServicesList({ services }: { services: any[] }) {
  return (
    <Page title="Manage Services (Active Infrastructure)">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">Manage all active services across your infrastructure.</p>
        <Link 
          to="/services/new"
          className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Provision Service
        </Link>
      </div>

      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-7 text-muted-foreground">
          <div className="col-span-2">Service ID</div>
          <div>User</div>
          <div className="col-span-2">Product</div>
          <div>Status / Expires</div>
          <div className="text-right">Actions</div>
        </div>
        {services.map(s => (
          <div key={s.id} className="p-4 text-sm grid grid-cols-7 items-center hover:bg-foreground/[0.02] transition-colors">
            <div className="col-span-2 font-mono text-xs">{s.id}</div>
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground"/> {s.customer}</div>
            <div className="col-span-2 flex items-center gap-2 font-medium"><Server className="w-4 h-4 text-muted-foreground"/> {s.product}</div>
            <div className="flex flex-col">
              <span className={s.status === 'Running' ? 'text-green-500' : 'text-yellow-500'}>{s.status}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3"/> {s.expiresAt}</span>
            </div>
            <div className="text-right flex gap-2 justify-end">
              <button className="p-1.5 border border-border hover:bg-foreground/5 text-muted-foreground"><Power className="w-4 h-4" /></button>
              <button className="p-1.5 border border-border hover:bg-foreground/5 text-muted-foreground"><Edit2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

export default function ServicesRouter() {
  const [services, setServices] = useState([
    { id: 'srv_8f39a1', customer: 'Vault Scope', product: 'VaultScope VPS Pro', status: 'Running', expiresAt: '2026-09-01' },
    { id: 'srv_9x22b4', customer: 'John Doe', product: 'Dedicated AX41', status: 'Pending', expiresAt: '2026-10-01' },
    { id: 'srv_ovh_adv1', customer: 'Jane Smith', product: 'Advance-1', status: 'Running', expiresAt: '2026-11-15' },
  ]);

  return (
    <Routes>
      <Route path="/" element={<ServicesList services={services} />} />
      <Route path="new" element={<ServicesNew onSave={(s) => setServices([s, ...services])} />} />
    </Routes>
  );
}
