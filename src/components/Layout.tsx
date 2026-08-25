import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Server, HardDrive, DollarSign, Plug, Activity, LogOut, LifeBuoy, ListTree, Tag, ExternalLink, Mail, MailOpen, FileText, ChevronDown, Sliders, Bell, History, BarChart3, Settings } from 'lucide-react';
import { getStoredClaims, logout } from '../lib/auth';

function SidebarItem({ link, location, isExpanded, onToggle }: { link: any, location: any, isExpanded: boolean, onToggle: () => void }) {
  const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));

  return (
    <div className="relative">
      {link.subItems ? (
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors cursor-pointer ${isActive ? 'bg-foreground/5 font-medium border-r-2 border-foreground' : 'text-muted-foreground hover:bg-foreground/[0.02]'}`}
        >
          <div className="flex items-center gap-3">
            <link.icon className="w-4 h-4" />
            {link.name}
          </div>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <Link
          to={link.path}
          className={`flex items-center justify-between px-6 py-3 text-sm transition-colors ${isActive ? 'bg-foreground/5 font-medium border-r-2 border-foreground' : 'text-muted-foreground hover:bg-foreground/[0.02]'}`}
        >
          <div className="flex items-center gap-3">
            <link.icon className="w-4 h-4" />
            {link.name}
          </div>
        </Link>
      )}

      {link.subItems && (
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="bg-foreground/[0.02] border-l-2 border-foreground/10 ml-8 pl-4 py-2 space-y-2 mb-2">
            {link.subItems.map((sub: any) => {
              const isSubActive = location.pathname === sub.path;
              return (
                <Link
                  key={sub.name}
                  to={sub.path}
                  className={`block text-xs transition-colors ${isSubActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
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

  const toggleItem = (name: string) => {
    setExpandedItem(prev => prev === name ? null : name);
  };

  const sections = [
    {
      label: null,
      items: [
        { name: 'Dashboard', path: '/', icon: Activity },
        { name: 'Notifications', path: '/notifications', icon: Bell },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
      ]
    },
    {
      label: 'Customers',
      items: [
        { name: 'Accounts', path: '/customers', icon: Users },
        { name: 'Support Tickets', path: '/tickets', icon: LifeBuoy,
          subItems: [
            { name: 'All Tickets', path: '/tickets' },
            { name: 'New Ticket', path: '/tickets/new' },
            { name: 'Departments', path: '/tickets/departments' }
          ]
        },
      ]
    },
    {
      label: 'Commerce',
      items: [
        { name: 'Billing', path: '/billing', icon: DollarSign,
          subItems: [
            { name: 'Insights', path: '/billing/insights' },
            { name: 'Invoices', path: '/billing/invoices' },
            { name: 'Automations', path: '/billing/automations' },
            { name: 'Tax Rates', path: '/billing/tax-rates' }
          ]
        },
        { name: 'Products', path: '/products', icon: HardDrive,
          subItems: [
            { name: 'All Products', path: '/products' },
            { name: 'New Product', path: '/products/new' },
            { name: 'Insights', path: '/products/insights' }
          ]
        },
        { name: 'Coupons', path: '/coupons', icon: Tag },
      ]
    },
    {
      label: 'Infrastructure',
      items: [
        { name: 'Services', path: '/services', icon: Server,
          subItems: [
            { name: 'All Services', path: '/services' },
            { name: 'New Service', path: '/services/new' }
          ]
        },
        { name: 'Provisioning Queue', path: '/jobs', icon: ListTree },
        { name: 'Service Forms', path: '/forms', icon: FileText },
        { name: 'Config Options', path: '/config-options', icon: Sliders },
      ]
    },
    {
      label: 'System',
      items: [
        { name: 'Connectors', path: '/connectors', icon: Plug,
          subItems: [
            { name: 'Authentication', path: '/connectors/authentication' },
            { name: 'Billing', path: '/connectors/billing' },
            { name: 'APIs', path: '/connectors/apis' },
            { name: 'Mail', path: '/connectors/mail' },
            { name: 'Mailboxes', path: '/connectors/mail/mailboxes' }
          ]
        },
        { name: 'Staff & RBAC', path: '/staff', icon: Users,
          subItems: [
            { name: 'Members', path: '/staff/members' },
            { name: 'RBAC', path: '/staff/rbac' },
            { name: 'My Account', path: '/staff/account' }
          ]
        },
        { name: 'Email Templates', path: '/email-templates', icon: MailOpen },
        { name: 'Email Logs', path: '/email-logs', icon: Mail },
        { name: 'Activity Log', path: '/activity', icon: History },
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    },
  ];

  return (
    <div className="w-64 border-r border-border h-screen bg-background flex flex-col fixed z-10">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img src="/camos.png" alt="CAMOS Logo" className="w-12 h-12 object-contain" />
          <div>
            <p className="text-[10px] text-muted-foreground leading-tight">Client Administration &<br/>Management Operations System</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {sections.map((section, si) => (
          <div key={si} className={section.label ? 'mt-2' : ''}>
            {section.label && (
              <div className="px-6 pt-4 pb-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{section.label}</span>
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
        <div className="mt-2">
          <div className="px-6 pt-4 pb-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Quick Links</span>
          </div>
          <Link
            to="/launchpad"
            className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${location.pathname === '/launchpad' ? 'bg-foreground/5 font-medium border-r-2 border-foreground' : 'text-muted-foreground hover:bg-foreground/[0.02]'}`}
          >
            <ExternalLink className="w-4 h-4" /> Internal Tools
          </Link>
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <Link to="/staff/account" className="flex flex-col hover:opacity-80 transition-opacity">
            <span className="font-medium">{getStoredClaims()?.email?.split('@')[0] || 'Admin User'}</span>
            <span className="text-xs text-muted-foreground">{getStoredClaims()?.role || 'Super Admin'}</span>
          </Link>
          <button onClick={logout} className="p-2 text-muted-foreground hover:text-foreground cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Page({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="ml-64 p-8 min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-light">{title}</h2>
      </div>
      {children}
    </div>
  );
}
