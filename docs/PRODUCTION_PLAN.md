# VaultScope Admin — Production Readiness Plan

> Last updated: 2026-08-25

## Current State Summary

**Frontend:** React 19, Vite 8, TypeScript 6, Tailwind 4, React Router 7, Recharts, Lucide  
**Backend:** Rust (Axum 0.8), SQLx 0.8, PostgreSQL, Tokio  
**Auth:** OIDC via Authentik (Authorization Code flow)  
**Infra:** Job runner with provisioning provider trait, Hetzner Cloud connector, encrypted connector config (AES)

### What Works Today

- Dashboard with live stats (customer/service/ticket counts, MRR)
- Customer list + detail (read-only)
- Services list (read-only)
- Products full CRUD
- Connectors management (list, edit, test connection)
- Staff list + current user profile
- Tickets list + detail (read-only)
- Activity log with category filtering
- Notifications (list, mark read, resolve)
- Email template management
- Global settings (key-value store)
- OIDC login flow

### What Exists in DB but Has No API Routes

| Table | Status |
|-------|--------|
| `invoices` + `invoice_line_items` | No routes |
| `ticket_messages` | No routes |
| `departments` | No routes |
| `service_forms` | No routes |
| `coupons` | No routes |
| `tax_rates` | No routes |
| `email_log` | No routes |
| `jobs` | Internal only (runner polls, no admin API) |

### What Frontend Has but Backend Doesn't Support

| Frontend Page | Missing Backend |
|---------------|----------------|
| Billing/Invoices | No invoice CRUD endpoints |
| Billing/Tax Rates | No tax rate endpoints |
| Billing/Automations | No automation model at all |
| Coupons | No coupon endpoints |
| Service Forms | No service form endpoints |
| Config Options | No config options model/endpoints |
| Job Queue | No admin job list/retry/cancel endpoints |
| Email Logs | No email log endpoints |
| Ticket Detail (reply) | No ticket message POST |
| Ticket Create | No ticket POST |
| Ticket Departments | No department endpoints |
| Service Detail (actions) | No power action/reinstall endpoints for admin |
| Service Provisioning | No service creation endpoint |
| Customer actions | No customer PUT (suspend/activate/notes) |
| Staff RBAC | No role CRUD, no staff create/update/delete |

---

## Implementation Plan

### Phase 1: Core CRUD Completions (Backend + Frontend Wiring)

Priority: **Critical** — these are table-stakes for an admin panel.

#### 1.1 Customer Management (write operations)

**Backend:**
- `PUT /api/admin/customers/{id}` — update status (active/suspended/cancelled), notes, metadata
- `POST /api/admin/customers/{id}/impersonate` — generate short-lived client token (optional, security review needed)

**Frontend:**
- Wire Suspend/Reactivate/Save Notes buttons to API
- Wire per-customer Invoices/Tickets/Activity tabs using existing list endpoints with `?customer_id=` filter

---

#### 1.2 Ticket System (full lifecycle)

**Backend:**
- `POST /api/admin/tickets` — create ticket (assign department, priority, customer)
- `PUT /api/admin/tickets/{id}` — update status, priority, assignment
- `GET /api/admin/tickets/{id}/messages` — list messages in thread
- `POST /api/admin/tickets/{id}/messages` — add reply (staff or internal note)
- `GET /api/admin/departments` — list departments
- `POST /api/admin/departments` — create department
- `PUT /api/admin/departments/{id}` — update
- `DELETE /api/admin/departments/{id}` — soft-delete

**Frontend:**
- Wire TicketDetail reply form to POST messages
- Wire TicketCreate page to POST ticket
- Wire Departments page to CRUD endpoints
- Add real-time status badges, assignment dropdown

---

#### 1.3 Billing & Invoices

**Backend:**
- `GET /api/admin/invoices` — list with filters (customer, status, date range, pagination)
- `GET /api/admin/invoices/{id}` — single with line items
- `POST /api/admin/invoices` — create (draft status)
- `PUT /api/admin/invoices/{id}` — update draft
- `POST /api/admin/invoices/{id}/send` — mark as sent, trigger email
- `POST /api/admin/invoices/{id}/mark-paid` — manual payment recording
- `DELETE /api/admin/invoices/{id}` — only drafts
- `GET /api/admin/tax-rates` — list
- `POST /api/admin/tax-rates` — create
- `PUT /api/admin/tax-rates/{id}` — update
- `DELETE /api/admin/tax-rates/{id}` — soft-delete
- `GET /api/admin/coupons` — list
- `POST /api/admin/coupons` — create
- `PUT /api/admin/coupons/{id}` — update
- `DELETE /api/admin/coupons/{id}` — soft-delete

**Frontend:**
- Replace hardcoded invoice data with `useApi` calls
- Wire invoice create/edit modals
- Wire tax rates and coupons CRUD
- Add invoice PDF generation (stretch — could be backend job)

---

#### 1.4 Staff & RBAC

**Backend:**
- `POST /api/admin/staff/roles` — create role with permission set
- `PUT /api/admin/staff/roles/{id}` — update role permissions
- `DELETE /api/admin/staff/roles/{id}` — remove role (block if staff assigned)
- `POST /api/admin/staff` — invite staff member (assign role)
- `PUT /api/admin/staff/{id}` — update role assignment, status
- `DELETE /api/admin/staff/{id}` — deactivate

**Frontend:**
- Wire role create/edit modal save buttons
- Add staff invite flow
- Add permission matrix UI for role editing
- Enforce frontend route guards based on role permissions

---

### Phase 2: Service Provisioning & Infrastructure

Priority: **High** — core business function.

#### 2.1 Service Forms (order configurator)

**Backend:**
- `GET /api/admin/service-forms` — list forms
- `POST /api/admin/service-forms` — create form definition (JSON schema for fields)
- `PUT /api/admin/service-forms/{id}` — update
- `DELETE /api/admin/service-forms/{id}` — soft-delete
- Link products to service forms (`product.service_form_id`)

**Frontend:**
- Wire existing form builder UI to API
- Add form preview/test mode
- Link form selection in product editor

---

#### 2.2 Service Provisioning Wizard

**Backend:**
- `POST /api/admin/services` — create service record + queue provisioning job
- `POST /api/admin/services/{id}/actions` — power actions (start/stop/restart/reinstall)
- `GET /api/admin/services/{id}/console` — get VNC/console URL from connector
- `GET /api/admin/services/{id}/status` — live status from connector

**Frontend:**
- Build `/services/new` wizard:
  1. Select customer
  2. Select product
  3. Fill service form (dynamic fields from product's form)
  4. Select connector (auto or manual)
  5. Review & provision
- Wire ServiceDetail action buttons (reboot, reinstall, console)
- Add real provisioning status with job progress

---

#### 2.3 Job Queue Administration

**Backend:**
- `GET /api/admin/jobs` — list with filters (status, type, pagination)
- `GET /api/admin/jobs/{id}` — single with logs/attempts
- `POST /api/admin/jobs/{id}/retry` — reset failed job for retry
- `POST /api/admin/jobs/{id}/cancel` — cancel pending/running job

**Frontend:**
- Replace hardcoded job list with API data
- Wire retry/cancel buttons
- Add job detail view with execution log
- Add auto-refresh (polling every 5s for active jobs)

---

### Phase 3: Communication & Logging

Priority: **Medium** — operational visibility.

#### 3.1 Email System

**Backend:**
- `GET /api/admin/email-log` — list sent emails with filters (recipient, template, status, date)
- `GET /api/admin/email-log/{id}` — single with rendered body
- `POST /api/admin/email/send` — send ad-hoc email (select template + recipient)

**Frontend:**
- Wire email log page to API
- Make search/filter inputs functional
- Add email detail view (rendered HTML preview)
- Add "Send Test Email" from template editor

---

#### 3.2 Notifications Enhancement

**Frontend (existing endpoints sufficient):**
- Add real-time notification badge in header (polling or WebSocket)
- Add notification preferences per staff member
- Group notifications by type/date
- Add bulk actions (mark all read, dismiss all)

---

### Phase 4: Analytics & Reporting

Priority: **Medium** — business intelligence.

#### 4.1 Dashboard Charts

**Backend:**
- `GET /api/admin/dashboard/revenue` — revenue over time (daily/weekly/monthly)
- `GET /api/admin/dashboard/growth` — customer/service growth over time
- `GET /api/admin/dashboard/tickets-summary` — ticket volume, avg resolution time

**Frontend:**
- Implement revenue trend chart (Recharts line chart)
- Implement customer growth chart
- Implement ticket volume/resolution chart
- Make time range selectable (7d, 30d, 90d, 1y)

---

#### 4.2 Reports & Exports

**Backend:**
- `GET /api/admin/reports/revenue` — detailed revenue report with breakdowns
- `GET /api/admin/reports/services` — service utilization report
- `GET /api/admin/reports/export` — CSV/JSON export endpoint (accept report type + date range)

**Frontend:**
- Wire report data to existing Reports page
- Enable CSV download buttons
- Add date range picker for all reports
- Add scheduled report generation (stretch)

---

#### 4.3 Billing Insights

**Backend:**
- `GET /api/admin/billing/insights` — MRR, churn, ARPU, outstanding balance, overdue count
- `GET /api/admin/billing/forecast` — projected revenue (stretch)

**Frontend:**
- Replace hardcoded financial figures with live data
- Add MRR trend chart
- Add outstanding/overdue invoice breakdown

---

### Phase 5: Production Hardening

Priority: **Critical** before go-live.

#### 5.1 Authentication & Security

- [ ] Implement token refresh (silent renew before expiry)
- [ ] Add session timeout with warning modal
- [ ] Implement RBAC enforcement on backend (middleware that checks staff role permissions per route)
- [ ] Add rate limiting on all admin endpoints
- [ ] Add audit trail for all write operations (who changed what, when)
- [ ] CSRF protection on state-changing endpoints
- [ ] Input validation on all POST/PUT bodies (backend already uses strong types, add explicit validation layer)
- [ ] Sanitize any user-generated HTML (ticket messages, email templates)

---

#### 5.2 Error Handling & Resilience

- [ ] Global error boundary with user-friendly error page
- [ ] Toast notification system for success/error feedback on mutations
- [ ] Retry logic for transient network failures (useApi enhancement)
- [ ] Loading skeletons for all data-fetching pages (replace spinner-only states)
- [ ] Optimistic updates for common actions (mark read, status changes)
- [ ] Request deduplication (prevent double-submit on slow connections)

---

#### 5.3 Testing

- [ ] Add Vitest + React Testing Library
- [ ] Unit tests for utility functions and hooks (useApi, auth helpers)
- [ ] Component tests for critical flows (login, invoice creation, service provisioning)
- [ ] Integration tests for API client (mock server responses)
- [ ] E2E tests with Playwright for golden paths:
  - Login flow
  - Create customer → create service → verify provisioning
  - Create invoice → send → mark paid
  - Ticket lifecycle (create → reply → resolve)

---

#### 5.4 Performance & UX

- [ ] Pagination on all list pages (most already have it, ensure consistency)
- [ ] Debounced search inputs
- [ ] Route-based code splitting (React.lazy for each page group)
- [ ] Image/asset optimization (if any)
- [ ] Keyboard shortcuts for common actions (Escape to close modals, Ctrl+Enter to submit)
- [ ] Responsive design audit (sidebar collapse on mobile)
- [ ] Dark mode support (CSS variables are in place, add toggle)

---

#### 5.5 DevOps & Deployment

- [ ] Environment-specific configs (.env.production, .env.staging)
- [ ] Docker build for admin SPA (nginx serving static files)
- [ ] CI pipeline (lint + type-check + test + build)
- [ ] Health check endpoint integration (show API health in admin footer)
- [ ] Version display in UI (git hash or package version)
- [ ] Error tracking integration (Sentry or similar)

---

## Recommended New Features & Enhancements

### High Value Additions

| Feature | Rationale |
|---------|-----------|
| **Bulk Actions** | Select multiple customers/invoices/tickets and apply batch operations (suspend, send invoice, close tickets) |
| **Search Command Palette** | Cmd+K to search across customers, tickets, services — fast navigation |
| **Activity Feed (real-time)** | WebSocket-driven live feed showing system events as they happen |
| **Webhook Management** | Allow admin to configure outgoing webhooks for events (new order, ticket created, payment received) |
| **API Key Management** | Issue/revoke API keys for third-party integrations |
| **Scheduled Actions** | Schedule invoice sends, service suspensions, maintenance windows |
| **Customer Communication Log** | Unified timeline of all interactions (emails, tickets, notes) per customer |
| **Multi-currency Support** | If serving international customers — currency on invoices, exchange rates |
| **SLA Tracking** | Track response/resolution time commitments per department/priority |
| **Staff Activity Dashboard** | Who resolved what, response times, workload distribution |

### UX Enhancements to Existing Features

| Enhancement | Where |
|-------------|-------|
| **Inline editing** | Customer notes, ticket priority, service labels — click to edit without modal |
| **Drag-and-drop** | Reorder service form fields, email template sections |
| **Rich text editor** | Ticket replies and email templates (TipTap or similar) |
| **File attachments** | Tickets (customer uploads screenshots, staff attaches docs) |
| **Saved filters/views** | Ticket views like "My Open Tickets", "Overdue Invoices" |
| **Breadcrumb navigation** | Currently missing — add for deep pages (Customer > Detail > Invoices) |
| **Undo for destructive actions** | Soft-delete with 10s undo toast instead of confirmation modals |
| **Relative timestamps** | "2 hours ago" with hover for absolute time |
| **Favicon badge** | Unread notification count in browser tab |

---

## Implementation Order (Recommended)

```
Week 1-2:  Phase 1.1 (Customer write ops) + 1.2 (Tickets)
Week 3-4:  Phase 1.3 (Billing/Invoices) + 1.4 (Staff RBAC)
Week 5-6:  Phase 2.1 (Service Forms) + 2.2 (Provisioning Wizard)
Week 7:    Phase 2.3 (Job Queue) + 3.1 (Email)
Week 8:    Phase 4 (Analytics/Reports)
Week 9-10: Phase 5 (Hardening — auth, errors, testing, perf)
```

Each phase requires work in both repos (VaultScope-API for endpoints, VaultScope-Admin for frontend wiring). Backend endpoints should be built first per phase, then frontend wired to them.

---

## Estimated Scope

| Category | Items | Effort |
|----------|-------|--------|
| New backend endpoints | ~45 routes | Large |
| Frontend pages to wire | ~15 pages | Medium |
| New frontend pages | 2-3 (provisioning wizard, job detail, email detail) | Medium |
| Testing setup + coverage | From 0 to baseline | Medium |
| Security/auth hardening | Token refresh, RBAC, rate limiting | Medium |
| DevOps | Docker, CI, monitoring | Small-Medium |

**Total estimated: 8-10 weeks** for a single developer working both repos, assuming no scope creep. Can be parallelized with 2 developers (one backend, one frontend) to ~5-6 weeks.
