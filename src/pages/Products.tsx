import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Plus, X, Server, Edit2, EyeOff, BarChart2, TrendingUp, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../lib/hooks';
import { useToast } from '../components/Toast';
import type { Product } from '../lib/types';

interface ProductFormData {
  name: string;
  category: string;
  specs: Record<string, unknown>;
  provider: string;
  target: string;
  cost: number;
  price: number;
  stock: number;
  userLimit: number;
  hidden: boolean;
  billingCycle: string;
  setupFee: number;
  serviceFormId: string;
}

function toFormData(p: Product): ProductFormData {
  return {
    name: p.name,
    category: p.category,
    specs: p.specs || {},
    provider: p.provider,
    target: p.target,
    cost: parseFloat(p.cost),
    price: parseFloat(p.price),
    stock: p.stock,
    userLimit: p.user_limit,
    hidden: p.hidden,
    billingCycle: p.billing_cycle === 'one_time' ? 'One-Time' : p.billing_cycle.charAt(0).toUpperCase() + p.billing_cycle.slice(1),
    setupFee: parseFloat(p.setup_fee),
    serviceFormId: p.service_form_id || '',
  };
}

function toApiPayload(p: ProductFormData) {
  return {
    name: p.name,
    category: p.category,
    provider: p.provider,
    target: p.target,
    specs: p.specs,
    cost: p.cost,
    price: p.price,
    setup_fee: p.setupFee,
    billing_cycle: p.billingCycle.toLowerCase().replace('-', '_'),
  };
}

function ProductsInsights() {
  const { data: products } = useApi<Product[]>('/admin/products');
  const items = products || [];

  return (
    <Page title="Product Insights">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" /> Total Products
          </h3>
          <div className="text-2xl font-light">{items.length}</div>
          <div className="text-sm text-muted-foreground mt-2">{items.filter(p => !p.hidden).length} visible on storefront</div>
        </div>
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" /> Highest Margin
          </h3>
          {items.length > 0 ? (
            <>
              <div className="text-2xl font-light">
                {items.sort((a, b) => (parseFloat(b.price) - parseFloat(b.cost)) - (parseFloat(a.price) - parseFloat(a.cost)))[0]?.name}
              </div>
              <div className="text-sm text-green-500 mt-2">
                €{(parseFloat(items[0]?.price || '0') - parseFloat(items[0]?.cost || '0')).toFixed(2)} / mo profit
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No products yet</div>
          )}
        </div>
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" /> Categories
          </h3>
          <div className="text-2xl font-light">{new Set(items.map(p => p.category)).size}</div>
          <div className="text-sm text-muted-foreground mt-2">unique categories</div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-6 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-muted-foreground" /> Margin Distribution
          </h3>
          <div className="space-y-4">
            {items.slice(0, 5).map(p => {
              const margin = parseFloat(p.price) - parseFloat(p.cost);
              const maxMargin = Math.max(...items.map(x => parseFloat(x.price) - parseFloat(x.cost)));
              const pct = maxMargin > 0 ? (margin / maxMargin) * 100 : 0;
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{p.name}</span>
                    <span className="font-mono text-green-500">€{margin.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-foreground/10 h-2">
                    <div className="bg-foreground h-2" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Page>
  );
}

function ProductsNew() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [newPlan, setNewPlan] = useState<ProductFormData>({
    name: '', category: 'VPS',
    specs: {
      cores: { num: 4, shared: false },
      threads: { num: 4, shared: false },
      ram: { num: 8, unit: 'GB', ecc: false },
      storage: { num: 160, unit: 'GB', type: 'NVMe' },
      uplink: { num: 1, unit: 'Gbps' },
      bandwidth: { num: 20, unit: 'TB' },
      ipv4: { type: 'Included', price: 0 },
      setupTime: { num: 0, unit: 'Instant' }
    },
    provider: 'Hetzner Cloud', target: '',
    cost: 0, price: 0, stock: -1, userLimit: 0, hidden: false,
    billingCycle: 'Monthly', setupFee: 0, serviceFormId: ''
  });

  const steps = ['Basics', 'Hardware', 'Pricing', 'Review'];
  const s = newPlan.specs as any;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/products', toApiPayload(newPlan));
      navigate('/products');
    } catch (e: any) {
      toast.error(e.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const canAdvance = () => {
    if (step === 0) return newPlan.name.trim() !== '' && newPlan.target.trim() !== '';
    return true;
  };

  return (
    <Page title="Add New Retail Plan">
      <div className="bg-background border border-border w-full max-w-2xl">
        <div className="flex border-b border-border">
          {steps.map((label, i) => (
            <button
              key={label}
              onClick={() => i < step && setStep(i)}
              className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
                i === step ? 'bg-foreground text-background' :
                i < step ? 'text-foreground cursor-pointer hover:bg-foreground/5' :
                'text-muted-foreground'
              }`}
            >
              <span className="mr-1.5">{i < step ? '✓' : i + 1}.</span>{label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {step === 0 && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">Name your plan and connect it to an upstream provider.</p>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Plan Name</label>
                <input type="text" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" placeholder="e.g. VaultScope VPS Pro" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Category</label>
                  <select value={newPlan.category} onChange={e => setNewPlan({ ...newPlan, category: e.target.value })} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground">
                    <option value="VPS">VPS</option>
                    <option value="Dedicated Servers">Dedicated Servers</option>
                    <option value="One Click Deploy">One Click Deploy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Provider</label>
                  <select value={newPlan.provider} onChange={e => setNewPlan({ ...newPlan, provider: e.target.value })} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground">
                    <option value="Hetzner Cloud">Hetzner Cloud</option>
                    <option value="Hetzner Robot">Hetzner Robot</option>
                    <option value="OVH BareMetal">OVH BareMetal</option>
                    <option value="Custom">Custom / Manual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">API Target SKU</label>
                <input type="text" value={newPlan.target} onChange={e => setNewPlan({ ...newPlan, target: e.target.value })} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" placeholder="e.g. CPX31" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">Define the hardware specs shown to customers.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Cores</label>
                  <div className="flex gap-2">
                    <input type="number" value={s.cores?.num} onChange={e => setNewPlan({ ...newPlan, specs: { ...s, cores: { ...s.cores, num: parseInt(e.target.value) || 0 } } })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none" />
                    <label className="flex items-center gap-1 text-xs whitespace-nowrap"><input type="checkbox" checked={s.cores?.shared} onChange={e => setNewPlan({ ...newPlan, specs: { ...s, cores: { ...s.cores, shared: e.target.checked } } })} /> Shared</label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">RAM</label>
                  <div className="flex gap-2">
                    <input type="number" value={s.ram?.num} onChange={e => setNewPlan({ ...newPlan, specs: { ...s, ram: { ...s.ram, num: parseInt(e.target.value) || 0 } } })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none" />
                    <select value={s.ram?.unit} onChange={e => setNewPlan({ ...newPlan, specs: { ...s, ram: { ...s.ram, unit: e.target.value } } })} className="border border-border bg-transparent p-2 text-sm focus:outline-none">
                      <option>MB</option><option>GB</option><option>TB</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Storage</label>
                <div className="flex gap-2">
                  <input type="number" value={s.storage?.num} onChange={e => setNewPlan({ ...newPlan, specs: { ...s, storage: { ...s.storage, num: parseInt(e.target.value) || 0 } } })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none" />
                  <select value={s.storage?.unit} onChange={e => setNewPlan({ ...newPlan, specs: { ...s, storage: { ...s.storage, unit: e.target.value } } })} className="border border-border bg-transparent p-2 text-sm focus:outline-none">
                    <option>MB</option><option>GB</option><option>TB</option>
                  </select>
                  <select value={s.storage?.type} onChange={e => setNewPlan({ ...newPlan, specs: { ...s, storage: { ...s.storage, type: e.target.value } } })} className="border border-border bg-transparent p-2 text-sm focus:outline-none">
                    <option>NVMe</option><option>SSD</option><option>HDD</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Uplink</label>
                  <div className="flex gap-2">
                    <input type="number" value={s.uplink?.num} onChange={e => setNewPlan({ ...newPlan, specs: { ...s, uplink: { ...s.uplink, num: parseInt(e.target.value) || 0 } } })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none" />
                    <select value={s.uplink?.unit} onChange={e => setNewPlan({ ...newPlan, specs: { ...s, uplink: { ...s.uplink, unit: e.target.value } } })} className="border border-border bg-transparent p-2 text-sm focus:outline-none">
                      <option>Mbps</option><option>Gbps</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Bandwidth</label>
                  <div className="flex gap-2">
                    <input type="number" value={s.bandwidth?.num} onChange={e => setNewPlan({ ...newPlan, specs: { ...s, bandwidth: { ...s.bandwidth, num: parseInt(e.target.value) || 0 } } })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none" />
                    <select value={s.bandwidth?.unit} onChange={e => setNewPlan({ ...newPlan, specs: { ...s, bandwidth: { ...s.bandwidth, unit: e.target.value } } })} className="border border-border bg-transparent p-2 text-sm focus:outline-none">
                      <option>GB</option><option>TB</option><option>Unlimited</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">Set your pricing, margins, and availability.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Wholesale Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">€</span>
                    <input type="number" step="0.01" value={newPlan.cost || ''} onChange={e => setNewPlan({ ...newPlan, cost: parseFloat(e.target.value) || 0 })} className="w-full border border-border bg-transparent p-2.5 pl-7 text-sm focus:outline-none focus:border-foreground" placeholder="13.40" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Retail Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">€</span>
                    <input type="number" step="0.01" value={newPlan.price || ''} onChange={e => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) || 0 })} className="w-full border border-border bg-transparent p-2.5 pl-7 text-sm focus:outline-none focus:border-foreground" placeholder="24.99" />
                  </div>
                </div>
              </div>
              {newPlan.cost > 0 && newPlan.price > 0 && (
                <div className="bg-foreground/5 border border-border p-3 text-sm">
                  Margin: <span className="text-green-500 font-medium">€{(newPlan.price - newPlan.cost).toFixed(2)}</span>
                  <span className="text-muted-foreground ml-2">({Math.round(((newPlan.price - newPlan.cost) / newPlan.cost) * 100)}% markup)</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Billing Cycle</label>
                  <select value={newPlan.billingCycle} onChange={e => setNewPlan({ ...newPlan, billingCycle: e.target.value })} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground">
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="One-Time">One-Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Setup Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">€</span>
                    <input type="number" step="0.01" value={newPlan.setupFee || ''} onChange={e => setNewPlan({ ...newPlan, setupFee: parseFloat(e.target.value) || 0 })} className="w-full border border-border bg-transparent p-2.5 pl-7 text-sm focus:outline-none focus:border-foreground" placeholder="0.00" />
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newPlan.hidden} onChange={e => setNewPlan({ ...newPlan, hidden: e.target.checked })} className="accent-foreground w-4 h-4" />
                <span className="text-sm font-medium">Hide from Storefront</span>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Confirm everything looks right before publishing.</p>
              <div className="border border-border divide-y divide-border text-sm">
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="col-span-2 font-medium">{newPlan.name}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground">Category</span>
                  <span className="col-span-2">{newPlan.category}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="col-span-2">{newPlan.provider} / <span className="font-mono">{newPlan.target}</span></span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground">Hardware</span>
                  <span className="col-span-2">
                    {s.cores?.num} Cores{s.cores?.shared ? ' (shared)' : ''}, {s.ram?.num} {s.ram?.unit} RAM, {s.storage?.num} {s.storage?.unit} {s.storage?.type}
                  </span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground">Pricing</span>
                  <span className="col-span-2">
                    €{newPlan.price.toFixed(2)} / {newPlan.billingCycle}
                    {newPlan.setupFee > 0 && <span className="text-muted-foreground"> + €{newPlan.setupFee} setup</span>}
                    {newPlan.cost > 0 && <span className="text-green-500 ml-2">(€{(newPlan.price - newPlan.cost).toFixed(2)} margin)</span>}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t border-border">
          <div>
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">Back</button>
            ) : (
              <Link to="/products" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</Link>
            )}
          </div>
          <div>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} disabled={!canAdvance()} className="px-5 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                Continue
              </button>
            ) : (
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-50">
                {saving ? 'Publishing...' : 'Publish Plan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

function ProductsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const { data: products, loading, error, refetch } = useApi<Product[]>('/admin/products');
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<(ProductFormData & { id: string }) | null>(null);
  const [saving, setSaving] = useState(false);

  const items = products || [];

  const filteredProducts = items.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = filterProvider === 'all' || p.provider.toLowerCase().includes(filterProvider.toLowerCase());
    return matchesSearch && matchesProvider;
  });

  const openEditModal = (p: Product) => {
    setEditPlan({ id: p.id, ...toFormData(p) });
    setIsModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editPlan) return;
    setSaving(true);
    try {
      await api.put(`/admin/products/${editPlan.id}`, toApiPayload(editPlan));
      setIsModalOpen(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page title="Products & Margin Tracking">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">Map your retail plans to underlying upstream infrastructure providers.</p>
        <Link to="/products/new" className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Plan
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-foreground/[0.02] border border-border p-3">
        <div className="flex-1">
          <input type="text" placeholder="Search by plan name or API target..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground" />
        </div>
        <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)} className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground w-48 shrink-0">
          <option value="all">All Providers</option>
          <option value="hetzner cloud">Hetzner Cloud</option>
          <option value="hetzner robot">Hetzner Robot</option>
          <option value="ovh">OVH BareMetal</option>
        </select>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading products...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load products: {error}</div>}

      {!loading && !error && (
        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-12 text-muted-foreground">
            <div className="col-span-3">Retail Plan</div>
            <div className="col-span-2">Provider / Target</div>
            <div className="col-span-1 text-center">Cycle</div>
            <div className="col-span-2 text-right">Wholesale</div>
            <div className="col-span-2 text-right">Retail</div>
            <div className="text-right col-span-2">Margin & Actions</div>
          </div>
          {filteredProducts.map(p => {
            const cost = parseFloat(p.cost);
            const price = parseFloat(p.price);
            const margin = price - cost;
            const marginPct = cost > 0 ? Math.round((margin / cost) * 100) : 100;
            const cycleLabel = p.billing_cycle === 'monthly' ? 'M' : p.billing_cycle === 'yearly' ? 'Y' : '1x';

            return (
              <div key={p.id} className={`p-4 text-sm grid grid-cols-12 items-center hover:bg-foreground/[0.02] ${p.hidden ? 'opacity-50' : ''}`}>
                <div className="col-span-3 flex flex-col">
                  <div className="flex items-center gap-1.5">
                    {p.hidden && <span title="Hidden Product"><EyeOff className="w-3 h-3 text-muted-foreground" /></span>}
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{p.category}</span>
                </div>
                <div className="col-span-2 flex flex-col">
                  <span className="text-xs text-muted-foreground">{p.provider}</span>
                  <span className="font-mono text-xs">{p.target}</span>
                </div>
                <div className="col-span-1 text-center text-xs text-muted-foreground">{cycleLabel}</div>
                <div className="col-span-2 text-right text-muted-foreground">€{cost.toFixed(2)}</div>
                <div className="col-span-2 text-right font-medium">
                  €{price.toFixed(2)}
                  {parseFloat(p.setup_fee) > 0 && <div className="text-[10px] text-muted-foreground font-normal">+ €{parseFloat(p.setup_fee).toFixed(2)} setup</div>}
                </div>
                <div className="text-right col-span-2 flex items-center justify-end gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-green-500 font-medium">+€{margin.toFixed(2)}</span>
                    <span className="text-[10px] text-muted-foreground">{marginPct}% markup</span>
                  </div>
                  <button onClick={() => openEditModal(p)} className="text-xs border border-border p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer" title="Edit">
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {items.length === 0 ? 'No products yet. Add your first plan.' : 'No products match your filters.'}
            </div>
          )}
        </div>
      )}

      {isModalOpen && editPlan && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Server className="w-5 h-5 text-muted-foreground" /> Edit Retail Plan
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Plan Name</label>
                <input type="text" value={editPlan.name} onChange={e => setEditPlan({ ...editPlan, name: e.target.value })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Provider</label>
                  <select value={editPlan.provider} onChange={e => setEditPlan({ ...editPlan, provider: e.target.value })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
                    <option value="Hetzner Cloud">Hetzner Cloud</option>
                    <option value="Hetzner Robot">Hetzner Robot</option>
                    <option value="OVH BareMetal">OVH BareMetal</option>
                    <option value="Custom">Custom / Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">API Target SKU</label>
                  <input type="text" value={editPlan.target} onChange={e => setEditPlan({ ...editPlan, target: e.target.value })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Wholesale Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-muted-foreground text-sm">€</span>
                    <input type="number" step="0.01" value={editPlan.cost || ''} onChange={e => setEditPlan({ ...editPlan, cost: parseFloat(e.target.value) || 0 })} className="w-full border border-border bg-transparent p-2 pl-7 text-sm focus:outline-none focus:border-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Retail Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-muted-foreground text-sm">€</span>
                    <input type="number" step="0.01" value={editPlan.price || ''} onChange={e => setEditPlan({ ...editPlan, price: parseFloat(e.target.value) || 0 })} className="w-full border border-border bg-transparent p-2 pl-7 text-sm focus:outline-none focus:border-foreground" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Setup Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-muted-foreground text-sm">€</span>
                    <input type="number" step="0.01" value={editPlan.setupFee || ''} onChange={e => setEditPlan({ ...editPlan, setupFee: parseFloat(e.target.value) || 0 })} className="w-full border border-border bg-transparent p-2 pl-7 text-sm focus:outline-none focus:border-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Billing Cycle</label>
                  <select value={editPlan.billingCycle} onChange={e => setEditPlan({ ...editPlan, billingCycle: e.target.value })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="One-Time">One-Time</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editPlan.hidden} onChange={e => setEditPlan({ ...editPlan, hidden: e.target.checked })} className="accent-foreground w-4 h-4" />
                <span className="text-sm font-medium">Hide from Storefront</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export default function ProductsRouter() {
  return (
    <Routes>
      <Route path="/" element={<ProductsList />} />
      <Route path="new" element={<ProductsNew />} />
      <Route path="insights" element={<ProductsInsights />} />
    </Routes>
  );
}
