import { Page } from '../components/Layout';
import { ExternalLink } from 'lucide-react';
import { getStoredClaims } from '../lib/auth';
import { useApi } from '../lib/hooks';
import type { InternalTool, Role } from '../lib/types';

export default function Launchpad() {
  const { data: internalTools } = useApi<InternalTool[]>('/admin/internal-tools');
  const { data: roles } = useApi<Role[]>('/admin/staff/roles');
  
  const claims = getStoredClaims();
  const currentRole = roles?.find(r => r.name === claims?.role);
  const userPermissions = currentRole?.permissions || [];
  
  const visibleTools = internalTools?.filter(t => 
    userPermissions.includes('*') || userPermissions.includes(t.required_permission)
  ) || [];

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
            key={tool.id} 
            href={tool.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="border border-border p-6 block group bg-background hover:bg-foreground/[0.02] transition-colors relative"
          >
            <ExternalLink className="w-8 h-8 mb-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <h3 className="font-medium text-lg mb-1">{tool.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">Internal Tool link to {tool.name}</p>
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

