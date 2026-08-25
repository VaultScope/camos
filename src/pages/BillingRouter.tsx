import { Routes, Route, Navigate } from 'react-router-dom';
import BillingInvoices from './BillingNew';
import TaxRates from './TaxRatesNew';

// Keep the old insights/automations placeholders for now
import { Page } from '../components/Layout';
import { TrendingUp } from 'lucide-react';

function BillingInsights() {
  return (
    <Page title="Billing Insights">
      <div className="grid grid-cols-2 gap-6">
        <div className="border border-border p-5 bg-background">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Unpaid Invoices</div>
          <div className="text-2xl font-light">€2,140.00</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 12 pending
          </div>
        </div>
        <div className="border border-border p-5 bg-background">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Stripe Balance</div>
          <div className="text-2xl font-light">€18,249.32</div>
          <div className="text-xs text-muted-foreground mt-1">Available for payout</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-4">Real-time billing insights will be implemented in a future update.</p>
    </Page>
  );
}

function BillingAutomations() {
  return (
    <Page title="Billing Automations">
      <p className="text-sm text-muted-foreground mb-6">Configure automated billing workflows and payment reminders.</p>
      <div className="border border-border bg-background p-6 space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">Grace Period After Due Date</label>
          <select className="w-full bg-background border border-border px-3 py-2 text-sm">
            <option>3 days</option>
            <option>7 days</option>
            <option>14 days</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Auto-Suspend After Grace Period</label>
          <select className="w-full bg-background border border-border px-3 py-2 text-sm">
            <option>Enabled</option>
            <option>Disabled</option>
          </select>
        </div>
        <p className="text-xs text-muted-foreground">Billing automation configuration will be functional in a future update.</p>
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
