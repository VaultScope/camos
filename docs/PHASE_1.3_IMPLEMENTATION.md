# Phase 1.3 Implementation: Billing & Invoices

**Status:** ✅ Complete  
**Date:** 2026-08-25

## What Was Implemented

### Backend Changes (VaultScope-API)

#### 1. Missing Models Added
**File:** `crates/db/src/models.rs`

Added two missing model structs:
- `Coupon` (265-276) — id, code, discount_type, discount_value, usage_limit, usage_count, expires_at, status, created_at, updated_at
- `TaxRate` (278-284) — id, name, country, rate, created_at

#### 2. Invoices API
**File:** `crates/api/src/routes/admin/invoices.rs` (new file)

**Endpoints:**
- `GET /api/admin/invoices` — List invoices with filters (customer_id, status, limit, offset)
- `GET /api/admin/invoices/{id}` — Get single invoice
- `POST /api/admin/invoices` — Create invoice with line items
  - Auto-generates invoice number (format: `INV-{8 char hex}` from UUIDv7)
  - Calculates subtotal, tax_amount, total
  - Creates invoice_line_items atomically
  - Status defaults to 'draft'
- `PUT /api/admin/invoices/{id}` — Update invoice (status, due_date, notes)
- `DELETE /api/admin/invoices/{id}` — Delete draft invoices only
- `POST /api/admin/invoices/{id}/send` — Mark draft as pending (send to customer)
- `POST /api/admin/invoices/{id}/mark-paid` — Mark as paid + set paid_at timestamp
- `GET /api/admin/invoices/{id}/line-items` — List line items for an invoice

**Implementation Details:**
- Uses `rust_decimal::Decimal` for all monetary values
- Enforces draft-only deletion (can't delete sent/paid invoices)
- Updates `updated_at` on all modifications
- Line items cascade delete when invoice is deleted (ON DELETE CASCADE)

#### 3. Coupons API
**File:** `crates/api/src/routes/admin/coupons.rs` (new file)

**Endpoints:**
- `GET /api/admin/coupons` — List all coupons
- `GET /api/admin/coupons/{id}` — Get single coupon
- `POST /api/admin/coupons` — Create coupon
  - Auto-uppercases code
  - Supports percentage or fixed discount
  - Optional usage_limit and expires_at
- `PUT /api/admin/coupons/{id}` — Update coupon (discount_value, usage_limit, expires_at, status)
- `DELETE /api/admin/coupons/{id}` — Delete coupon

**Implementation Details:**
- Code is stored uppercase
- Status management: active, exhausted, expired, disabled
- Discount types: percentage, fixed
- usage_count can be incremented by order system (not implemented in admin panel)

#### 4. Tax Rates API
**File:** `crates/api/src/routes/admin/tax_rates.rs` (new file)

**Endpoints:**
- `GET /api/admin/tax-rates` — List all tax rates (sorted by name)
- `GET /api/admin/tax-rates/{id}` — Get single tax rate
- `POST /api/admin/tax-rates` — Create tax rate (name, country, rate)
- `PUT /api/admin/tax-rates/{id}` — Update tax rate
- `DELETE /api/admin/tax-rates/{id}` — Delete tax rate

**Implementation Details:**
- Rate stored as `Decimal` (up to 5 decimal places, e.g., 19.50%)
- No cascade constraints (tax rates can be deleted even if used in invoices)

### Frontend Changes (VaultScope-Admin)

#### 1. Type Definitions
**File:** `src/lib/types.ts`

Added interfaces:
- `Invoice` — full invoice with status, amounts, dates, stripe integration
- `InvoiceLineItem` — description, quantity, unit_price, total, service_id, sort_order
- `Coupon` — code, discount_type, discount_value, usage tracking, expiry, status
- `TaxRate` — name, country, rate

#### 2. Billing Invoices Page (Complete Rewrite)
**File:** `src/pages/BillingNew.tsx` (new file)

**Features:**
- **List View:**
  - Fetches from `/admin/invoices` and `/admin/customers`
  - Search by invoice number or customer name
  - Filter by status (draft, pending, paid, overdue, void)
  - Displays: invoice number, customer, amount, status, due date
  - Actions per invoice: Send (draft only), Delete (draft only), Mark Paid (pending/overdue)

- **Create Modal:**
  - Customer dropdown (required)
  - Due date picker
  - Tax rate input (%)
  - Dynamic line items (add/remove)
    - Description, quantity, unit price
    - Auto-calculates item total
  - Live subtotal, tax amount, and total calculation
  - Notes textarea
  - Creates invoice via `POST /admin/invoices`

- **UI Details:**
  - Status badges with color coding (green=paid, blue=pending, red=overdue, gray=draft/void)
  - Delete/send confirmation dialogs
  - Disabled state during API calls
  - Error alerts on failures
  - Auto-refetch after mutations

#### 3. Tax Rates Page (Complete Rewrite)
**File:** `src/pages/TaxRatesNew.tsx` (new file)

**Features:**
- List all tax rates with name, country, rate
- Add button opens modal
- Delete button per rate (with confirmation)
- Create modal:
  - Name input (e.g., "VAT (Germany)")
  - Country input
  - Rate input (decimal percentage)
- Real-time API integration
- Loading/error states

#### 4. Coupons Page (Complete Rewrite)
**File:** `src/pages/CouponsNew.tsx` (new file)

**Features:**
- **List View:**
  - Search by code or type
  - Filter by status (active, exhausted, expired, disabled)
  - Displays: code, discount (formatted), type, usage count/limit, expiry date
  - Actions: Enable/Disable toggle, Delete

- **Create Modal:**
  - Code input with auto-uppercase
  - Random code generator button (8 alphanumeric chars)
  - Discount type dropdown (percentage/fixed)
  - Discount value input (changes label based on type)
  - Optional usage limit
  - Optional expiry date/time picker
  - Creates via `POST /admin/coupons`

- **UI Details:**
  - Usage displayed as "count / limit" or "count / ∞"
  - Expiry formatted as date or "Never"
  - Discount formatted as "50% OFF" or "€10.00 Credit"
  - Status toggle button (enable/disable)

#### 5. Billing Router (New)
**File:** `src/pages/BillingRouter.tsx` (new file)

Replaces old BillingAutomation.tsx for routing:
- `/billing/invoices` → BillingNew (API-integrated)
- `/billing/tax-rates` → TaxRatesNew (API-integrated)
- `/billing/insights` → Placeholder (hardcoded stats)
- `/billing/automations` → Placeholder (hardcoded inputs)
- Default redirect: `/billing/` → `/billing/invoices`

#### 6. App Routing Update
**File:** `src/App.tsx`

Updated imports and routes:
- `import BillingRouter from './pages/BillingRouter'` (replaced BillingAutomation)
- `import Coupons from './pages/CouponsNew'` (replaced old Coupons)
- Routes now use new API-integrated components

### Build Status
- ✅ Backend compiles (`cargo check --workspace`)
- ✅ Frontend builds (`npm run build`)
- ✅ All TypeScript errors resolved

## Testing Checklist

### Backend API Testing
- [ ] `GET /api/admin/invoices` — list invoices
- [ ] `GET /api/admin/invoices?customer_id={id}` — filter by customer
- [ ] `GET /api/admin/invoices?status=draft` — filter by status
- [ ] `POST /api/admin/invoices` — create invoice with line items
- [ ] `GET /api/admin/invoices/{id}/line-items` — fetch line items
- [ ] `POST /api/admin/invoices/{id}/send` — change draft to pending
- [ ] `POST /api/admin/invoices/{id}/mark-paid` — mark as paid
- [ ] `DELETE /api/admin/invoices/{id}` — delete draft (should fail for non-drafts)
- [ ] `GET /api/admin/coupons` — list coupons
- [ ] `POST /api/admin/coupons` — create coupon (verify code uppercases)
- [ ] `PUT /api/admin/coupons/{id}` — update status
- [ ] `DELETE /api/admin/coupons/{id}` — delete coupon
- [ ] `GET /api/admin/tax-rates` — list tax rates
- [ ] `POST /api/admin/tax-rates` — create tax rate
- [ ] `DELETE /api/admin/tax-rates/{id}` — delete tax rate

### Frontend UI Testing
- [ ] Billing invoices page loads and displays list
- [ ] Search invoices by number/customer name
- [ ] Filter invoices by status
- [ ] Create invoice modal opens
- [ ] Add/remove line items in modal
- [ ] Subtotal/tax/total calculate correctly
- [ ] Create invoice saves and refetches list
- [ ] Send button works (draft → pending)
- [ ] Mark Paid button works
- [ ] Delete button works (draft only)
- [ ] Tax rates page loads
- [ ] Create tax rate works
- [ ] Delete tax rate works
- [ ] Coupons page loads
- [ ] Search/filter coupons
- [ ] Generate random code button works
- [ ] Create coupon saves
- [ ] Enable/Disable toggle works
- [ ] Delete coupon works

## Known Limitations

1. **No invoice PDF generation** — invoices exist in DB but no PDF renderer
2. **No email integration** — "Send" button just changes status, doesn't actually email
3. **No Stripe integration** — stripe_payment_intent_id field exists but not used
4. **No payment recording** — Mark Paid is manual only, no payment gateway integration
5. **No invoice editing** — can update due date/notes/status but not line items after creation
6. **No coupon application logic** — coupons exist but aren't applied to orders/invoices yet
7. **Insights & Automations still stubbed** — hardcoded placeholders, no real data
8. **No invoice pagination UI** — backend supports it but frontend loads all at once
9. **No bulk operations** — can't select multiple invoices for batch actions
10. **No invoice templates** — all invoices created manually, no recurring invoice logic

## Integration Points

- **Customer Management** — invoices link to customer_id from `/admin/customers`
- **Services** — invoice line items can reference service_id from `/admin/services`
- **Tax Rates** — invoice creation uses tax_rate value (not linked to tax_rates table)
- **Order System** (future) — coupons should be applied during checkout/order creation

## Security Considerations

- ✅ All endpoints require `AuthAdmin` guard
- ✅ Draft-only deletion prevents accidental data loss
- ⚠️ **No RBAC enforcement** — any authenticated admin can create/modify invoices
- ⚠️ **No audit trail** — invoice modifications aren't logged to activity_log
- ⚠️ **No validation on discount values** — 1000% discount or negative amounts aren't blocked
- ⚠️ **Coupon code collisions** — database enforces UNIQUE but API doesn't handle conflict gracefully

## Performance Notes

- Invoice creation is atomic (invoice + line items in single transaction)
- No pagination UI for invoices — could be slow with 1000+ invoices
- Tax rates and coupons load all at once (acceptable for typical volumes <1000)
- Customer dropdown in invoice creation could be slow with 10k+ customers (consider search/autocomplete)

## Next Steps

### Phase 1.4 - Staff & RBAC
- Role CRUD endpoints
- Staff invite/update/deactivate
- Wire role editor save button
- Enforce RBAC on backend routes

### Future Enhancements (Post Phase 1)
- Invoice PDF generation (wkhtmltopdf or similar)
- Email invoices to customers (SMTP integration)
- Stripe payment integration
- Recurring invoices / subscriptions
- Invoice templates
- Payment recording (log transactions)
- Coupon application logic in order flow
- Real billing insights (MRR, churn, ARPU)
- Invoice editing (add/remove line items)
- Bulk invoice actions
- Invoice search by date range
- Export invoices to CSV/Excel

## Breaking Changes

None - all changes are additive.
