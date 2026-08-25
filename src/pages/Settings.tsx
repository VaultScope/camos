import { useState, useEffect } from 'react';
import { Page } from '../components/Layout';
import { Save, Send } from 'lucide-react';
import { api } from '../lib/api';
import type { Setting } from '../lib/types';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'VaultScope',
    legalName: 'VaultScope GmbH',
    storefrontUrl: 'https://vaultscope.de',
    adminUrl: 'https://admin.vaultscope.de',
    addressStreet: 'Musterstraße 1',
    addressCity: 'Berlin',
    addressState: 'Berlin',
    addressPostal: '10115',
    addressCountry: 'DE',
    phone: '+49 30 1234567',
    vatId: 'DE123456789',
    taxNumber: '27/123/45678',
    registrationNumber: 'HRB 12345',
    registrationCourt: 'Amtsgericht Berlin-Charlottenburg',
    currency: 'EUR',
    currencySymbol: '€',
    timezone: 'Europe/Berlin',
    locale: 'de-DE',
    dateFormat: 'DD.MM.YYYY',
    smtpSender: 'noreply@vaultscope.de',
    smtpReplyTo: 'support@vaultscope.de',
    smtpFromName: 'VaultScope',
    taxMode: 'exclusive',
    defaultTaxRate: 19,
    reverseChargeEnabled: true,
    invoicePrefix: 'INV',
    invoiceNextNumber: 901,
    invoiceDueDays: 14,
    invoiceFooter: 'Thank you for choosing VaultScope. Payment is due within 14 days.',
    bankName: 'Deutsche Bank',
    bankIban: 'DE89 3704 0044 0532 0130 00',
    bankBic: 'COBADEFFXXX',
    bankAccountHolder: 'VaultScope GmbH',
    paymentMethods: 'Stripe (Card, SEPA)',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    brandColor: '#6366f1',
    supportEmail: 'support@vaultscope.de',
    supportPhone: '+49 30 1234567',
    supportHours: 'Mon–Fri 09:00–18:00 CET',
    tosUrl: 'https://vaultscope.de/tos',
    privacyUrl: 'https://vaultscope.de/privacy',
    imprintUrl: 'https://vaultscope.de/imprint',
    gracePeriodDays: 3,
    autoSuspendEnabled: true,
    autoTerminateDays: 14,
    lowStockThreshold: 3,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    requireMfaStaff: true,
  });

  useEffect(() => {
    api.get<Setting[]>('/admin/settings').then((data) => {
      const mapped: Record<string, any> = {};
      data.forEach((s) => { mapped[s.key] = s.value; });
      setSettings((prev) => ({ ...prev, ...mapped }));
    }).catch(() => {});
  }, []);

  const handleSave = () => {
    const entries = Object.entries(settings).map(([key, value]) => ({ key, value }));
    api.put('/admin/settings', entries)
      .then(() => { setSaved(true); setTimeout(() => setSaved(false), 2000); })
      .catch(() => {});
  };

  const update = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <Page title="Global Settings">
      <div className="max-w-3xl">
        <div className="flex justify-between items-center mb-6 border-b border-border pb-6">
          <p className="text-sm text-muted-foreground">System-wide configuration for CAMOS and VaultScope.</p>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" /> {saved ? 'Saved' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-8">
          {/* Company */}
          <section>
            <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Company</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Display Name</label>
                  <input type="text" value={settings.companyName} onChange={e => update('companyName', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Legal Name</label>
                  <input type="text" value={settings.legalName} onChange={e => update('legalName', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Storefront URL</label>
                  <input type="url" value={settings.storefrontUrl} onChange={e => update('storefrontUrl', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Admin Panel URL</label>
                  <input type="url" value={settings.adminUrl} onChange={e => update('adminUrl', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Phone</label>
                <input type="tel" value={settings.phone} onChange={e => update('phone', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
              </div>
            </div>
          </section>

          {/* Address */}
          <section>
            <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Address</h3>
            <p className="text-xs text-muted-foreground mb-4">Used on invoices, legal correspondence, and imprint.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Street</label>
                <input type="text" value={settings.addressStreet} onChange={e => update('addressStreet', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Postal Code</label>
                  <input type="text" value={settings.addressPostal} onChange={e => update('addressPostal', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">City</label>
                  <input type="text" value={settings.addressCity} onChange={e => update('addressCity', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">State / Region</label>
                  <input type="text" value={settings.addressState} onChange={e => update('addressState', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Country</label>
                <select value={settings.addressCountry} onChange={e => update('addressCountry', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground">
                  <option value="DE">Germany</option>
                  <option value="AT">Austria</option>
                  <option value="CH">Switzerland</option>
                  <option value="NL">Netherlands</option>
                  <option value="FR">France</option>
                  <option value="GB">United Kingdom</option>
                  <option value="US">United States</option>
                </select>
              </div>
            </div>
          </section>

          {/* Legal & Registration */}
          <section>
            <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Legal & Registration</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">VAT ID</label>
                  <input type="text" value={settings.vatId} onChange={e => update('vatId', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Tax Number</label>
                  <input type="text" value={settings.taxNumber} onChange={e => update('taxNumber', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Registration Number</label>
                  <input type="text" value={settings.registrationNumber} onChange={e => update('registrationNumber', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Court of Registration</label>
                  <input type="text" value={settings.registrationCourt} onChange={e => update('registrationCourt', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                </div>
              </div>
            </div>
          </section>

          {/* Localization */}
          <section>
            <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Localization</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Currency</label>
                <select value={settings.currency} onChange={e => update('currency', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground">
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Timezone</label>
                <select value={settings.timezone} onChange={e => update('timezone', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground">
                  <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Locale</label>
                <select value={settings.locale} onChange={e => update('locale', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground">
                  <option value="de-DE">German (de-DE)</option>
                  <option value="en-US">English (en-US)</option>
                  <option value="en-GB">English (en-GB)</option>
                  <option value="fr-FR">French (fr-FR)</option>
                  <option value="nl-NL">Dutch (nl-NL)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Date Format</label>
                <select value={settings.dateFormat} onChange={e => update('dateFormat', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground">
                  <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                </select>
              </div>
            </div>
          </section>

          {/* Email */}
          <section>
            <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Email & Transactional</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">From Name</label>
                  <input type="text" value={settings.smtpFromName} onChange={e => update('smtpFromName', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Sender Address</label>
                  <input type="email" value={settings.smtpSender} onChange={e => update('smtpSender', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Reply-To</label>
                  <input type="email" value={settings.smtpReplyTo} onChange={e => update('smtpReplyTo', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
              </div>
              <button className="flex items-center gap-2 text-xs border border-border px-3 py-1.5 hover:bg-foreground/5 transition-colors cursor-pointer">
                <Send className="w-3 h-3" /> Send Test Email
              </button>
            </div>
          </section>

          {/* Billing */}
          <section>
            <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Billing & Tax</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Tax Mode</label>
                  <select value={settings.taxMode} onChange={e => update('taxMode', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground">
                    <option value="exclusive">Tax Exclusive (added on top)</option>
                    <option value="inclusive">Tax Inclusive (included in price)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Default Tax Rate</label>
                  <div className="relative">
                    <input type="number" value={settings.defaultTaxRate} onChange={e => update('defaultTaxRate', parseFloat(e.target.value) || 0)} className="w-full border border-border bg-transparent p-2.5 pr-8 text-sm focus:outline-none focus:border-foreground" />
                    <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={settings.reverseChargeEnabled} onChange={e => update('reverseChargeEnabled', e.target.checked)} className="w-4 h-4 accent-foreground cursor-pointer" />
                    Reverse Charge (B2B EU)
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Invoice Prefix</label>
                  <div className="flex gap-2">
                    <input type="text" value={settings.invoicePrefix} onChange={e => update('invoicePrefix', e.target.value)} className="w-20 border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                    <input type="number" value={settings.invoiceNextNumber} onChange={e => update('invoiceNextNumber', parseInt(e.target.value) || 0)} className="flex-1 border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Next: {settings.invoicePrefix}-2026-0{settings.invoiceNextNumber}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Payment Due (Days)</label>
                  <input type="number" value={settings.invoiceDueDays} onChange={e => update('invoiceDueDays', parseInt(e.target.value) || 0)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Payment Methods</label>
                  <input type="text" value={settings.paymentMethods} onChange={e => update('paymentMethods', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Invoice Footer Text</label>
                <textarea value={settings.invoiceFooter} onChange={e => update('invoiceFooter', e.target.value)} rows={2} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground resize-none" />
              </div>
            </div>
          </section>

          {/* Bank Details */}
          <section>
            <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Bank Details</h3>
            <p className="text-xs text-muted-foreground mb-4">Displayed on invoices for wire transfer payments.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Account Holder</label>
                  <input type="text" value={settings.bankAccountHolder} onChange={e => update('bankAccountHolder', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Bank Name</label>
                  <input type="text" value={settings.bankName} onChange={e => update('bankName', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">IBAN</label>
                  <input type="text" value={settings.bankIban} onChange={e => update('bankIban', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">BIC / SWIFT</label>
                  <input type="text" value={settings.bankBic} onChange={e => update('bankBic', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
              </div>
            </div>
          </section>

          {/* Branding */}
          <section>
            <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Branding</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Logo URL</label>
                  <input type="text" value={settings.logoUrl} onChange={e => update('logoUrl', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Favicon URL</label>
                  <input type="text" value={settings.faviconUrl} onChange={e => update('faviconUrl', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Brand Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={settings.brandColor} onChange={e => update('brandColor', e.target.value)} className="w-10 h-10 border border-border bg-transparent cursor-pointer p-0.5" />
                    <input type="text" value={settings.brandColor} onChange={e => update('brandColor', e.target.value)} className="flex-1 border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support & Legal */}
          <section>
            <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Support & Legal</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Support Email</label>
                  <input type="email" value={settings.supportEmail} onChange={e => update('supportEmail', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Support Phone</label>
                  <input type="tel" value={settings.supportPhone} onChange={e => update('supportPhone', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Support Hours</label>
                  <input type="text" value={settings.supportHours} onChange={e => update('supportHours', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Terms of Service URL</label>
                  <input type="url" value={settings.tosUrl} onChange={e => update('tosUrl', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Privacy Policy URL</label>
                  <input type="url" value={settings.privacyUrl} onChange={e => update('privacyUrl', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Imprint URL</label>
                  <input type="url" value={settings.imprintUrl} onChange={e => update('imprintUrl', e.target.value)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground font-mono" />
                </div>
              </div>
            </div>
          </section>

          {/* Automation */}
          <section>
            <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Automation & Thresholds</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Grace Period (Days)</label>
                <input type="number" value={settings.gracePeriodDays} onChange={e => update('gracePeriodDays', parseInt(e.target.value) || 0)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                <p className="text-[10px] text-muted-foreground mt-1">Days after due date before auto-suspend</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Auto-Terminate (Days)</label>
                <input type="number" value={settings.autoTerminateDays} onChange={e => update('autoTerminateDays', parseInt(e.target.value) || 0)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                <p className="text-[10px] text-muted-foreground mt-1">Days after suspension before deletion</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Low Stock Alert Threshold</label>
                <input type="number" value={settings.lowStockThreshold} onChange={e => update('lowStockThreshold', parseInt(e.target.value) || 0)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                <p className="text-[10px] text-muted-foreground mt-1">Notify when product stock falls below</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Session Timeout (min)</label>
                <input type="number" value={settings.sessionTimeout} onChange={e => update('sessionTimeout', parseInt(e.target.value) || 0)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                <p className="text-[10px] text-muted-foreground mt-1">Admin session inactivity timeout</p>
              </div>
            </div>
          </section>

          {/* Security */}
          <section>
            <h3 className="text-sm font-medium border-b border-border pb-2 mb-4">Security</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1">Max Login Attempts</label>
                <input type="number" value={settings.maxLoginAttempts} onChange={e => update('maxLoginAttempts', parseInt(e.target.value) || 0)} className="w-full border border-border bg-transparent p-2.5 text-sm focus:outline-none focus:border-foreground" />
                <p className="text-[10px] text-muted-foreground mt-1">Before account lockout</p>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={settings.requireMfaStaff} onChange={e => update('requireMfaStaff', e.target.checked)} className="w-4 h-4 accent-foreground cursor-pointer" />
                  Require MFA for all staff accounts
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Page>
  );
}
