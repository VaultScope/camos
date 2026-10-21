import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout';
import {
  Plus, X, Server, Edit2, EyeOff, BarChart2, TrendingUp, Clock, Trash2,
  Database, Cpu, Sparkles, Sliders, ChevronDown, ChevronUp, AlertCircle, HardDrive
} from 'lucide-react';
import { api } from '../lib/api';
import { useApi } from '../lib/hooks';
import { useToast } from '../components/Toast';
import { HelpTooltip } from '../components/HelpTooltip';
import type { Product } from '../lib/types';

// ==========================================
// Preset Definitions & Specifications Helpers
// ==========================================

export interface PlanPreset {
  id: string;
  name: string;
  target: string;
  category: string;
  cost: number;
  price: number;
  specs: Record<string, string>;
}

export const HETZNER_CLOUD_PRESETS: PlanPreset[] = [
  {
    id: 'cx22',
    name: 'VaultScope Cloud CX22',
    target: 'cx22',
    category: 'VPS',
    cost: 3.29,
    price: 4.99,
    specs: {
      server_type: '2 vCPU',
      cpu: '2 vCPU (Intel Xeon)',
      ram: '4 GB RAM',
      disk: '40 GB NVMe',
      traffic: '20 TB Included',
      location: 'fsn1 (Falkenstein, DE)',
      uplink: '1 Gbps',
      ip: 'Dedicated IPv4 & /64 IPv6',
    },
  },
  {
    id: 'cpx21',
    name: 'VaultScope Cloud CPX21',
    target: 'cpx21',
    category: 'VPS',
    cost: 6.49,
    price: 9.99,
    specs: {
      server_type: '3 vCPU',
      cpu: '3 vCPU (AMD EPYC)',
      ram: '4 GB RAM',
      disk: '80 GB NVMe',
      traffic: '20 TB Included',
      location: 'fsn1 (Falkenstein, DE)',
      uplink: '1 Gbps',
      ip: 'Dedicated IPv4 & /64 IPv6',
    },
  },
  {
    id: 'cx32',
    name: 'VaultScope Cloud CX32',
    target: 'cx32',
    category: 'VPS',
    cost: 6.49,
    price: 9.99,
    specs: {
      server_type: '4 vCPU',
      cpu: '4 vCPU (Intel Xeon)',
      ram: '8 GB RAM',
      disk: '80 GB NVMe',
      traffic: '20 TB Included',
      location: 'nbg1 (Nuremberg, DE)',
      uplink: '1 Gbps',
      ip: 'Dedicated IPv4 & /64 IPv6',
    },
  },
  {
    id: 'cpx31',
    name: 'VaultScope Cloud CPX31',
    target: 'cpx31',
    category: 'VPS',
    cost: 12.49,
    price: 18.99,
    specs: {
      server_type: '4 vCPU',
      cpu: '4 vCPU (AMD EPYC)',
      ram: '8 GB RAM',
      disk: '160 GB NVMe',
      traffic: '20 TB Included',
      location: 'fsn1 (Falkenstein, DE)',
      uplink: '1 Gbps',
      ip: 'Dedicated IPv4 & /64 IPv6',
    },
  },
  {
    id: 'cx42',
    name: 'VaultScope Cloud CX42',
    target: 'cx42',
    category: 'VPS',
    cost: 14.90,
    price: 22.99,
    specs: {
      server_type: '8 vCPU',
      cpu: '8 vCPU (Intel Xeon)',
      ram: '16 GB RAM',
      disk: '160 GB NVMe',
      traffic: '20 TB Included',
      location: 'hel1 (Helsinki, FI)',
      uplink: '1 Gbps',
      ip: 'Dedicated IPv4 & /64 IPv6',
    },
  },
  {
    id: 'cpx41',
    name: 'VaultScope Cloud CPX41',
    target: 'cpx41',
    category: 'VPS',
    cost: 24.90,
    price: 36.99,
    specs: {
      server_type: '8 vCPU',
      cpu: '8 vCPU (AMD EPYC)',
      ram: '16 GB RAM',
      disk: '240 GB NVMe',
      traffic: '20 TB Included',
      location: 'fsn1 (Falkenstein, DE)',
      uplink: '1 Gbps',
      ip: 'Dedicated IPv4 & /64 IPv6',
    },
  },
  {
    id: 'cax11',
    name: 'VaultScope Cloud CAX11 (ARM)',
    target: 'cax11',
    category: 'VPS',
    cost: 3.79,
    price: 5.49,
    specs: {
      server_type: '2 vCPU',
      cpu: '2 vCPU (Ampere Altra ARM)',
      ram: '4 GB RAM',
      disk: '40 GB NVMe',
      traffic: '20 TB Included',
      location: 'fsn1 (Falkenstein, DE)',
      uplink: '1 Gbps',
      ip: 'Dedicated IPv4 & /64 IPv6',
    },
  },
];

export const SFTP_STORAGE_PRESETS: PlanPreset[] = [
  {
    id: 'sftp-100',
    name: 'SFTP Vault Starter (100 GB)',
    target: 'sftp-100',
    category: 'Storage',
    cost: 1.99,
    price: 3.49,
    specs: {
      storage_gb: '100',
      storage: '100 GB NVMe Storage',
      protocols: 'SFTP, SCP, FTPS, WebDAV',
      traffic: 'Unmetered / Fair Use',
      snapshots: 'Daily Included',
      connections: 'Unlimited',
      location: 'Frankfurt, DE',
    },
  },
  {
    id: 'sftp-250',
    name: 'SFTP Vault Standard (250 GB)',
    target: 'sftp-250',
    category: 'Storage',
    cost: 3.99,
    price: 6.99,
    specs: {
      storage_gb: '250',
      storage: '250 GB NVMe Storage',
      protocols: 'SFTP, SCP, FTPS, WebDAV',
      traffic: 'Unmetered / Fair Use',
      snapshots: 'Daily Included',
      connections: 'Unlimited',
      location: 'Frankfurt, DE',
    },
  },
  {
    id: 'sftp-500',
    name: 'SFTP Vault Pro (500 GB)',
    target: 'sftp-500',
    category: 'Storage',
    cost: 6.99,
    price: 11.99,
    specs: {
      storage_gb: '500',
      storage: '500 GB NVMe Storage',
      protocols: 'SFTP, SCP, FTPS, WebDAV',
      traffic: 'Unmetered / Fair Use',
      snapshots: 'Daily Included',
      connections: 'Unlimited',
      location: 'Frankfurt, DE',
    },
  },
  {
    id: 'sftp-1000',
    name: 'SFTP Vault Enterprise (1 TB)',
    target: 'sftp-1000',
    category: 'Storage',
    cost: 11.99,
    price: 19.99,
    specs: {
      storage_gb: '1000',
      storage: '1000 GB (1 TB) NVMe Storage',
      protocols: 'SFTP, SCP, FTPS, WebDAV',
      traffic: 'Unmetered / Fair Use',
      snapshots: 'Daily Included',
      connections: 'Unlimited',
      location: 'Frankfurt, DE',
    },
  },
  {
    id: 'sftp-5000',
    name: 'SFTP Vault Massive (5 TB)',
    target: 'sftp-5000',
    category: 'Storage',
    cost: 44.99,
    price: 69.99,
    specs: {
      storage_gb: '5000',
      storage: '5000 GB (5 TB) NVMe Storage',
      protocols: 'SFTP, SCP, FTPS, WebDAV',
      traffic: 'Unmetered / Fair Use',
      snapshots: 'Daily Included',
      connections: 'Unlimited',
      location: 'Frankfurt, DE',
    },
  },
];

export const DEDICATED_PRESETS: PlanPreset[] = [
  {
    id: 'ex44',
    name: 'Dedicated EX-44',
    target: 'ex44',
    category: 'Dedicated Servers',
    cost: 44.00,
    price: 59.00,
    specs: {
      server_type: 'Intel Core i5-13500',
      cpu: 'Intel Core i5-13500 (14 Cores / 20 Threads)',
      ram: '64 GB DDR4 RAM',
      disk: '2x 512 GB NVMe SSD (Software RAID 1)',
      uplink: '1 Gbps Guaranteed',
      traffic: 'Unlimited / Unmetered',
      ipmi: 'KVM over IP (on request)',
      location: 'fsn1 (Falkenstein, DE)',
    },
  },
  {
    id: 'ax52',
    name: 'Dedicated AX-52',
    target: 'ax52',
    category: 'Dedicated Servers',
    cost: 59.00,
    price: 79.00,
    specs: {
      server_type: 'AMD Ryzen 7 7700',
      cpu: 'AMD Ryzen 7 7700 (8 Cores / 16 Threads)',
      ram: '64 GB DDR5 ECC RAM',
      disk: '2x 1 TB NVMe SSD (Gen4)',
      uplink: '1 Gbps Guaranteed',
      traffic: 'Unlimited / Unmetered',
      ipmi: 'KVM over IP (on request)',
      location: 'fsn1 (Falkenstein, DE)',
    },
  },
  {
    id: 'ax102',
    name: 'Dedicated AX-102 High-End',
    target: 'ax102',
    category: 'Dedicated Servers',
    cost: 104.00,
    price: 139.00,
    specs: {
      server_type: 'AMD Ryzen 9 7950X3D',
      cpu: 'AMD Ryzen 9 7950X3D (16 Cores / 32 Threads)',
      ram: '128 GB DDR5 ECC RAM',
      disk: '2x 1.92 TB NVMe Datacenter Edition',
      uplink: '1 Gbps Guaranteed',
      traffic: 'Unlimited / Unmetered',
      ipmi: 'KVM over IP (on request)',
      location: 'nbg1 (Nuremberg, DE)',
    },
  },
  {
    id: 'rs-32',
    name: 'Dedicated RS-32 (ReliableSite)',
    target: 'rs-32',
    category: 'Dedicated Servers',
    cost: 49.00,
    price: 65.00,
    specs: {
      server_type: 'AMD Ryzen 5 3600',
      cpu: 'AMD Ryzen 5 3600 (6 Cores / 12 Threads)',
      ram: '32 GB DDR4 RAM',
      disk: '512 GB NVMe SSD',
      uplink: '1 Gbps Unmetered',
      traffic: 'Unmetered (1 Gbps)',
      ipmi: 'IPMI / KVM Included',
      location: 'Miami, FL (US-East)',
    },
  },
  {
    id: 'rs-64',
    name: 'Dedicated RS-64 (ReliableSite)',
    target: 'rs-64',
    category: 'Dedicated Servers',
    cost: 79.00,
    price: 99.00,
    specs: {
      server_type: 'AMD Ryzen 7 5800X',
      cpu: 'AMD Ryzen 7 5800X (8 Cores / 16 Threads)',
      ram: '64 GB DDR4 RAM',
      disk: '1 TB NVMe SSD',
      uplink: '1 Gbps Unmetered',
      traffic: 'Unmetered (1 Gbps)',
      ipmi: 'IPMI / KVM Included',
      location: 'NYC Metro, NY (US-East)',
    },
  },
];

function normalizeSpecs(raw: any): Record<string, string> {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (val === null || val === undefined) continue;
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      result[key] = String(val);
    } else if (typeof val === 'object') {
      const v = val as any;
      if (key === 'cores' && v.num !== undefined) {
        result['cpu'] = `${v.num} Cores${v.shared ? ' (shared)' : ''}`;
        if (!result['server_type']) result['server_type'] = `${v.num} vCPU`;
      } else if (key === 'ram' && v.num !== undefined) {
        result['ram'] = `${v.num} ${v.unit || 'GB'}`;
      } else if (key === 'storage' && v.num !== undefined) {
        result['disk'] = `${v.num} ${v.unit || 'GB'} ${v.type || 'NVMe'}`.trim();
        result['storage_gb'] = String(v.num);
      } else if (key === 'uplink' && v.num !== undefined) {
        result['uplink'] = `${v.num} ${v.unit || 'Gbps'}`;
      } else if (key === 'bandwidth' && v.num !== undefined) {
        result['traffic'] = `${v.num} ${v.unit || 'TB'}`;
      } else {
        result[key] = Object.entries(v).map(([subK, subV]) => `${subK}: ${subV}`).join(', ');
      }
    }
  }
  return result;
}

function getPresetsForProvider(provider: string, category: string): PlanPreset[] {
  const p = (provider || '').toLowerCase();
  const c = (category || '').toLowerCase();
  if (p === 'sftpgo' || c.includes('storage')) return SFTP_STORAGE_PRESETS;
  if (p === 'reliablesite' || p === 'hetzner_robot' || p === 'ovh' || c.includes('dedicated')) return DEDICATED_PRESETS;
  if (p === 'hetzner_cloud' || c.includes('vps')) return HETZNER_CLOUD_PRESETS;
  return [...HETZNER_CLOUD_PRESETS, ...SFTP_STORAGE_PRESETS, ...DEDICATED_PRESETS];
}

// ==========================================
// Provider-Tailored Specs Editor Component
// ==========================================

interface ProviderSpecsEditorProps {
  provider: string;
  category: string;
  specs: Record<string, string>;
  onChange: (specs: Record<string, string>) => void;
}

function ProviderSpecsEditor({ provider, category, specs, onChange }: ProviderSpecsEditorProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [customVal, setCustomVal] = useState('');

  const p = (provider || '').toLowerCase();
  const c = (category || '').toLowerCase();

  const isStorage = p === 'sftpgo' || c.includes('storage');
  const isDedicated = p === 'reliablesite' || p === 'hetzner_robot' || p === 'ovh' || c.includes('dedicated');
  const isVps = !isStorage && !isDedicated && (p === 'hetzner_cloud' || c.includes('vps') || p === 'proxmox');
  const isCustomMode = !isStorage && !isDedicated && !isVps;

  const updateSpec = (key: string, value: string) => {
    const next: Record<string, string> = { ...specs };
    if (value === '') {
      delete next[key];
    } else {
      next[key] = value;
    }
    onChange(next);
  };

  const handleAddCustom = () => {
    if (!customKey.trim()) return;
    const cleanKey = customKey.trim().toLowerCase().replace(/\s+/g, '_');
    updateSpec(cleanKey, customVal.trim());
    setCustomKey('');
    setCustomVal('');
  };

  const handleDeleteSpec = (key: string) => {
    const next: Record<string, string> = { ...specs };
    delete next[key];
    onChange(next);
  };

  // Define keys handled by the tailored UI sections
  const tailoredKeys = isStorage
    ? ['storage_gb', 'storage', 'protocols', 'traffic', 'snapshots', 'connections', 'location']
    : isDedicated
    ? ['cpu', 'server_type', 'ram', 'disk', 'uplink', 'traffic', 'ipmi', 'location']
    : isVps
    ? ['cpu', 'server_type', 'ram', 'disk', 'traffic', 'uplink', 'ip', 'location']
    : [];

  const extraKeys = Object.keys(specs).filter(k => !tailoredKeys.includes(k));

  return (
    <div className="space-y-5">
      {/* Provider Badge Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          {isStorage && <Database className="w-4 h-4 text-cyan-500" />}
          {isVps && <Cpu className="w-4 h-4 text-purple-500" />}
          {isDedicated && <Server className="w-4 h-4 text-amber-500" />}
          {isCustomMode && <Sliders className="w-4 h-4 text-muted-foreground" />}
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isStorage && 'SFTP Storage Vault Specifications'}
            {isVps && 'Cloud VPS Compute Specifications'}
            {isDedicated && 'Bare-Metal Dedicated Server Specifications'}
            {isCustomMode && 'Custom Specifications Editor'}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {isStorage ? 'Storage Quota, Protocols & Backups' : isVps ? 'vCPU, RAM, NVMe & Traffic' : isDedicated ? 'Bare-Metal CPU, ECC RAM & Disks' : 'Flexible Key-Value Pairs'}
        </span>
      </div>

      {/* STORAGE MODE FIELDS (SFTPGo) */}
      {isStorage && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Storage Quota (GB)
              </label>
              <input
                type="number"
                min="1"
                value={specs.storage_gb || ''}
                onChange={e => {
                  const val = e.target.value;
                  const next: Record<string, string> = { ...specs };
                  if (!val) {
                    delete next['storage_gb'];
                  } else {
                    next['storage_gb'] = val;
                    if (!next['storage'] || next['storage'].includes('Storage')) {
                      next['storage'] = `${val} GB NVMe Storage`;
                    }
                  }
                  onChange(next);
                }}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="e.g. 250"
              />
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Numeric quota passed to SFTPGo quota manager</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Storage Display Title
              </label>
              <input
                type="text"
                value={specs.storage || ''}
                onChange={e => updateSpec('storage', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="e.g. 250 GB NVMe Storage"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Supported Protocols
              </label>
              <input
                type="text"
                value={specs.protocols || 'SFTP, SCP, FTPS, WebDAV'}
                onChange={e => updateSpec('protocols', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="SFTP, SCP, FTPS, WebDAV"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Included Bandwidth / Traffic
              </label>
              <input
                type="text"
                value={specs.traffic || 'Unmetered / Fair Use'}
                onChange={e => updateSpec('traffic', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="Unmetered / Fair Use"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Snapshots & Backups
              </label>
              <input
                type="text"
                value={specs.snapshots || 'Daily Included'}
                onChange={e => updateSpec('snapshots', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="Daily Included (ZFS Snapshot)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Datacenter Location
              </label>
              <input
                type="text"
                value={specs.location || 'Frankfurt, DE'}
                onChange={e => updateSpec('location', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="Frankfurt, DE"
              />
            </div>
          </div>
        </div>
      )}

      {/* VPS / CLOUD MODE FIELDS (Hetzner Cloud) */}
      {isVps && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                vCPU / Cores
              </label>
              <input
                type="text"
                value={specs.cpu || specs.server_type || ''}
                onChange={e => {
                  const next: Record<string, string> = { ...specs };
                  if (!e.target.value) {
                    delete next['cpu'];
                    delete next['server_type'];
                  } else {
                    next['cpu'] = e.target.value;
                    next['server_type'] = e.target.value;
                  }
                  onChange(next);
                }}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="e.g. 3 vCPU (AMD EPYC)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                RAM / Memory
              </label>
              <input
                type="text"
                value={specs.ram || ''}
                onChange={e => updateSpec('ram', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="e.g. 4 GB RAM"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Disk / NVMe Storage
              </label>
              <input
                type="text"
                value={specs.disk || ''}
                onChange={e => updateSpec('disk', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="e.g. 80 GB NVMe"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Included Bandwidth
              </label>
              <input
                type="text"
                value={specs.traffic || '20 TB Included'}
                onChange={e => updateSpec('traffic', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="e.g. 20 TB Included"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Port Speed / Uplink
              </label>
              <input
                type="text"
                value={specs.uplink || '1 Gbps'}
                onChange={e => updateSpec('uplink', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="e.g. 1 Gbps"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Datacenter Location
              </label>
              <input
                type="text"
                value={specs.location || 'fsn1 (Falkenstein, DE)'}
                onChange={e => updateSpec('location', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="fsn1 (Falkenstein, DE)"
              />
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED SERVERS MODE FIELDS (ReliableSite, Hetzner Robot, OVH) */}
      {isDedicated && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                CPU / Processor Model
              </label>
              <input
                type="text"
                value={specs.cpu || specs.server_type || ''}
                onChange={e => {
                  const next: Record<string, string> = { ...specs };
                  if (!e.target.value) {
                    delete next['cpu'];
                    delete next['server_type'];
                  } else {
                    next['cpu'] = e.target.value;
                    next['server_type'] = e.target.value;
                  }
                  onChange(next);
                }}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="e.g. AMD Ryzen 7 7700 (8C / 16T)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                RAM / Memory
              </label>
              <input
                type="text"
                value={specs.ram || ''}
                onChange={e => updateSpec('ram', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="e.g. 64 GB DDR5 ECC"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Disks & RAID Storage
              </label>
              <input
                type="text"
                value={specs.disk || ''}
                onChange={e => updateSpec('disk', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="e.g. 2x 1 TB NVMe SSD (Software RAID 1)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Uplink / Port Speed
              </label>
              <input
                type="text"
                value={specs.uplink || '1 Gbps Guaranteed'}
                onChange={e => updateSpec('uplink', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="e.g. 1 Gbps Guaranteed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Monthly Traffic / Bandwidth
              </label>
              <input
                type="text"
                value={specs.traffic || 'Unlimited / Unmetered'}
                onChange={e => updateSpec('traffic', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="e.g. Unlimited / Unmetered"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                Remote Management / IPMI
              </label>
              <input
                type="text"
                value={specs.ipmi || 'KVM over IP (on request)'}
                onChange={e => updateSpec('ipmi', e.target.value)}
                className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                placeholder="e.g. IPMI / KVM over IP Included"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
              Datacenter Location
            </label>
            <input
              type="text"
              value={specs.location || ''}
              onChange={e => updateSpec('location', e.target.value)}
              className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
              placeholder="e.g. Falkenstein, DE or Miami, FL"
            />
          </div>
        </div>
      )}

      {/* CUSTOM MODE QUICK PRESETS CHIPS */}
      {isCustomMode && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Quickly add standard specification rows:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '+ vCPU', k: 'cpu', v: '2 vCPU' },
              { label: '+ RAM', k: 'ram', v: '4 GB' },
              { label: '+ Disk', k: 'disk', v: '50 GB SSD' },
              { label: '+ Quota', k: 'storage_gb', v: '100' },
              { label: '+ Bandwidth', k: 'traffic', v: 'Unmetered' },
              { label: '+ Location', k: 'location', v: 'Frankfurt, DE' },
              { label: '+ Slots', k: 'slots', v: '32 Player Slots' },
            ].map(item => (
              <button
                key={item.k}
                type="button"
                onClick={() => {
                  if (!specs[item.k]) updateSpec(item.k, item.v);
                }}
                className="text-xs px-2.5 py-1 border border-border bg-foreground/[0.03] hover:bg-foreground/10 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ADDITIONAL & CUSTOM SPECIFICATIONS TABLE */}
      <div className="pt-2 border-t border-border">
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground py-1"
        >
          <span>
            {isCustomMode ? 'Active Specifications' : `Custom / Additional Specifications (${extraKeys.length})`}
          </span>
          {showCustom || isCustomMode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {(showCustom || isCustomMode) && (
          <div className="mt-3 space-y-3 bg-foreground/[0.02] border border-border p-3">
            {extraKeys.length > 0 && (
              <div className="space-y-2">
                {extraKeys.map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-1/3 text-xs font-mono text-muted-foreground truncate capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <input
                      type="text"
                      value={specs[key]}
                      onChange={e => updateSpec(key, e.target.value)}
                      className="flex-1 border border-border bg-background p-1.5 text-xs focus:outline-none focus:border-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSpec(key)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Remove Spec"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Custom Row */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <input
                type="text"
                placeholder="Spec Key (e.g. ddos_protection)"
                value={customKey}
                onChange={e => setCustomKey(e.target.value)}
                className="w-1/3 border border-border bg-background p-1.5 text-xs font-mono focus:outline-none focus:border-foreground"
              />
              <input
                type="text"
                placeholder="Spec Value (e.g. 2.4 Tbps Arbor Filtering)"
                value={customVal}
                onChange={e => setCustomVal(e.target.value)}
                className="flex-1 border border-border bg-background p-1.5 text-xs focus:outline-none focus:border-foreground"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustom}
                disabled={!customKey.trim()}
                className="px-3 py-1.5 text-xs bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Form Data Types & Normalization
// ==========================================

interface ProductFormData {
  name: string;
  category: string;
  specs: Record<string, string>;
  provider: string;
  target: string;
  cost: number;
  price: number;
  stock: number;
  userLimit: number;
  hidden: boolean;
  billingCycle: string;
  setupFee: number;
  serviceFormId: string;
  trialDays: number;
  trialQuotaGb?: number | null;
  quotaGb?: number | null;
}

function toFormData(p: Product): ProductFormData {
  return {
    name: p.name,
    category: p.category,
    specs: normalizeSpecs(p.specs),
    provider: p.provider,
    target: p.target,
    cost: parseFloat(p.cost) || 0,
    price: parseFloat(p.price) || 0,
    stock: p.stock ?? -1,
    userLimit: p.user_limit ?? 0,
    hidden: p.hidden ?? false,
    billingCycle: p.billing_cycle === 'one_time' ? 'One-Time' : p.billing_cycle.charAt(0).toUpperCase() + p.billing_cycle.slice(1),
    setupFee: parseFloat(p.setup_fee) || 0,
    serviceFormId: p.service_form_id || '',
    trialDays: p.trial_days || 0,
    trialQuotaGb: p.trial_quota_gb ?? null,
    quotaGb: p.quota_gb ?? null,
  };
}

function toApiPayload(p: ProductFormData) {
  return {
    name: p.name,
    category: p.category,
    provider: p.provider,
    target: p.target,
    specs: p.specs,
    cost: p.cost,
    price: p.price,
    setup_fee: p.setupFee,
    billing_cycle: p.billingCycle.toLowerCase().replace('-', '_'),
    trial_days: p.trialDays > 0 ? p.trialDays : null,
    trial_quota_gb: p.trialDays > 0 && p.trialQuotaGb && p.trialQuotaGb > 0 ? p.trialQuotaGb : null,
    quota_gb: p.quotaGb && p.quotaGb > 0 ? p.quotaGb : null,
    service_form_id: p.serviceFormId || null,
    hidden: p.hidden,
  };
}

// ==========================================
// Product Insights Component
// ==========================================

function ProductsInsights() {
  const { data: products } = useApi<Product[]>('/admin/products');
  const items = products || [];

  return (
    <Page title="Product Insights">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" /> Total Products
          </h3>
          <div className="text-2xl font-light">{items.length}</div>
          <div className="text-sm text-muted-foreground mt-2">{items.filter(p => !p.hidden).length} visible on storefront</div>
        </div>
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" /> Highest Margin
          </h3>
          {items.length > 0 ? (
            <>
              <div className="text-2xl font-light">
                {items.sort((a, b) => (parseFloat(b.price) - parseFloat(b.cost)) - (parseFloat(a.price) - parseFloat(a.cost)))[0]?.name}
              </div>
              <div className="text-sm text-green-500 mt-2">
                €{(parseFloat(items[0]?.price || '0') - parseFloat(items[0]?.cost || '0')).toFixed(2)} / mo profit
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No products yet</div>
          )}
        </div>
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" /> Categories
          </h3>
          <div className="text-2xl font-light">{new Set(items.map(p => p.category)).size}</div>
          <div className="text-sm text-muted-foreground mt-2">unique categories</div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="border border-border p-5 bg-background">
          <h3 className="text-sm font-medium mb-6 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-muted-foreground" /> Margin Distribution
          </h3>
          <div className="space-y-4">
            {items.slice(0, 5).map(p => {
              const margin = parseFloat(p.price) - parseFloat(p.cost);
              const maxMargin = Math.max(...items.map(x => parseFloat(x.price) - parseFloat(x.cost)));
              const pct = maxMargin > 0 ? (margin / maxMargin) * 100 : 0;
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{p.name}</span>
                    <span className="font-mono text-green-500">€{margin.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-foreground/10 h-2">
                    <div className="bg-foreground h-2" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Page>
  );
}

// ==========================================
// New Retail Plan Flow (Provider-Tailored)
// ==========================================

function ProductsNew() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: serviceForms } = useApi<any[]>('/admin/service-forms');
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [newPlan, setNewPlan] = useState<ProductFormData>({
    name: '',
    category: 'VPS',
    specs: {
      server_type: '2 vCPU',
      cpu: '2 vCPU (Intel Xeon)',
      ram: '4 GB RAM',
      disk: '40 GB NVMe',
      traffic: '20 TB Included',
      location: 'fsn1 (Falkenstein, DE)',
      uplink: '1 Gbps',
      ip: 'Dedicated IPv4 & /64 IPv6',
    },
    provider: 'hetzner_cloud',
    target: '',
    cost: 0,
    price: 0,
    stock: -1,
    userLimit: 0,
    hidden: false,
    billingCycle: 'Monthly',
    setupFee: 0,
    serviceFormId: '',
    trialDays: 0,
    trialQuotaGb: null,
    quotaGb: null,
  });

  const steps = ['Basics', 'Specifications', 'Pricing', 'Review'];

  const availablePresets = getPresetsForProvider(newPlan.provider, newPlan.category);

  const applyPreset = (presetId: string) => {
    const preset = availablePresets.find(p => p.id === presetId);
    if (!preset) return;
    setNewPlan({
      ...newPlan,
      name: preset.name,
      category: preset.category,
      target: preset.target,
      cost: preset.cost,
      price: preset.price,
      specs: { ...preset.specs },
    });
    toast.success(`Loaded preset: ${preset.name}`);
  };

  const handleProviderChange = (newProvider: string) => {
    let nextCategory = newPlan.category;
    let nextSpecs = { ...newPlan.specs };

    if (newProvider === 'sftpgo') {
      nextCategory = 'Storage';
      if (!nextSpecs.storage_gb) {
        nextSpecs = { ...SFTP_STORAGE_PRESETS[1].specs };
      }
    } else if (newProvider === 'hetzner_cloud') {
      nextCategory = 'VPS';
      if (!nextSpecs.cpu) {
        nextSpecs = { ...HETZNER_CLOUD_PRESETS[0].specs };
      }
    } else if (['reliablesite', 'hetzner_robot', 'ovh'].includes(newProvider)) {
      nextCategory = 'Dedicated Servers';
      if (!nextSpecs.cpu) {
        nextSpecs = { ...DEDICATED_PRESETS[1].specs };
      }
    }

    setNewPlan({
      ...newPlan,
      provider: newProvider,
      category: nextCategory,
      specs: nextSpecs,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/products', toApiPayload(newPlan));
      toast.success(`Retail plan "${newPlan.name}" published successfully!`);
      navigate('/products');
    } catch (e: any) {
      toast.error(e.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const canAdvance = () => {
    if (step === 0) return newPlan.name.trim() !== '' && newPlan.target.trim() !== '';
    return true;
  };

  return (
    <Page title="Add New Retail Plan">
      <div className="bg-background border border-border w-full max-w-2xl">
        {/* Step Indicator Header */}
        <div className="flex border-b border-border">
          {steps.map((label, i) => (
            <button
              key={label}
              onClick={() => i < step && setStep(i)}
              className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
                i === step ? 'bg-foreground text-background' :
                i < step ? 'text-foreground cursor-pointer hover:bg-foreground/5' :
                'text-muted-foreground'
              }`}
            >
              <span className="mr-1.5">{i < step ? '✓' : i + 1}.</span>{label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* STEP 0: BASICS */}
          {step === 0 && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Name your plan and connect it to an upstream provider connector.
              </p>

              {/* Quick Preset Selector */}
              {availablePresets.length > 0 && (
                <div className="bg-foreground/[0.02] border border-border p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Quick Preset Template
                    </span>
                    <span className="text-[11px] text-muted-foreground">Auto-populates SKU, specs & pricing</span>
                  </div>
                  <select
                    onChange={e => {
                      if (e.target.value) applyPreset(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full border border-border bg-background p-2 text-sm focus:outline-none focus:border-foreground"
                  >
                    <option value="" disabled>-- Select a template preset or configure manually --</option>
                    {availablePresets.map(preset => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name} ({preset.target}) — Cost: €{preset.cost.toFixed(2)}, Retail: €{preset.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Plan Name</label>
                  <HelpTooltip
                    title="Public Product Title"
                    content="The commercial name displayed on the storefront pricing page, customer invoices, and order receipts."
                    example="VaultScope VPS Pro, Dedicated EX-44, SFTP Vault Standard (250 GB)"
                  />
                </div>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground"
                  placeholder="e.g. VaultScope VPS Pro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Provider</label>
                    <HelpTooltip
                      title="Provisioning Engine"
                      badge="API Connector"
                      content="Specifies which upstream provider connector will receive automated provisioning, power control, and cancellation tasks."
                    />
                  </div>
                  <select
                    value={newPlan.provider}
                    onChange={e => handleProviderChange(e.target.value)}
                    className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground"
                  >
                    <option value="hetzner_cloud">Hetzner Cloud (VPS)</option>
                    <option value="sftpgo">SFTPGo (Cloud Storage)</option>
                    <option value="reliablesite">ReliableSite (Dedicated)</option>
                    <option value="hetzner_robot">Hetzner Robot (Dedicated)</option>
                    <option value="ovh">OVH BareMetal</option>
                    <option value="pterodactyl">Pterodactyl</option>
                    <option value="proxmox">Proxmox VE</option>
                    <option value="Custom">Custom / Manual</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Category</label>
                    <HelpTooltip
                      title="Storefront Category"
                      content="Determines the storefront catalog tab and management dashboard layout for the provisioned service."
                    />
                  </div>
                  <select
                    value={newPlan.category}
                    onChange={e => setNewPlan({ ...newPlan, category: e.target.value })}
                    className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground"
                  >
                    <option value="VPS">VPS</option>
                    <option value="Storage">Storage / SFTP</option>
                    <option value="Dedicated Servers">Dedicated Servers</option>
                    <option value="One Click Deploy">One Click Deploy</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase">API Target SKU</label>
                  <HelpTooltip
                    title="Upstream Server / Plan SKU"
                    badge="Provider Identifier"
                    content="The exact plan identifier passed into the provider API. For Hetzner Cloud: 'cx22', 'cpx21'. For SFTPGo: 'sftp-250'. For ReliableSite: server ID or package SKU."
                    example="cx22, cpx31, sftp-250, ax52"
                  />
                </div>
                <input
                  type="text"
                  value={newPlan.target}
                  onChange={e => setNewPlan({ ...newPlan, target: e.target.value })}
                  className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono"
                  placeholder="e.g. cpx21 or sftp-250"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Checkout Configuration Form (CAMOS Service Form)</label>
                  <HelpTooltip
                    title="Custom Configuration Step"
                    content="Attach a custom CAMOS Service Form if customers should fill out custom configuration fields during checkout. Leave as 'None' for instant turn-key services like SFTP."
                  />
                </div>
                <select
                  value={newPlan.serviceFormId}
                  onChange={e => setNewPlan({ ...newPlan, serviceFormId: e.target.value })}
                  className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground"
                >
                  <option value="">None (No configuration step required)</option>
                  {(serviceForms || []).map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({Array.isArray(f.fields) ? f.fields.length : 0} fields)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 1: SPECIFICATIONS (PROVIDER-TAILORED) */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Define the customer-facing specifications for this{' '}
                <span className="text-foreground font-medium">{newPlan.provider}</span> plan.
              </p>
              <ProviderSpecsEditor
                provider={newPlan.provider}
                category={newPlan.category}
                specs={newPlan.specs}
                onChange={nextSpecs => setNewPlan({ ...newPlan, specs: nextSpecs })}
              />
            </div>
          )}

          {/* STEP 2: PRICING */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">Set your pricing, margins, and availability.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Wholesale Cost</label>
                    <HelpTooltip
                      title="Wholesale Provider Cost"
                      content="The raw cost you incur from the upstream provider (Hetzner, SFTPGo server, ReliableSite, etc.) per month before markup."
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={newPlan.cost || ''}
                      onChange={e => setNewPlan({ ...newPlan, cost: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-border bg-transparent p-2.5 pl-7 text-sm focus:outline-none focus:border-foreground"
                      placeholder="6.49"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Retail Price</label>
                    <HelpTooltip
                      title="Customer Retail Price"
                      badge="Net Amount"
                      content="The price charged to retail customers before 19% VAT. Storefront displays this with +19% VAT included for B2C clients."
                      example="€10.00 net -> €11.90 incl. 19% VAT"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={newPlan.price || ''}
                      onChange={e => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-border bg-transparent p-2.5 pl-7 text-sm focus:outline-none focus:border-foreground"
                      placeholder="9.99"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Regular monthly renewal price billed <em>after</em> any trial. The trial period will automatically make the initial period €0.00.
                  </span>
                </div>
              </div>

              {newPlan.price <= 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs p-3 rounded flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Notice: Retail Price is €0.00.</span>
                    <p className="mt-0.5 text-amber-500/90">
                      Customers will renew at <strong>€0.00 / month</strong> forever. If this product has a free trial and should convert into a paid subscription afterwards, enter the regular monthly price above (e.g. €14.99).
                    </p>
                  </div>
                </div>
              )}

              {newPlan.cost > 0 && newPlan.price > 0 && (
                <div className="bg-foreground/5 border border-border p-3 text-sm flex items-center justify-between">
                  <div>
                    Margin: <span className="text-green-500 font-medium">€{(newPlan.price - newPlan.cost).toFixed(2)}</span>
                    <span className="text-muted-foreground ml-2">
                      ({Math.round(((newPlan.price - newPlan.cost) / newPlan.cost) * 100)}% markup)
                    </span>
                  </div>
                  <HelpTooltip
                    title="Profit Margin & Markup"
                    content="Gross monthly profit earned per active service instance after deducting raw cloud provider costs."
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Billing Cycle</label>
                    <HelpTooltip
                      title="Recurring Subscription Period"
                      content="Defines how often the billing engine generates renewal invoices: Monthly (every 30 days), Yearly (every 365 days), or One-Time."
                    />
                  </div>
                  <select
                    value={newPlan.billingCycle}
                    onChange={e => setNewPlan({ ...newPlan, billingCycle: e.target.value })}
                    className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="One-Time">One-Time</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Setup Fee</label>
                    <HelpTooltip
                      title="One-Time Provisioning Fee"
                      content="Non-recurring installation charge billed strictly on the initial invoice."
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={newPlan.setupFee || ''}
                      onChange={e => setNewPlan({ ...newPlan, setupFee: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-border bg-transparent p-2.5 pl-7 text-sm focus:outline-none focus:border-foreground"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Trial Period (Days)</label>
                    <HelpTooltip
                      title="Free Trial Duration"
                      content="Number of days the customer can use the service for free before automatic subscription renewal. Set to 0 or leave empty for no trial."
                      example="7 days, 14 days, 30 days"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={newPlan.trialDays || ''}
                      onChange={e => setNewPlan({ ...newPlan, trialDays: parseInt(e.target.value) || 0 })}
                      className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground"
                      placeholder="0 (No trial)"
                    />
                  </div>
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPlan.hidden}
                      onChange={e => setNewPlan({ ...newPlan, hidden: e.target.checked })}
                      className="accent-foreground w-4 h-4"
                    />
                    <span className="text-sm font-medium">Hide from Storefront</span>
                  </label>
                </div>
              </div>

              {/* Storage Quotas & Trial Allocation */}
              <div className="p-4 border border-cyan-500/20 bg-cyan-500/5 rounded space-y-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    {newPlan.trialDays > 0 ? 'Storage Quotas (GB)' : 'Plan Storage Quota (GB)'}
                  </span>
                </div>
                {newPlan.trialDays > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                        Trial Quota (GB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newPlan.trialQuotaGb ?? ''}
                        onChange={e => setNewPlan({ ...newPlan, trialQuotaGb: parseInt(e.target.value) || null })}
                        className="w-full border border-border bg-background p-2 text-sm focus:outline-none focus:border-foreground font-mono"
                        placeholder="e.g. 5 (during trial)"
                      />
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        Quota allocated during the free trial period.
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                        Post-Trial / Paid Quota (GB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newPlan.quotaGb ?? ''}
                        onChange={e => setNewPlan({ ...newPlan, quotaGb: parseInt(e.target.value) || null })}
                        className="w-full border border-border bg-background p-2 text-sm focus:outline-none focus:border-foreground font-mono"
                        placeholder="e.g. 150 (regular plan)"
                      />
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        Full quota upgraded upon subscription renewal.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                      Storage Quota (GB)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newPlan.quotaGb ?? ''}
                      onChange={e => setNewPlan({ ...newPlan, quotaGb: parseInt(e.target.value) || null })}
                      className="w-full border border-border bg-background p-2 text-sm focus:outline-none focus:border-foreground font-mono"
                      placeholder="e.g. 150"
                    />
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Full regular plan storage quota allocated to this service.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Confirm everything looks right before publishing.</p>
              <div className="border border-border divide-y divide-border text-sm">
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="col-span-2 font-medium">{newPlan.name}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground">Category</span>
                  <span className="col-span-2">{newPlan.category}</span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground">Provider & SKU</span>
                  <span className="col-span-2">{newPlan.provider} / <span className="font-mono">{newPlan.target}</span></span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground">Specifications</span>
                  <div className="col-span-2 space-y-1">
                    {Object.entries(newPlan.specs).length > 0 ? (
                      Object.entries(newPlan.specs).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs py-0.5">
                          <span className="text-muted-foreground capitalize">{k.replace(/_/g, ' ')}:</span>
                          <span className="font-medium text-right">{String(v)}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground italic text-xs">No specifications set</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground">Pricing</span>
                  <span className="col-span-2">
                    €{newPlan.price.toFixed(2)} / {newPlan.billingCycle}
                    {newPlan.setupFee > 0 && <span className="text-muted-foreground"> + €{newPlan.setupFee} setup</span>}
                    {newPlan.cost > 0 && <span className="text-green-500 ml-2">(€{(newPlan.price - newPlan.cost).toFixed(2)} margin)</span>}
                  </span>
                </div>
                <div className="grid grid-cols-3 p-3">
                  <span className="text-muted-foreground">Trial Period</span>
                  <span className="col-span-2 font-medium">
                    {newPlan.trialDays > 0 ? (
                      <span className="text-blue-500 font-semibold">{newPlan.trialDays} Days Free Trial</span>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </span>
                </div>
                {(newPlan.trialQuotaGb || newPlan.quotaGb) && (
                  <div className="grid grid-cols-3 p-3">
                    <span className="text-muted-foreground">Storage Quota</span>
                    <span className="col-span-2 font-mono text-cyan-400">
                      {newPlan.trialQuotaGb ? `${newPlan.trialQuotaGb} GB trial` : 'Default trial quota'} → {newPlan.quotaGb ? `${newPlan.quotaGb} GB paid` : 'Default paid quota'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-border">
          <div>
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Back
              </button>
            ) : (
              <Link to="/products" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </Link>
            )}
          </div>
          <div>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                className="px-5 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish Plan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

// ==========================================
// Products List & Edit Flow
// ==========================================

function ProductsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const { data: products, loading, error, refetch } = useApi<Product[]>('/admin/products');
  const { data: serviceForms } = useApi<any[]>('/admin/service-forms');
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<(ProductFormData & { id: string }) | null>(null);
  const [saving, setSaving] = useState(false);

  const items = products || [];

  const filteredProducts = items.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider =
      filterProvider === 'all' || p.provider.toLowerCase().includes(filterProvider.toLowerCase());
    return matchesSearch && matchesProvider;
  });

  const openEditModal = (p: Product) => {
    setEditPlan({ id: p.id, ...toFormData(p) });
    setIsModalOpen(true);
  };

  const syncStock = async (id: string) => {
    try {
      await api.post(`/admin/products/${id}/sync`, {});
      toast.success('Stock synced successfully');
      refetch();
    } catch (e: any) {
      toast.error(e.message || 'Failed to sync stock');
    }
  };

  const handleSaveEdit = async () => {
    if (!editPlan) return;
    setSaving(true);
    try {
      await api.put(`/admin/products/${editPlan.id}`, toApiPayload(editPlan));
      toast.success(`Product "${editPlan.name}" updated successfully`);
      setIsModalOpen(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${productName}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      toast.success(`Product "${productName}" deleted successfully`);
      if (isModalOpen) setIsModalOpen(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete product');
    }
  };

  return (
    <Page title="Products & Margin Tracking">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">Map your retail plans to underlying upstream infrastructure providers.</p>
        <Link to="/products/new" className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Plan
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-foreground/[0.02] border border-border p-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by plan name or API target..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
        </div>
        <select
          value={filterProvider}
          onChange={e => setFilterProvider(e.target.value)}
          className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground w-48 shrink-0"
        >
          <option value="all">All Providers</option>
          <option value="hetzner_cloud">Hetzner Cloud</option>
          <option value="sftpgo">SFTPGo (Storage)</option>
          <option value="reliablesite">ReliableSite</option>
          <option value="hetzner_robot">Hetzner Robot</option>
          <option value="ovh">OVH BareMetal</option>
        </select>
      </div>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading products...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load products: {error}</div>}

      {!loading && !error && (
        <div className="border border-border divide-y divide-border bg-background">
          <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-12 text-muted-foreground">
            <div className="col-span-3">Retail Plan</div>
            <div className="col-span-2">Provider / Target</div>
            <div className="col-span-1 text-center">Cycle</div>
            <div className="col-span-2 text-right">Wholesale</div>
            <div className="col-span-2 text-right">Retail</div>
            <div className="text-right col-span-2">Margin & Actions</div>
          </div>
          {filteredProducts.map(p => {
            const cost = parseFloat(p.cost);
            const price = parseFloat(p.price);
            const margin = price - cost;
            const marginPct = cost > 0 ? Math.round((margin / cost) * 100) : 100;
            const cycleLabel = p.billing_cycle === 'monthly' ? 'M' : p.billing_cycle === 'yearly' ? 'Y' : '1x';

            return (
              <div key={p.id} className={`p-4 text-sm grid grid-cols-12 items-center hover:bg-foreground/[0.02] ${p.hidden ? 'opacity-50' : ''}`}>
                <div className="col-span-3 flex flex-col">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {p.hidden && <span title="Hidden Product"><EyeOff className="w-3 h-3 text-muted-foreground" /></span>}
                    <span className="font-medium">{p.name}</span>
                    {p.trial_days && p.trial_days > 0 ? (
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono">
                        {p.trial_days}d trial
                      </span>
                    ) : null}
                    {p.quota_gb ? (
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono">
                        {p.trial_days && p.trial_days > 0 && p.trial_quota_gb ? `${p.trial_quota_gb}GB → ` : ''}{p.quota_gb}GB
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs text-muted-foreground">{p.category}</span>
                </div>
                <div className="col-span-2 flex flex-col">
                  <span className="text-xs text-muted-foreground">{p.provider}</span>
                  <span className="font-mono text-xs">{p.target}</span>
                </div>
                <div className="col-span-1 text-center text-xs text-muted-foreground">{cycleLabel}</div>
                <div className="col-span-2 text-right text-muted-foreground">€{cost.toFixed(2)}</div>
                <div className="col-span-2 text-right font-medium">
                  €{price.toFixed(2)}
                  {parseFloat(p.setup_fee) > 0 && <div className="text-[10px] text-muted-foreground font-normal">+ €{parseFloat(p.setup_fee).toFixed(2)} setup</div>}
                </div>
                <div className="text-right col-span-2 flex items-center justify-end gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-green-500 font-medium">+€{margin.toFixed(2)}</span>
                    <span className="text-[10px] text-muted-foreground">{marginPct}% markup</span>
                  </div>
                  <button onClick={() => syncStock(p.id)} className="text-xs border border-border p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer" title="Sync Stock">
                    Sync
                  </button>
                  <button onClick={() => openEditModal(p)} className="text-xs border border-border p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer" title="Edit">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDeleteProduct(p.id, p.name)} className="text-xs border border-border p-1.5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors cursor-pointer" title="Delete Product">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {items.length === 0 ? 'No products yet. Add your first plan.' : 'No products match your filters.'}
            </div>
          )}
        </div>
      )}

      {/* EDIT RETAIL PLAN MODAL */}
      {isModalOpen && editPlan && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Server className="w-5 h-5 text-muted-foreground" /> Edit Retail Plan
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Plan Name</label>
                <input
                  type="text"
                  value={editPlan.name}
                  onChange={e => setEditPlan({ ...editPlan, name: e.target.value })}
                  className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Provider</label>
                  <select
                    value={editPlan.provider}
                    onChange={e => setEditPlan({ ...editPlan, provider: e.target.value })}
                    className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                  >
                    <option value="hetzner_cloud">Hetzner Cloud (VPS)</option>
                    <option value="sftpgo">SFTPGo (Cloud Storage)</option>
                    <option value="reliablesite">ReliableSite (Dedicated)</option>
                    <option value="hetzner_robot">Hetzner Robot (Dedicated)</option>
                    <option value="ovh">OVH BareMetal</option>
                    <option value="pterodactyl">Pterodactyl</option>
                    <option value="proxmox">Proxmox VE</option>
                    <option value="Custom">Custom / Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Category</label>
                  <select
                    value={editPlan.category}
                    onChange={e => setEditPlan({ ...editPlan, category: e.target.value })}
                    className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                  >
                    <option value="VPS">VPS</option>
                    <option value="Storage">Storage / SFTP</option>
                    <option value="Dedicated Servers">Dedicated Servers</option>
                    <option value="One Click Deploy">One Click Deploy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">API Target SKU</label>
                <input
                  type="text"
                  value={editPlan.target}
                  onChange={e => setEditPlan({ ...editPlan, target: e.target.value })}
                  className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                  Checkout Configuration Form (CAMOS Service Form)
                </label>
                <select
                  value={editPlan.serviceFormId || ''}
                  onChange={e => setEditPlan({ ...editPlan, serviceFormId: e.target.value })}
                  className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                >
                  <option value="">None (No configuration step required)</option>
                  {(serviceForms || []).map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({Array.isArray(f.fields) ? f.fields.length : 0} fields)
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Only attach a form if this service requires custom checkout configuration. Leave as None for SFTP or zero-config plans.
                </span>
              </div>

              {/* SPECIFICATIONS EDITOR IN EDIT MODAL */}
              <div className="border border-border p-4 bg-foreground/[0.01]">
                <ProviderSpecsEditor
                  provider={editPlan.provider}
                  category={editPlan.category}
                  specs={editPlan.specs}
                  onChange={nextSpecs => setEditPlan({ ...editPlan, specs: nextSpecs })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Wholesale Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-muted-foreground text-sm">€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editPlan.cost || ''}
                      onChange={e => setEditPlan({ ...editPlan, cost: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-border bg-transparent p-2 pl-7 text-sm focus:outline-none focus:border-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Retail Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-muted-foreground text-sm">€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editPlan.price || ''}
                      onChange={e => setEditPlan({ ...editPlan, price: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-border bg-transparent p-2 pl-7 text-sm focus:outline-none focus:border-foreground"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Regular monthly renewal price billed <em>after</em> any trial.
                  </span>
                </div>
              </div>

              {editPlan.price <= 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs p-3 rounded flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Notice: Retail Price is €0.00.</span>
                    <p className="mt-0.5 text-amber-500/90">
                      Customers will renew at <strong>€0.00 / month</strong> forever. If this product has a trial and should convert into a paid subscription, enter the normal monthly renewal price above.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Setup Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-muted-foreground text-sm">€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editPlan.setupFee || ''}
                      onChange={e => setEditPlan({ ...editPlan, setupFee: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-border bg-transparent p-2 pl-7 text-sm focus:outline-none focus:border-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Billing Cycle</label>
                  <select
                    value={editPlan.billingCycle}
                    onChange={e => setEditPlan({ ...editPlan, billingCycle: e.target.value })}
                    className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="One-Time">One-Time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Trial Period (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={editPlan.trialDays || ''}
                    onChange={e => setEditPlan({ ...editPlan, trialDays: parseInt(e.target.value) || 0 })}
                    className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                    placeholder="0 (No trial)"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPlan.hidden}
                      onChange={e => setEditPlan({ ...editPlan, hidden: e.target.checked })}
                      className="accent-foreground w-4 h-4"
                    />
                    <span className="text-sm font-medium">Hide from Storefront</span>
                  </label>
                </div>
              </div>

              {/* Storage Quotas & Trial Allocation */}
              <div className="p-4 border border-cyan-500/20 bg-cyan-500/5 rounded space-y-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    {editPlan.trialDays > 0 ? 'Storage Quotas (GB)' : 'Plan Storage Quota (GB)'}
                  </span>
                </div>
                {editPlan.trialDays > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                        Trial Quota (GB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editPlan.trialQuotaGb ?? ''}
                        onChange={e => setEditPlan({ ...editPlan, trialQuotaGb: parseInt(e.target.value) || null })}
                        className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground font-mono"
                        placeholder="e.g. 5 (during trial)"
                      />
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        Quota allocated during the free trial period.
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                        Post-Trial / Paid Quota (GB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editPlan.quotaGb ?? ''}
                        onChange={e => setEditPlan({ ...editPlan, quotaGb: parseInt(e.target.value) || null })}
                        className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground font-mono"
                        placeholder="e.g. 150 (regular plan)"
                      />
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        Full quota upgraded upon subscription renewal.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
                      Storage Quota (GB)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editPlan.quotaGb ?? ''}
                      onChange={e => setEditPlan({ ...editPlan, quotaGb: parseInt(e.target.value) || null })}
                      className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground font-mono"
                      placeholder="e.g. 150"
                    />
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Full regular plan storage quota allocated to this service.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => handleDeleteProduct(editPlan.id, editPlan.name)}
                className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Plan
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export default function ProductsRouter() {
  return (
    <Routes>
      <Route path="/" element={<ProductsList />} />
      <Route path="new" element={<ProductsNew />} />
      <Route path="insights" element={<ProductsInsights />} />
    </Routes>
  );
}
