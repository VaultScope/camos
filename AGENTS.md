# VaultScope Admin

## Verified Commands
- Install: `npm i`
- Dev Server: `npm run dev`
- Build: `npm run build` (tsc -b && vite build)
- Lint: `npm run lint` (oxlint)
- Test: `npm run test` (vitest run)

## Invariants & Conventions
- React 19 functional components with hooks.
- Tailwind 4 for styling with `clsx` and `tailwind-merge`.
- Types are manually maintained in `src/lib/types.ts`.
- TipTap is used for rich text editing.

## Interfaces to Ecosystem
- **API**: Connects exclusively to `VaultScope-API` endpoints under `/api/admin/*`.
- **Storefront**: No direct link.
- API Client: Handled via `src/lib/api.ts` which uses `localStorage` (`vs_admin_token`).
- Token validation is strictly checked via `Audience::Admin` on the backend.

## No-Go Areas & Pitfalls
- **Auth**: Admin JWTs are distinctly segregated from Storefront JWTs by audience.
- **Testing**: Many interactions require `act(...)` wrapping, failing to do so causes warnings in vitest logs.
- **Roles**: All access is governed by staff roles set in the API database, not locally.

## Detail Docs
- [API Contract](/CONTRACT_MISMATCHES.md)
- [Auth Flow](docs/auth.md)
