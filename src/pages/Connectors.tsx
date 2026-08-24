import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Page } from '../components/Layout';
import { Cloud, Server, CreditCard, Mail, Globe, Users, Plus, Shield } from 'lucide-react';

function ConnectorCard({ name, desc, icon: Icon, status, placeholder }: any) {
  return (
    <div className="border border-border p-6 relative overflow-hidden bg-background flex flex-col justify-between h-full">
      <div>
        <div className="absolute top-0 right-0 p-4">
          <span className={`flex items-center gap-2 text-xs font-medium ${status === 'Connected' ? 'text-green-500' : 'text-yellow-500'}`}>
            <div className={`w-2 h-2 rounded-full ${status === 'Connected' ? 'bg-green-500' : 'bg-yellow-500'}`} /> {status}
          </span>
        </div>
        <Icon className="w-8 h-8 mb-4 text-muted-foreground" />
        <h3 className="font-medium text-lg mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-6">{desc}</p>
      </div>
      
      <div className="flex flex-col gap-2 mt-4 border-t border-border pt-4">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">Configuration Token / Endpoint</label>
        <div className="flex gap-2">
          <input 
            type="password" 
            className="flex-1 bg-transparent border border-border px-3 py-2 text-sm text-foreground focus:outline-none" 
            defaultValue={status === 'Connected' ? 'some-fake-secure-token-here' : ''} 
            placeholder={placeholder}
          />
          <button className="border border-border px-4 py-2 text-sm hover:bg-foreground/5 transition-colors cursor-pointer">
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

function ConnectorsAuth() {
  return (
    <Page title="Authentication & Identity">
      <div className="grid md:grid-cols-2 gap-6">
        <ConnectorCard 
          name="Authentik (SSO)" 
          desc="Primary Identity Provider for Single Sign-On and Passkeys." 
          icon={Users} 
          status="Not Configured" 
          placeholder="https://auth.vaultscope.de" 
        />
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
  return (
    <Page title="Billing & Payment Gateways">
      <div className="grid md:grid-cols-2 gap-6">
        <ConnectorCard 
          name="Stripe" 
          desc="Process credit cards, SEPA, and local payment methods. (Invoicing is handled internally)." 
          icon={CreditCard} 
          status="Connected" 
          placeholder="sk_live_..." 
        />
        {/* Placeholder for future gateways */}
      </div>
    </Page>
  );
}

function ConnectorsApis() {
  return (
    <Page title="Infrastructure APIs">
      <p className="text-sm text-muted-foreground mb-6">Connect downstream APIs to enable automated provisioning and lifecycle management of services.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ConnectorCard name="Hetzner Cloud" desc="Reseller API: Auto-provision VPS instances" icon={Cloud} status="Connected" placeholder="API Token..." />
        <ConnectorCard name="Hetzner Robot" desc="Reseller API: Auto-provision Dedicated Bare Metal" icon={Server} status="Not Configured" placeholder="Webservice Username..." />
        <ConnectorCard name="OVH API" desc="Reseller API: Auto-provision OVH Advance/Scale" icon={Globe} status="Connected" placeholder="Application Key..." />
        <ConnectorCard name="Pterodactyl" desc="Panel API: Auto-provision Game Servers" icon={Server} status="Not Configured" placeholder="Application API Key..." />
        <ConnectorCard name="Proxmox VE" desc="Cluster API: Provision KVMs on owned hardware" icon={Cloud} status="Not Configured" placeholder="API Token ID..." />
      </div>
    </Page>
  );
}

function ConnectorsMail() {
  return (
    <Page title="Mailcow Integration">
      <div className="border border-border p-6 relative overflow-hidden bg-background">
        <div className="absolute top-0 right-0 p-4">
          <span className="flex items-center gap-2 text-xs font-medium text-green-500">
            <div className="w-2 h-2 rounded-full bg-green-500" /> Connected
          </span>
        </div>
        <Mail className="w-8 h-8 mb-4 text-muted-foreground" />
        <h3 className="font-medium text-lg mb-1">Mailcow (Core Setup)</h3>
        <p className="text-sm text-muted-foreground mb-6">Transactional emails and API integration.</p>

        <div className="flex flex-col gap-2 border-t border-border pt-4 max-w-xl">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Mailcow API Key</label>
          <div className="flex gap-2">
            <input 
              type="password" 
              className="flex-1 bg-transparent border border-border px-3 py-2 text-sm text-foreground focus:outline-none" 
              defaultValue="some-fake-secure-token-here"
            />
            <button className="border border-border px-4 py-2 text-sm hover:bg-foreground/5 transition-colors cursor-pointer">
              Update
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">API key used to send automated transactional emails from VaultScope.</p>
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

      <div className="border border-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-2 text-muted-foreground">
          <div>Mailbox Address</div>
          <div>Ticket Routing Target</div>
        </div>
        <div className="divide-y divide-border">
          <div className="p-4 text-sm grid grid-cols-2 items-center hover:bg-foreground/[0.02]">
            <span className="font-mono">support@vaultscope.de</span>
            <span>General Support Desk</span>
          </div>
          <div className="p-4 text-sm grid grid-cols-2 items-center hover:bg-foreground/[0.02]">
            <span className="font-mono">abuse@vaultscope.de</span>
            <span>Abuse Reports</span>
          </div>
          <div className="p-4 text-sm grid grid-cols-2 items-center hover:bg-foreground/[0.02]">
            <span className="font-mono">dmca@vaultscope.de</span>
            <span>DMCA Takedowns</span>
          </div>
          <div className="p-4 text-sm grid grid-cols-2 items-center hover:bg-foreground/[0.02]">
            <span className="font-mono">noreply@vaultscope.de</span>
            <span className="text-muted-foreground italic">No Routing (Outgoing Only)</span>
          </div>
        </div>
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
