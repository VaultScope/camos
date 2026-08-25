# CAMOS (VaultScope Control & Administrative Management Operations System)

CAMOS is the staff-facing administrative portal for the VaultScope ecosystem. Built with React and Vite, it gives support staff and administrators complete oversight and management capabilities for the entire platform.

## Features
- **Product Management**: Create, edit, and categorize infrastructure plans and map them to upstream provider APIs (e.g., Hetzner, OVH).
- **Service Oversight**: View and manage all active customer services, instances, and statuses.
- **Support & Ticketing**: Respond to customer support and abuse tickets.
- **Financials**: Manage invoices, process refunds, and track margins.

## Getting Started

### Prerequisites
- Node.js 20+
- A running instance of [VaultScope-API](../VaultScope-API) (VAMOS)

### Installation
```bash
npm install
npm run dev
```

## Security & Testing
- **RBAC**: Enforces strict administrative checks. If an unauthorized user attempts to load CAMOS, the API securely rejects the requests.
- **Testing**: Built-in Vitest suites for verifying core administrative components. Run `npm test` to execute the suite.

## License
See the [LICENSE](LICENSE) file for details.
