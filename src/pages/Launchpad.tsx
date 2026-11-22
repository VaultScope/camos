import { Page } from '../components/Layout';
import { ExternalLink } from 'lucide-react';
import { getStoredClaims } from '../lib/auth';
import { useApi } from '../lib/hooks';
import { isSafeHttpUrl } from '../lib/url';
import type { InternalTool, Role } from '../lib/types';

export default function Launchpad() {
  const { data: internalTools } = useApi<InternalTool[]>('/admin/internal-tools');
  const { data: roles } = useApi<Role[]>('/admin/staff/roles');

  const claims = getStoredClaims();
  const currentRole = roles?.find(r => r.name === claims?.role);
  const userPermissions =
    claims?.role === 'Owner' || claims?.permissions?.includes('*')
      ? ['*']
      : currentRole?.permissions || claims?.permissions || [];

  const visibleTools =
    internalTools?.filter(
      t =>
        (userPermissions.includes('*') || userPermissions.includes(t.required_permission)) &&
        isSafeHttpUrl(t.url)
    ) || [];

  return (
    <Page title="Internal Tools & Telemetry">
      <div className="mb-6 space-y-2.5">
        <p className="text-sm text-muted-foreground">Quick access to the sovereign OSS stack that powers VaultScope.</p>
        <div className="text-xs rounded-xl border border-border bg-card inline-block px-3 py-1.5 max-w-full overflow-x-auto">
          <span className="text-muted-foreground">Active Tool Permissions: </span>
          <span className="font-mono text-foreground">{userPermissions.join(', ')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {visibleTools.map(tool => (
          <a
            key={tool.id}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-border p-5 sm:p-6 block group bg-card shadow-xs hover:bg-foreground/[0.03] hover:border-foreground/25 transition-colors duration-150 relative"
          >
            <div className="w-11 h-11 rounded-xl border border-border bg-foreground/5 flex items-center justify-center mb-4 group-hover:bg-foreground/10 transition-colors">
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <h3 className="font-medium text-base sm:text-lg mb-1">{tool.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">Internal Tool link to {tool.name}</p>
            <div className="text-xs text-blue-500 font-mono truncate">
              {tool.url}
            </div>
          </a>
        ))}
        {visibleTools.length === 0 && (
          <div className="col-span-full p-8 rounded-2xl border border-border bg-card text-center text-sm text-muted-foreground">
            You do not have permission to view any internal tools.
          </div>
        )}
      </div>
    </Page>
  );
}
