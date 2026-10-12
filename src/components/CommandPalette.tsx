import React, { useState, useEffect, useRef } from 'react';
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

interface CommandItem {
  id: string;
  name: string;
  description: string;
  category: 'Pages' | 'Actions' | 'Tools';
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
  keywords?: string[];
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

  const commands: CommandItem[] = [
    // Pages
    { id: 'dash', name: 'Dashboard', description: 'Real-time telemetry, MRR & node health', category: 'Pages', path: '/', icon: Activity, keywords: ['overview', 'mrr', 'stats'] },
    { id: 'notif', name: 'Notifications', description: 'System alerts and events', category: 'Pages', path: '/notifications', icon: Bell },
    { id: 'reports', name: 'Reports & Revenue', description: 'Financial metrics & growth analysis', category: 'Pages', path: '/reports', icon: BarChart3, keywords: ['finance', 'revenue', 'analytics'] },
    { id: 'customers', name: 'Customer Accounts', description: 'Client profiles, emails & services', category: 'Pages', path: '/customers', icon: Users, keywords: ['users', 'clients'] },
    { id: 'tickets', name: 'Support Tickets', description: 'Customer tickets & helpdesk', category: 'Pages', path: '/tickets', icon: LifeBuoy, keywords: ['support', 'messages', 'help'] },
    { id: 'billing', name: 'Billing & Invoices', description: 'Manage invoices, automations & tax rates', category: 'Pages', path: '/billing', icon: DollarSign, keywords: ['invoices', 'stripe', 'payments'] },
    { id: 'products', name: 'Product Catalog', description: 'Configure compute, storage & retail plans', category: 'Pages', path: '/products', icon: HardDrive, keywords: ['plans', 'pricing', 'hardware'] },
    { id: 'coupons', name: 'Coupons & Promos', description: 'Discount codes and incentives', category: 'Pages', path: '/coupons', icon: Tag, keywords: ['discounts', 'promotions'] },
    { id: 'services', name: 'Active Services', description: 'Provisioned cloud & dedicated servers', category: 'Pages', path: '/services', icon: Server, keywords: ['instances', 'vps', 'dedicated', 'sftp'] },
    { id: 'jobs', name: 'Provisioning Queue', description: 'Background job worker execution status', category: 'Pages', path: '/jobs', icon: ListTree, keywords: ['queue', 'tasks', 'workers'] },
    { id: 'forms', name: 'Service Forms', description: 'Dynamic order form builders', category: 'Pages', path: '/forms', icon: FileText },
    { id: 'staff', name: 'Staff & RBAC', description: 'Team members, roles and permissions', category: 'Pages', path: '/staff', icon: Shield, keywords: ['roles', 'permissions', 'admin'] },
    { id: 'email-tpl', name: 'Email Templates', description: 'Transactional email designs', category: 'Pages', path: '/email-templates', icon: MailOpen },
    { id: 'email-logs', name: 'Email Logs', description: 'Audit history of outbound mail', category: 'Pages', path: '/email-logs', icon: Mail },
    { id: 'activity', name: 'Activity Log', description: 'Platform audit trails & staff actions', category: 'Pages', path: '/activity', icon: History, keywords: ['audit', 'history'] },
    { id: 'blog', name: 'Blog Articles', description: 'Editorial and release news', category: 'Pages', path: '/blog', icon: FileText },
    { id: 'settings', name: 'System Settings', description: 'Platform credentials & environment', category: 'Pages', path: '/settings', icon: Settings },
    
    // Actions
    { id: 'act-prov', name: 'Provision New Service', description: 'Manually allocate a server or storage account', category: 'Actions', path: '/services/new', icon: Plus },
    { id: 'act-prod', name: 'Create Product Plan', description: 'Add a new retail hosting configuration', category: 'Actions', path: '/products/new', icon: Plus },
    { id: 'act-ticket', name: 'Open Support Ticket', description: 'Create internal or customer ticket', category: 'Actions', path: '/tickets/new', icon: Plus },
    { id: 'act-explain', name: explainMode ? 'Disable UI Explanations' : 'Enable UI Explanations (Help Mode)', description: 'Toggle interactive ? boxes across CAMOS', category: 'Actions', action: toggleExplainMode, icon: HelpCircle },
    
    // Tools
    { id: 'launchpad', name: 'Internal Launchpad', description: 'Quick access to sovereign internal tooling', category: 'Tools', path: '/launchpad', icon: ExternalLink },
  ];

  const filtered = commands.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords?.some(k => k.includes(q))
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
        }
      }
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          const item = filtered[selectedIndex];
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-150">
      <div
        className="w-full max-w-xl bg-background border border-border shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-border bg-foreground/[0.02]">
          <Search className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or jump to page... (e.g. Invoices, Tickets, MRR)"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full py-3.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          <kbd className="hidden sm:inline-flex text-[10px] uppercase font-mono px-1.5 py-0.5 border border-border rounded text-muted-foreground bg-foreground/5">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
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
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                    isSelected ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:bg-foreground/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isSelected ? 'bg-foreground text-background' : 'bg-foreground/5 text-muted-foreground'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-xs text-foreground truncate">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{item.description}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground/60 px-1.5 py-0.5 rounded border border-border/50 shrink-0 ml-2">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-border bg-foreground/[0.02] flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Use <kbd className="font-mono text-[10px] px-1 py-0.5 border rounded">↑</kbd> <kbd className="font-mono text-[10px] px-1 py-0.5 border rounded">↓</kbd> to navigate</span>
            <span>•</span>
            <span><kbd className="font-mono text-[10px] px-1 py-0.5 border rounded">↵</kbd> to select</span>
          </div>
          <span className="font-mono text-[10px]">CAMOS v2.4</span>
        </div>
      </div>
    </div>
  );
}
