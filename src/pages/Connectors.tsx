import { useState, useRef } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Cloud, Server, CreditCard, Mail, Globe, Users, Plus, Shield } from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import type { Connector } from '../lib/types';

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
  const { data: connectors } = useApi<Connector[]>('/admin/connectors');
  const stripe = connectors?.find(c => c.provider === 'stripe');

  return (
    <Page title="Billing & Payment Gateways">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-border p-6 bg-background">
          <CreditCard className="w-8 h-8 mb-4 text-muted-foreground" />
          <h3 className="font-medium text-lg mb-1">Stripe</h3>
          <p className="text-sm text-muted-foreground mb-4">Process credit cards, SEPA, and local payment methods.</p>
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${stripe?.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className={stripe?.status === 'connected' ? 'text-green-500' : 'text-yellow-500'}>
              {stripe?.status === 'connected' ? 'Connected' : 'Not Configured'}
            </span>
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
  const formRef = useRef<HTMLDivElement>(null);
  const Icon = def.icon;

  const status = connector?.status || 'not_configured';
  const statusLabel = status === 'connected' ? 'Connected' : status === 'error' ? 'Error' : 'Not Configured';
  const statusColor = status === 'connected' ? 'green' : status === 'error' ? 'red' : 'yellow';

  const getFieldValues = () => {
    const config: Record<string, string> = {};
    if (!formRef.current) return config;
    const inputs = formRef.current.querySelectorAll('input');
    def.fields.forEach((f, i) => {
      if (inputs[i]) config[f.key] = inputs[i].value;
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
    if (!connector) return;
    setSaving(true);
    try {
      await api.put(`/admin/connectors/${connector.id}`, { config: getFieldValues() });
      setResult('success');
      onSaved();
    } catch {
      setResult('error');
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
            <h3 className="font-medium">{def.name}</h3>
            <p className="text-xs text-muted-foreground">{def.description}</p>
          </div>
        </div>
        <span className={`flex items-center gap-2 text-xs font-medium text-${statusColor}-500`}>
          <div className={`w-2 h-2 rounded-full bg-${statusColor}-500`} />
          {statusLabel}
        </span>
      </div>

      <div ref={formRef} className="space-y-3 border-t border-border pt-4">
        {def.fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">{f.label}</label>
            <input
              type={f.type || 'password'}
              defaultValue=""
              placeholder={f.placeholder}
              className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono"
            />
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
          disabled={saving || !connector}
          className="text-xs px-4 py-1.5 bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {!connector && (
        <p className="mt-3 text-xs text-muted-foreground">This connector has not been registered in the database yet. Create it via the API or seed the database.</p>
      )}
    </div>
  );
}

function ConnectorsApis() {
  const { data: connectors, loading, error, refetch } = useApi<Connector[]>('/admin/connectors');

  return (
    <Page title="Infrastructure APIs">
      <p className="text-sm text-muted-foreground mb-6">Connect upstream provider APIs to enable automated provisioning and lifecycle management.</p>

      {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading connectors...</div>}
      {error && <div className="p-8 text-center text-red-500 text-sm">Failed to load connectors: {error}</div>}

      {!loading && !error && (
        <div className="space-y-6">
          {PROVIDER_DEFS.map(def => (
            <ApiConnectorPanel
              key={def.provider}
              def={def}
              connector={connectors?.find(c => c.provider === def.provider)}
              onSaved={refetch}
            />
          ))}
        </div>
      )}
    </Page>
  );
}

function ConnectorsMail() {
  const { data: connectors } = useApi<Connector[]>('/admin/connectors');
  const mailcow = connectors?.find(c => c.provider === 'mailcow');

  return (
    <Page title="Mailcow Integration">
      <div className="border border-border p-6 bg-background">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Mail className="w-8 h-8 mb-4 text-muted-foreground" />
            <h3 className="font-medium text-lg mb-1">Mailcow (Core Setup)</h3>
            <p className="text-sm text-muted-foreground">Transactional emails and ticket-pipe integration.</p>
          </div>
          <span className={`flex items-center gap-2 text-xs font-medium ${mailcow?.status === 'connected' ? 'text-green-500' : 'text-yellow-500'}`}>
            <div className={`w-2 h-2 rounded-full ${mailcow?.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            {mailcow?.status === 'connected' ? 'Connected' : 'Not Configured'}
          </span>
        </div>
        <div className="border-t border-border pt-4 text-sm text-muted-foreground">
          Mailcow connector configuration will be available once the connector is registered in the database.
        </div>
      </div>
    </Page>
  );
}

function ConnectorsMailboxes() {
  return (
    <Page title="Mailcow Mailboxes">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">Map IMAP mailboxes to VaultScope support departments.</p>
        <button className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add Mailbox Route
        </button>
      </div>

      <div className="border border-border bg-background p-8 text-center text-sm text-muted-foreground">
        Mailbox routing will be configurable once the mail connector is active and the mailbox API endpoint is implemented.
      </div>
    </Page>
  );
}

export default function ConnectorsRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="apis" replace />} />
      <Route path="authentication" element={<ConnectorsAuth />} />
      <Route path="billing" element={<ConnectorsBilling />} />
      <Route path="apis" element={<ConnectorsApis />} />
      <Route path="mail" element={<ConnectorsMail />} />
      <Route path="mail/mailboxes" element={<ConnectorsMailboxes />} />
    </Routes>
  );
}
