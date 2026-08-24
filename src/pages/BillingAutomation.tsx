import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Plus, X, Receipt, FileText, Trash2, CheckCircle2, Percent, TrendingUp } from 'lucide-react';

function BillingInsights() {
  return (
    <Page title="Billing Insights">
      <div className="grid grid-cols-2 gap-6">
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" /> Financial Overview
          </h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Unpaid Invoices</span>
              <span className="text-red-500 font-mono">€1,240.50</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Stripe Balance</span>
              <span className="font-mono">€8,400.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Next Stripe Payout</span>
              <span className="font-mono">24 Aug 2026</span>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function BillingAutomations() {
  return (
    <Page title="Billing Automations">
      <div className="border border-border p-5 bg-background max-w-xl">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-muted-foreground" /> Automation Rules
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Grace Period (Days)</span>
            <input type="number" defaultValue={3} className="w-16 bg-transparent border border-border px-2 py-1 text-center focus:outline-none focus:border-foreground" />
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Auto-Suspend Overdue</span>
            <span className="text-green-500 bg-green-500/10 px-2 py-0.5 text-xs rounded-sm">Enabled</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Auto-Terminate (Days)</span>
            <input type="number" defaultValue={14} className="w-16 bg-transparent border border-border px-2 py-1 text-center focus:outline-none focus:border-foreground" />
          </div>
        </div>
      </div>
    </Page>
  );
}

function BillingTaxRates() {
  const [taxRates, setTaxRates] = useState([
    { id: 'tx_1', name: 'VAT (Germany)', country: 'Germany', rate: 19.0 },
    { id: 'tx_2', name: 'VAT (EU Standard)', country: 'All EU Countries', rate: 20.0 }
  ]);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [newTaxRate, setNewTaxRate] = useState({ name: '', country: 'All Countries', rate: 0 });

  const handleSaveTaxRate = () => {
    setTaxRates([{ ...newTaxRate, id: `tx_${Date.now()}` }, ...taxRates]);
    setIsTaxModalOpen(false);
    setNewTaxRate({ name: '', country: 'All Countries', rate: 0 });
  };

  const handleDeleteTaxRate = (id: string) => {
    setTaxRates(taxRates.filter(t => t.id !== id));
  };

  return (
    <Page title="Tax Rates">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">Configure tax rates applied to invoices based on customer country.</p>
        <button onClick={() => setIsTaxModalOpen(true)} className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add Tax Rate
        </button>
      </div>
      
      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-4 text-muted-foreground">
          <div className="col-span-2">Tax Name</div>
          <div>Applicable Countries</div>
          <div className="text-right">Rate / Actions</div>
        </div>
        {taxRates.map(t => (
          <div key={t.id} className="p-4 text-sm grid grid-cols-4 items-center hover:bg-foreground/[0.02]">
            <div className="col-span-2 flex items-center gap-2 font-medium">
              <Percent className="w-4 h-4 text-muted-foreground" /> {t.name}
            </div>
            <div className="text-muted-foreground">{t.country}</div>
            <div className="text-right flex items-center justify-end gap-4">
              <span className="font-mono">{t.rate.toFixed(2)}%</span>
              <button onDoubleClick={() => handleDeleteTaxRate(t.id)} className="text-xs border border-red-500/30 text-red-500 p-1.5 hover:bg-red-500/10 transition-colors cursor-pointer" title="Double-click to Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {taxRates.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No tax rates configured.
          </div>
        )}
      </div>

      {isTaxModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Percent className="w-5 h-5 text-muted-foreground" /> Add Tax Rate
              </h2>
              <button onClick={() => setIsTaxModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Tax Name</label>
                <input 
                  type="text" 
                  value={newTaxRate.name} 
                  onChange={e => setNewTaxRate({...newTaxRate, name: e.target.value})}
                  className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                  placeholder="e.g. VAT"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Country</label>
                <select 
                  value={newTaxRate.country}
                  onChange={e => setNewTaxRate({...newTaxRate, country: e.target.value})}
                  className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                >
                  <option value="All Countries">All Countries</option>
                  <option value="Germany">Germany</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="All EU Countries">All EU Countries</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Rate (%)</label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.01" 
                    value={newTaxRate.rate || ''} 
                    onChange={e => setNewTaxRate({...newTaxRate, rate: parseFloat(e.target.value) || 0})}
                    className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground pr-8"
                    placeholder="19.0"
                  />
                  <span className="absolute right-3 top-2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <button onClick={() => setIsTaxModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                Cancel
              </button>
              <button 
                onClick={handleSaveTaxRate} 
                disabled={!newTaxRate.name}
                className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Save Tax Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

function BillingInvoices() {
  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-0899', customer: 'Vault Scope', amount: '€24.99', status: 'Paid', date: '2026-08-20' },
    { id: 'INV-2026-0900', customer: 'John Doe', amount: '€140.00', status: 'Pending', date: '2026-08-22' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const customers = ['Vault Scope', 'John Doe', 'Acme Corp'];
  const customerServices = [
    { id: 'srv_1', name: 'VPS - 4GB RAM (Frankfurt)' },
    { id: 'srv_2', name: 'Managed Database (PostgreSQL)' }
  ];

  const [newInvoice, setNewInvoice] = useState({
    customer: customers[0],
    dueDate: '2026-09-01',
    lineItems: [
      { id: 1, type: 'service', serviceId: 'srv_1', description: 'VPS - 4GB RAM (Frankfurt)', quantity: 1, price: 24.99 }
    ]
  });

  const addLineItem = () => setNewInvoice({ ...newInvoice, lineItems: [...newInvoice.lineItems, { id: Date.now(), type: 'custom', serviceId: '', description: '', quantity: 1, price: 0 }] });
  const removeLineItem = (id: number) => setNewInvoice({ ...newInvoice, lineItems: newInvoice.lineItems.filter(item => item.id !== id) });
  const updateLineItem = (id: number, field: string, value: any) => setNewInvoice({ ...newInvoice, lineItems: newInvoice.lineItems.map(item => item.id === id ? { ...item, [field]: value } : item) });

  const handleCreateInvoice = () => {
    const total = newInvoice.lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setInvoices([{ id: `INV-2026-0${Math.floor(100 + Math.random() * 900)}`, customer: newInvoice.customer, amount: `€${total.toFixed(2)}`, status: 'Pending', date: new Date().toISOString().split('T')[0] }, ...invoices]);
    setIsModalOpen(false);
  };

  const filteredInvoices = invoices.filter(i => {
    const matchesSearch = i.id.toLowerCase().includes(searchQuery.toLowerCase()) || i.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || i.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <Page title="Invoices">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">Manage and generate customer invoices.</p>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4 bg-foreground/[0.02] border border-border p-3">
        <div className="flex-1">
          <input type="text" placeholder="Search invoices by ID or Customer..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground w-40 shrink-0">
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="void">Void</option>
        </select>
      </div>

      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-6 text-muted-foreground">
          <div className="col-span-1">Invoice ID</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-1">Date</div>
          <div className="col-span-1">Amount</div>
          <div className="text-right col-span-1">Status</div>
        </div>
        {filteredInvoices.map(i => (
          <div key={i.id} className="p-4 text-sm grid grid-cols-6 items-center hover:bg-foreground/[0.02] cursor-pointer">
            <div className="font-mono text-xs col-span-1">{i.id}</div>
            <div className="col-span-2 font-medium">{i.customer}</div>
            <div className="col-span-1 text-muted-foreground">{i.date}</div>
            <div className="col-span-1">{i.amount}</div>
            <div className={`text-right col-span-1 ${i.status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>{i.status}</div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" /> Generate Manual Invoice
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Customer</label>
                <select value={newInvoice.customer} onChange={e => setNewInvoice({...newInvoice, customer: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground">
                  {customers.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Due Date</label>
                <input type="date" value={newInvoice.dueDate} onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})} className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground" />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-medium text-muted-foreground uppercase">Line Items</label>
                <button onClick={addLineItem} className="text-xs flex items-center gap-1 text-foreground hover:underline cursor-pointer"><Plus className="w-3 h-3" /> Add Item</button>
              </div>
              
              <div className="border border-border divide-y divide-border">
                <div className="bg-foreground/5 grid grid-cols-12 gap-2 p-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  <div className="col-span-3">Type</div>
                  <div className="col-span-5">Description / Service</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-1"></div>
                </div>
                {newInvoice.lineItems.map(item => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 p-3 items-center">
                    <div className="col-span-3">
                      <select value={item.type} onChange={e => updateLineItem(item.id, 'type', e.target.value)} className="w-full border border-border bg-transparent p-1.5 text-xs focus:outline-none focus:border-foreground">
                        <option value="service">Attached Service</option>
                        <option value="custom">Custom Item</option>
                      </select>
                    </div>
                    <div className="col-span-5">
                      {item.type === 'service' ? (
                        <select value={item.serviceId} onChange={e => { const svc = customerServices.find(s => s.id === e.target.value); updateLineItem(item.id, 'serviceId', e.target.value); if (svc) updateLineItem(item.id, 'description', svc.name); }} className="w-full border border-border bg-transparent p-1.5 text-xs focus:outline-none focus:border-foreground">
                          <option value="">Select a service...</option>
                          {customerServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      ) : (
                        <input type="text" placeholder="Item description" value={item.description} onChange={e => updateLineItem(item.id, 'description', e.target.value)} className="w-full border border-border bg-transparent p-1.5 text-xs focus:outline-none focus:border-foreground" />
                      )}
                    </div>
                    <div className="col-span-1">
                      <input type="number" min="1" value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)} className="w-full border border-border bg-transparent p-1.5 text-xs text-center focus:outline-none focus:border-foreground" />
                    </div>
                    <div className="col-span-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-xs text-muted-foreground">€</span>
                        <input type="number" step="0.01" value={item.price} onChange={e => updateLineItem(item.id, 'price', parseFloat(e.target.value) || 0)} className="w-full border border-border bg-transparent p-1.5 pl-5 text-xs text-right focus:outline-none focus:border-foreground" />
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => removeLineItem(item.id)} className="text-muted-foreground hover:text-red-500 p-1 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-end">
                <div className="text-right w-48">
                  <div className="flex justify-between py-1 text-sm text-muted-foreground">
                    <span>Total:</span>
                    <span>€{newInvoice.lineItems.reduce((s, i) => s + (i.quantity * i.price), 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">Cancel</button>
              <button onClick={handleCreateInvoice} className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors flex items-center gap-2 cursor-pointer"><Receipt className="w-4 h-4" /> Generate</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export default function BillingRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="invoices" replace />} />
      <Route path="insights" element={<BillingInsights />} />
      <Route path="invoices" element={<BillingInvoices />} />
      <Route path="automations" element={<BillingAutomations />} />
      <Route path="tax-rates" element={<BillingTaxRates />} />
    </Routes>
  );
}
