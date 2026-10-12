# CAMOS (VaultScope-Admin) — Lifecycle Guide
## Installation, Upgrading, and Uninstallation

This document provides complete instructions for installing, upgrading, and uninstalling CAMOS (Control & Administrative Management Operations System), the staff-facing administrative portal of the VaultScope ecosystem.

---

## 1. Overview & Architecture

CAMOS is a responsive single-page web application (SPA) built with:
- **React 19 & Vite 8**: Modern component architecture and rapid asset bundling
- **Tailwind CSS 4**: Modern styling system
- **TipTap Editor**: Rich-text editing for customer support tickets and email templates
- **Recharts**: Telemetry and Monthly Recurring Revenue (MRR) financial analytics
- **Nginx Alpine**: Minimal web server serving static assets and handling client-side SPA routing fallbacks

### Default Ports & Networking
- **Internal Container Port**: `80`
- **Host Port**: `8081` (production stack) or `3001` (local full-stack)
- **Health Check**: `GET http://127.0.0.1:80` (verifies Nginx serves `index.html`)

---

## 2. Prerequisites & System Requirements

### Production Requirements
- **OS**: Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+, RHEL 8+)
- **Docker**: Version 24+ & Docker Compose v2
- **VAMOS API**: Running backend instance (`http://localhost:3000/api` or `https://api.your-domain.com/api`)
- **Authentik**: OIDC provider with configured client ID `vaultscope-admin`
- **Database Staff Account**: Staff role configured in VAMOS PostgreSQL database

### Bare-Metal Development Requirements
- **Node.js**: 22.x or higher
- **npm**: 10.x or higher

---

## 3. Installation Methods

### Method A: Automated Full-Stack Installation (Production)
Run the root production installer from the host:
```bash
curl -fsSL https://raw.githubusercontent.com/VaultScope/website/dev/installer.sh | sudo bash
```
The installer automatically:
1. Clones CAMOS into `/opt/vaultscope/camos`.
2. Bakes build-time environment variables (`VITE_*`) into the static bundle.
3. Configures Nginx reverse proxy with Let's Encrypt SSL certificates for `admin.your-domain.com`.
4. Starts the `vaultscope-admin` container and integrates it into systemd.

---

### Method B: Standalone Docker Container Deployment
Because Vite embeds environment variables into the compiled client JavaScript at build time, supply all `VITE_*` parameters as Docker build arguments:
```bash
# 1. Clone repository
git clone https://github.com/VaultScope/camos.git
cd camos

# 2. Build Docker container with build arguments
docker build -t vaultscope-admin \
  --build-arg VITE_API_URL=https://api.your-domain.com/api \
  --build-arg VITE_AUTHENTIK_URL=https://auth.your-domain.com \
  --build-arg VITE_OIDC_CLIENT_ID=vaultscope-admin \
  --build-arg VITE_OIDC_REDIRECT_URI=https://admin.your-domain.com/auth/callback .

# 3. Run container
docker run -d \
  --name vaultscope-admin \
  --restart unless-stopped \
  -p 8081:80 \
  vaultscope-admin
```

---

### Method C: Bare-Metal Local Development
```bash
# 1. Clone repository
git clone https://github.com/VaultScope/camos.git
cd camos

# 2. Install dependencies
npm install

# 3. Configure environment file
cp .env.example .env
nano .env

# 4. Start Vite development server
npm run dev
# The application will be available at http://localhost:5173
```

---

## 4. Configuration Reference (`.env`)

| Variable | Required | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | **Yes** | `https://api.vaultscope.de/api` | Base HTTP endpoint to the VAMOS API |
| `VITE_AUTHENTIK_URL` | **Yes** | `https://auth.vaultscope.de` | Authentik identity provider base URL |
| `VITE_OIDC_CLIENT_ID` | **Yes** | `vaultscope-admin` | Admin OIDC client ID configured in Authentik |
| `VITE_OIDC_REDIRECT_URI` | **Yes** | `https://admin.vaultscope.de/auth/callback` | Authorized redirect URI for token reception |

### Initial Staff User Promotion
After authenticating with Authentik for the first time, grant the user account `superadmin` privileges in the PostgreSQL database:
```sql
INSERT INTO staff (user_id, role, permissions, is_active)
VALUES (
  (SELECT id FROM users WHERE email = 'admin@your-domain.com'),
  'superadmin',
  '{"can_manage_products": true, "can_manage_billing": true, "can_manage_infrastructure": true, "can_view_logs": true}'::jsonb,
  true
)
ON CONFLICT (user_id) DO UPDATE 
SET role = 'superadmin', is_active = true;
```

---

## 5. Verification & Health Checks

```bash
# 1. Check container health
docker inspect --format='{{json .State.Health.Status}}' vaultscope-admin
# Expected output: "healthy"

# 2. Test internal Nginx server
docker exec -it vaultscope-admin wget -qO- http://127.0.0.1:80

# 3. Test public endpoint
curl -I https://admin.your-domain.com
# Expected output: HTTP/2 200 OK
```

---

## 6. Upgrading Procedures

### Automated Upgrades (`update.sh`)
```bash
sudo /opt/vaultscope/update.sh --branch=dev
```
The updater automatically snapshots the installation, pulls updated code, rebuilds the container without cache, and verifies uptime.

### Manual Container Upgrade
```bash
cd /opt/vaultscope
cd camos && git pull origin dev && cd ..
docker-compose -f docker-compose.production.yml build --no-cache admin
docker-compose -f docker-compose.production.yml up -d --no-deps admin
```

### Bare-Metal Upgrade
```bash
cd camos
git pull origin dev
npm install
npm run build
```

---

## 7. Uninstallation Procedures

### Complete System Uninstallation
```bash
sudo /opt/vaultscope/uninstall.sh
```

### Standalone Manual Teardown
```bash
# 1. Stop and remove Docker container
docker stop vaultscope-admin && docker rm vaultscope-admin

# 2. Remove Nginx configuration
sudo rm -f /etc/nginx/sites-enabled/admin.your-domain.com
sudo rm -f /etc/nginx/sites-available/admin.your-domain.com
sudo systemctl reload nginx

# 3. Delete application files
sudo rm -rf /opt/vaultscope/camos
```
