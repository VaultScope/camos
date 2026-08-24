import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Plus, X, Server, Edit2, EyeOff, BarChart2, TrendingUp, Clock } from 'lucide-react';

function ProductsInsights() {
  return (
    <Page title="Product Insights">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" /> Best Selling Plan
          </h3>
          <div className="text-2xl font-light">VaultScope VPS Pro</div>
          <div className="text-sm text-green-500 mt-2">42 active instances</div>
        </div>
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" /> Highest Margin Plan
          </h3>
          <div className="text-2xl font-light">Dedicated AX41</div>
          <div className="text-sm text-green-500 mt-2">€30.00 / mo profit</div>
        </div>
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" /> Avg. Retention Time
          </h3>
          <div className="text-2xl font-light">6.4 Months</div>
          <div className="text-sm text-muted-foreground mt-2">Across all VPS plans</div>
        </div>
      </div>
      
      <div className="border border-border p-5 bg-background">
        <h3 className="text-sm font-medium mb-6 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-muted-foreground" /> Sales Distribution
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>VaultScope VPS Pro</span>
              <span className="font-mono">45%</span>
            </div>
            <div className="w-full bg-foreground/10 h-2">
              <div className="bg-foreground h-2" style={{width: '45%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>VaultScope VPS Basic</span>
              <span className="font-mono">30%</span>
            </div>
            <div className="w-full bg-foreground/10 h-2">
              <div className="bg-foreground h-2" style={{width: '30%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Dedicated AX41</span>
              <span className="font-mono">15%</span>
            </div>
            <div className="w-full bg-foreground/10 h-2">
              <div className="bg-foreground h-2" style={{width: '15%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function ProductsNew({ onSave }: { onSave: (p: any) => void }) {
  const navigate = useNavigate();
  const [newPlan, setNewPlan] = useState({
    name: '', specs: '', provider: 'Hetzner Cloud', target: '', 
    cost: 0, price: 0, stock: -1, userLimit: 0, hidden: false, 
    billingCycle: 'Monthly', setupFee: 0, serviceFormId: 'f_1'
  });

  const handleSave = () => {
    onSave(newPlan);
    navigate('/products');
  };

  return (
    <Page title="Add New Retail Plan">
      <div className="bg-background border border-border p-6 w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Retail Details</h3>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Plan Name</label>
              <input type="text" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" placeholder="e.g. VaultScope VPS Pro" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Hardware Specs / Description</label>
              <input type="text" value={newPlan.specs} onChange={e => setNewPlan({...newPlan, specs: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" placeholder="e.g. 4 vCPU, 8GB RAM" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Stock</label>
                <input type="number" value={newPlan.stock} onChange={e => setNewPlan({...newPlan, stock: parseInt(e.target.value) || 0})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" placeholder="-1 for unlimited" />
                <p className="text-[10px] text-muted-foreground mt-1">-1 for unlimited</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Per User Limit</label>
                <input type="number" value={newPlan.userLimit} onChange={e => setNewPlan({...newPlan, userLimit: parseInt(e.target.value) || 0})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" placeholder="0 for unlimited" />
                <p className="text-[10px] text-muted-foreground mt-1">0 for unlimited</p>
              </div>
            </div>

            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input type="checkbox" checked={newPlan.hidden} onChange={e => setNewPlan({...newPlan, hidden: e.target.checked})} className="accent-foreground w-4 h-4" />
              <span className="text-sm font-medium">Hide Product from Storefront</span>
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Pricing & Upstream Mapping</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Provider</label>
                <select value={newPlan.provider} onChange={e => setNewPlan({...newPlan, provider: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
                  <option value="Hetzner Cloud">Hetzner Cloud</option>
                  <option value="Hetzner Robot">Hetzner Robot</option>
                  <option value="OVH BareMetal">OVH BareMetal</option>
                  <option value="Custom">Custom / Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">API Target SKU</label>
                <input type="text" value={newPlan.target} onChange={e => setNewPlan({...newPlan, target: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground font-mono" placeholder="e.g. CPX31" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Linked Checkout Form</label>
              <select value={newPlan.serviceFormId} onChange={e => setNewPlan({...newPlan, serviceFormId: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
                <option value="f_1">VPS Configuration</option>
                <option value="f_2">Dedicated Server Setup</option>
                <option value="f_3">Pterodactyl Variables</option>
                <option value="">None (Instant Provisioning)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Billing Cycle</label>
                <select value={newPlan.billingCycle} onChange={e => setNewPlan({...newPlan, billingCycle: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="One-Time">One-Time</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Setup Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-muted-foreground text-sm">€</span>
                  <input type="number" step="0.01" value={newPlan.setupFee || ''} onChange={e => setNewPlan({...newPlan, setupFee: parseFloat(e.target.value) || 0})} className="w-full border border-border bg-transparent p-2 pl-7 text-sm focus:outline-none focus:border-foreground" placeholder="0.00" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Wholesale Cost</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-muted-foreground text-sm">€</span>
                  <input type="number" step="0.01" value={newPlan.cost || ''} onChange={e => setNewPlan({...newPlan, cost: parseFloat(e.target.value) || 0})} className="w-full border border-border bg-transparent p-2 pl-7 text-sm focus:outline-none focus:border-foreground" placeholder="13.40" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Retail Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-muted-foreground text-sm">€</span>
                  <input type="number" step="0.01" value={newPlan.price || ''} onChange={e => setNewPlan({...newPlan, price: parseFloat(e.target.value) || 0})} className="w-full border border-border bg-transparent p-2 pl-7 text-sm focus:outline-none focus:border-foreground" placeholder="24.99" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
          <Link to="/products" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer border border-transparent">Cancel</Link>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer">
            Create Retail Plan
          </button>
        </div>
      </div>
    </Page>
  );
}

function ProductsList({ products, setProducts }: { products: any[], setProducts: (p: any[]) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<any>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.specs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = filterProvider === 'all' || p.provider.toLowerCase().includes(filterProvider.toLowerCase());
    return matchesSearch && matchesProvider;
  });

  const openEditModal = (plan: any) => {
    setEditPlan({ ...plan });
    setIsModalOpen(true);
  };

  const handleSaveEdit = () => {
    setProducts(products.map(p => p.name === editPlan.name ? { ...editPlan } : p));
    setIsModalOpen(false);
  };

  return (
    <Page title="Products & Margin Tracking">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">Map your retail plans to underlying upstream infrastructure providers.</p>
        <Link 
          to="/products/new"
          className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Plan
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-foreground/[0.02] border border-border p-3">
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Search by plan name, specs, or API target..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
        </div>
        <select 
          value={filterProvider}
          onChange={e => setFilterProvider(e.target.value)}
          className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground w-48 shrink-0"
        >
          <option value="all">All Providers</option>
          <option value="hetzner cloud">Hetzner Cloud</option>
          <option value="hetzner robot">Hetzner Robot</option>
          <option value="ovh">OVH BareMetal</option>
        </select>
      </div>

      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-12 text-muted-foreground">
          <div className="col-span-3">Retail Plan</div>
          <div className="col-span-2">Provider / Target</div>
          <div className="col-span-1 text-center">Stock</div>
          <div className="col-span-2 text-right">Wholesale</div>
          <div className="col-span-2 text-right">Retail</div>
          <div className="text-right col-span-2">Margin & Actions</div>
        </div>
        {filteredProducts.map((p, i) => {
          const marginStr = `€${(p.price - p.cost).toFixed(2)}`;
          const marginPct = p.cost > 0 ? Math.round(((p.price - p.cost) / p.cost) * 100) : 100;
          
          return (
            <div key={i} className={`p-4 text-sm grid grid-cols-12 items-center hover:bg-foreground/[0.02] ${p.hidden ? 'opacity-50' : ''}`}>
              <div className="col-span-3 flex flex-col">
                <div className="flex items-center gap-1.5">
                  {p.hidden && <span title="Hidden Product"><EyeOff className="w-3 h-3 text-muted-foreground" /></span>}
                  <span className="font-medium">{p.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{p.specs}</span>
              </div>
              <div className="col-span-2 flex flex-col">
                <span className="text-xs text-muted-foreground">{p.provider}</span>
                <span className="font-mono text-xs">{p.target}</span>
              </div>
              <div className="col-span-1 text-center">
                {p.stock === -1 ? <span className="text-muted-foreground text-xs">∞</span> : <span className={p.stock === 0 ? 'text-red-500' : ''}>{p.stock}</span>}
              </div>
              <div className="col-span-2 text-right text-muted-foreground">
                €{Number(p.cost).toFixed(2)} <span className="text-[10px]">/{p.billingCycle.charAt(0)}</span>
              </div>
              <div className="col-span-2 text-right font-medium">
                €{Number(p.price).toFixed(2)} <span className="text-[10px]">/{p.billingCycle.charAt(0)}</span>
                {p.setupFee > 0 && <div className="text-[10px] text-muted-foreground font-normal">+ €{p.setupFee} setup</div>}
              </div>
              <div className="text-right col-span-2 flex items-center justify-end gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-green-500 font-medium">+{marginStr}</span>
                  <span className="text-[10px] text-muted-foreground">{marginPct}% markup</span>
                </div>
                <button onClick={() => openEditModal(p)} className="text-xs border border-border p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer" title="Edit">
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && editPlan && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Server className="w-5 h-5 text-muted-foreground" /> Edit Retail Plan
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Retail Details</h3>
                
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Plan Name</label>
                  <input type="text" value={editPlan.name} disabled className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Hardware Specs / Description</label>
                  <input type="text" value={editPlan.specs} onChange={e => setEditPlan({...editPlan, specs: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Stock</label>
                    <input type="number" value={editPlan.stock} onChange={e => setEditPlan({...editPlan, stock: parseInt(e.target.value) || 0})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Per User Limit</label>
                    <input type="number" value={editPlan.userLimit} onChange={e => setEditPlan({...editPlan, userLimit: parseInt(e.target.value) || 0})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" />
                  </div>
                </div>

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input type="checkbox" checked={editPlan.hidden} onChange={e => setEditPlan({...editPlan, hidden: e.target.checked})} className="accent-foreground w-4 h-4" />
                  <span className="text-sm font-medium">Hide Product from Storefront</span>
                </label>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Pricing & Upstream Mapping</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Provider</label>
                    <select value={editPlan.provider} onChange={e => setEditPlan({...editPlan, provider: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
                      <option value="Hetzner Cloud">Hetzner Cloud</option>
                      <option value="Hetzner Robot">Hetzner Robot</option>
                      <option value="OVH BareMetal">OVH BareMetal</option>
                      <option value="Custom">Custom / Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">API Target SKU</label>
                    <input type="text" value={editPlan.target} onChange={e => setEditPlan({...editPlan, target: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Wholesale Cost</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground text-sm">€</span>
                      <input type="number" step="0.01" value={editPlan.cost || ''} onChange={e => setEditPlan({...editPlan, cost: parseFloat(e.target.value) || 0})} className="w-full border border-border bg-transparent p-2 pl-7 text-sm focus:outline-none focus:border-foreground" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Retail Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground text-sm">€</span>
                      <input type="number" step="0.01" value={editPlan.price || ''} onChange={e => setEditPlan({...editPlan, price: parseFloat(e.target.value) || 0})} className="w-full border border-border bg-transparent p-2 pl-7 text-sm focus:outline-none focus:border-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export default function ProductsRouter() {
  const [products, setProducts] = useState([
    { name: 'VaultScope VPS Basic', specs: '2 vCPU, 2GB RAM', provider: 'Hetzner Cloud', target: 'CX11', cost: 3.20, price: 6.99, stock: -1, userLimit: 0, hidden: false, billingCycle: 'Monthly', setupFee: 0, serviceFormId: 'f_1' },
    { name: 'VaultScope VPS Pro', specs: '4 vCPU, 8GB RAM', provider: 'Hetzner Cloud', target: 'CPX31', cost: 13.40, price: 24.99, stock: 10, userLimit: 1, hidden: false, billingCycle: 'Monthly', setupFee: 5.00, serviceFormId: 'f_1' },
    { name: 'Dedicated AX41', specs: 'Ryzen 5, 64GB ECC', provider: 'Hetzner Robot', target: 'AX41-NVMe', cost: 39.00, price: 69.00, stock: 2, userLimit: 0, hidden: false, billingCycle: 'Monthly', setupFee: 39.00, serviceFormId: 'f_2' },
    { name: 'Advance-1', specs: 'Hexa-Core, 32GB RAM', provider: 'OVH BareMetal', target: 'ADV-1-GEN2', cost: 74.00, price: 129.00, stock: 0, userLimit: 0, hidden: true, billingCycle: 'Yearly', setupFee: 0, serviceFormId: 'f_2' },
    { name: 'Scale-2', specs: 'AMD EPYC, 128GB RAM', provider: 'OVH BareMetal', target: 'SCALE-2', cost: 149.00, price: 249.00, stock: -1, userLimit: 0, hidden: false, billingCycle: 'Monthly', setupFee: 0, serviceFormId: 'f_2' },
  ]);

  return (
    <Routes>
      <Route path="/" element={<ProductsList products={products} setProducts={setProducts} />} />
      <Route path="new" element={<ProductsNew onSave={(p) => setProducts([p, ...products])} />} />
      <Route path="insights" element={<ProductsInsights />} />
    </Routes>
  );
}
