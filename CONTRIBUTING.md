# Working agreement (solo now, team later)

- Branch from `main`: `feat/…`, `fix/…`. Small PRs, even if self-reviewed.
- Before pushing: `pnpm typecheck && pnpm lint && pnpm test`.
- Schema change → `pnpm migrate:dev -- --name <what_changed>` and commit the generated migration.
- Update `SCOPE.md` / `docs/OPEN_QUESTIONS.md` when a decision is made — docs are part of the deliverable.
- Design/content edits only touch `globals.css` tokens and `apps/web/src/config/site.ts`.
- **Strict error codes**: All API errors must return a domain-specific `code` defined in `packages/shared` (`DOMAIN_ENTITY_REASON` format, e.g. `AUTH_INVALID_CREDENTIALS`, `ORDER_INVALID_TRANSITION`). Never return generic codes like "error", "bad_request", or raw HTTP exception names.
