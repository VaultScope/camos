import { useState } from 'react';
import { Page } from '../components/Layout';
import { Plus, Percent, Trash2 } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import type { TaxRate } from '../lib/types';

export default function TaxRatesPage() {
  const { data: taxRates, loading, error, refetch } = useApi<TaxRate[]>('/admin/tax-rates');
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    country: '',
    rate: 0,
  });

  const handleSave = async () => {
    if (!form.name.trim() || !form.country.trim() || saving) return;

    setSaving(true);
    try {
      await api.post('/admin/tax-rates', {
        name: form.name.trim(),
        country: form.country.trim(),
        rate: form.rate,
      });
      setShowModal(false);
      setForm({ name: '', country: '', rate: 0 });
      refetch();
    } catch (err) {
      toast.error(`Failed to create tax rate: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tax rate "${name}"?`)) return;
    try {
      await api.delete(`/admin/tax-rates/${id}`);
      refetch();
    } catch (err) {
      toast.error(`Failed to delete tax rate: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <Page title="Tax Rates" requiredPermission="tax.manage">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <p className="text-sm text-muted-foreground">Configure tax rates applied to invoices based on customer country.</p>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Tax Rate
        </button>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load tax rates: {error}</div>}

      {!loading && !error && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[540px] divide-y divide-border">
              <div className="p-4 bg-foreground/[0.03] text-xs font-medium uppercase tracking-wider grid grid-cols-4 text-muted-foreground">
                <div className="col-span-2">Tax Name</div>
                <div>Country</div>
                <div className="text-right">Rate / Actions</div>
              </div>
              {(taxRates || []).map(t => (
                <div key={t.id} className="p-4 text-sm grid grid-cols-4 items-center hover:bg-foreground/[0.025] transition-colors">
                  <div className="col-span-2 flex items-center gap-2.5 font-medium">
                    <Percent className="w-4 h-4 text-muted-foreground shrink-0" /> {t.name}
                  </div>
                  <div className="text-muted-foreground">{t.country}</div>
                  <div className="text-right flex items-center justify-end gap-3">
                    <span className="font-mono tabular-nums">{parseFloat(t.rate).toFixed(2)}%</span>
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      className="text-xs rounded-xl border border-red-500/30 text-red-500 p-1.5 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {(taxRates || []).length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">No tax rates configured.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-ui-fade">
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-6 max-w-md w-full max-h-[90dvh] overflow-y-auto animate-ui-scale">
            <h3 className="text-lg font-medium mb-4">Add Tax Rate</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                  placeholder="e.g. VAT (Germany)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                <select
                  value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value })}
                  className="w-full rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                >
                  <option value="">Select country...</option>
                  <option value="ALL">ALL (Global)</option>
                  <option value="United States">United States</option>
                  <option value="Germany">Germany</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="France">France</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rate (%) *</label>
                <input
                  type="number"
                  value={form.rate}
                  onChange={e => setForm({ ...form, rate: parseFloat(e.target.value) || 0 })}
                  step="0.01"
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
                disabled={!form.name.trim() || !form.country.trim() || saving}
                className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
