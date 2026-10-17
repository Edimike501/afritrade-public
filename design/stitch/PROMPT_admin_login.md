# Screen 20: Admin Dedicated Login (`apps/admin` `/login`)

## Purpose & Context
Allows platform administrators to authenticate into the AfriTrade Connect Operations Portal.
Per architecture and RULES.md, administrators are pre-seeded in the database (no public self-registration). The screen enforces strict credential entry, role guard protection (`ADMIN` role only), and explicit notice of administrative audit logging.

## Roles & Access Control
- Unauthenticated users attempting admin access.
- Role strictly validated on the backend: must have `Role.ADMIN`. If a buyer or supplier attempts login here, they are rejected with `AUTH_ROLE_UNAUTHORIZED`.

## Data & Actions
- **Header**: AfriTrade Connect Operations Portal with lock security badge.
- **Form Fields**:
  - Administrator Email Address (e.g. `admin@afritrade.internal` or `ops@afritrade.com`)
  - Master Password (with show/hide password toggle)
  - "Remember session on this secure workstation" checkbox
- **Security Notice**:
  - "Restricted Portal: Authorized AfriTrade administrative personnel only. All access attempts, session IP addresses, and operational actions are permanently recorded to admin audit logs."
- **Action**:
  - `Sign In to Operations Console` (Forest Green primary button, 44px height)
  - `Need access? Contact Platform Superadmin`

## Domain & Styling Rules
- Plain everyday English. No banned words: no `arteries`, `corridors`, `parity`, `exporter`.
- Brand Tokens: Warm Alabaster (`#FBF9F5`), Forest Green (`#1E3A2B`), Deep Charcoal (`#1B2420`), Clean borders (`#E5DFD7`).
- 100% mobile responsive down to 320px with minimum 44px tap targets.
