import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Plus, Power, Server, Calendar } from 'lucide-react';
import { useApi } from '../lib/hooks';
import type { Service } from '../lib/types';

import ServiceDetail from './ServiceDetail';

function ServicesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: services, loading, error } = useApi<Service[]>('/admin/services');

  const items = services || [];
  const filtered = items.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Page title="Manage Services (Active Infrastructure)">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3 flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Search by name, IP, hostname, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground w-40 shrink-0"
          >
            <option value="all">All Statuses</option>
            <option value="running">Running</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
        <Link
          to="/services/new"
          className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Provision Service
        </Link>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading services...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load services: {error}</div>}

      {!loading && !error && (
        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-7 text-muted-foreground">
            <div className="col-span-2">Service</div>
            <div>IP</div>
            <div>Status</div>
            <div>Price</div>
            <div>Next Due</div>
            <div className="text-right">Actions</div>
          </div>
          {filtered.map(s => (
            <Link key={s.id} to={`/services/${s.id}`} className="p-4 text-sm grid grid-cols-7 items-center hover:bg-foreground/[0.02] transition-colors">
              <div className="col-span-2 flex flex-col">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{s.name}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-6">{s.hostname || s.id.slice(0, 8)}</span>
              </div>
              <div className="font-mono text-xs">{s.ip || '—'}</div>
              <div>
                <span className={`text-[10px] px-2 py-0.5 border uppercase ${
                  s.status === 'running' ? 'border-green-500/30 text-green-500' :
                  s.status === 'suspended' ? 'border-yellow-500/30 text-yellow-500' :
                  s.status === 'pending' ? 'border-blue-500/30 text-blue-500' :
                  'border-red-500/30 text-red-500'
                }`}>
                  {s.status}
                </span>
              </div>
              <div>€{parseFloat(s.price || '0').toFixed(2)}/mo</div>
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Calendar className="w-3 h-3" />
                {s.next_due?.split('T')[0] || '—'}
              </div>
              <div className="text-right">
                <button className="p-1.5 border border-border hover:bg-foreground/5 text-muted-foreground" onClick={e => e.preventDefault()}>
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
      )}
    </Page>
  );
}

export default function ServicesRouter() {
  return (
    <Routes>
      <Route path="/" element={<ServicesList />} />
      <Route path=":id" element={<ServiceDetail />} />
    </Routes>
  );
}
