import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Server, HardDrive, DollarSign, Plug, Activity, LogOut, LifeBuoy, ListTree, Tag, ExternalLink, Mail, FileText, ChevronDown, Sliders } from 'lucide-react';

function SidebarItem({ link, location }: { link: any, location: any }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
  const isExpanded = isActive || isHovered;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link 
        to={link.subItems ? link.subItems[0].path : link.path} 
        className={`flex items-center justify-between px-6 py-3 text-sm transition-colors ${isActive ? 'bg-foreground/5 font-medium border-r-2 border-foreground' : 'text-muted-foreground hover:bg-foreground/[0.02]'}`}
      >
        <div className="flex items-center gap-3">
          <link.icon className="w-4 h-4" />
          {link.name}
        </div>
        {link.subItems && (
           <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        )}
      </Link>
      
      {link.subItems && (
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
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
  const links = [
    { name: 'Internal Tools', path: '/launchpad', icon: ExternalLink },
    { name: 'Dashboard', path: '/', icon: Activity },
    { name: 'Customers', path: '/customers', icon: Users },
    { 
      name: 'Support Tickets', path: '/tickets', icon: LifeBuoy,
      subItems: [
        { name: 'All Tickets', path: '/tickets' },
        { name: 'New Ticket', path: '/tickets/new' },
        { name: 'Departments', path: '/tickets/departments' }
      ]
    },
    { 
      name: 'Billing & Automation', path: '/billing', icon: DollarSign,
      subItems: [
        { name: 'Insights', path: '/billing/insights' },
        { name: 'Invoices', path: '/billing/invoices' },
        { name: 'Automations', path: '/billing/automations' },
        { name: 'Tax Rates', path: '/billing/tax-rates' }
      ]
    },
    { name: 'Coupons & Promos', path: '/coupons', icon: Tag },
    {
      name: 'Manage Services', path: '/services', icon: Server,
      subItems: [
        { name: 'All Services', path: '/services' },
        { name: 'New Service', path: '/services/new' }
      ]
    },
    {
      name: 'Products & Margins', path: '/products', icon: HardDrive,
      subItems: [
        { name: 'All Products', path: '/products' },
        { name: 'New Product', path: '/products/new' },
        { name: 'Insights', path: '/products/insights' }
      ]
    },
    { name: 'Service Forms', path: '/forms', icon: FileText },
    { name: 'Config Options', path: '/config-options', icon: Sliders },
    { name: 'Provisioning Queue', path: '/jobs', icon: ListTree },
    { name: 'Email Logs', path: '/email-logs', icon: Mail },
    { 
      name: 'API Connectors', path: '/connectors', icon: Plug,
      subItems: [
        { name: 'Authentication', path: '/connectors/authentication' },
        { name: 'Billing', path: '/connectors/billing' },
        { name: 'APIs', path: '/connectors/apis' },
        { name: 'Mail', path: '/connectors/mail' },
        { name: 'Mailboxes', path: '/connectors/mail/mailboxes' }
      ]
    },
    { 
      name: 'Staff & RBAC', path: '/staff', icon: Users,
      subItems: [
        { name: 'Members', path: '/staff/members' },
        { name: 'RBAC', path: '/staff/rbac' }
      ]
    },
  ];

  return (
    <div className="w-64 border-r border-border h-screen bg-background flex flex-col fixed z-10">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-medium tracking-tight">CAMOS</h1>
        <p className="text-[10px] text-muted-foreground mt-1 leading-tight">Client Administration &<br/>Management Operations System</p>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {links.map(link => (
          <SidebarItem key={link.name} link={link} location={location} />
        ))}
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col">
            <span className="font-medium">Admin User</span>
            <span className="text-xs text-muted-foreground">Super Admin</span>
          </div>
          <button className="p-2 text-muted-foreground hover:text-foreground">
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
