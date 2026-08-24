import { useState } from 'react';
import { Page } from '../components/Layout';
import { Activity, Server, Mail, Users, GitMerge } from 'lucide-react';

export default function Launchpad() {
  // In a real app, this would come from an Auth Context or OIDC claim
  const [userPermissions] = useState<string[]>([
    'tools.Authentik',
    'tools.Coolify',
    'tools.Uptime Kuma',
    'tools.Forgejo'
    // 'tools.Beszel', 'tools.Mailcow', 'tools.Listmonk' are omitted to demonstrate filtering
  ]);

  const allTools = [
    { name: 'Authentik', perm: 'tools.Authentik', desc: 'Central SSO, Staff & Customer Identities', url: 'https://auth.vaultscope.de/if/admin/', icon: Users },
    { name: 'Beszel', perm: 'tools.Beszel', desc: 'Real-time node telemetry, RAM, and CPU tracking', url: 'https://mon.vaultscope.de/', icon: Activity },
    { name: 'Coolify', perm: 'tools.Coolify', desc: 'PaaS engine & Managed App deployments', url: 'https://cool.pegasusbot.app/', icon: Server },
    { name: 'Uptime Kuma', perm: 'tools.Uptime Kuma', desc: 'Global status page & uptime monitoring', url: 'https://status.vaultscope.de/', icon: Activity },
    { name: 'Mailcow', perm: 'tools.Mailcow', desc: 'Transactional routing & mailbox administration', url: 'https://mail.vaultscope.de/', icon: Mail },
    { name: 'Listmonk', perm: 'tools.Listmonk', desc: 'Marketing campaigns & newsletter lists', url: 'https://subscribe.vaultscope.de/', icon: Users },
    { name: 'Forgejo', perm: 'tools.Forgejo', desc: 'Internal Git repositories & code hosting', url: 'https://git.vaultscope.de/', icon: GitMerge },
  ];

  const visibleTools = allTools.filter(tool => userPermissions.includes('*') || userPermissions.includes(tool.perm));

  return (
    <Page title="Internal Tools & Telemetry">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Quick access to the sovereign OSS stack that powers VaultScope.</p>
        <div className="mt-2 text-xs border border-border bg-foreground/5 inline-block px-2 py-1">
          <span className="text-muted-foreground">Active Tool Permissions: </span>
          <span className="font-mono text-foreground">{userPermissions.join(', ')}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleTools.map(tool => (
          <a 
            key={tool.name} 
            href={tool.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="border border-border p-6 block group bg-background hover:bg-foreground/[0.02] transition-colors relative"
          >
            <tool.icon className="w-8 h-8 mb-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <h3 className="font-medium text-lg mb-1">{tool.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{tool.desc}</p>
            <div className="text-xs text-blue-400 font-mono flex items-center gap-2">
              {tool.url}
            </div>
          </a>
        ))}
        {visibleTools.length === 0 && (
          <div className="col-span-full p-8 border border-border text-center text-sm text-muted-foreground">
            You do not have permission to view any internal tools.
          </div>
        )}
      </div>
    </Page>
  );
}
