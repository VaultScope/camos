import { useState } from 'react';
import { Page } from '../components/Layout';
import { Download, TrendingUp, Users, Server } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { API_BASE } from '../lib/api';
import { useToast } from '../components/Toast';

interface DashboardStats {
  active_services: number;
  total_customers: number;
  open_tickets: number;
  pending_jobs: number;
  mrr: number;
}

export default function Reports() {
  const { data: stats, loading } = useApi<DashboardStats>('/admin/dashboard/stats');
  const [downloading, setDownloading] = useState<'invoices' | 'customers' | null>(null);
  const toast = useToast();

  const handleExport = async (type: 'invoices' | 'customers') => {
    if (downloading) return;
    setDownloading(type);
    try {
      const token = localStorage.getItem('vs_admin_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}/admin/dashboard/export/${type}`, {
        headers,
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to export ${type} (${res.status})`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`${type === 'invoices' ? 'Invoices' : 'Customers'} CSV downloaded.`);
    } catch (err: any) {
      toast.error(err?.message || `Failed to export ${type}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Page title="Reports & Exports" requiredPermission="reports.view">
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
          <button
            onClick={() => handleExport('invoices')}
            disabled={downloading === 'invoices'}
            className="flex items-center justify-center gap-2 border border-border px-4 py-3 text-sm hover:bg-foreground/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {downloading === 'invoices' ? 'Exporting...' : 'Invoices'}
          </button>
          <button className="flex items-center justify-center gap-2 border border-border px-4 py-3 text-sm hover:bg-foreground/5 transition-colors cursor-pointer opacity-50" disabled>
            <Download className="w-4 h-4" /> Revenue
          </button>
          <button
            onClick={() => handleExport('customers')}
            disabled={downloading === 'customers'}
            className="flex items-center justify-center gap-2 border border-border px-4 py-3 text-sm hover:bg-foreground/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {downloading === 'customers' ? 'Exporting...' : 'Customers'}
          </button>
          <button className="flex items-center justify-center gap-2 border border-border px-4 py-3 text-sm hover:bg-foreground/5 transition-colors cursor-pointer opacity-50" disabled>
            <Download className="w-4 h-4" /> Services
          </button>
        </div>
      </div>
    </Page>
  );
}
