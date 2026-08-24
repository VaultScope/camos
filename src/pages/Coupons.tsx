import { useState } from 'react';
import { Page } from '../components/Layout';
import { Plus, Tag, X, RefreshCw, Edit2 } from 'lucide-react';

export default function Coupons() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  const [newCoupon, setNewCoupon] = useState({
    code: '', type: 'percentage', value: '', usageLimit: '', expires: '', status: 'Active'
  });

  const [coupons, setCoupons] = useState([
    { code: 'BF2026', discount: '50% OFF', type: 'First Month Only', usage: '142 / 500', expires: '24 Nov 2026', status: 'Active' },
    { code: 'WELCOME10', discount: '€10.00 Credit', type: 'One-Time Credit', usage: '89 / ∞', expires: 'Never', status: 'Active' },
    { code: 'SUMMER-VPS', discount: '20% OFF', type: 'Recurring (Lifetime)', usage: '100 / 100', expires: '01 Sep 2026', status: 'Exhausted' },
  ]);

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = 
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setNewCoupon({ code: '', type: 'percentage', value: '', usageLimit: '', expires: '', status: 'Active' });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: any) => {
    const isPercentage = coupon.discount.includes('%');
    const value = isPercentage ? coupon.discount.replace('% OFF', '') : coupon.discount.replace('€', '').replace(' Credit', '');
    const limit = coupon.usage.split(' / ')[1] === '∞' ? '' : coupon.usage.split(' / ')[1];
    
    setNewCoupon({
      code: coupon.code,
      type: isPercentage ? 'percentage' : 'fixed',
      value: value,
      usageLimit: limit,
      expires: coupon.expires === 'Never' ? '' : coupon.expires, // Simplified for mock
      status: coupon.status
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveCoupon = () => {
    const discountStr = newCoupon.type === 'percentage' ? `${newCoupon.value}% OFF` : `€${Number(newCoupon.value).toFixed(2)} Credit`;
    const usageStr = newCoupon.usageLimit ? `0 / ${newCoupon.usageLimit}` : '0 / ∞';
    const expiresStr = newCoupon.expires || 'Never';

    const savedCoupon = { 
      code: newCoupon.code, 
      discount: discountStr, 
      type: newCoupon.type === 'percentage' ? 'Percentage' : 'Fixed Credit', 
      usage: usageStr, 
      expires: expiresStr, 
      status: newCoupon.status 
    };

    if (modalMode === 'create') {
      setCoupons([savedCoupon, ...coupons]);
    } else {
      setCoupons(coupons.map(c => c.code === newCoupon.code ? savedCoupon : c));
    }
    
    setIsModalOpen(false);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon({ ...newCoupon, code });
  };

  return (
    <Page title="Coupons & Marketing">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">Manage promo codes and discounts for your customers.</p>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 border border-border bg-foreground text-background px-4 py-2 text-sm hover:bg-foreground/90 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-foreground/[0.02] border border-border p-3">
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Search by Coupon Code or Type..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground"
          />
        </div>
        <select 
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground w-40 shrink-0"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="exhausted">Exhausted</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="border border-border divide-y divide-border bg-background">
        <div className="p-4 bg-foreground/5 text-xs font-medium uppercase tracking-wider grid grid-cols-8 text-muted-foreground">
          <div className="col-span-2">Coupon Code</div>
          <div>Discount</div>
          <div>Type</div>
          <div>Usage Limit</div>
          <div>Expires</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>
        {filteredCoupons.map((c, i) => (
          <div key={i} className="p-4 text-sm grid grid-cols-8 items-center hover:bg-foreground/[0.02]">
            <div className="col-span-2 flex items-center gap-3">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-mono font-medium">{c.code}</span>
              </div>
            </div>
            <div className="font-medium text-green-500">{c.discount}</div>
            <div className="text-xs text-muted-foreground">{c.type}</div>
            <div className="text-xs">{c.usage}</div>
            <div className="text-xs text-muted-foreground">{c.expires}</div>
            <div>
              <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border border-border ${c.status === 'Active' ? 'text-green-500 bg-green-500/5' : 'text-yellow-500 bg-yellow-500/5'}`}>
                {c.status}
              </span>
            </div>
            <div className="text-right">
              <button onClick={() => openEditModal(c)} className="text-xs border border-border p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer" title="Edit">
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        {filteredCoupons.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No coupons match your filters.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border border-border shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Tag className="w-5 h-5 text-muted-foreground" /> {modalMode === 'create' ? 'Create Coupon Code' : 'Edit Coupon Code'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Coupon Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCoupon.code} 
                    onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    disabled={modalMode === 'edit'}
                    className="flex-1 border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground font-mono disabled:opacity-50"
                    placeholder="e.g. SUMMER2026"
                  />
                  {modalMode === 'create' && (
                    <button onClick={generateCode} className="border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer" title="Generate Random Code">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Discount Type</label>
                  <select 
                    value={newCoupon.type}
                    onChange={e => setNewCoupon({...newCoupon, type: e.target.value})}
                    className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Credit (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Discount Value</label>
                  <input 
                    type="number" 
                    value={newCoupon.value} 
                    onChange={e => setNewCoupon({...newCoupon, value: e.target.value})}
                    className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                    placeholder={newCoupon.type === 'percentage' ? "e.g. 20" : "e.g. 10.00"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Maximum Uses</label>
                  <input 
                    type="number" 
                    value={newCoupon.usageLimit} 
                    onChange={e => setNewCoupon({...newCoupon, usageLimit: e.target.value})}
                    className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                    placeholder="Leave blank for infinite"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Expiry Date</label>
                  <input 
                    type="date" 
                    value={newCoupon.expires} 
                    onChange={e => setNewCoupon({...newCoupon, expires: e.target.value})}
                    className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>
              
              {modalMode === 'edit' && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Status</label>
                  <select 
                    value={newCoupon.status}
                    onChange={e => setNewCoupon({...newCoupon, status: e.target.value})}
                    className="w-full border border-border bg-transparent p-2 text-sm focus:outline-none focus:border-foreground"
                  >
                    <option value="Active">Active</option>
                    <option value="Exhausted">Exhausted</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-border pt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer border border-transparent">
                Cancel
              </button>
              <button 
                onClick={handleSaveCoupon} 
                disabled={!newCoupon.code || !newCoupon.value}
                className="px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {modalMode === 'create' ? 'Create Coupon' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
