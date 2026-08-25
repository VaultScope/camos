import { useState } from 'react';
import { Page } from '../components/Layout';
import { User, Server, CreditCard, LifeBuoy, HardDrive, Shield, Settings, Plug } from 'lucide-react';
import { useApi } from '../lib/hooks';
import type { ActivityLog as ActivityEntry } from '../lib/types';

const CATEGORY_META: Record<string, { icon: typeof User; label: string }> = {
  customer: { icon: User, label: 'Customer' },
  service: { icon: Server, label: 'Service' },
  billing: { icon: CreditCard, label: 'Billing' },
  ticket: { icon: LifeBuoy, label: 'Ticket' },
  product: { icon: HardDrive, label: 'Product' },
  staff: { icon: Shield, label: 'Staff' },
  system: { icon: Settings, label: 'System' },
  connector: { icon: Plug, label: 'Connector' },
};

export default function ActivityLogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const { data: activities, loading, error } = useApi<ActivityEntry[]>('/admin/activity');

  const items = activities || [];
  const filtered = items.filter(a => {
    const matchesSearch =
      a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.detail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || a.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Page title="Activity Log">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">Chronological record of all staff and system actions.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-foreground/[0.02] border border-border p-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search actions, targets, or details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground w-40 shrink-0"
        >
          <option value="all">All Categories</option>
          <option value="customer">Customer</option>
          <option value="service">Service</option>
          <option value="billing">Billing</option>
          <option value="ticket">Ticket</option>
          <option value="product">Product</option>
          <option value="staff">Staff</option>
          <option value="system">System</option>
          <option value="connector">Connector</option>
        </select>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading activity...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load activity: {error}</div>}

      {!loading && !error && (
        <div className="border border-border bg-background">
          {filtered.map((entry, i) => {
            const meta = CATEGORY_META[entry.category] || CATEGORY_META.system;
            const Icon = meta.icon;
            return (
              <div key={entry.id} className={`flex items-start gap-4 p-4 hover:bg-foreground/[0.02] ${i > 0 ? 'border-t border-border' : ''}`}>
                <div className="mt-0.5 p-2 border border-border bg-foreground/5">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{entry.actor_name}</span>
                    <span className="text-muted-foreground">{entry.action}</span>
                    <span className="font-medium truncate">{entry.target}</span>
                  </div>
                  {entry.detail && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{entry.detail}</p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {entry.created_at?.split('T')[0]}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {items.length === 0 ? 'No activity recorded yet.' : 'No activity matches your filters.'}
            </div>
          )}
        </div>
      )}
    </Page>
  );
}
