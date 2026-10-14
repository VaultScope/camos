import { useState } from 'react';
import { Page } from '../components/Layout';
import { 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  RefreshCw, 
  Search, 
  Sparkles, 
  TrendingUp, 
  MousePointerClick, 
  Users, 
  Clock, 
  Trash2, 
  Edit3,
  Coins,
  Percent,
  HardDrive
} from 'lucide-react';
import { useApi } from '../lib/hooks';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import type { PartnerWithProduct, Product } from '../lib/types';

export default function Partners() {
  const { data: partners, loading, refetch } = useApi<PartnerWithProduct[]>('/admin/partners');
  const { data: products } = useApi<Product[]>('/admin/products');
  const toast = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerWithProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Quick Cut & Quotas Modal State
  const [quickCutPartner, setQuickCutPartner] = useState<PartnerWithProduct | null>(null);
  const [quickCutForm, setQuickCutForm] = useState({
    commission_type: 'none' as 'percent' | 'fixed' | 'none',
    commission_rate: '' as string | number,
    commission_fixed_eur: '' as string | number,
    trial_quota_gb_override: '' as string | number,
  });

  const parseCommissionNum = (val: string | number | null | undefined): number | null => {
    if (val === '' || val === null || val === undefined) return null;
    const parsed = parseFloat(String(val).replace(',', '.'));
    return isNaN(parsed) ? null : parsed;
  };

  const [form, setForm] = useState({
    name: '',
    slug: '',
    product_id: '',
    trial_days_override: '' as string | number,
    trial_quota_gb_override: '' as string | number,
    quota_gb_override: '' as string | number,
    badge_text: '',
    headline: '',
    description: '',
    limit_one_per_user: true,
    active: true,
    commission_type: 'none' as 'percent' | 'fixed' | 'none',
    commission_rate: '' as string | number,
    commission_fixed_eur: '' as string | number,
  });

  const handleOpenCreateModal = () => {
    setEditingPartner(null);
    setForm({
      name: '',
      slug: '',
      product_id: products && products.length > 0 ? products[0].id : '',
      trial_days_override: '',
      trial_quota_gb_override: '',
      quota_gb_override: '',
      badge_text: 'Community Special',
      headline: '',
      description: '',
      limit_one_per_user: true,
      active: true,
      commission_type: 'none',
      commission_rate: '',
      commission_fixed_eur: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (partner: PartnerWithProduct) => {
    setEditingPartner(partner);
    setForm({
      name: partner.name,
      slug: partner.slug,
      product_id: partner.product_id,
      trial_days_override: partner.trial_days_override !== null && partner.trial_days_override !== undefined 
        ? partner.trial_days_override 
        : '',
      trial_quota_gb_override: partner.trial_quota_gb_override !== null && partner.trial_quota_gb_override !== undefined 
        ? partner.trial_quota_gb_override 
        : '',
      quota_gb_override: partner.quota_gb_override !== null && partner.quota_gb_override !== undefined 
        ? partner.quota_gb_override 
        : '',
      badge_text: partner.badge_text || '',
      headline: partner.headline || '',
      description: partner.description || '',
      limit_one_per_user: partner.limit_one_per_user !== false,
      active: partner.active,
      commission_type: (partner.commission_type as any) || 'none',
      commission_rate: partner.commission_rate !== null && partner.commission_rate !== undefined ? partner.commission_rate : '',
      commission_fixed_eur: partner.commission_fixed_eur !== null && partner.commission_fixed_eur !== undefined ? partner.commission_fixed_eur : '',
    });
    setShowModal(true);
  };

  const handleNameChange = (name: string) => {
    // Auto generate slug if creating and slug hasn't been manually diverged
    if (!editingPartner) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setForm(prev => ({ ...prev, name, slug: generatedSlug }));
    } else {
      setForm(prev => ({ ...prev, name }));
    }
  };

  const handleSave = async () => {
    if (saving) return;
    if (!form.name.trim()) {
      toast.error('Partner name is required.');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('URL slug is required.');
      return;
    }
    if (!form.product_id) {
      toast.error('Please select a linked product.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        product_id: form.product_id,
        trial_days_override: form.trial_days_override !== '' && form.trial_days_override !== undefined
          ? parseInt(String(form.trial_days_override), 10)
          : null,
        trial_quota_gb_override: form.trial_quota_gb_override !== '' && form.trial_quota_gb_override !== undefined
          ? parseInt(String(form.trial_quota_gb_override), 10)
          : null,
        quota_gb_override: null,
        badge_text: form.badge_text.trim() || null,
        headline: form.headline.trim() || null,
        description: form.description.trim() || null,
        limit_one_per_user: form.limit_one_per_user,
        active: form.active,
        commission_type: form.commission_type,
        commission_rate: form.commission_type === 'percent'
          ? parseCommissionNum(form.commission_rate)
          : null,
        commission_fixed_eur: form.commission_type === 'fixed'
          ? parseCommissionNum(form.commission_fixed_eur)
          : null,
      };

      if (editingPartner) {
        await api.put(`/admin/partners/${editingPartner.id}`, payload);
        toast.success(`Partner "${form.name}" updated successfully.`);
      } else {
        await api.post('/admin/partners', payload);
        toast.success(`Partner campaign "${form.name}" created.`);
      }

      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error(`Failed to save partner: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenQuickCut = (partner: PartnerWithProduct) => {
    setQuickCutPartner(partner);
    setQuickCutForm({
      commission_type: (partner.commission_type as any) || 'none',
      commission_rate: partner.commission_rate !== null && partner.commission_rate !== undefined ? partner.commission_rate : '',
      commission_fixed_eur: partner.commission_fixed_eur !== null && partner.commission_fixed_eur !== undefined ? partner.commission_fixed_eur : '',
      trial_quota_gb_override: partner.trial_quota_gb_override !== null && partner.trial_quota_gb_override !== undefined ? partner.trial_quota_gb_override : '',
    });
  };

  const handleSaveQuickCut = async () => {
    if (!quickCutPartner || saving) return;
    setSaving(true);
    try {
      const payload = {
        name: quickCutPartner.name,
        slug: quickCutPartner.slug,
        product_id: quickCutPartner.product_id,
        trial_days_override: quickCutPartner.trial_days_override,
        trial_quota_gb_override: quickCutForm.trial_quota_gb_override !== '' && quickCutForm.trial_quota_gb_override !== undefined
          ? parseInt(String(quickCutForm.trial_quota_gb_override), 10)
          : null,
        quota_gb_override: null,
        badge_text: quickCutPartner.badge_text,
        headline: quickCutPartner.headline,
        description: quickCutPartner.description,
        limit_one_per_user: quickCutPartner.limit_one_per_user !== false,
        active: quickCutPartner.active,
        commission_type: quickCutForm.commission_type,
        commission_rate: quickCutForm.commission_type === 'percent'
          ? parseCommissionNum(quickCutForm.commission_rate)
          : null,
        commission_fixed_eur: quickCutForm.commission_type === 'fixed'
          ? parseCommissionNum(quickCutForm.commission_fixed_eur)
          : null,
      };

      await api.put(`/admin/partners/${quickCutPartner.id}`, payload);
      toast.success(`Partner cut & quotas for "${quickCutPartner.name}" updated successfully.`);
      setQuickCutPartner(null);
      refetch();
    } catch (err) {
      toast.error(`Failed to update partner: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (partner: PartnerWithProduct) => {
    try {
      await api.put(`/admin/partners/${partner.id}`, {
        name: partner.name,
        slug: partner.slug,
        product_id: partner.product_id,
        trial_days_override: partner.trial_days_override,
        trial_quota_gb_override: partner.trial_quota_gb_override,
        quota_gb_override: partner.quota_gb_override,
        badge_text: partner.badge_text,
        headline: partner.headline,
        description: partner.description,
        limit_one_per_user: partner.limit_one_per_user !== false,
        active: !partner.active,
        commission_type: partner.commission_type || 'none',
        commission_rate: partner.commission_rate,
        commission_fixed_eur: partner.commission_fixed_eur,
      });
      refetch();
    } catch (err) {
      toast.error(`Failed to update status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (partner: PartnerWithProduct) => {
    if (!confirm(`Are you sure you want to delete partner "${partner.name}"?`)) return;
    try {
      await api.delete(`/admin/partners/${partner.id}`);
      toast.success(`Partner "${partner.name}" deleted.`);
      refetch();
    } catch (err) {
      toast.error(`Failed to delete partner: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCopyLink = (slug: string) => {
    const storefrontUrl = window.location.origin.includes('admin')
      ? window.location.origin.replace('admin.', '')
      : 'https://vaultscope.de';
    const link = `${storefrontUrl}/ps/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedSlug(slug);
    toast.success('Partner landing link copied to clipboard!');
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredPartners = (partners || []).filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && p.active) ||
      (filterStatus === 'inactive' && !p.active);
    return matchesSearch && matchesStatus;
  });

  const totalClicks = (partners || []).reduce((acc, p) => acc + (p.clicks || 0), 0);
  const totalConversions = (partners || []).reduce((acc, p) => acc + (p.conversions || 0), 0);
  const totalPayouts = (partners || []).reduce((acc, p) => acc + (parseFloat(String(p.earned_commission_eur || 0))), 0);
  const overallCr = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0.0';

  return (
    <Page title="Partner Campaigns">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage partner sponsorship landing pages (<code className="text-xs bg-muted/40 px-1 py-0.5 rounded">/ps/:slug</code>) and trial promotions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/10 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Partner Link
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="border border-border p-5 bg-background">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Active Partners</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold">
            {(partners || []).filter(p => p.active).length}{' '}
            <span className="text-xs font-normal text-muted-foreground">/ {(partners || []).length} total</span>
          </div>
        </div>

        <div className="border border-border p-5 bg-background">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Clicks</span>
            <MousePointerClick className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
        </div>

        <div className="border border-border p-5 bg-background">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Conversions</span>
            <Sparkles className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-500">{totalConversions.toLocaleString()}</div>
        </div>

        <div className="border border-border p-5 bg-background">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-500">{overallCr}%</div>
        </div>

        <div className="border border-border p-5 bg-background">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Partner Payouts</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-500">€{totalPayouts.toFixed(2)}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search partners by name, slug or product..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border bg-background text-sm focus:outline-none focus:border-foreground/40"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground/40"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Partner Table */}
      <div className="border border-border bg-background overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/10 text-muted-foreground text-xs uppercase tracking-wider">
              <th className="px-5 py-3 font-medium">Partner</th>
              <th className="px-5 py-3 font-medium">Landing URL</th>
              <th className="px-5 py-3 font-medium">Linked Product & Trial</th>
              <th className="px-5 py-3 font-medium">Partner Cut</th>
              <th className="px-5 py-3 font-medium text-center">Clicks</th>
              <th className="px-5 py-3 font-medium text-center">Conversions</th>
              <th className="px-5 py-3 font-medium text-center">CR</th>
              <th className="px-5 py-3 font-medium text-center">Payout</th>
              <th className="px-5 py-3 font-medium text-center">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={10} className="px-5 py-8 text-center text-muted-foreground">
                  Loading partner campaigns...
                </td>
              </tr>
            ) : filteredPartners.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-8 text-center text-muted-foreground">
                  No partner campaigns found. Click "New Partner Link" to set up your first campaign.
                </td>
              </tr>
            ) : (
              filteredPartners.map(p => {
                const effectiveTrial = p.trial_days_override || p.product_trial_days || 0;
                const cr = p.clicks > 0 ? ((p.conversions / p.clicks) * 100).toFixed(1) : '0.0';

                return (
                  <tr key={p.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">{p.name}</div>
                      {p.badge_text && (
                        <div className="inline-block mt-1 text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {p.badge_text}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-foreground/80 bg-muted/20 px-2 py-1 rounded border border-border/50">
                          /ps/{p.slug}
                        </span>
                        <button
                          onClick={() => handleCopyLink(p.slug)}
                          title="Copy full link"
                          className="p-1 hover:bg-muted/20 text-muted-foreground hover:text-foreground cursor-pointer rounded"
                        >
                          {copiedSlug === p.slug ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={`https://vaultscope.de/ps/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Preview in new tab"
                          className="p-1 hover:bg-muted/20 text-muted-foreground hover:text-foreground rounded"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-xs">{p.product_name}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          €{(parseFloat(p.product_price) * 1.19).toFixed(2)}/mo
                        </span>
                        {effectiveTrial > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                            <Clock className="w-2.5 h-2.5" />
                            {effectiveTrial}d trial
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">No trial</span>
                        )}
                        {p.limit_one_per_user !== false ? (
                          <span 
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            title="Campaign can only be claimed once per customer"
                          >
                            1 per user
                          </span>
                        ) : (
                          <span 
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted/20 text-muted-foreground border border-border/50"
                            title="Multiple claims allowed"
                          >
                            Unlimited
                          </span>
                        )}
                      </div>
                      {(() => {
                        const trialQuota = p.trial_quota_gb_override;
                        const planQuota = p.product_quota_gb || 150;
                        return (
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 mt-1.5">
                            <HardDrive className="w-3 h-3 text-cyan-500 shrink-0" />
                            <span>
                              {trialQuota ? `${trialQuota} GB trial → ` : ''}{planQuota} GB plan
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    <td className="px-5 py-4">
                      {p.commission_type === 'percent' && p.commission_rate ? (
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <Percent className="w-3 h-3" />
                              {parseFloat(String(p.commission_rate))}% / sale
                            </span>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              €{parseFloat(String(p.per_sale_commission_eur || 0)).toFixed(2)} per conversion
                            </div>
                          </div>
                          <button
                            onClick={() => handleOpenQuickCut(p)}
                            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors cursor-pointer"
                            title="Edit Partner Cut"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : p.commission_type === 'fixed' && p.commission_fixed_eur ? (
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <Coins className="w-3 h-3" />
                              €{parseFloat(String(p.commission_fixed_eur)).toFixed(2)} fixed
                            </span>
                            <div className="text-[11px] text-muted-foreground mt-0.5">per conversion</div>
                          </div>
                          <button
                            onClick={() => handleOpenQuickCut(p)}
                            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors cursor-pointer"
                            title="Edit Partner Cut"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenQuickCut(p)}
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border border-dashed border-border hover:border-foreground/50 text-muted-foreground hover:text-foreground rounded transition-colors cursor-pointer"
                          title="Configure partner commission cut and storage quotas"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Cut & Quota</span>
                        </button>
                      )}
                    </td>

                    <td className="px-5 py-4 text-center font-mono text-xs">
                      {p.clicks}
                    </td>

                    <td className="px-5 py-4 text-center font-mono text-xs font-semibold text-green-500">
                      {p.conversions}
                    </td>

                    <td className="px-5 py-4 text-center font-mono text-xs text-blue-400">
                      {cr}%
                    </td>

                    <td className="px-5 py-4 text-center font-mono text-xs font-bold text-emerald-500">
                      €{parseFloat(String(p.earned_commission_eur || 0)).toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer transition-colors ${
                          p.active
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                            : 'bg-muted/20 text-muted-foreground border border-border hover:bg-muted/30'
                        }`}
                      >
                        {p.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded cursor-pointer"
                          title="Edit Partner"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded cursor-pointer"
                          title="Delete Partner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border w-full max-w-lg p-6 my-8 space-y-5">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-lg font-medium">
                {editingPartner ? `Edit Partner: ${editingPartner.name}` : 'New Partner Campaign'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">
                  Partner / Influencer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. HardwareLuxx, TechWithTim"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground/50"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">
                  URL Slug * (<code className="text-[11px]">domain.com/ps/{form.slug || ':slug'}</code>)
                </label>
                <input
                  type="text"
                  placeholder="e.g. hardwareluxx"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                  className="w-full border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:border-foreground/50"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">
                  Linked Product *
                </label>
                <select
                  value={form.product_id}
                  onChange={e => setForm({ ...form, product_id: e.target.value })}
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground/50"
                >
                  <option value="" disabled>Select a product to promote</option>
                  {(products || []).map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.target}) — €{(parseFloat(prod.price) * 1.19).toFixed(2)}/mo
                      {prod.trial_days ? ` (${prod.trial_days}d default trial)` : ''}
                      {prod.quota_gb ? ` [${prod.trial_quota_gb ?? 5}GB trial → ${prod.quota_gb}GB paid]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">
                  Trial Period Override (Days)
                </label>
                <input
                  type="number"
                  placeholder="Leave empty to use product's default trial period"
                  value={form.trial_days_override}
                  onChange={e => setForm({ ...form, trial_days_override: e.target.value })}
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Overrides product trial days specifically for visitors using this partner link (e.g. 14, 30, 60 days).
                </p>
              </div>

              {/* Storage Quota Overrides */}
              <div className="p-4 border border-cyan-500/20 bg-cyan-500/5 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <label className="text-xs uppercase tracking-wider text-foreground font-mono font-semibold">
                      Trial Storage Quota (GB)
                    </label>
                  </div>
                  {(() => {
                    const selectedProd = (products || []).find(p => p.id === form.product_id);
                    if (!selectedProd) return null;
                    return (
                      <span className="text-[11px] text-cyan-400 font-mono font-medium">
                        Plan Quota: {selectedProd.quota_gb ?? 150} GB
                      </span>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground font-medium mb-1">
                    Storage Size during Free Trial (GB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 25"
                    value={form.trial_quota_gb_override}
                    onChange={e => setForm({ ...form, trial_quota_gb_override: e.target.value })}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground/50 font-mono"
                  />
                  {(() => {
                    const selectedProd = (products || []).find(p => p.id === form.product_id);
                    const planGb = selectedProd?.quota_gb ?? 150;
                    return (
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Storage allocated during the trial. Customers automatically upgrade to the full <strong>{planGb} GB</strong> plan upon renewal.
                      </p>
                    );
                  })()}
                </div>
              </div>

              {/* Partner Commission Cut (Admin only) */}
              <div className="p-4 border border-border bg-muted/10 rounded space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-500" />
                    <label className="text-xs uppercase tracking-wider text-foreground font-mono font-semibold">
                      Partner Cut / Commission
                    </label>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    Admin Only
                  </span>
                </div>

                {/* 3-Way Segmented Tabs */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-background border border-border rounded">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, commission_type: 'none' }))}
                    className={`py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
                      form.commission_type === 'none'
                        ? 'bg-muted text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    No Cut (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({
                      ...prev,
                      commission_type: 'percent',
                      commission_rate: prev.commission_rate || '15',
                    }))}
                    className={`py-1.5 text-xs font-medium rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.commission_type === 'percent'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Percent className="w-3 h-3" />
                    Percent (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({
                      ...prev,
                      commission_type: 'fixed',
                      commission_fixed_eur: prev.commission_fixed_eur || '5.00',
                    }))}
                    className={`py-1.5 text-xs font-medium rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.commission_type === 'fixed'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Coins className="w-3 h-3" />
                    Fixed Euro (€)
                  </button>
                </div>

                {form.commission_type === 'percent' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-muted-foreground font-medium">
                        Commission Percentage (%) per Sale
                      </label>
                      <div className="flex items-center gap-1">
                        {[5, 10, 15, 20, 25, 30].map(pct => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, commission_rate: pct }))}
                            className={`px-1.5 py-0.5 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                              String(form.commission_rate) === String(pct)
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 font-semibold'
                                : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 15 or 15.5"
                        value={form.commission_rate}
                        onChange={e => setForm({ ...form, commission_rate: e.target.value })}
                        className="w-full border border-border bg-background px-3 py-2 pr-8 text-sm focus:outline-none focus:border-foreground/50 font-mono"
                      />
                      <span className="absolute right-3 top-2 text-sm text-muted-foreground font-mono">%</span>
                    </div>

                    {form.commission_rate && (
                      <div className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 p-2.5 rounded flex items-center justify-between">
                        <span>Partner Cut per conversion:</span>
                        <strong className="text-sm font-mono text-foreground">
                          €{(((products || []).find(p => p.id === form.product_id) ? parseFloat((products || []).find(p => p.id === form.product_id)!.price) * ((parseCommissionNum(form.commission_rate) || 0) / 100) : 0)).toFixed(2)}
                        </strong>
                      </div>
                    )}
                  </div>
                )}

                {form.commission_type === 'fixed' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-muted-foreground font-medium">
                        Fixed Amount (€) per Sale
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2.5, 5, 10, 15].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, commission_fixed_eur: amt.toFixed(2) }))}
                            className={`px-1.5 py-0.5 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                              String(form.commission_fixed_eur) === amt.toFixed(2) || String(form.commission_fixed_eur) === String(amt)
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 font-semibold'
                                : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                            }`}
                          >
                            €{amt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 5.00"
                        value={form.commission_fixed_eur}
                        onChange={e => setForm({ ...form, commission_fixed_eur: e.target.value })}
                        className="w-full border border-border bg-background px-3 py-2 pr-8 text-sm focus:outline-none focus:border-foreground/50 font-mono"
                      />
                      <span className="absolute right-3 top-2 text-sm text-muted-foreground font-mono">€</span>
                    </div>

                    {form.commission_fixed_eur && (
                      <div className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 p-2.5 rounded flex items-center justify-between">
                        <span>Partner Cut per conversion:</span>
                        <strong className="text-sm font-mono text-foreground">
                          €{(parseCommissionNum(form.commission_fixed_eur) || 0).toFixed(2)}
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">
                  Badge Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Community Special, Official Partner"
                  value={form.badge_text}
                  onChange={e => setForm({ ...form, badge_text: e.target.value })}
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground/50"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">
                  Custom Headline (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exclusive Free 30-Day Cloud Trial for HardwareLuxx"
                  value={form.headline}
                  onChange={e => setForm({ ...form, headline: e.target.value })}
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground/50"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground font-mono mb-1">
                  Custom Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Custom intro paragraph for the landing page..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground/50 resize-none"
                />
              </div>

              <div className="p-3 border border-border bg-muted/10 rounded space-y-1">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="limitOnePerUserCheckbox"
                    checked={form.limit_one_per_user}
                    onChange={e => setForm({ ...form, limit_one_per_user: e.target.checked })}
                    className="mt-0.5 rounded border-border accent-foreground cursor-pointer"
                  />
                  <div>
                    <label htmlFor="limitOnePerUserCheckbox" className="text-sm font-medium cursor-pointer select-none block text-foreground">
                      Can only be claimed once per user
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Restricts activation of this partner campaign to 1 per customer account. Prevents repeat claims and promotional abuse.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheckbox"
                  checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                  className="rounded border-border accent-foreground cursor-pointer"
                />
                <label htmlFor="activeCheckbox" className="text-sm cursor-pointer select-none">
                  Campaign is active and accessible to visitors
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="border border-border px-4 py-2 text-sm hover:bg-muted/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.slug.trim() || !form.product_id}
                className="bg-foreground text-background font-medium px-5 py-2 text-sm hover:bg-foreground/90 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingPartner ? 'Update Partner' : 'Create Campaign'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Dedicated Quick Cut Modal */}
      {quickCutPartner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background border border-border w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-500" />
                  Configure Cut & Storage Quotas
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Partner: <strong className="text-foreground">{quickCutPartner.name}</strong> ({quickCutPartner.product_name})
                </p>
              </div>
              <button
                onClick={() => setQuickCutPartner(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Storage Quota during Trial */}
              <div className="p-3.5 border border-cyan-500/20 bg-cyan-500/5 rounded space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                    <label className="text-xs uppercase tracking-wider text-foreground font-mono font-semibold">
                      Trial Storage Quota (GB)
                    </label>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono font-medium">
                    Plan Quota: {quickCutPartner.product_quota_gb ?? 150} GB
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground font-medium mb-1">
                    Storage Size during Free Trial (GB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 25"
                    value={quickCutForm.trial_quota_gb_override}
                    onChange={e => setQuickCutForm({ ...quickCutForm, trial_quota_gb_override: e.target.value })}
                    className="w-full border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:border-foreground/50 font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Storage limit during trial. Automatically upgrades to the full <strong>{quickCutPartner.product_quota_gb ?? 150} GB</strong> plan upon renewal.
                  </span>
                </div>
              </div>

              {/* Commission Cut */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-medium">
                    Partner Cut / Commission
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Admin Only
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 p-1 bg-muted/20 border border-border rounded">
                  <button
                    type="button"
                    onClick={() => setQuickCutForm(prev => ({ ...prev, commission_type: 'none' }))}
                    className={`py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
                      quickCutForm.commission_type === 'none'
                        ? 'bg-background text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    No Cut (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCutForm(prev => ({
                      ...prev,
                      commission_type: 'percent',
                      commission_rate: prev.commission_rate || '15',
                    }))}
                    className={`py-1.5 text-xs font-medium rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      quickCutForm.commission_type === 'percent'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Percent className="w-3 h-3" />
                    Percent (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCutForm(prev => ({
                      ...prev,
                      commission_type: 'fixed',
                      commission_fixed_eur: prev.commission_fixed_eur || '5.00',
                    }))}
                    className={`py-1.5 text-xs font-medium rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      quickCutForm.commission_type === 'fixed'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Coins className="w-3 h-3" />
                    Fixed (€)
                  </button>
                </div>

                {quickCutForm.commission_type === 'percent' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-muted-foreground font-medium">
                        Commission Percentage (%)
                      </label>
                      <div className="flex items-center gap-1">
                        {[5, 10, 15, 20, 25, 30].map(pct => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setQuickCutForm(prev => ({ ...prev, commission_rate: pct }))}
                            className={`px-1.5 py-0.5 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                              String(quickCutForm.commission_rate) === String(pct)
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 font-semibold'
                                : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 15"
                        value={quickCutForm.commission_rate}
                        onChange={e => setQuickCutForm({ ...quickCutForm, commission_rate: e.target.value })}
                        className="w-full border border-border bg-background px-3 py-2 pr-8 text-sm focus:outline-none focus:border-foreground/50 font-mono"
                      />
                      <span className="absolute right-3 top-2 text-sm text-muted-foreground font-mono">%</span>
                    </div>

                    <div className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 p-2.5 rounded flex items-center justify-between">
                      <span>Partner receives per conversion:</span>
                      <strong className="text-sm font-mono text-foreground">
                        €{((parseFloat(quickCutPartner.product_price) * ((parseCommissionNum(quickCutForm.commission_rate) || 0) / 100))).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                )}

                {quickCutForm.commission_type === 'fixed' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-muted-foreground font-medium">
                        Fixed Euro (€) per Sale
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2.5, 5, 10, 15].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setQuickCutForm(prev => ({ ...prev, commission_fixed_eur: amt.toFixed(2) }))}
                            className={`px-1.5 py-0.5 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                              String(quickCutForm.commission_fixed_eur) === amt.toFixed(2) || String(quickCutForm.commission_fixed_eur) === String(amt)
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 font-semibold'
                                : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                            }`}
                          >
                            €{amt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 5.00"
                        value={quickCutForm.commission_fixed_eur}
                        onChange={e => setQuickCutForm({ ...quickCutForm, commission_fixed_eur: e.target.value })}
                        className="w-full border border-border bg-background px-3 py-2 pr-8 text-sm focus:outline-none focus:border-foreground/50 font-mono"
                      />
                      <span className="absolute right-3 top-2 text-sm text-muted-foreground font-mono">€</span>
                    </div>

                    <div className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 p-2.5 rounded flex items-center justify-between">
                      <span>Partner receives per conversion:</span>
                      <strong className="text-sm font-mono text-foreground">
                        €{(parseCommissionNum(quickCutForm.commission_fixed_eur) || 0).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setQuickCutPartner(null)}
                className="border border-border px-4 py-2 text-sm hover:bg-muted/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickCut}
                disabled={saving}
                className="bg-foreground text-background font-medium px-5 py-2 text-sm hover:bg-foreground/90 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
