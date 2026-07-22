# Research Library

## Purpose

Own research request validation, persisted run lifecycle, and server-side n8n dispatch.

## Ownership

- `research.ts` owns framework-independent request orchestration.
- `runs.ts` and `schema.ts` own user-scoped persistence and lifecycle transitions.
- `n8n.ts` owns the HTTPS webhook boundary and response validation.

## Local Contracts

- Create runs as `pending`; only explicit authenticated start actions may dispatch them.
- Scope every read and mutation to the authenticated owner.
- Send `{ id, keyword }` to the fixed n8n research webhook and persist only a validated, non-empty execution identifier.
- Never expose webhook URLs, response bodies, or internal errors in the UI.
- Prevent duplicate dispatch by atomically claiming only `pending` or `failed` runs.

## Work Guidance

- Keep fetch injectable and retain a bounded timeout.
- Fix response compatibility at the shared n8n boundary, not in individual callers.

## Verification

- Run `bun test lib/research` and `bun run typecheck`.

## Child DOX Index

- None.
