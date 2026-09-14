# VaultScope Admin Panel E2E Tests

Comprehensive Playwright test suite for VaultScope admin panel with full RBAC coverage.

## Prerequisites

- Docker containers running
- Services accessible at:
  - Admin Panel: http://localhost:3001
  - Authentik: http://localhost:9000
  - API: http://localhost:8000

## Installation

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install chromium
```

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run specific test suite
npx playwright test e2e/admin-owner.spec.ts
npx playwright test e2e/admin-rbac-support.spec.ts

# Run with UI mode
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific role tests
npx playwright test -g "Support Role"
npx playwright test -g "Billing Role"
```

## Test Coverage

### admin-auth.spec.ts
- ✅ Authentication redirect to Authentik
- ✅ Owner login (admin1)
- ✅ User email display
- ✅ Invalid credentials rejection

### admin-owner.spec.ts (Test 4)
- ✅ Customer list loads
- ✅ Customer detail view
- ✅ Edit customer notes
- ✅ Change customer status (suspend/activate)
- ✅ Staff list shows all members
- ✅ All navigation sections accessible

### admin-rbac-support.spec.ts (Test 5)
- ✅ Support role login
- ✅ CAN access: Customers, Tickets, Services (read)
- ✅ CANNOT access: Staff, Invoices, Connectors, Settings

### admin-rbac-billing.spec.ts (Test 6)
- ✅ Billing role login
- ✅ CAN access: Customers, Invoices
- ✅ CANNOT access: Services, Staff, Connectors

### admin-rbac-technical.spec.ts (Test 7)
- ✅ Technical role login
- ✅ CAN access: Services, Connectors, Jobs
- ✅ CANNOT access: Customers, Invoices, Staff

### admin-security.spec.ts (Test 8-9)
- ✅ Invalid credentials blocked
- ✅ Unauthenticated access redirected
- ✅ CORS headers present
- ✅ SQL injection sanitized
- ✅ XSS attempts blocked

## Test Users

```
Owner:      admin1 / Admin123!      (Full access)
Support:    support1 / Support123!  (Customers, Tickets, Services read)
Billing:    billing1 / Billing123!  (Customers, Invoices)
Technical:  tech1 / Tech123!        (Services, Connectors, Jobs)
```

## Viewing Results

```bash
# Open HTML report
npx playwright show-report

# View traces
npx playwright show-trace trace.zip
```

## Known Issues

**UI-001:** Navigation shows restricted sections to non-Owner users (they get "Forbidden" on click)
- **Impact:** UX issue, security works correctly
- **Workaround:** API blocks unauthorized access

**SEC-005:** Permission format must use dots (`.`) not colons (`:`)
- **Fixed:** Database updated with correct format

**SEC-006:** Wildcard permissions not implemented
- **Fixed:** Using explicit permission grants

## CI Integration

```yaml
- name: Run Admin E2E tests
  run: |
    docker-compose -f docker-compose.full-stack.yml up -d
    npm run test:e2e
```
