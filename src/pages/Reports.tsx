import { Page } from '../components/Layout';
import { Download, TrendingUp, Users, Server } from 'lucide-react';
import { useApi } from '../lib/hooks';

interface DashboardStats {
  active_services: number;
  total_customers: number;
  open_tickets: number;
  pending_jobs: number;
  mrr: number;
}

export default function Reports() {
  const { data: stats, loading } = useApi<DashboardStats>('/admin/dashboard/stats');

  return (
    <Page title="Reports & Exports">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">Financial overview, growth metrics, and data exports.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="border border-border p-4 bg-background">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Current MRR</div>
          <div className="text-2xl font-light">{loading ? '—' : `€${(stats?.mrr ?? 0).toLocaleString()}`}</div>
          <div className="text-xs text-muted-foreground mt-1">monthly recurring</div>
        </div>
        <div className="border border-border p-4 bg-background">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Active Services</div>
          <div className="text-2xl font-light">{loading ? '—' : stats?.active_services ?? 0}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Server className="w-3 h-3" /> provisioned
          </div>
        </div>
        <div className="border border-border p-4 bg-background">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Customers</div>
          <div className="text-2xl font-light">{loading ? '—' : stats?.total_customers ?? 0}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Users className="w-3 h-3" /> registered
          </div>
        </div>
        <div className="border border-border p-4 bg-background">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Open Tickets</div>
          <div className="text-2xl font-light">{loading ? '—' : stats?.open_tickets ?? 0}</div>
          <div className="text-xs text-muted-foreground mt-1">awaiting response</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" /> Revenue Over Time
          </h3>
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            Revenue charts will populate as billing data accumulates.
          </div>
        </div>

        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" /> Customer Growth
          </h3>
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            Growth metrics will populate as customer data accumulates.
          </div>
        </div>
      </div>

      <div className="border border-border p-5 bg-background">
        <h3 className="text-sm font-medium mb-4">Data Exports</h3>
        <p className="text-xs text-muted-foreground mb-4">Download CSV files for accounting, analytics, or migration.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex items-center justify-center gap-2 border border-border px-4 py-3 text-sm hover:bg-foreground/5 transition-colors cursor-pointer opacity-50" disabled>
            <Download className="w-4 h-4" /> Invoices
          </button>
          <button className="flex items-center justify-center gap-2 border border-border px-4 py-3 text-sm hover:bg-foreground/5 transition-colors cursor-pointer opacity-50" disabled>
            <Download className="w-4 h-4" /> Revenue
          </button>
          <button className="flex items-center justify-center gap-2 border border-border px-4 py-3 text-sm hover:bg-foreground/5 transition-colors cursor-pointer opacity-50" disabled>
            <Download className="w-4 h-4" /> Customers
          </button>
          <button className="flex items-center justify-center gap-2 border border-border px-4 py-3 text-sm hover:bg-foreground/5 transition-colors cursor-pointer opacity-50" disabled>
            <Download className="w-4 h-4" /> Services
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Export functionality will be available once reporting endpoints are implemented.</p>
      </div>
    </Page>
  );
}
