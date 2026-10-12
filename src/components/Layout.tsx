import React, { useState } from 'react';
import { Link, useLocation, useInRouterContext } from 'react-router-dom';
import {
  Users,
  Server,
  HardDrive,
  DollarSign,
  Activity,
  LogOut,
  LifeBuoy,
  ListTree,
  Tag,
  ExternalLink,
  Mail,
  MailOpen,
  FileText,
  ChevronDown,
  Bell,
  History,
  BarChart3,
  Settings,
  Shield,
  Search,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { getStoredClaims, logout, hasPermission } from '../lib/auth';
import { useApi } from '../lib/hooks';
import type { InternalTool, Role } from '../lib/types';
import { CommandPalette } from './CommandPalette';
import { useExplainMode } from './HelpTooltip';

export function SidebarItem({
  link,
  location,
  isExpanded,
  onToggle
}: {
  link: any;
  location: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));

  return (
    <div className="relative">
      {link.subItems ? (
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between px-6 py-2.5 text-sm transition-colors cursor-pointer ${
            isActive
              ? 'bg-foreground/5 font-medium border-r-2 border-foreground text-foreground'
              : 'text-muted-foreground hover:bg-foreground/[0.02] hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-3">
            <link.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{link.name}</span>
          </div>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <Link
          to={link.path}
          className={`flex items-center justify-between px-6 py-2.5 text-sm transition-colors ${
            isActive
              ? 'bg-foreground/5 font-medium border-r-2 border-foreground text-foreground'
              : 'text-muted-foreground hover:bg-foreground/[0.02] hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-3">
            <link.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{link.name}</span>
          </div>
          {link.badge && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-foreground/10 text-muted-foreground">
              {link.badge}
            </span>
          )}
        </Link>
      )}

      {link.subItems && (
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-foreground/[0.02] border-l-2 border-foreground/10 ml-8 pl-4 py-1.5 space-y-1.5 mb-1">
            {link.subItems.map((sub: any) => {
              const isSubActive = location.pathname === sub.path;
              return (
                <Link
                  key={sub.name}
                  to={sub.path}
                  className={`block text-xs transition-colors py-1 ${
                    isSubActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {sub.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const { data: internalTools } = useApi<InternalTool[]>('/admin/internal-tools');
  const { data: roles } = useApi<Role[]>('/admin/staff/roles');

  const claims = getStoredClaims();
  const currentRole = roles?.find(r => r.name === claims?.role);
  const userPermissions = currentRole?.permissions || [];

  const visibleTools =
    internalTools?.filter(
      t => userPermissions.includes('*') || userPermissions.includes(t.required_permission)
    ) || [];

  const toggleItem = (name: string) => {
    setExpandedItem(prev => (prev === name ? null : name));
  };

  const sections = [
    {
      label: null,
      items: [
        { name: 'Dashboard', path: '/', icon: Activity },
        { name: 'Notifications', path: '/notifications', icon: Bell },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      label: 'Content',
      items: [{ name: 'Blog', path: '/blog', icon: FileText }],
    },
    {
      label: 'Customers',
      items: [
        { name: 'Accounts', path: '/customers', icon: Users },
        {
          name: 'Support Tickets',
          path: '/tickets',
          icon: LifeBuoy,
          subItems: [
            { name: 'All Tickets', path: '/tickets' },
            { name: 'New Ticket', path: '/tickets/new' },
            { name: 'Departments', path: '/tickets/departments' },
          ],
        },
      ],
    },
    {
      label: 'Commerce',
      items: [
        {
          name: 'Billing',
          path: '/billing',
          icon: DollarSign,
          subItems: [
            { name: 'Insights', path: '/billing/insights' },
            { name: 'Invoices', path: '/billing/invoices' },
            { name: 'Automations', path: '/billing/automations' },
            { name: 'Tax Rates', path: '/billing/tax-rates' },
          ],
        },
        {
          name: 'Products',
          path: '/products',
          icon: HardDrive,
          subItems: [
            { name: 'All Products', path: '/products' },
            { name: 'New Product', path: '/products/new' },
            { name: 'Insights', path: '/products/insights' },
          ],
        },
        { name: 'Coupons', path: '/coupons', icon: Tag },
      ],
    },
    {
      label: 'Infrastructure',
      items: [
        {
          name: 'Services',
          path: '/services',
          icon: Server,
          subItems: [
            { name: 'All Services', path: '/services' },
            { name: 'New Service', path: '/services/new' },
          ],
        },
        { name: 'Provisioning Queue', path: '/jobs', icon: ListTree },
        { name: 'Service Forms', path: '/forms', icon: FileText },
      ],
    },
    {
      label: 'System',
      items: [
        {
          name: 'Staff & RBAC',
          path: '/staff',
          icon: Users,
          subItems: [
            { name: 'Members', path: '/staff/members' },
            { name: 'RBAC', path: '/staff/rbac' },
            { name: 'My Account', path: '/staff/account' },
          ],
        },
        { name: 'Email Templates', path: '/email-templates', icon: MailOpen },
        { name: 'Email Logs', path: '/email-logs', icon: Mail },
        { name: 'Activity Log', path: '/activity', icon: History },
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="w-64 border-r border-border h-screen bg-background flex flex-col fixed z-20 select-none">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/camos.png" alt="CAMOS Logo" className="w-9 h-9 object-contain shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5">
              CAMOS <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-foreground/10 text-muted-foreground">v2.4</span>
            </h1>
            <p className="text-[10px] text-muted-foreground truncate">Operations Control Plane</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {sections.map((section, si) => (
          <div key={si} className={section.label ? 'mt-2' : ''}>
            {section.label && (
              <div className="px-6 pt-3 pb-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                  {section.label}
                </span>
              </div>
            )}
            {section.items.map(link => (
              <SidebarItem
                key={link.name}
                link={link}
                location={location}
                isExpanded={expandedItem === link.name}
                onToggle={() => toggleItem(link.name)}
              />
            ))}
          </div>
        ))}

        {visibleTools.length > 0 && (
          <div className="mt-3">
            <div className="px-6 pt-3 pb-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Internal Tools
              </span>
            </div>
            {visibleTools.map(tool => (
              <a
                key={tool.id}
                href={tool.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-6 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-foreground/[0.02] hover:text-foreground"
              >
                <ExternalLink className="w-4 h-4 shrink-0" /> <span className="truncate">{tool.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-foreground/[0.01]">
        <div className="flex items-center justify-between text-sm">
          <Link to="/staff/account" className="flex flex-col hover:opacity-80 transition-opacity min-w-0 mr-2">
            <span className="font-medium text-xs text-foreground truncate">{claims?.email?.split('@')[0] || 'Admin User'}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{claims?.role || 'Owner'}</span>
          </Link>
          <button
            onClick={logout}
            className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer rounded hover:bg-foreground/10 transition-colors"
            title="Sign Out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function TopNav({ title: _title }: { title: string }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const inRouter = useInRouterContext();
  const location = inRouter ? useLocation() : { pathname: '/' };
  const { explainMode, toggleExplainMode } = useExplainMode();

  // Create simple breadcrumb from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const BreadcrumbLink = ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => {
    if (inRouter) {
      return <Link to={to} className={className}>{children}</Link>;
    }
    return <span className={className}>{children}</span>;
  };

  return (
    <>
      <header className="sticky top-0 z-10 w-full h-14 bg-background/90 backdrop-blur-md border-b border-border px-8 flex items-center justify-between">
        {/* Left: Breadcrumbs & Page Title */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BreadcrumbLink to="/" className="hover:text-foreground transition-colors font-medium">CAMOS</BreadcrumbLink>
          {pathSegments.length > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
          {pathSegments.map((seg, idx) => {
            const isLast = idx === pathSegments.length - 1;
            const path = `/${pathSegments.slice(0, idx + 1).join('/')}`;
            return (
              <React.Fragment key={path}>
                {isLast ? (
                  <span className="text-foreground font-semibold capitalize">{seg.replace(/-/g, ' ')}</span>
                ) : (
                  <>
                    <BreadcrumbLink to={path} className="hover:text-foreground transition-colors capitalize">{seg}</BreadcrumbLink>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Quick Search + Explain Mode Toggle + API Status */}
        <div className="flex items-center gap-3">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-foreground/[0.03] hover:bg-foreground/[0.08] hover:text-foreground border border-border rounded-lg transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search CAMOS...</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-foreground/10 border border-border/60">
              Ctrl K
            </kbd>
          </button>

          {/* Explain Mode Toggle */}
          <button
            type="button"
            onClick={toggleExplainMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              explainMode
                ? 'bg-amber-500/15 text-amber-500 border-amber-500/40 shadow-sm'
                : 'text-muted-foreground border-border hover:text-foreground hover:bg-foreground/[0.03]'
            }`}
            title="Toggle interactive help tooltips on all fields and metrics"
          >
            <HelpCircle className={`w-3.5 h-3.5 ${explainMode ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{explainMode ? 'Help Hints: ON' : 'Explain UI'}</span>
          </button>

          {/* System Heartbeat Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>API Online</span>
          </div>
        </div>
      </header>

      {inRouter && <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />}
    </>
  );
}

export function Page({
  title,
  children,
  requiredPermission,
}: {
  title: string;
  children: React.ReactNode;
  requiredPermission?: string;
}) {
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="ml-64 p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground">
            You do not have the required permissions ({requiredPermission}) to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen flex flex-col">
      <TopNav title={title} />
      <div className="p-8 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-light tracking-tight text-foreground">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}
