import { useState } from 'react';
import { Page } from '../components/Layout';
import { Plus, Tag, X, RefreshCw } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import type { Coupon } from '../lib/types';

export default function CouponsPage() {
  const { data: coupons, loading, error, refetch } = useApi<Coupon[]>('/admin/coupons');
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    usage_limit: undefined as number | undefined,
    expires_at: '',
  });

  const handleOpenModal = () => {
    setForm({
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      usage_limit: undefined,
      expires_at: '',
    });
    setShowModal(true);
  };

  const handleGenerateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setForm({ ...form, code });
  };

  const handleSave = async () => {
    if (!form.code.trim() || saving) return;

    setSaving(true);
    try {
      await api.post('/admin/coupons', {
        code: form.code.trim(),
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        usage_limit: form.usage_limit || null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      });
      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error(`Failed to create coupon: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await api.put(`/admin/coupons/${id}`, { status: newStatus });
      refetch();
    } catch (err) {
      toast.error(`Failed to update coupon: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      refetch();
    } catch (err) {
      toast.error(`Failed to delete coupon: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const filteredCoupons = (coupons || []).filter(c => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.discount_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${parseFloat(coupon.discount_value)}% OFF`;
    } else {
      return `€${parseFloat(coupon.discount_value).toFixed(2)} Credit`;
    }
  };

  const formatUsage = (coupon: Coupon) => {
    if (coupon.usage_limit) {
      return `${coupon.usage_count} / ${coupon.usage_limit}`;
    }
    return `${coupon.usage_count} / ∞`;
  };

  const formatExpiry = (coupon: Coupon) => {
    if (!coupon.expires_at) return 'Never';
    return new Date(coupon.expires_at).toLocaleDateString();
  };

  return (
    <Page title="Coupons">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">Manage discount codes and promotional offers.</p>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search coupons..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="exhausted">Exhausted</option>
          <option value="expired">Expired</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load coupons: {error}</div>}

      {!loading && !error && (
        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-6 text-muted-foreground">
            <div>Code</div>
            <div>Discount</div>
            <div>Type</div>
            <div>Usage</div>
            <div>Expires</div>
            <div className="text-right">Actions</div>
          </div>
          {filteredCoupons.map(c => (
            <div key={c.id} className="p-4 text-sm grid grid-cols-6 items-center hover:bg-foreground/[0.02]">
              <div className="flex items-center gap-2 font-mono font-medium">
                <Tag className="w-4 h-4 text-muted-foreground" /> {c.code}
              </div>
              <div>{formatDiscount(c)}</div>
              <div className="capitalize text-muted-foreground">{c.discount_type}</div>
              <div className="font-mono text-xs">{formatUsage(c)}</div>
              <div className="text-muted-foreground text-xs">{formatExpiry(c)}</div>
              <div className="text-right space-x-2">
                <button
                  onClick={() => handleToggleStatus(c.id, c.status)}
                  className={`text-xs px-2 py-1 border ${
                    c.status === 'active'
                      ? 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/5'
                      : 'border-green-500/30 text-green-500 hover:bg-green-500/5'
                  }`}
                >
                  {c.status === 'active' ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.code)}
                  className="text-xs px-2 py-1 border border-red-500/30 text-red-500 hover:bg-red-500/5"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredCoupons.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">No coupons match your filters.</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create Coupon</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="flex-1 bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground font-mono"
                    placeholder="SUMMER2026"
                  />
                  <button
                    onClick={handleGenerateCode}
                    className="px-3 border border-border hover:bg-foreground/5"
                    title="Generate random code"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Discount Type</label>
                <select
                  value={form.discount_type}
                  onChange={e => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount Value * {form.discount_type === 'percentage' ? '(%)' : '(€)'}
                </label>
                <input
                  type="number"
                  value={form.discount_value}
                  onChange={e => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })}
                  step={form.discount_type === 'percentage' ? '1' : '0.01'}
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Usage Limit (optional)</label>
                <input
                  type="number"
                  value={form.usage_limit || ''}
                  onChange={e => setForm({ ...form, usage_limit: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                  placeholder="Unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expires At (optional)</label>
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={e => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={!form.code.trim() || saving}
                className="px-4 py-2 bg-foreground text-background text-sm hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Creating...' : 'Create Coupon'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-border text-sm hover:bg-foreground/5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
