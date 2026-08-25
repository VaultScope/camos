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
    <Page title="Tax Rates">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">Configure tax rates applied to invoices based on customer country.</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Tax Rate
        </button>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load tax rates: {error}</div>}

      {!loading && !error && (
        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-4 text-muted-foreground">
            <div className="col-span-2">Tax Name</div>
            <div>Country</div>
            <div className="text-right">Rate / Actions</div>
          </div>
          {(taxRates || []).map(t => (
            <div key={t.id} className="p-4 text-sm grid grid-cols-4 items-center hover:bg-foreground/[0.02]">
              <div className="col-span-2 flex items-center gap-2 font-medium">
                <Percent className="w-4 h-4 text-muted-foreground" /> {t.name}
              </div>
              <div className="text-muted-foreground">{t.country}</div>
              <div className="text-right flex items-center justify-end gap-4">
                <span className="font-mono">{parseFloat(t.rate).toFixed(2)}%</span>
                <button
                  onClick={() => handleDelete(t.id, t.name)}
                  className="text-xs border border-red-500/30 text-red-500 p-1.5 hover:bg-red-500/10 cursor-pointer"
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
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Add Tax Rate</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                  placeholder="e.g. VAT (Germany)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                  placeholder="e.g. Germany"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rate (%) *</label>
                <input
                  type="number"
                  value={form.rate}
                  onChange={e => setForm({ ...form, rate: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || !form.country.trim() || saving}
                className="px-4 py-2 bg-foreground text-background text-sm hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save'}
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
