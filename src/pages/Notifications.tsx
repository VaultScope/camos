import { useState } from 'react';
import { Page } from '../components/Layout';
import { AlertTriangle, CreditCard, Server, LifeBuoy, HardDrive, Plug, CheckCircle2, X, Check } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import type { Notification } from '../lib/types';

const CATEGORY_META: Record<string, { icon: typeof AlertTriangle; label: string }> = {
  alert: { icon: AlertTriangle, label: 'Alert' },
  billing: { icon: CreditCard, label: 'Billing' },
  provisioning: { icon: Server, label: 'Provisioning' },
  ticket: { icon: LifeBuoy, label: 'Ticket' },
  stock: { icon: HardDrive, label: 'Stock' },
  connector: { icon: Plug, label: 'Connector' },
};

export default function NotificationsPage() {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const { data: notifications, loading, error, refetch } = useApi<Notification[]>('/admin/notifications');

  const items = notifications || [];
  const unreadCount = items.filter(n => !n.read).length;
  const unresolvedCount = items.filter(n => !n.resolved).length;

  const markRead = async (id: string) => {
    await api.put(`/admin/notifications/${id}/read`);
    refetch();
  };

  const resolve = async (id: string) => {
    await api.put(`/admin/notifications/${id}/resolve`);
    refetch();
  };

  const filtered = items.filter(n => {
    const matchesSeverity = filterSeverity === 'all' || n.severity === filterSeverity;
    const matchesCategory = filterCategory === 'all' || n.category === filterCategory;
    return matchesSeverity && matchesCategory;
  });

  return (
    <Page title="Notifications">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">
          {unresolvedCount > 0
            ? <><span className="text-foreground font-medium">{unresolvedCount} unresolved</span>{unreadCount > 0 && <>, <span className="text-foreground font-medium">{unreadCount} unread</span></>} — events that need your attention.</>
            : 'All caught up — nothing unresolved.'}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-foreground/[0.02] border border-border p-3">
        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
          className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground w-40 shrink-0"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground w-44 shrink-0"
        >
          <option value="all">All Categories</option>
          <option value="alert">Alerts</option>
          <option value="billing">Billing</option>
          <option value="provisioning">Provisioning</option>
          <option value="ticket">Tickets</option>
          <option value="stock">Stock</option>
          <option value="connector">Connectors</option>
        </select>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading notifications...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load notifications: {error}</div>}

      {!loading && !error && (
        <div className="border border-border bg-background">
          {filtered.map((n, i) => {
            const meta = CATEGORY_META[n.category] || CATEGORY_META.alert;
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`flex items-start gap-4 p-4 transition-colors hover:bg-foreground/[0.02] ${i > 0 ? 'border-t border-border' : ''} ${!n.read ? 'bg-foreground/[0.03]' : ''} ${n.resolved ? 'opacity-50' : ''}`}
              >
                <div className={`mt-0.5 p-2 border ${
                  n.resolved ? 'border-green-500/30 bg-green-500/10' :
                  n.severity === 'critical' ? 'border-red-500/30 bg-red-500/10' :
                  n.severity === 'warning' ? 'border-yellow-500/30 bg-yellow-500/10' :
                  'border-border bg-foreground/5'
                }`}>
                  {n.resolved ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Icon className={`w-4 h-4 ${
                      n.severity === 'critical' ? 'text-red-500' :
                      n.severity === 'warning' ? 'text-yellow-500' :
                      'text-muted-foreground'
                    }`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!n.read && <div className="w-2 h-2 rounded-full bg-foreground shrink-0" />}
                    <span className={`text-sm ${!n.read ? 'font-medium' : ''}`}>{n.title}</span>
                    {n.resolved ? (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-green-500/30 text-green-500">Resolved</span>
                    ) : (
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 border ${
                        n.severity === 'critical' ? 'text-red-500 border-red-500/30' :
                        n.severity === 'warning' ? 'text-yellow-500 border-yellow-500/30' :
                        'text-muted-foreground border-border'
                      }`}>{n.severity}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{n.detail}</p>
                  {!n.resolved && (
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        onClick={e => { e.stopPropagation(); resolve(n.id); }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-green-500/30 text-green-500 hover:bg-green-500/10 transition-colors cursor-pointer"
                      >
                        <Check className="w-3 h-3" /> Resolve
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {n.created_at?.split('T')[0]}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 mb-2 text-foreground/20" />
              {items.length === 0 ? 'No notifications yet.' : 'No notifications match your filters.'}
            </div>
          )}
        </div>
      )}
    </Page>
  );
}
