import { useState } from 'react';
import { Page } from '../components/Layout';
import { ArrowLeft, Terminal, ShieldAlert, Power, RefreshCw, HardDrive, Wifi, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const bwData = [
  { time: '10:00', in: 4.2, out: 8.4 },
  { time: '10:05', in: 3.8, out: 12.1 },
  { time: '10:10', in: 12.4, out: 45.2 },
  { time: '10:15', in: 18.2, out: 55.4 },
  { time: '10:20', in: 5.1, out: 14.2 },
  { time: '10:25', in: 2.1, out: 8.1 },
];

const osImages = [
  { id: 'ubuntu-24.04', name: 'Ubuntu 24.04 LTS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ubuntu/ubuntu-original.svg' },
  { id: 'debian-12', name: 'Debian 12', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/debian/debian-original.svg' },
  { id: 'almalinux-9', name: 'AlmaLinux 9', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/almalinux/almalinux-original.svg' },
  { id: 'rocky-9', name: 'Rocky Linux 9', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rockylinux/rockylinux-original.svg' },
];

export default function ServiceDetail() {
  const [showReinstall, setShowReinstall] = useState(false);
  const [selectedOs, setSelectedOs] = useState('ubuntu-24.04');
  const [authMethod, setAuthMethod] = useState<'password' | 'ssh'>('password');
  const [ptrEditing, setPtrEditing] = useState(false);
  const [ptrValue, setPtrValue] = useState('mail.vaultscope.de');

  return (
    <Page title="Instance Management">
      <div className="mb-6 flex justify-between items-center">
        <Link to="/services" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border border-border px-4 py-2 text-sm bg-foreground/5 hover:bg-foreground/10 transition-colors text-yellow-500 font-medium">
            <RefreshCw className="w-4 h-4" /> Soft Reboot
          </button>
          <button className="flex items-center gap-2 border border-border px-4 py-2 text-sm hover:bg-red-500/10 transition-colors text-red-500 font-medium">
            <Power className="w-4 h-4" /> Hard Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 font-medium flex justify-between items-center">
            <span>Instance vs_vps_8f39a1</span>
            <span className="flex items-center gap-2 text-xs text-green-500"><div className="w-2 h-2 rounded-full bg-green-500" /> Running</span>
          </div>
          <div className="p-6 grid grid-cols-2 gap-y-6">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Customer</div>
              <div className="font-medium">Vault Scope (acc_09f3b19a)</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Retail Plan</div>
              <div className="font-medium">VaultScope VPS Pro</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Upstream Target</div>
              <div className="font-mono text-sm">Hetzner CX31 (fsn1-dc14)</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Creation Date</div>
              <div className="text-sm">12 Aug 2026 14:22 UTC</div>
            </div>
          </div>
        </div>

        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 font-medium flex items-center gap-2">
            <Wifi className="w-4 h-4" /> Network (IPAM)
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Primary IPv4</div>
              <div className="font-mono text-sm flex justify-between items-center">
                198.51.100.42
                {ptrEditing ? (
                  <div className="flex gap-2">
                    <input type="text" value={ptrValue} onChange={e => setPtrValue(e.target.value)} className="bg-transparent border border-border px-1 text-xs" />
                    <button onClick={() => setPtrEditing(false)} className="text-xs text-green-500">Save</button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground text-xs">{ptrValue}</span>
                    <button onClick={() => setPtrEditing(true)} className="text-xs text-muted-foreground underline hover:text-foreground">Edit PTR</button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">IPv6 Subnet</div>
              <div className="font-mono text-sm">2001:db8:85a3::/64</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">MAC Address</div>
              <div className="font-mono text-sm">00:1A:2B:3C:4D:5E</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-6">Live Bandwidth Usage (Hetzner API)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bwData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} Mb/s`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="out" stroke="#3b82f6" strokeWidth={2} fillOpacity={0.2} fill="#3b82f6" name="Outbound" />
                <Area type="monotone" dataKey="in" stroke="#22c55e" strokeWidth={2} fillOpacity={0.2} fill="#22c55e" name="Inbound" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border p-5 bg-background flex flex-col gap-4">
           <h3 className="text-sm font-medium mb-2">Destructive Actions</h3>
           <p className="text-xs text-muted-foreground mb-4">These actions interface directly with the upstream provider and will cause downtime or data loss for the customer.</p>
           
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
            
            <p className="text-sm text-muted-foreground mb-6">Select a clean image to deploy. All existing data on the disk will be permanently erased. This action cannot be undone.</p>
            
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
