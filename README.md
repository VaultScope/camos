# CAMOS
**Client Administration & Management Operations System**

CAMOS is the centralized internal dashboard used by staff to manage **VaultScope** operations. Built with React, Vite, and Tailwind CSS, it acts as the primary control plane for billing, customer support, infrastructure API integrations, and staff role-based access control (RBAC).

## Features

- **Dashboard & Telemetry**: Visualize MRR, active servers, open tickets, and infrastructure node capacity.
- **Customers & Billing**: View client profiles, manage Stripe subscriptions/invoices, handle tax rates, and generate promotional coupons.
- **Service & Product Management**: Map retail plans to underlying upstream infrastructure. Support for custom configuration options (SSH keys, root passwords, Pterodactyl node variables, datacenter locations).
- **API Connectors**: Natively route API calls to infrastructure providers:
  - **Authentik**: Single Sign-On (SSO) and OIDC attribute-based RBAC.
  - **Mailcow**: Transactional emails and department-based IMAP mailbox routing.
  - **Stripe**: Billing and payment gateway processing.
  - **Infrastructure**: Hetzner Cloud, Hetzner Robot, OVH BareMetal, Pterodactyl, and Proxmox VE.
- **Support Desk**: Fully-featured ticketing system supporting general support, abuse reports, and DMCA takedowns directly mapped to Mailcow IMAP mailboxes.
- **Internal Launchpad**: Quick access portal to sovereign OSS tools (Coolify, Uptime Kuma, Beszel, Forgejo, Listmonk) restricted by staff RBAC permissions.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd VaultScope-Admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Development & Routing
This application relies heavily on nested routing structure via `react-router-dom`. Major domains are split into their respective pages and sub-routers:
- `/tickets/*` -> `TicketsRouter`
- `/billing/*` -> `BillingRouter`
- `/services/*` -> `ServicesRouter`
- `/products/*` -> `ProductsRouter`
- `/connectors/*` -> `ConnectorsRouter`
- `/staff/*` -> `StaffRouter`

## Authentication
Authentication is strictly handled by **Authentik**. Local password logins are intentionally disabled for security. Staff members are dynamically mapped to RBAC permissions via OIDC Group claims (`vaultscope_admins`, `support_t1`, etc.).
