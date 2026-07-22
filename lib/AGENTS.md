# Library Modules

## Purpose

Own server and client domain logic shared by routes and components.

## Ownership

- `auth` owns Better Auth configuration and schema.
- `db` owns the Drizzle database connection and schema exports.
- `email` owns transactional email behavior.
- `research` owns research validation, persistence, lifecycle, and n8n dispatch.
- `logger.ts` owns server-only structured logging, development formatting, and redaction.
- `n8n.ts` owns the stage-agnostic, server-only n8n execution status boundary and normalized execution states.
- `utils.ts` owns shared presentation utilities.

## Local Contracts

- Keep server-only modules marked with `server-only`.
- Keep trust-boundary validation and safe user-facing errors in domain logic.
- Do not add provider-specific AI or search SDKs; workflow execution belongs to n8n.
- Detailed integration request and response records are development-only and must redact credential-shaped fields.
- Adopt Effect only for intentionally migrated server workflows; keep expected failures typed internally and retain Promise adapters for existing Promise-based callers.
- Read n8n execution status only through the authenticated server boundary; runtime-validate responses and never expose API credentials or raw responses.

## Work Guidance

- Prefer small domain functions with injectable external boundaries for focused tests.

## Verification

- Run the affected `*.test.ts` files and `bun run typecheck`.
- Logger changes must cover development output, non-development suppression, and redaction.

## Child DOX Index

- [`auth/AGENTS.md`](auth/AGENTS.md): authentication configuration and security boundary.
- [`db/AGENTS.md`](db/AGENTS.md): database connection and schema exports.
- [`email/AGENTS.md`](email/AGENTS.md): transactional email behavior.
- [`research/AGENTS.md`](research/AGENTS.md): research workflow lifecycle and n8n integration.
