import { Routes, Route, Navigate } from 'react-router-dom';
import BillingInvoices from './BillingNew';
import TaxRates from './TaxRatesNew';
import { Page } from '../components/Layout';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar
} from 'recharts';

interface ComprehensiveStats {
    unpaid_invoices: number;
    paid_invoices: number;
    revenue: number;
    profit: number;
    stripe_balance: number;
    revenue_per_month: { month: string, revenue: number }[];
    infrastructure_cost: number;
    top_clients: { customer_id: string, name: string, total_spent: number }[];
    coupons_loss: number;
    top_products: { name: string, count: number }[];
}

function BillingInsights() {
  const [stats, setStats] = useState<ComprehensiveStats | null>(null);
  
  useEffect(() => {
    api.get<ComprehensiveStats>('/admin/invoices/stats/comprehensive')
      .then(res => setStats(res))
      .catch(() => {});
  }, []);

  if (!stats) return <Page title="Billing Insights"><div className="p-5">Loading...</div></Page>;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const invoiceData = [
    { name: 'Paid', value: Number(stats.paid_invoices) },
    { name: 'Unpaid', value: Number(stats.unpaid_invoices) }
  ];

  const profitCostData = [
    { name: 'Totals', Revenue: Number(stats.revenue), Profit: Number(stats.profit) }
  ];

  const stripeData = [
    { name: 'Stripe Balance', value: Number(stats.stripe_balance), fill: '#6366f1' }
  ];

  const couponsData = [
    { name: 'Coupons Loss', value: Number(stats.coupons_loss) }
  ];

  return (
    <Page title="Billing Insights">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {/* 1. Invoices PieChart */}
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Paid vs Unpaid</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={invoiceData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                  {invoiceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Revenue vs Profit */}
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Revenue & Profit (Total)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitCostData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis width={40} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Revenue" fill="#3b82f6" />
                <Bar dataKey="Profit" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Stripe Balance */}
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Stripe Balance</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={20} data={stripeData} startAngle={180} endAngle={0}>
                <RadialBar background dataKey="value" cornerRadius={10} />
                <Tooltip />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold fill-foreground">
                  €{Number(stats.stripe_balance).toFixed(0)}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Infrastructure Cost */}
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Infrastructure Cost</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{name: 'Cost', value: Number(stats.infrastructure_cost)}, {name: 'Profit', value: Number(stats.profit)}]} cx="50%" cy="50%" outerRadius={60} dataKey="value">
                  <Cell fill="#ef4444" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* 4. Revenue per month */}
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Revenue Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenue_per_month}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Spent per Client */}
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Top Clients by Spend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={stats.top_clients} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="total_spent" fill="#f59e0b" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7. Coupons Loss */}
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Coupons Impact</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={couponsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" name="Loss (€)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 8. Top Products */}
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Top Products (Active Services)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.top_products} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="name" label>
                  {stats.top_products.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Page>
  );
}

function BillingAutomations() {
  const [settings, setSettings] = useState({
    grace_period_days: '3',
    auto_suspend_enabled: 'Enabled',
    auto_terminate_days: '14'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<{key: string, value: any}[]>('/admin/settings').then((data) => {
      const mapped: Record<string, any> = {};
      data.forEach((s) => { mapped[s.key] = s.value; });
      setSettings((prev) => ({ 
        grace_period_days: String(mapped.grace_period_days ?? prev.grace_period_days),
        auto_suspend_enabled: String(mapped.auto_suspend_enabled ?? prev.auto_suspend_enabled),
        auto_terminate_days: String(mapped.auto_terminate_days ?? prev.auto_terminate_days),
      }));
    }).catch(() => {});
  }, []);

  const update = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    const entries = Object.entries(settings).map(([key, value]) => ({ key, value }));
    api.put('/admin/settings', entries)
      .then(() => { setSaved(true); setTimeout(() => setSaved(false), 2000); })
      .catch(() => {});
  };

  return (
    <Page title="Billing Automations">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">Configure automated billing workflows and payment reminders.</p>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer"
        >
          {saved ? 'Saved' : 'Save Changes'}
        </button>
      </div>
      <div className="border border-border bg-background p-6 space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">Grace Period After Due Date</label>
          <select value={settings.grace_period_days} onChange={e => update('grace_period_days', e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm">
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Auto-Suspend After Grace Period</label>
          <select value={settings.auto_suspend_enabled} onChange={e => update('auto_suspend_enabled', e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm">
            <option value="Enabled">Enabled</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Auto-Terminate After Suspension</label>
          <select value={settings.auto_terminate_days} onChange={e => update('auto_terminate_days', e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm">
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
      </div>
    </Page>
  );
}

export default function BillingRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/billing/invoices" replace />} />
      <Route path="/invoices" element={<BillingInvoices />} />
      <Route path="/tax-rates" element={<TaxRates />} />
      <Route path="/insights" element={<BillingInsights />} />
      <Route path="/automations" element={<BillingAutomations />} />
    </Routes>
  );
}
