import { Link } from 'react-router-dom';
import { Page } from '../components/Layout';
import { ArrowRight, Bell, CreditCard, ExternalLink, LifeBuoy, Plus, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { HelpTooltip } from '../components/HelpTooltip';

interface DashboardStats {
  active_services: number;
  total_customers: number;
  open_tickets: number;
  pending_jobs: number;
  mrr: number;
}

export default function Dashboard() {
  const { data: stats, loading } = useApi<DashboardStats>('/admin/dashboard/stats');
  const { data: notifications } = useApi<any[]>('/admin/notifications');
  const { data: activities } = useApi<any[]>('/admin/activity');
  const { data: tickets } = useApi<any[]>('/admin/tickets');

  return (
    <Page title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <div className="rounded-2xl border border-border p-4 sm:p-5 bg-card shadow-xs hover:border-foreground/20 transition-colors duration-150">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">MRR</span>
            <HelpTooltip
              title="Monthly Recurring Revenue"
              badge="Finance"
              content="Normalized monthly recurring subscription revenue across all active running services (excluding setup fees and cancelled accounts)."
              example="€12.00 (Monthly) or €120.00 / 12 (Annual)"
            />
          </div>
          <div className="text-2xl font-light tabular-nums">{loading ? '—' : `€${(stats?.mrr ?? 0).toLocaleString()}`}</div>
          <div className="text-[11px] text-muted-foreground mt-1">monthly recurring</div>
        </div>

        <div className="rounded-2xl border border-border p-4 sm:p-5 bg-card shadow-xs hover:border-foreground/20 transition-colors duration-150">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Active Services</span>
            <HelpTooltip
              title="Active Provisioned Services"
              badge="Infra"
              content="Total compute, storage, and dedicated instances currently running and billed in production across Hetzner, ReliableSite, and SFTPGo."
            />
          </div>
          <div className="text-2xl font-light tabular-nums">{loading ? '—' : stats?.active_services ?? 0}</div>
          <div className="text-[11px] text-muted-foreground mt-1">provisioned</div>
        </div>

        <div className="rounded-2xl border border-border p-4 sm:p-5 bg-card shadow-xs hover:border-foreground/20 transition-colors duration-150">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Open Tickets</span>
            <HelpTooltip
              title="Open Support Inquiries"
              badge="Support"
              content="Customer inquiries with status 'open' requiring triage or reply from support staff."
            />
          </div>
          <div className="text-2xl font-light tabular-nums">{loading ? '—' : stats?.open_tickets ?? 0}</div>
          <div className="text-[11px] text-muted-foreground mt-1">awaiting response</div>
        </div>

        <div className="rounded-2xl border border-border p-4 sm:p-5 bg-card shadow-xs hover:border-foreground/20 transition-colors duration-150">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Pending Jobs</span>
            <HelpTooltip
              title="Provisioning Job Queue"
              badge="Async Worker"
              content="Tasks currently scheduled in the background job queue (create server, destroy, power reboot, change quota) awaiting execution."
            />
          </div>
          <div className="text-2xl font-light tabular-nums">{loading ? '—' : stats?.pending_jobs ?? 0}</div>
          <div className="text-[11px] text-muted-foreground mt-1">in queue</div>
        </div>

        <div className="rounded-2xl border border-border p-4 sm:p-5 bg-card shadow-xs hover:border-foreground/20 transition-colors duration-150 sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Customers</span>
            <HelpTooltip
              title="Registered Customer Accounts"
              badge="Accounts"
              content="Total distinct registered client accounts in VaultScope. Includes both individual and business accounts."
            />
          </div>
          <div className="text-2xl font-light tabular-nums">{loading ? '—' : stats?.total_customers ?? 0}</div>
          <div className="text-[11px] text-muted-foreground mt-1">registered</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mb-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border bg-foreground/[0.03]">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-muted-foreground" /> Needs Attention
              </h3>
              <HelpTooltip
                title="Automated Action Alerts"
                content="Aggregates system-generated notifications that require staff intervention (e.g. failed provisioning jobs, overdue invoices past grace period, and high-priority abuse tickets)."
              />
            </div>
            <Link to="/notifications" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 sm:p-6 text-sm text-muted-foreground">
            {notifications && notifications.length > 0 ? (
              <div className="space-y-2.5">
                {notifications.slice(0, 5).map(n => (
                  <div key={n.id} className="flex justify-between items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/[0.03] transition-colors">
                    <span className="text-foreground/90 truncate">{n.title}</span>
                    <span className="text-xs shrink-0 font-mono">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Nothing urgent right now.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border bg-foreground/[0.03]">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider">Quick Actions</h3>
              <HelpTooltip
                title="Fast Operator Shortcuts"
                content="Direct entry points to the most common day-to-day administration flows: manual server provisioning, product pricing updates, ticket creation, and billing adjustments."
              />
            </div>
          </div>
          <div className="p-3 space-y-2">
            <Link to="/services/new" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border/80 bg-background/50 hover:bg-foreground/[0.05] hover:border-foreground/20 transition-colors duration-150 text-sm">
              <Plus className="w-4 h-4 text-muted-foreground shrink-0" /> Provision Service
            </Link>
            <Link to="/products/new" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border/80 bg-background/50 hover:bg-foreground/[0.05] hover:border-foreground/20 transition-colors duration-150 text-sm">
              <Plus className="w-4 h-4 text-muted-foreground shrink-0" /> New Product
            </Link>
            <Link to="/tickets/new" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border/80 bg-background/50 hover:bg-foreground/[0.05] hover:border-foreground/20 transition-colors duration-150 text-sm">
              <Plus className="w-4 h-4 text-muted-foreground shrink-0" /> Create Ticket
            </Link>
            <Link to="/billing/invoices?new=true" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border/80 bg-background/50 hover:bg-foreground/[0.05] hover:border-foreground/20 transition-colors duration-150 text-sm">
              <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" /> Generate Invoice
            </Link>
            <Link to="/launchpad" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border/80 bg-background/50 hover:bg-foreground/[0.05] hover:border-foreground/20 transition-colors duration-150 text-sm">
              <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" /> Internal Tools
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mb-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border bg-foreground/[0.03]">
            <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Recent Activity
            </h3>
            <Link to="/activity" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              Full Log <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 sm:p-6 text-sm text-muted-foreground">
            {activities && activities.length > 0 ? (
              <div className="space-y-2.5">
                {activities.slice(0, 5).map(a => (
                  <div key={a.id} className="flex justify-between items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/[0.03] transition-colors">
                    <span className="truncate text-foreground/90">{a.actor_name}: {a.action} {a.target}</span>
                    <span className="text-xs shrink-0 font-mono">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">No recent activity recorded.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border bg-foreground/[0.03]">
            <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <LifeBuoy className="w-3.5 h-3.5 text-muted-foreground" /> Ticket Queue
            </h3>
            <Link to="/tickets" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              Open <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 sm:p-5 text-sm text-muted-foreground">
            {tickets && tickets.filter(t => t.status === 'open').length > 0 ? (
              <div className="space-y-2">
                {tickets.filter(t => t.status === 'open').slice(0, 5).map(t => (
                  <Link key={t.id} to={`/tickets/${t.id}`} className="block px-3 py-2.5 rounded-xl hover:bg-foreground/[0.04] hover:text-foreground transition-colors">
                    <div className="font-medium text-foreground truncate">{t.subject}</div>
                    <div className="text-xs font-mono mt-0.5 text-muted-foreground">#{t.ticket_number}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">No open tickets.</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border bg-foreground/[0.03]">
          <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" /> Revenue
          </h3>
          <Link to="/reports" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            Full Report <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-6 sm:p-8 text-center text-sm text-muted-foreground">
          <div className="text-3xl font-light text-foreground tabular-nums">€{(stats?.mrr ?? 0).toLocaleString()}</div>
          <div className="text-xs mt-1.5">Monthly Recurring Revenue</div>
        </div>
      </div>
    </Page>
  );
}
