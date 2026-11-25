import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Plus, X } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api, API_BASE } from '../lib/api';
import { hasPermission } from '../lib/auth';
import { useToast } from '../components/Toast';
import { HelpTooltip } from '../components/HelpTooltip';
import type { Invoice, Customer } from '../lib/types';

interface LineItemForm {
  description: string;
  quantity: number;
  unit_price: number;
  service_id?: string;
}

export default function BillingInvoices() {
  const { data: invoices, loading, error, refetch } = useApi<Invoice[]>('/admin/invoices');
  const { data: customers } = useApi<Customer[]>('/admin/customers');
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(searchParams.get('new') === 'true');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [creating, setCreating] = useState(false);

  const canCreate = hasPermission('invoices.create');
  const canEdit = hasPermission('invoices.edit');
  const canDelete = hasPermission('invoices.delete');

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      const timer = setTimeout(() => {
        setShowModal(true);
        setSearchParams({});
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  const [form, setForm] = useState(() => ({
    customer_id: '',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tax_rate: 19,
    notes: '',
    line_items: [{ description: '', quantity: 1, unit_price: 0 }] as LineItemForm[],
  }));

  const handleAddLineItem = () => {
    setForm({
      ...form,
      line_items: [...form.line_items, { description: '', quantity: 1, unit_price: 0 }],
    });
  };

  const handleRemoveLineItem = (index: number) => {
    setForm({
      ...form,
      line_items: form.line_items.filter((_, i) => i !== index),
    });
  };

  const handleUpdateLineItem = (index: number, field: keyof LineItemForm, value: any) => {
    setForm({
      ...form,
      line_items: form.line_items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    });
  };

  const handleCreate = async () => {
    if (!form.customer_id || form.line_items.some(i => !i.description.trim()) || creating) return;

    setCreating(true);
    try {
      await api.post('/admin/invoices', {
        customer_id: form.customer_id,
        due_date: form.due_date,
        tax_rate: form.tax_rate,
        notes: form.notes || undefined,
        line_items: form.line_items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          service_id: item.service_id || null,
        })),
      });
      setShowModal(false);
      setForm({
        customer_id: '',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tax_rate: 19,
        notes: '',
        line_items: [{ description: '', quantity: 1, unit_price: 0 }],
      });
      refetch();
    } catch (err) {
      toast.error(`Failed to create invoice: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm('Send this invoice to the customer?')) return;
    try {
      await api.post(`/admin/invoices/${id}/send`);
      refetch();
    } catch (err) {
      toast.error(`Failed to send invoice: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleMarkPaid = async (id: string) => {
    if (!confirm('Mark this invoice as paid?')) return;
    try {
      await api.post(`/admin/invoices/${id}/mark-paid`);
      refetch();
    } catch (err) {
      toast.error(`Failed to mark invoice as paid: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleVoid = async (inv: Invoice) => {
    if (!confirm(`Mark invoice ${inv.invoice_number} as void?`)) return;
    try {
      await api.put(`/admin/invoices/${inv.id}`, { status: 'void' });
      toast.success(`Invoice ${inv.invoice_number} voided`);
      refetch();
    } catch (err) {
      toast.error(`Failed to void invoice: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (inv: Invoice) => {
    if (!confirm(`Delete invoice ${inv.invoice_number} (${inv.status})? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/invoices/${inv.id}`);
      toast.success(`Invoice ${inv.invoice_number} deleted`);
      refetch();
    } catch (err) {
      toast.error(`Failed to delete invoice: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDownloadPdf = async (invId: string, invoiceNumber: string) => {
    try {
      const token = localStorage.getItem('vs_admin_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}/admin/invoices/${invId}/pdf`, {
        headers,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to download invoice PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Invoice ${invoiceNumber} downloaded.`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to download invoice PDF');
    }
  };

  const getCustomerName = (customer_id: string) => {
    const customer = (customers || []).find(c => c.id === customer_id);
    return customer ? customer.name : 'Unknown';
  };

  const filteredInvoices = (invoices || []).filter(inv => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerName(inv.customer_id).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const subtotal = form.line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const taxAmount = subtotal * (form.tax_rate / 100);
  const total = subtotal + taxAmount;

  return (
    <Page title="Invoices" requiredPermission="invoices.view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          Manage, send, void, or delete customer invoices.
          <HelpTooltip content="Invoices can be downloaded as PDF, sent to the customer via email, marked paid manually, voided, or permanently deleted if you hold the invoices.delete permission." />
        </p>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5 bg-card border border-border rounded-2xl p-3 shadow-xs">
        <input
          type="text"
          placeholder="Search invoices..."
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
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="void">Void</option>
        </select>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load invoices: {error}</div>}

      {!loading && !error && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[740px] divide-y divide-border">
              <div className="p-4 bg-foreground/[0.03] text-xs font-medium uppercase tracking-wider grid grid-cols-6 text-muted-foreground">
                <div>Invoice</div>
                <div>Customer</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Due Date</div>
                <div className="text-right">Actions</div>
              </div>
              {filteredInvoices.map(inv => (
                <div key={inv.id} className="p-4 text-sm grid grid-cols-6 items-center hover:bg-foreground/[0.025] transition-colors">
                  <div className="font-mono text-xs">{inv.invoice_number}</div>
                  <div className="truncate pr-2">{getCustomerName(inv.customer_id)}</div>
                  <div className="font-medium tabular-nums">€{parseFloat(inv.total).toFixed(2)}</div>
                  <div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase font-medium ${
                        inv.status === 'paid'
                          ? 'border-green-500/30 bg-green-500/10 text-green-500'
                          : inv.status === 'pending'
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-500'
                          : inv.status === 'overdue'
                          ? 'border-red-500/30 bg-red-500/10 text-red-500'
                          : 'border-muted-foreground/30 bg-foreground/5 text-muted-foreground'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-muted-foreground font-mono text-xs">{inv.due_date}</div>
                  <div className="text-right flex items-center justify-end gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleDownloadPdf(inv.id, inv.invoice_number)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-foreground/5 transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      PDF
                    </button>
                    {inv.status === 'draft' && canEdit && (
                      <button onClick={() => handleSend(inv.id)} className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-foreground/5 transition-colors cursor-pointer">
                        Send
                      </button>
                    )}
                    {(inv.status === 'pending' || inv.status === 'overdue') && canEdit && (
                      <>
                        <button onClick={() => handleMarkPaid(inv.id)} className="text-xs px-2.5 py-1 rounded-lg border border-green-500/30 text-green-500 hover:bg-green-500/10 transition-colors cursor-pointer">
                          Mark Paid
                        </button>
                        <button onClick={() => handleVoid(inv)} className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-foreground/5 transition-colors cursor-pointer">
                          Void
                        </button>
                      </>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDelete(inv)} className="text-xs px-2.5 py-1 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredInvoices.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">No invoices match your filters.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-ui-fade">
          <div className="bg-card rounded-2xl border border-border shadow-2xl p-5 sm:p-6 max-w-2xl w-full max-h-[90dvh] overflow-y-auto animate-ui-scale">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create Invoice</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer *</label>
                  <select
                    value={form.customer_id}
                    onChange={e => setForm({ ...form, customer_id: e.target.value })}
                    className="w-full rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                  >
                    <option value="">Select customer...</option>
                    {(customers || []).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="w-full rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  value={form.tax_rate}
                  onChange={e => setForm({ ...form, tax_rate: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  className="w-full rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Line Items</label>
                  <button onClick={handleAddLineItem} className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-foreground/5 cursor-pointer">
                    Add Line
                  </button>
                </div>
                <div className="space-y-2">
                  {form.line_items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={e => handleUpdateLineItem(idx, 'description', e.target.value)}
                        className="flex-1 rounded-xl bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={e => handleUpdateLineItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-20 rounded-xl bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.unit_price}
                          onChange={e => handleUpdateLineItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                          step="0.01"
                          className="w-28 rounded-xl bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
                        />
                        {form.line_items.length > 1 && (
                          <button onClick={() => handleRemoveLineItem(idx)} className="px-2 rounded-xl text-red-500 hover:bg-red-500/10 cursor-pointer">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="tabular-nums">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({form.tax_rate}%):</span>
                  <span className="tabular-nums">€{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
                  <span>Total:</span>
                  <span className="tabular-nums">€{total.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50 resize-none"
                  placeholder="Internal notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-foreground/5 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.customer_id || form.line_items.some(i => !i.description.trim()) || creating}
                className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
              >
                {creating ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
