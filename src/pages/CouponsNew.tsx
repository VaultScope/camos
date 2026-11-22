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
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[bytes[i] % chars.length];
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
    <Page title="Coupons" requiredPermission="coupons.manage">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <p className="text-sm text-muted-foreground">Manage discount codes and promotional offers.</p>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5 bg-card border border-border rounded-2xl p-3 shadow-xs">
        <input
          type="text"
          placeholder="Search coupons..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50 sm:w-44 cursor-pointer"
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
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[680px] divide-y divide-border">
              <div className="p-4 bg-foreground/[0.03] text-xs font-medium uppercase tracking-wider grid grid-cols-6 text-muted-foreground">
                <div>Code</div>
                <div>Discount</div>
                <div>Type</div>
                <div>Usage</div>
                <div>Expires</div>
                <div className="text-right">Actions</div>
              </div>
              {filteredCoupons.map(c => (
                <div key={c.id} className="p-4 text-sm grid grid-cols-6 items-center hover:bg-foreground/[0.025] transition-colors">
                  <div className="flex items-center gap-2 font-mono font-medium">
                    <Tag className="w-4 h-4 text-muted-foreground shrink-0" /> {c.code}
                  </div>
                  <div>{formatDiscount(c)}</div>
                  <div className="capitalize text-muted-foreground">{c.discount_type}</div>
                  <div className="font-mono text-xs">{formatUsage(c)}</div>
                  <div className="text-muted-foreground text-xs">{formatExpiry(c)}</div>
                  <div className="text-right flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(c.id, c.status)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        c.status === 'active'
                          ? 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10'
                          : 'border-green-500/30 text-green-500 hover:bg-green-500/10'
                      }`}
                    >
                      {c.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.code)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
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
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-ui-fade">
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 max-w-md w-full max-h-[90dvh] overflow-y-auto animate-ui-scale">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create Coupon</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer">
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
                    className="flex-1 rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50 font-mono"
                    placeholder="SUMMER2026"
                  />
                  <button
                    onClick={handleGenerateCode}
                    className="px-3 rounded-xl border border-border hover:bg-foreground/5 cursor-pointer"
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
                  className="w-full rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
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
                  className="w-full rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Usage Limit (optional)</label>
                <input
                  type="number"
                  value={form.usage_limit || ''}
                  onChange={e => setForm({ ...form, usage_limit: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                  placeholder="Unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expires At (optional)</label>
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={e => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-foreground/5 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.code.trim() || saving}
                className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Creating...' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
