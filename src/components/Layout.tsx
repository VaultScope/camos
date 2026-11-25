import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext, memo } from 'react';
import { Link, useLocation, useNavigate, useInRouterContext } from 'react-router-dom';
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
  ChevronRight,
  Sparkles,
  MessageSquare,
  Menu,
  X,
  Sun,
  Moon,
  Keyboard,
} from 'lucide-react';
import { getStoredClaims, logout, hasPermission, permissionSatisfies, syncStoredPermissions } from '../lib/auth';
import { useApi } from '../lib/hooks';
import { isSafeHttpUrl } from '../lib/url';
import { prefetchRoute } from '../lib/routePrefetch';
import type { InternalTool, Role, Staff } from '../lib/types';
import { CommandPalette } from './CommandPalette';
import { useExplainMode } from './HelpTooltip';

interface MobileNavContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MobileNavContext = createContext<MobileNavContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export function useMobileNav() {
  return useContext(MobileNavContext);
}

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle]
  );

  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>;
}

export const SidebarItem = memo(function SidebarItem({
  link,
  location,
  isExpanded,
  onToggle,
  onNavigate,
}: {
  link: any;
  location: any;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const isActive =
    location.pathname === link.path ||
    (link.path !== '/' && location.pathname.startsWith(link.path));

  const handlePrefetch = () => {
    if (link.path) prefetchRoute(link.path);
  };

  return (
    <div className="relative px-2.5 my-0.5">
      {link.subItems ? (
        <button
          type="button"
          onClick={onToggle}
          onMouseEnter={handlePrefetch}
          onFocus={handlePrefetch}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm rounded-xl transition-colors duration-150 cursor-pointer ${
            isActive
              ? 'bg-foreground/[0.08] font-medium text-foreground shadow-2xs'
              : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <link.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{link.name}</span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-150 shrink-0 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      ) : (
        <Link
          to={link.path}
          onClick={onNavigate}
          onMouseEnter={handlePrefetch}
          onFocus={handlePrefetch}
          className={`flex items-center justify-between px-3.5 py-2.5 text-sm rounded-xl transition-colors duration-150 ${
            isActive
              ? 'bg-foreground/[0.08] font-medium text-foreground shadow-2xs'
              : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <link.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{link.name}</span>
          </div>
          {link.badge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-foreground/10 text-muted-foreground">
              {link.badge}
            </span>
          )}
        </Link>
      )}

      {link.subItems && (
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-150 ease-out ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="ml-5 pl-3 border-l border-border/80 py-1 my-1 space-y-0.5">
            {link.subItems.map((sub: any) => {
              const isSubActive = location.pathname === sub.path;
              return (
                <Link
                  key={sub.name}
                  to={sub.path}
                  onClick={onNavigate}
                  onMouseEnter={() => prefetchRoute(sub.path)}
                  onFocus={() => prefetchRoute(sub.path)}
                  className={`block text-xs px-3 py-1.5 rounded-lg transition-colors duration-150 ${
                    isSubActive
                      ? 'bg-foreground/[0.07] text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
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
});

export function Sidebar() {
  const location = useLocation();
  const { isOpen, close } = useMobileNav();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const { data: internalTools } = useApi<InternalTool[]>('/admin/internal-tools');
  const { data: roles } = useApi<Role[]>('/admin/staff/roles');
  const { data: myProfile } = useApi<(Staff & { role_name?: string; permissions?: string[] })>('/admin/staff/me');

  // Auto-close mobile drawer whenever route changes
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  const claims = getStoredClaims();
  const currentRole = roles?.find((r) => r.name === (myProfile?.role_name || claims?.role));
  const resolvedPerms = myProfile?.permissions || currentRole?.permissions || claims?.permissions;

  useEffect(() => {
    if (Array.isArray(resolvedPerms) && resolvedPerms.length > 0) {
      syncStoredPermissions(myProfile?.role_name || currentRole?.name || claims?.role, resolvedPerms);
    }
  }, [resolvedPerms, myProfile?.role_name, currentRole?.name, claims?.role]);

  const hasResolvedPermissions = Boolean(
    Array.isArray(myProfile?.permissions) || currentRole || Array.isArray(claims?.permissions)
  );
  const effectiveRoleName = myProfile?.role_name || claims?.role || '';
  const userPermissions =
    effectiveRoleName === 'Owner' ||
    effectiveRoleName === 'Super Admin' ||
    resolvedPerms?.includes('*')
      ? ['*']
      : resolvedPerms || [];

  const visibleTools =
    internalTools?.filter(
      (t) =>
        permissionSatisfies(userPermissions, t.required_permission) &&
        isSafeHttpUrl(t.url)
    ) || [];

  const canViewNavPermission = (permission?: string) => {
    if (!permission) return true;
    // Allow standalone Sidebar unit tests without claims; AuthGuard blocks unauthenticated access in App
    if (!claims) return true;
    if (userPermissions.includes('*')) return true;
    if (!hasResolvedPermissions) return false;
    return permissionSatisfies(userPermissions, permission);
  };

  const toggleItem = useCallback((name: string) => {
    setExpandedItem((prev) => (prev === name ? null : name));
  }, []);

  const rawSections: Array<{
    label: string | null;
    items: Array<{
      name: string;
      path: string;
      icon: any;
      permission?: string;
      subItems?: Array<{ name: string; path: string; permission?: string }>;
    }>;
  }> = [
    {
      label: null,
      items: [
        { name: 'Dashboard', path: '/', icon: Activity },
        { name: 'Notifications', path: '/notifications', icon: Bell, permission: 'notifications.view' },
        { name: 'Reports', path: '/reports', icon: BarChart3, permission: 'reports.view' },
      ],
    },
    {
      label: 'Content',
      items: [{ name: 'Blog', path: '/blog', icon: FileText, permission: 'blog.view' }],
    },
    {
      label: 'Customers',
      items: [
        { name: 'Accounts', path: '/customers', icon: Users, permission: 'customers.view' },
        {
          name: 'Support Tickets',
          path: '/tickets',
          icon: LifeBuoy,
          permission: 'tickets.view',
          subItems: [
            { name: 'All Tickets', path: '/tickets', permission: 'tickets.view' },
            { name: 'New Ticket', path: '/tickets/new', permission: 'tickets.reply' },
            { name: 'Departments', path: '/tickets/departments', permission: 'tickets.manage' },
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
            { name: 'Insights', path: '/billing/insights', permission: 'billing.view' },
            { name: 'Invoices', path: '/billing/invoices', permission: 'invoices.view' },
            { name: 'Automations', path: '/billing/automations', permission: 'billing.manage' },
            { name: 'Tax Rates', path: '/billing/tax-rates', permission: 'tax.manage' },
          ],
        },
        {
          name: 'Products',
          path: '/products',
          icon: HardDrive,
          subItems: [
            { name: 'All Products', path: '/products', permission: 'products.view' },
            { name: 'New Product', path: '/products/new', permission: 'products.create' },
            { name: 'Insights', path: '/products/insights', permission: 'products.view' },
          ],
        },
        { name: 'Coupons', path: '/coupons', icon: Tag, permission: 'coupons.manage' },
        { name: 'Partners', path: '/partners', icon: Sparkles, permission: 'products.view' },
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
            { name: 'All Services', path: '/services', permission: 'services.view' },
            { name: 'New Service', path: '/services/new', permission: 'services.manage' },
          ],
        },
        { name: 'Provisioning Queue', path: '/jobs', icon: ListTree, permission: 'jobs.view' },
        { name: 'Service Forms', path: '/forms', icon: FileText, permission: 'forms.manage' },
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
            { name: 'Members', path: '/staff/members', permission: 'staff.view' },
            { name: 'RBAC', path: '/staff/rbac', permission: 'rbac.manage' },
            { name: 'My Account', path: '/staff/account' },
          ],
        },
        { name: 'Email Templates', path: '/email-templates', icon: MailOpen, permission: 'templates.manage' },
        { name: 'Email Logs', path: '/email-logs', icon: Mail, permission: 'email_logs.view' },
        { name: 'Activity Log', path: '/activity', icon: History, permission: 'activity.view' },
        { name: 'Settings', path: '/settings', icon: Settings, permission: 'settings.manage' },
      ],
    },
  ];

  const sections = rawSections
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => canViewNavPermission(item.permission))
        .map((item) =>
          item.subItems
            ? { ...item, subItems: item.subItems.filter((sub) => canViewNavPermission(sub.permission)) }
            : item
        )
        .filter((item) => !item.subItems || item.subItems.length > 0),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      {/* Mobile / Tablet Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/45 backdrop-blur-xs lg:hidden animate-ui-fade"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Primary navigation"
        className={`w-64 max-w-[82vw] border-r border-border h-dvh bg-background/95 backdrop-blur-md flex flex-col fixed inset-y-0 left-0 z-40 select-none transition-transform duration-200 ease-out rounded-r-2xl lg:rounded-none shadow-2xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-2">
          <Link to="/" onClick={close} className="flex items-center gap-3 min-w-0">
            <img
              src="/camos.png"
              alt="CAMOS Logo"
              className="w-9 h-9 object-contain shrink-0 rounded-xl"
              decoding="async"
            />
            <div className="min-w-0">
              <h1 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5">
                CAMOS{' '}
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-foreground/10 text-muted-foreground">
                  v2.5
                </span>
              </h1>
              <p className="text-[10px] text-muted-foreground truncate">Operations Control Plane</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={close}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {sections.map((section, si) => (
            <div key={si} className={section.label ? 'mt-3' : ''}>
              {section.label && (
                <div className="px-5 pt-2 pb-1">
                  <span className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-widest">
                    {section.label}
                  </span>
                </div>
              )}
              {section.items.map((link) => (
                <SidebarItem
                  key={link.name}
                  link={link}
                  location={location}
                  isExpanded={expandedItem === link.name}
                  onToggle={() => toggleItem(link.name)}
                  onNavigate={close}
                />
              ))}
            </div>
          ))}

          {visibleTools.length > 0 && (
            <div className="mt-3">
              <div className="px-5 pt-2 pb-1">
                <span className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-widest">
                  Internal Tools
                </span>
              </div>
              <div className="px-2.5 space-y-0.5">
                {visibleTools.map((tool) => (
                  <a
                    key={tool.id}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm rounded-xl transition-colors duration-150 text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tool.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 mx-3 border-t border-border/60 pt-3">
            <div className="px-2.5 pb-1">
              <span className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-widest">
                Community
              </span>
            </div>
            <a
              href="https://discord.gg/84kMAY2aKm"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-3 py-2 text-xs rounded-xl transition-colors duration-150 text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
              <span className="truncate">Discord Server</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-40 shrink-0" />
            </a>
          </div>
        </nav>

        <div className="p-3 border-t border-border bg-foreground/[0.015]">
          <div className="flex items-center justify-between text-sm px-2.5 py-2 rounded-xl bg-foreground/[0.03] border border-border/60">
            <Link
              to="/staff/account"
              onClick={close}
              className="flex flex-col hover:opacity-80 transition-opacity min-w-0 mr-2"
            >
              <span className="font-medium text-xs text-foreground truncate">
                {claims?.email?.split('@')[0] || 'Unknown'}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                {claims?.role || 'No Role'}
              </span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-foreground/10 transition-colors shrink-0"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function BreadcrumbLink({
  to,
  children,
  className,
  inRouter,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  inRouter: boolean;
}) {
  if (inRouter) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }
  return <span className={className}>{children}</span>;
}

function useThemeMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next);
      }
      try {
        localStorage.setItem('camos_theme', next ? 'dark' : 'light');
      } catch {
        // Ignore storage quota / private mode issues
      }
      return next;
    });
  }, []);

  return { isDark, toggleTheme };
}

const SHORTCUT_ITEMS = [
  { keys: ['Ctrl', 'K'], label: 'Open Command Palette & Search' },
  { keys: ['?'], label: 'Open Keyboard Shortcuts Guide' },
  { keys: ['Alt', 'H'], label: 'Toggle Interactive UI Hints (Explain Mode)' },
  { keys: ['Alt', 'D'], label: 'Toggle Dark / Light Theme' },
  { keys: ['G', 'D'], label: 'Go to Dashboard' },
  { keys: ['G', 'C'], label: 'Go to Customer Accounts' },
  { keys: ['G', 'S'], label: 'Go to Active Services' },
  { keys: ['G', 'T'], label: 'Go to Support Tickets' },
  { keys: ['G', 'I'], label: 'Go to Billing & Invoices' },
  { keys: ['G', 'P'], label: 'Go to Product Catalog' },
  { keys: ['G', 'R'], label: 'Go to Staff & RBAC' },
  { keys: ['G', 'A'], label: 'Go to Activity Log' },
  { keys: ['G', 'X'], label: 'Go to Global Settings' },
];

function TopNavWithRouter({ title: _title }: { title: string }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const lastChordRef = useRef<{ key: string; time: number } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { explainMode, toggleExplainMode } = useExplainMode();
  const { toggle: toggleMobileNav } = useMobileNav();
  const { isDark, toggleTheme } = useThemeMode();

  // Global keyboard shortcuts (Ctrl+K, Alt+H, Alt+D, ?, and G + <key> navigation chords)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (target && (target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
        return;
      }

      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        toggleExplainMode();
        return;
      }

      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleTheme();
        return;
      }

      if (isEditable || e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape' && isShortcutsOpen) {
        setIsShortcutsOpen(false);
        return;
      }

      const keyLower = e.key.toLowerCase();
      const now = Date.now();
      if (lastChordRef.current && lastChordRef.current.key === 'g' && now - lastChordRef.current.time < 900) {
        lastChordRef.current = null;
        const chordRoutes: Record<string, { path: string; perm?: string }> = {
          d: { path: '/' },
          c: { path: '/customers', perm: 'customers.view' },
          s: { path: '/services', perm: 'services.view' },
          t: { path: '/tickets', perm: 'tickets.view' },
          i: { path: '/billing/invoices', perm: 'invoices.view' },
          p: { path: '/products', perm: 'products.view' },
          r: { path: '/staff/rbac', perm: 'staff.view' },
          a: { path: '/activity', perm: 'activity.view' },
          x: { path: '/settings', perm: 'settings.manage' },
        };
        const match = chordRoutes[keyLower];
        if (match && (!match.perm || hasPermission(match.perm))) {
          e.preventDefault();
          navigate(match.path);
        }
        return;
      }

      if (keyLower === 'g') {
        lastChordRef.current = { key: 'g', time: now };
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, toggleExplainMode, toggleTheme, isShortcutsOpen]);

  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <>
      <header className="sticky top-0 z-20 w-full h-14 bg-background/85 backdrop-blur-md border-b border-border px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* Left: Mobile Drawer Toggle + Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={toggleMobileNav}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 -ml-1 rounded-xl border border-border bg-card text-foreground hover:bg-foreground/[0.05] transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <BreadcrumbLink
              to="/"
              inRouter={true}
              className="hover:text-foreground transition-colors font-semibold shrink-0"
            >
              CAMOS
            </BreadcrumbLink>
            {pathSegments.length > 0 && (
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
            )}
            {pathSegments.map((seg, idx) => {
              const isLast = idx === pathSegments.length - 1;
              const path = `/${pathSegments.slice(0, idx + 1).join('/')}`;
              return (
                <React.Fragment key={path}>
                  {isLast ? (
                    <span className="text-foreground font-semibold capitalize truncate">
                      {seg.replace(/-/g, ' ')}
                    </span>
                  ) : (
                    <>
                      <BreadcrumbLink
                        to={path}
                        inRouter={true}
                        className="hover:text-foreground transition-colors capitalize truncate hidden sm:inline"
                      >
                        {seg}
                      </BreadcrumbLink>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0 hidden sm:inline" />
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Search + Explain Mode + Theme Toggle + API Status */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            aria-label="Quick search"
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs text-muted-foreground bg-foreground/[0.03] hover:bg-foreground/[0.07] hover:text-foreground border border-border rounded-xl transition-colors duration-150 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Search CAMOS...</span>
            <kbd className="hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-foreground/10 border border-border/60">
              Ctrl K
            </kbd>
          </button>

          {/* Explain Mode Toggle */}
          <button
            type="button"
            onClick={toggleExplainMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-colors duration-150 cursor-pointer ${
              explainMode
                ? 'bg-amber-500/15 text-amber-500 border-amber-500/40 shadow-xs'
                : 'text-muted-foreground border-border hover:text-foreground hover:bg-foreground/[0.04]'
            }`}
            title="Toggle interactive help tooltips on all fields and metrics (Alt+H)"
          >
            <HelpCircle className={`w-3.5 h-3.5 shrink-0 ${explainMode ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{explainMode ? 'Help Hints: ON' : 'Explain UI'}</span>
          </button>

          {/* Keyboard Shortcuts Guide */}
          <button
            type="button"
            onClick={() => setIsShortcutsOpen(true)}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] transition-colors duration-150 cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          {/* Theme Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] transition-colors duration-150 cursor-pointer"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* System Heartbeat Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>API Online</span>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {isShortcutsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-ui-fade"
          onClick={() => setIsShortcutsOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 animate-ui-scale"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Keyboard Shortcuts</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-border/60 max-h-[65dvh] overflow-y-auto">
              {SHORTCUT_ITEMS.map((item) => (
                <div key={item.label} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-2 py-0.5 font-mono text-[11px] rounded-md border border-border bg-foreground/5 text-foreground"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TopNavStatic({ title: _title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 w-full h-14 bg-background/85 backdrop-blur-md border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="hover:text-foreground transition-colors font-semibold">CAMOS</span>
      </div>
    </header>
  );
}

export function TopNav({ title }: { title: string }) {
  const inRouter = useInRouterContext();
  if (inRouter) {
    return <TopNavWithRouter title={title} />;
  }
  return <TopNavStatic title={title} />;
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
      <div className="lg:ml-64 px-4 py-8 sm:p-8 min-h-dvh flex items-center justify-center">
        <div className="text-center max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground">
            You do not have the required permissions ({requiredPermission}) to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:ml-64 min-h-dvh flex flex-col min-w-0">
      <TopNav title={title} />
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 flex-1 w-full max-w-[1600px] mx-auto min-w-0">
        <div className="mb-5 sm:mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-light tracking-tight text-foreground truncate">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
