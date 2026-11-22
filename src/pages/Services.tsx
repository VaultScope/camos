import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Plus, Power, Server, Calendar } from 'lucide-react';
import { useApi } from '../lib/hooks';
import type { Service } from '../lib/types';

import ServiceDetail from './ServiceDetail';
import ServiceNew from './ServiceNew';

function ServicesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrderState, setFilterOrderState] = useState('all');
  const { data: services, loading, error } = useApi<Service[]>('/admin/services');

  const items = services || [];
  const filtered = items.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const orderState = s.order_state || 'active';
    const matchesOrderState = filterOrderState === 'all' || orderState === filterOrderState;
    return matchesSearch && matchesStatus && matchesOrderState;
  });

  return (
    <Page title="Manage Services (Active Infrastructure)" requiredPermission="services.view">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6 bg-card border border-border rounded-2xl p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <input
            type="text"
            placeholder="Search by name, IP, hostname, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:flex-1 rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50"
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50 sm:w-40 shrink-0 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="running">Running</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
            <option value="terminated">Terminated</option>
          </select>
          <select
            value={filterOrderState}
            onChange={e => setFilterOrderState(e.target.value)}
            className="rounded-xl bg-background border border-border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50 sm:w-48 shrink-0 cursor-pointer"
          >
            <option value="all">All Order States</option>
            <option value="payment_received">Payment Received</option>
            <option value="provisioning">Provisioning</option>
            <option value="hardware_setup">Hardware Setup</option>
            <option value="active">Active / Ready</option>
            <option value="action_required">Action Required</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Link
          to="/services/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Provision Service
        </Link>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading services...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load services: {error}</div>}

      {!loading && !error && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[840px] divide-y divide-border">
              <div className="p-4 bg-foreground/[0.03] text-xs font-medium uppercase tracking-wider grid grid-cols-8 text-muted-foreground">
                <div className="col-span-2">Service</div>
                <div>IP</div>
                <div>Status</div>
                <div>Order State</div>
                <div>Price</div>
                <div>Next Due</div>
                <div className="text-right">Actions</div>
              </div>
              {filtered.map(s => (
                <Link key={s.id} to={`/services/${s.id}`} className="p-4 text-sm grid grid-cols-8 items-center hover:bg-foreground/[0.025] transition-colors">
                  <div className="col-span-2 flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate">{s.name}</span>
                      {s.is_trial && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono shrink-0">
                          Trial
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground ml-6 truncate">{s.hostname || s.id.slice(0, 8)}</span>
                  </div>
                  <div className="font-mono text-xs">{s.ip || '—'}</div>
                  <div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase font-medium ${
                      s.status === 'running' ? 'border-green-500/30 bg-green-500/10 text-green-500' :
                      s.status === 'suspended' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500' :
                      s.status === 'pending' ? 'border-blue-500/30 bg-blue-500/10 text-blue-500' :
                      'border-red-500/30 bg-red-500/10 text-red-500'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono uppercase ${
                      (s.order_state || 'active') === 'active'
                        ? 'border-green-500/30 bg-green-500/10 text-green-500'
                        : (s.order_state || 'active') === 'cancelled'
                          ? 'border-red-500/30 bg-red-500/10 text-red-500'
                          : (s.order_state || 'active') === 'action_required'
                            ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500'
                            : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                    }`}>
                      {(s.order_state || 'active').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="tabular-nums">€{parseFloat(s.price || '0').toFixed(2)}/mo</div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs font-mono">
                    <Calendar className="w-3 h-3 shrink-0" />
                    {s.next_due?.split('T')[0] || '—'}
                  </div>
                  <div className="text-right">
                    <button className="p-1.5 rounded-xl border border-border hover:bg-foreground/5 text-muted-foreground transition-colors" onClick={e => e.preventDefault()}>
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  {items.length === 0 ? 'No services provisioned yet.' : 'No services match your filters.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export default function ServicesRouter() {
  return (
    <Routes>
      <Route path="/" element={<ServicesList />} />
      <Route path="new" element={<ServiceNew />} />
      <Route path=":id" element={<ServiceDetail />} />
    </Routes>
  );
}
