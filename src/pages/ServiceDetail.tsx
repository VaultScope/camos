import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Page } from '../components/Layout';
import { ArrowLeft, Terminal, ShieldAlert, Power, RefreshCw, HardDrive, Wifi, X } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import type { Service } from '../lib/types';

const osImages = [
  { id: 'ubuntu-24.04', name: 'Ubuntu 24.04 LTS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ubuntu/ubuntu-original.svg' },
  { id: 'debian-12', name: 'Debian 12', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/debian/debian-original.svg' },
  { id: 'almalinux-9', name: 'AlmaLinux 9', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/almalinux/almalinux-original.svg' },
  { id: 'rocky-9', name: 'Rocky Linux 9', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rockylinux/rockylinux-original.svg' },
];

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: service, loading, error, refetch } = useApi<Service>(`/admin/services/${id}`);
  const [showReinstall, setShowReinstall] = useState(false);
  const [selectedOs, setSelectedOs] = useState('ubuntu-24.04');
  const [authMethod, setAuthMethod] = useState<'password' | 'ssh'>('password');
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (action: 'suspend' | 'reactivate' | 'terminate') => {
    if (!id) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/services/${id}/${action}`, {});
      refetch();
    } catch (e: any) {
      alert(e.message || `Failed to ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Page title="Instance Management"><div className="p-8 text-center text-muted-foreground text-sm">Loading service...</div></Page>;
  if (error || !service) return <Page title="Instance Management"><div className="p-8 text-center text-red-500 text-sm">Failed to load service: {error}</div></Page>;

  const statusColor = service.status === 'running' ? 'text-green-500' :
    service.status === 'suspended' ? 'text-yellow-500' :
    service.status === 'pending' ? 'text-blue-500' : 'text-red-500';

  return (
    <Page title="Instance Management">
      <div className="mb-6 flex justify-between items-center">
        <Link to="/services" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
        <div className="flex gap-2">
          {service.status === 'running' && (
            <button
              onClick={() => handleAction('suspend')}
              disabled={actionLoading}
              className="flex items-center gap-2 border border-border px-4 py-2 text-sm hover:bg-yellow-500/10 transition-colors text-yellow-500 font-medium disabled:opacity-50"
            >
              <Power className="w-4 h-4" /> Suspend
            </button>
          )}
          {service.status === 'suspended' && (
            <button
              onClick={() => handleAction('reactivate')}
              disabled={actionLoading}
              className="flex items-center gap-2 border border-border px-4 py-2 text-sm hover:bg-green-500/10 transition-colors text-green-500 font-medium disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" /> Reactivate
            </button>
          )}
          {service.status !== 'terminated' && (
            <button
              onClick={() => handleAction('terminate')}
              disabled={actionLoading}
              className="flex items-center gap-2 border border-border px-4 py-2 text-sm hover:bg-red-500/10 transition-colors text-red-500 font-medium disabled:opacity-50"
            >
              <Power className="w-4 h-4" /> Terminate
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 font-medium flex justify-between items-center">
            <span>{service.name}</span>
            <span className={`flex items-center gap-2 text-xs ${statusColor}`}>
              <div className={`w-2 h-2 rounded-full ${statusColor.replace('text-', 'bg-')}`} />
              {service.status}
            </span>
          </div>
          <div className="p-6 grid grid-cols-2 gap-y-6">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Service ID</div>
              <div className="font-mono text-sm">{service.id.slice(0, 8)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Hostname</div>
              <div className="font-medium">{service.hostname || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price</div>
              <div className="font-medium">€{parseFloat(service.price || '0').toFixed(2)} / mo</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Created</div>
              <div className="text-sm">{new Date(service.created_at).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Next Due</div>
              <div className="text-sm">{service.next_due?.split('T')[0] || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Provider Resource</div>
              <div className="font-mono text-sm">{service.provider_resource_id || '—'}</div>
            </div>
          </div>
        </div>

        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 font-medium flex items-center gap-2">
            <Wifi className="w-4 h-4" /> Network
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Primary IP</div>
              <div className="font-mono text-sm">{service.ip || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Customer ID</div>
              <div className="font-mono text-sm">{service.customer_id.slice(0, 8)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Product ID</div>
              <div className="font-mono text-sm">{service.product_id.slice(0, 8)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4">Configuration</h3>
          <pre className="text-xs font-mono bg-foreground/5 p-4 border border-border overflow-auto max-h-48">
            {JSON.stringify(service.config, null, 2)}
          </pre>
        </div>

        <div className="border border-border p-5 bg-background flex flex-col gap-4">
          <h3 className="text-sm font-medium mb-2">Destructive Actions</h3>
          <p className="text-xs text-muted-foreground mb-4">These actions interface directly with the upstream provider and will cause downtime or data loss.</p>

          <button className="flex items-center justify-between border border-border p-4 hover:bg-foreground/5 transition-colors group">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-yellow-500" />
              <div className="text-left">
                <div className="text-sm font-medium group-hover:text-yellow-500 transition-colors">Boot Rescue System</div>
                <div className="text-xs text-muted-foreground">Reboots into Linux Live ISO</div>
              </div>
            </div>
          </button>

          <button className="flex items-center justify-between border border-border p-4 hover:bg-foreground/5 transition-colors group">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-blue-500" />
              <div className="text-left">
                <div className="text-sm font-medium group-hover:text-blue-500 transition-colors">Open VNC Console</div>
                <div className="text-xs text-muted-foreground">Emergency KVM access</div>
              </div>
            </div>
          </button>

          <button onClick={() => setShowReinstall(true)} className="flex items-center justify-between border border-border p-4 hover:bg-red-500/10 transition-colors group">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-red-500" />
              <div className="text-left">
                <div className="text-sm font-medium group-hover:text-red-500 transition-colors">Reinstall OS</div>
                <div className="text-xs text-muted-foreground">Wipes all customer data</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {showReinstall && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-background border border-border p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-red-500 flex items-center gap-2"><HardDrive className="w-5 h-5" /> OS Reinstallation</h2>
              <button onClick={() => setShowReinstall(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">Select a clean image to deploy. All existing data on the disk will be permanently erased.</p>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {osImages.map(os => (
                <button
                  key={os.id}
                  onClick={() => setSelectedOs(os.id)}
                  className={`border p-4 flex flex-col items-center gap-3 transition-colors ${selectedOs === os.id ? 'border-foreground bg-foreground/5' : 'border-border hover:border-muted-foreground'}`}
                >
                  <img src={os.icon} alt={os.name} className="w-10 h-10" />
                  <span className="text-xs font-medium text-center">{os.name}</span>
                </button>
              ))}
            </div>

            <div className="mb-6 space-y-4 border border-border p-4">
              <h3 className="text-sm font-medium">Authentication Method</h3>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={authMethod === 'password'} onChange={() => setAuthMethod('password')} className="accent-foreground" />
                  Generate Root Password
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={authMethod === 'ssh'} onChange={() => setAuthMethod('ssh')} className="accent-foreground" />
                  Inject SSH Key
                </label>
              </div>
              {authMethod === 'ssh' && (
                <select className="w-full bg-transparent border border-border p-2 text-sm outline-none">
                  <option>Customer Key: vaultscope-admin-key</option>
                  <option>Staff Key: admin-override-key</option>
                </select>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowReinstall(false)} className="px-4 py-2 text-sm border border-border hover:bg-foreground/5">Cancel</button>
              <button className="px-4 py-2 text-sm bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">Confirm Reinstall</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
