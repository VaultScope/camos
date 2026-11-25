import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Activity,
  Bell,
  BarChart3,
  FileText,
  Users,
  LifeBuoy,
  DollarSign,
  HardDrive,
  Tag,
  Server,
  ListTree,
  MailOpen,
  Mail,
  History,
  Settings,
  Plus,
  ExternalLink,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useExplainMode } from './HelpTooltip';
import { prefetchRoute } from '../lib/routePrefetch';
import { hasPermission } from '../lib/auth';

interface CommandItem {
  id: string;
  name: string;
  description: string;
  category: 'Pages' | 'Actions' | 'Tools';
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
  keywords?: string[];
  permission?: string;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toggleExplainMode, explainMode } = useExplainMode();

  const commands = useMemo<CommandItem[]>(() => {
    const allItems: CommandItem[] = [
      // Pages
      { id: 'dash', name: 'Dashboard', description: 'Real-time telemetry, MRR & node health', category: 'Pages', path: '/', icon: Activity, keywords: ['overview', 'mrr', 'stats'], shortcut: 'G D' },
      { id: 'notif', name: 'Notifications', description: 'System alerts and events', category: 'Pages', path: '/notifications', icon: Bell, permission: 'notifications.view' },
      { id: 'reports', name: 'Reports & Revenue', description: 'Financial metrics & growth analysis', category: 'Pages', path: '/reports', icon: BarChart3, keywords: ['finance', 'revenue', 'analytics'], permission: 'reports.view' },
      { id: 'customers', name: 'Customer Accounts', description: 'Client profiles, emails, impersonation & services', category: 'Pages', path: '/customers', icon: Users, keywords: ['users', 'clients', 'impersonate'], permission: 'customers.view', shortcut: 'G C' },
      { id: 'tickets', name: 'Support Tickets', description: 'Customer tickets & helpdesk', category: 'Pages', path: '/tickets', icon: LifeBuoy, keywords: ['support', 'messages', 'help'], permission: 'tickets.view', shortcut: 'G T' },
      { id: 'billing', name: 'Billing & Invoices', description: 'Manage invoices, automations & tax rates', category: 'Pages', path: '/billing/invoices', icon: DollarSign, keywords: ['invoices', 'stripe', 'payments'], permission: 'invoices.view', shortcut: 'G I' },
      { id: 'billing-insights', name: 'Billing Insights', description: 'Revenue, Stripe balance, and profit analytics', category: 'Pages', path: '/billing/insights', icon: BarChart3, keywords: ['stripe', 'profit', 'analytics'], permission: 'billing.view' },
      { id: 'tax-rates', name: 'Tax Rates', description: 'Configure EU VAT and regional tax rules', category: 'Pages', path: '/billing/tax-rates', icon: DollarSign, keywords: ['vat', 'tax'], permission: 'tax.manage' },
      { id: 'products', name: 'Product Catalog', description: 'Configure compute, storage & retail plans', category: 'Pages', path: '/products', icon: HardDrive, keywords: ['plans', 'pricing', 'hardware'], permission: 'products.view', shortcut: 'G P' },
      { id: 'coupons', name: 'Coupons & Promos', description: 'Discount codes and incentives', category: 'Pages', path: '/coupons', icon: Tag, keywords: ['discounts', 'promotions'], permission: 'coupons.manage' },
      { id: 'services', name: 'Active Services', description: 'Provisioned cloud & dedicated servers', category: 'Pages', path: '/services', icon: Server, keywords: ['instances', 'vps', 'dedicated', 'sftp'], permission: 'services.view', shortcut: 'G S' },
      { id: 'jobs', name: 'Provisioning Queue', description: 'Background job worker execution status', category: 'Pages', path: '/jobs', icon: ListTree, keywords: ['queue', 'tasks', 'workers'], permission: 'jobs.view' },
      { id: 'forms', name: 'Service Forms', description: 'Dynamic order form builders', category: 'Pages', path: '/forms', icon: FileText, permission: 'forms.manage' },
      { id: 'staff', name: 'Staff & RBAC', description: 'Team members, roles and permissions', category: 'Pages', path: '/staff', icon: Shield, keywords: ['roles', 'permissions', 'admin'], permission: 'staff.view', shortcut: 'G R' },
      { id: 'email-tpl', name: 'Email Templates', description: 'Transactional email designs', category: 'Pages', path: '/email-templates', icon: MailOpen, permission: 'templates.manage' },
      { id: 'email-logs', name: 'Email Logs', description: 'Audit history of outbound mail', category: 'Pages', path: '/email-logs', icon: Mail, permission: 'email_logs.view' },
      { id: 'activity', name: 'Activity Log', description: 'Platform audit trails & staff actions', category: 'Pages', path: '/activity', icon: History, keywords: ['audit', 'history'], permission: 'activity.view', shortcut: 'G A' },
      { id: 'blog', name: 'Blog Articles', description: 'Editorial and release news', category: 'Pages', path: '/blog', icon: FileText, permission: 'blog.view' },
      { id: 'settings', name: 'System Settings', description: 'Platform credentials & environment', category: 'Pages', path: '/settings', icon: Settings, permission: 'settings.manage', shortcut: 'G X' },

      // Actions
      { id: 'act-prov', name: 'Provision New Service', description: 'Manually allocate a server or storage account', category: 'Actions', path: '/services/new', icon: Plus, permission: 'services.manage' },
      { id: 'act-inv', name: 'Create New Invoice', description: 'Generate a customer invoice with line items', category: 'Actions', path: '/billing/invoices?new=true', icon: Plus, permission: 'invoices.create' },
      { id: 'act-prod', name: 'Create Product Plan', description: 'Add a new retail hosting configuration', category: 'Actions', path: '/products/new', icon: Plus, permission: 'products.create' },
      { id: 'act-ticket', name: 'Open Support Ticket', description: 'Create internal or customer ticket', category: 'Actions', path: '/tickets/new', icon: Plus, permission: 'tickets.reply' },
      { id: 'act-explain', name: explainMode ? 'Disable UI Explanations' : 'Enable UI Explanations (Help Mode)', description: 'Toggle interactive ? boxes across CAMOS', category: 'Actions', action: toggleExplainMode, icon: HelpCircle, shortcut: 'Alt H' },

      // Tools
      { id: 'launchpad', name: 'Internal Launchpad', description: 'Quick access to sovereign internal tooling', category: 'Tools', path: '/launchpad', icon: ExternalLink },
    ];
    return allItems.filter((item) => !item.permission || hasPermission(item.permission));
  }, [explainMode, toggleExplainMode]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords?.some((k) => k.includes(q))
    );
  }, [commands, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[selectedIndex];
        if (item) {
          if (item.action) {
            item.action();
          } else if (item.path) {
            navigate(item.path);
          }
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-24 px-3 sm:px-4 bg-black/50 backdrop-blur-xs animate-ui-fade"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-ui-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-border bg-foreground/[0.02]">
          <Search className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or jump to page... (e.g. Invoices, Tickets, MRR)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full py-3.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          <kbd className="hidden sm:inline-flex text-[10px] uppercase font-mono px-2 py-0.5 border border-border rounded-lg text-muted-foreground bg-foreground/5">
            ESC
          </kbd>
        </div>

        <div className="max-h-[55dvh] sm:max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching pages or actions found for "{query}".
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.action) item.action();
                    else if (item.path) navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => {
                    setSelectedIndex(index);
                    if (item.path) prefetchRoute(item.path);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-colors duration-100 cursor-pointer ${
                    isSelected
                      ? 'bg-foreground/10 text-foreground'
                      : 'text-muted-foreground hover:bg-foreground/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-foreground text-background'
                          : 'bg-foreground/5 text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-xs text-foreground truncate">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-foreground/10 border border-border/60 text-muted-foreground">
                        {item.shortcut}
                      </kbd>
                    )}
                    <span className="text-[10px] font-mono uppercase text-muted-foreground/70 px-2 py-0.5 rounded-full border border-border/60">
                      {item.category}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-border bg-foreground/[0.02] flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Use <kbd className="font-mono text-[10px] px-1.5 py-0.5 border rounded-md">↑</kbd>{' '}
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 border rounded-md">↓</kbd> to navigate
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 border rounded-md">↵</kbd> to select
            </span>
          </div>
          <span className="font-mono text-[10px] shrink-0">CAMOS v2.5</span>
        </div>
      </div>
    </div>
  );
}
