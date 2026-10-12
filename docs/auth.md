# Admin Authentication Flow

## Mechanism
- Authentication uses `POST /api/auth/init-login` followed by `/api/auth/callback/admin`.
- The token is stored in localStorage as `vs_admin_token`.
- Every request using `src/lib/api.ts` attaches this token as a Bearer header.
- CSRF protection relies on an `x-csrf-token` fetched from `/api/csrf` on non-GET requests.

## Security Constraints
- The backend validates the JWT `audience` claim specifically for `Audience::Admin`.
- Access is strictly governed by the backend's `roles` table. The frontend relies on the backend to enforce `require_permission!` (e.g. `jobs.view`).
