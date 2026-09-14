import { useState, useRef, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Cloud, Server, CreditCard, Globe, Users, Shield } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import type { Connector } from '../lib/types';
import { useToast } from '../components/Toast';

interface ProviderDef {
  provider: string;
  name: string;
  description: string;
  icon: typeof Cloud;
  fields: { label: string; key: string; type?: string; placeholder?: string }[];
}

const PROVIDER_DEFS: ProviderDef[] = [
  {
    provider: 'hetzner_cloud',
    name: 'Hetzner Cloud',
    description: 'Auto-provision cloud VPS instances via Hetzner Cloud API',
    icon: Cloud,
    fields: [{ label: 'API Token', key: 'token', placeholder: 'hcloud_api_token...' }],
  },
  {
    provider: 'hetzner_robot',
    name: 'Hetzner Robot',
    description: 'Manage dedicated bare-metal servers via Robot Webservice API',
    icon: Server,
    fields: [
      { label: 'Webservice Username', key: 'username', type: 'text', placeholder: '#ws+abcdef' },
      { label: 'Webservice Password', key: 'password', placeholder: 'Password...' },
    ],
  },
  {
    provider: 'ovh',
    name: 'OVH API',
    description: 'Provision OVH Advance & Scale dedicated servers',
    icon: Globe,
    fields: [
      { label: 'Application Key', key: 'app_key', type: 'text', placeholder: 'app_key...' },
      { label: 'Application Secret', key: 'app_secret', placeholder: 'app_secret...' },
      { label: 'Consumer Key', key: 'consumer_key', placeholder: 'consumer_key...' },
      { label: 'Endpoint', key: 'endpoint', type: 'text', placeholder: 'ovh-eu' },
    ],
  },
  {
    provider: 'pterodactyl',
    name: 'Pterodactyl Panel',
    description: 'Auto-provision game server instances via Pterodactyl Application API',
    icon: Server,
    fields: [
      { label: 'Panel URL', key: 'url', type: 'text', placeholder: 'https://panel.example.com' },
      { label: 'Application API Key', key: 'api_key', placeholder: 'ptla_...' },
    ],
  },
  {
    provider: 'proxmox',
    name: 'Proxmox VE',
    description: 'Provision KVM virtual machines on self-hosted Proxmox clusters',
    icon: Cloud,
    fields: [
      { label: 'Host / Cluster URL', key: 'url', type: 'text', placeholder: 'https://pve.example.com:8006' },
      { label: 'API Token ID', key: 'token_id', type: 'text', placeholder: 'user@pam!tokenname' },
      { label: 'API Token Secret', key: 'token_secret', placeholder: 'uuid-secret...' },
      { label: 'Default Node', key: 'node', type: 'text', placeholder: 'pve1' },
    ],
  },
];

function ConnectorsAuth() {
  return (
    <Page title="Authentication & Identity">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-border p-6 bg-background">
          <Users className="w-8 h-8 mb-4 text-muted-foreground" />
          <h3 className="font-medium text-lg mb-1">Authentik (SSO)</h3>
          <p className="text-sm text-muted-foreground mb-6">Primary Identity Provider for Single Sign-On and Passkeys.</p>
          <div className="border-t border-border pt-4 text-sm text-muted-foreground">
            Authentik is configured via environment variables on the API server. See <code className="bg-foreground/5 px-1 py-0.5 text-xs">AUTHENTIK_ISSUER</code> and related settings.
          </div>
        </div>
        <div className="border border-border p-6 flex flex-col justify-center items-center text-center bg-foreground/[0.02]">
          <Shield className="w-8 h-8 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">Role-Based Access Control (RBAC)</h3>
          <p className="text-sm text-muted-foreground mb-4">RBAC is managed natively within VaultScope via the Staff section, applying attributes passed from your Identity Provider.</p>
          <Link to="/staff/rbac" className="text-sm text-blue-400 hover:underline">Manage Roles</Link>
        </div>
      </div>
    </Page>
  );
}

function ConnectorsBilling() {
  const { data: settingsData, refetch } = useApi<any[]>('/admin/settings');
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    stripe_live_public_key: '',
    stripe_live_secret_key: '',
    stripe_sandbox_public_key: '',
    stripe_sandbox_secret_key: '',
    stripe_webhook_secret: '',
    stripe_sandbox_mode: false,
  });

  useEffect(() => {
    if (settingsData) {
      const s: any = { ...settings };
      settingsData.forEach((row) => {
        if (row.key in s) {
          s[row.key] = row.key === 'stripe_sandbox_mode' ? row.value === 'true' : row.value;
        }
      });
      setSettings(s);
    }
  }, [settingsData]);

  const update = (key: string, value: any) => setSettings({ ...settings, [key]: value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(settings).map(([k, v]) => ({ key: k, value: String(v) }));
      await api.put('/admin/settings', payload);
      toast.success('Stripe settings saved successfully');
      refetch();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const isConfigured = settings.stripe_live_secret_key || settings.stripe_sandbox_secret_key;

  return (
    <Page title="Billing & Payment Gateways">
      <div className="border border-border p-6 bg-background">
        <div className="flex items-start justify-between mb-4">
          <div>
            <CreditCard className="w-8 h-8 mb-4 text-muted-foreground" />
            <h3 className="font-medium text-lg mb-1">Stripe Configuration</h3>
            <p className="text-sm text-muted-foreground">Process credit cards, SEPA, and local payment methods via Stripe.</p>
          </div>
          <span className={`flex items-center gap-2 text-xs font-medium ${isConfigured ? 'text-green-500' : 'text-yellow-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-yellow-500'}`} />
            {isConfigured ? 'Connected' : 'Not Configured'}
          </span>
        </div>

        <div className="space-y-4 border-t border-border pt-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={settings.stripe_sandbox_mode} onChange={e => update('stripe_sandbox_mode', e.target.checked)} className="w-4 h-4 accent-foreground cursor-pointer" />
            Enable Test Mode (Sandbox)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Live Public Key</label>
              <input type="text" value={settings.stripe_live_public_key} onChange={e => update('stripe_live_public_key', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" placeholder="pk_live_..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Live Secret Key</label>
              <input type="password" value={settings.stripe_live_secret_key} onChange={e => update('stripe_live_secret_key', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" placeholder="sk_live_..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Sandbox Public Key</label>
              <input type="text" value={settings.stripe_sandbox_public_key} onChange={e => update('stripe_sandbox_public_key', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" placeholder="pk_test_..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Sandbox Secret Key</label>
              <input type="password" value={settings.stripe_sandbox_secret_key} onChange={e => update('stripe_sandbox_secret_key', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" placeholder="sk_test_..." />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Webhook Secret</label>
              <input type="password" value={settings.stripe_webhook_secret} onChange={e => update('stripe_webhook_secret', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" placeholder="whsec_..." />
            </div>
          </div>
          <div className="pt-2">
            <button onClick={handleSave} disabled={saving} className="text-xs px-4 py-1.5 bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}

function ApiConnectorPanel({ def, connector, onSaved }: { def: ProviderDef; connector?: Connector; onSaved: () => void }) {
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [name, setName] = useState(connector?.name || def.name);
  const formRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const Icon = def.icon;

  const status = connector?.status || 'not_configured';
  const statusLabel = status === 'connected' ? 'Connected' : status === 'error' ? 'Error' : 'Not Configured';
  const statusColor = status === 'connected' ? 'green' : status === 'error' ? 'red' : 'yellow';

  const getFieldValues = () => {
    const config: Record<string, string> = {};
    if (!formRef.current) return config;
    const inputs = formRef.current.querySelectorAll('input:not([name="connector_name"])');
    def.fields.forEach((f, i) => {
      if (inputs[i]) config[f.key] = (inputs[i] as HTMLInputElement).value;
    });
    return config;
  };

  const handleTest = async () => {
    if (!connector) return;
    setTesting(true);
    setResult(null);
    try {
      await api.post(`/admin/connectors/${connector.id}/test`);
      setResult('success');
    } catch {
      setResult('error');
    } finally {
      setTesting(false);
      setTimeout(() => setResult(null), 3000);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (connector) {
        await api.put(`/admin/connectors/${connector.id}`, { config: getFieldValues() });
      } else {
        await api.post('/admin/connectors', { name, provider: def.provider, config: getFieldValues() });
      }
      setResult('success');
      onSaved();
    } catch (e: any) {
      setResult('error');
      toast.error(e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setResult(null), 3000);
    }
  };

  return (
    <div className="border border-border bg-background p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-muted-foreground" />
          <div>
            <h3 className="font-medium">{connector ? connector.name : def.name}</h3>
            <p className="text-xs text-muted-foreground">{def.description}</p>
          </div>
        </div>
        <span className={`flex items-center gap-2 text-xs font-medium text-${statusColor}-500`}>
          <div className={`w-2 h-2 rounded-full bg-${statusColor}-500`} />
          {statusLabel}
        </span>
      </div>

      <div ref={formRef} className="space-y-3 border-t border-border pt-4">
        {!connector && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Instance Name</label>
            <input
              type="text"
              name="connector_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hetzner Cloud - Frankfurt"
              className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground"
            />
          </div>
        )}
        {def.fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">
              {f.label}
              {connector && (
                <span className="ml-2 text-green-500 font-normal">✓ Configured</span>
              )}
            </label>
            <input
              type={f.type || 'password'}
              defaultValue=""
              placeholder={connector ? "Leave blank to keep existing value" : f.placeholder}
              className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono"
            />
            {connector && (
              <p className="text-xs text-muted-foreground mt-1">
                Only fill this field if you want to change the {f.label.toLowerCase()}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTest}
            disabled={testing || !connector}
            className="text-xs px-3 py-1.5 border border-border hover:bg-foreground/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          {result === 'success' && <span className="text-xs text-green-500">Success</span>}
          {result === 'error' && <span className="text-xs text-red-500">Failed</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs px-4 py-1.5 bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function ConnectorsApis() {
  const { data: connectors, loading, error, refetch } = useApi<Connector[]>('/admin/connectors');
  const [addingProvider, setAddingProvider] = useState<string>('');

  const handleAdded = () => {
    setAddingProvider('');
    refetch();
  };

  return (
    <Page title="Infrastructure APIs">
      <p className="text-sm text-muted-foreground mb-6">Connect upstream provider APIs to enable automated provisioning and lifecycle management.</p>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading connectors...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load connectors: {error}</div>}

      {!loading && !error && (
        <div className="space-y-6">
          {connectors?.map(connector => {
            const def = PROVIDER_DEFS.find(d => d.provider === connector.provider);
            if (!def) return null;
            return <ApiConnectorPanel key={connector.id} def={def} connector={connector} onSaved={refetch} />
          })}

          <div className="mt-8 border-t border-border pt-6">
            <h3 className="font-medium text-lg mb-4">Add New Connector</h3>
            <div className="flex gap-4 mb-6">
              <select 
                value={addingProvider}
                onChange={e => setAddingProvider(e.target.value)}
                className="border border-border bg-background p-2 text-sm focus:outline-none focus:border-foreground"
              >
                <option value="">Select a provider...</option>
                {PROVIDER_DEFS.map(def => (
                  <option key={def.provider} value={def.provider}>{def.name}</option>
                ))}
              </select>
            </div>
            
            {addingProvider && (
              <ApiConnectorPanel 
                def={PROVIDER_DEFS.find(d => d.provider === addingProvider)!} 
                onSaved={handleAdded} 
              />
            )}
          </div>
        </div>
      )}
    </Page>
  );
}

import Mailboxes from './Mailboxes';

export default function ConnectorsRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="apis" replace />} />
      <Route path="authentication" element={<ConnectorsAuth />} />
      <Route path="billing" element={<ConnectorsBilling />} />
      <Route path="apis" element={<ConnectorsApis />} />
      <Route path="mail/*" element={<Mailboxes />} />
    </Routes>
  );
}
