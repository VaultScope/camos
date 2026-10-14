import { useState, useEffect } from 'react';
import { Page } from '../components/Layout';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import type { Customer, Product } from '../lib/types';

export default function ServiceNew() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    name: '',
    hostname: '',
    price: 0,
    trial_days: 0,
    is_trial: false,
  });

  useEffect(() => {
    Promise.all([
      api.get<Customer[]>('/admin/customers'),
      api.get<Product[]>('/admin/products')
    ]).then(([c, p]) => {
      setCustomers(c);
      setProducts(p);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load customers or products');
      setLoading(false);
    });
  }, []);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = products.find(x => x.id === e.target.value);
    if (p) {
      setFormData({
        ...formData,
        product_id: p.id,
        price: parseFloat(p.price),
        trial_days: p.trial_days || 0,
        is_trial: (p.trial_days || 0) > 0,
      });
    } else {
      setFormData({ ...formData, product_id: '', trial_days: 0, is_trial: false });
    }
  };

  const handleCreate = async () => {
    if (!formData.customer_id || !formData.product_id) return;
    setSaving(true);
    try {
      const payload: any = { ...formData };
      if (!payload.name.trim()) delete payload.name;
      if (!payload.hostname.trim()) delete payload.hostname;
      if (!payload.trial_days || payload.trial_days <= 0) {
        delete payload.trial_days;
        delete payload.is_trial;
      }
      
      await api.post('/admin/services', payload);
      toast.success('Service manually provisioned');
      navigate('/services');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create service');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Page title="New Service"><div className="p-8 text-center text-muted-foreground text-sm">Loading...</div></Page>;

  return (
    <Page title="Manual Service Provisioning">
      <div className="max-w-xl">
        <p className="text-xs text-muted-foreground mb-6">Bypass the standard checkout flow to manually deploy a service for a customer.</p>
        
        <div className="space-y-4 bg-background border border-border p-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Customer</label>
            <select value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
              <option value="">Select a customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Product</label>
            <select value={formData.product_id} onChange={handleProductChange} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
              <option value="">Select a product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Custom Service Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" placeholder="Leave empty for default" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Hostname (Optional)</label>
              <input type="text" value={formData.hostname} onChange={e => setFormData({ ...formData, hostname: e.target.value })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" placeholder="vps1.example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Recurring Price Overwrite (€)</label>
              <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Trial Period (Days)</label>
              <input type="number" min="0" value={formData.trial_days || ''} onChange={e => setFormData({ ...formData, trial_days: parseInt(e.target.value) || 0, is_trial: (parseInt(e.target.value) || 0) > 0 })} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" placeholder="0 (No trial)" />
            </div>
          </div>
          {formData.trial_days > 0 && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
              This service will be deployed under a <strong>{formData.trial_days}-day free trial</strong>. The renewal date will be scheduled after the trial ends.
            </div>
          )}

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <button onClick={() => navigate('/services')} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={handleCreate} disabled={!formData.customer_id || !formData.product_id || saving} className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors">
              Deploy Service
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}
