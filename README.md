# CAMOS (VaultScope Control & Administrative Management Operations System)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-22.x-brightgreen.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-19-blue.svg)](https://react.dev)

The staff-facing administrative portal for the VaultScope ecosystem. Built with React 19 and Vite, CAMOS provides complete oversight and management capabilities for support staff and administrators.

## 🌟 Features

- **👥 Customer Management**: View and manage all customer accounts, services, and billing
- **📦 Product Management**: Create, edit, and categorize infrastructure plans, map to provider APIs
- **⚙️ Service Oversight**: Monitor and manage all active services, instances, and statuses
- **🎫 Support & Ticketing**: Respond to customer support and abuse tickets with full context
- **💰 Financial Management**: Manage invoices, process refunds, track margins and revenue
- **🔗 Connector Configuration**: Configure and test provider API integrations
- **📧 Email Template Management**: Customize automated email templates
- **👷 Staff Management**: Manage admin users and permissions
- **🔐 RBAC**: Role-based access control enforced at API level

## 📋 Prerequisites

- **Node.js**: 22.x or higher
- **npm**: 10.x or higher
- **VaultScope-API (VAMOS)**: Running instance
- **Authentik**: OIDC provider with admin client configured

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/VaultScope/camos.git
cd camos
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

Access at `http://localhost:5173`

## 📁 Project Structure

```
camos/
├── src/
│   ├── components/     # Reusable UI components
│   ├── lib/            # Core utilities (API, auth)
│   ├── pages/          # Route components
│   │   ├── Dashboard.tsx
│   │   ├── Customers.tsx
│   │   ├── Products.tsx
│   │   ├── Services.tsx
│   │   ├── Tickets.tsx
│   │   └── ...
│   └── App.tsx
├── documentation/      # Comprehensive documentation
└── e2e/               # Playwright E2E tests
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | VAMOS API base URL | `http://localhost:3000/api` |
| `VITE_AUTHENTIK_URL` | Authentik OIDC provider URL | `https://auth.vaultscope.de` |
| `VITE_OIDC_CLIENT_ID` | OIDC client ID for admin | `vaultscope-admin` |
| `VITE_OIDC_REDIRECT_URI` | OAuth2 callback URL | `http://localhost:5173/auth/callback` |

## 📚 Documentation

- **[Getting Started](documentation/GETTING_STARTED.md)** - Setup guide
- **[Development](documentation/DEVELOPMENT.md)** - Development workflows
- **[Deployment](documentation/DEPLOYMENT.md)** - Production deployment

## 🔒 Security

- **RBAC Enforcement**: API verifies admin role for all endpoints
- **OIDC Authentication**: Secure authentication via Authentik
- **CSRF Protection**: Token-based CSRF validation
- **Audit Logging**: All admin actions are logged

See [SECURITY.md](SECURITY.md) for comprehensive security practices.

## 🧪 Testing

```bash
npm test                 # Unit tests
npx playwright test      # E2E tests
npm run lint            # Linting
```

## 📦 Building for Production

```bash
npm run build
# Output in dist/

# Docker
docker build -t vaultscope/camos:latest .
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🔗 Related Projects

- **[vamos](https://github.com/VaultScope/vamos)** - VaultScope API (Rust)
- **[website](https://github.com/VaultScope/website)** - VaultScope Storefront (React)

---

Built with ❤️ by the VaultScope team
