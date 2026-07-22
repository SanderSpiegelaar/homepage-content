# Library Modules

## Purpose

Own server and client domain logic shared by routes and components.

## Ownership

- `auth` owns Better Auth configuration and schema.
- `db` owns the Drizzle database connection and schema exports.
- `email` owns transactional email behavior.
- `research` owns research validation, persistence, lifecycle, and n8n dispatch.
- `utils.ts` owns shared presentation utilities.

## Local Contracts

- Keep server-only modules marked with `server-only`.
- Keep trust-boundary validation and safe user-facing errors in domain logic.
- Do not add provider-specific AI or search SDKs; workflow execution belongs to n8n.

## Work Guidance

- Prefer small domain functions with injectable external boundaries for focused tests.

## Verification

- Run the affected `*.test.ts` files and `bun run typecheck`.

## Child DOX Index

- [`auth/AGENTS.md`](auth/AGENTS.md): authentication configuration and security boundary.
- [`db/AGENTS.md`](db/AGENTS.md): database connection and schema exports.
- [`email/AGENTS.md`](email/AGENTS.md): transactional email behavior.
- [`research/AGENTS.md`](research/AGENTS.md): research workflow lifecycle and n8n integration.
