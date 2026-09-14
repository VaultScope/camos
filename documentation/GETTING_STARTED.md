# Getting Started with CAMOS

Quick setup guide for the VaultScope Admin Panel.

## Prerequisites

- Node.js 22+
- Running VaultScope API (VAMOS)
- Authentik with admin client configured

## Installation

```bash
# Clone
git clone https://github.com/VaultScope/camos.git
cd camos

# Install dependencies
npm install

# Configure
cp .env.example .env
nano .env

# Start
npm run dev
```

## Configuration

Edit `.env`:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_AUTHENTIK_URL=https://auth.vaultscope.de
VITE_OIDC_CLIENT_ID=vaultscope-admin
VITE_OIDC_REDIRECT_URI=http://localhost:5173/auth/callback
```

## Authentik Setup

In Authentik, create OAuth2/OIDC provider:
- Client ID: `vaultscope-admin`
- Redirect URI: `http://localhost:5173/auth/callback`
- Scopes: `openid profile email`

## Development

```bash
npm run dev      # Start dev server
npm test         # Run tests
npm run lint     # Lint code
npm run build    # Production build
```

## First Login

1. Navigate to `http://localhost:5173`
2. Click "Login"
3. Authenticate with Authentik
4. You'll be redirected to the dashboard

**Note**: Your user must have admin role in the API database.

## Common Issues

### "Unauthorized" after login
- Verify your user has admin role in database
- Check JWT token in localStorage
- Ensure API CORS includes `http://localhost:5173`

### Can't connect to API
- Verify API is running: `curl http://localhost:3000/api/health`
- Check `VITE_API_URL` in `.env`

### Authentication fails
- Verify Authentik is accessible
- Check client ID and redirect URI match Authentik
- Clear localStorage and try again

## Next Steps

- Read [DEVELOPMENT.md](DEVELOPMENT.md) for development workflows
- Review admin panel features
- Configure provider connectors
