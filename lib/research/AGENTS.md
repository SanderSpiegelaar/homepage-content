# Research Library

## Purpose

Own research request validation, persisted run lifecycle, and server-side n8n dispatch.

## Ownership

- `research.ts` owns framework-independent request orchestration.
- `runs.ts` and `schema.ts` own user-scoped persistence and lifecycle transitions.
- `n8n.ts` owns the Effect-based HTTPS webhook boundary, typed dispatch failures, local dependency layer, Promise adapter, development request/response logging, and request/response schemas.

## Local Contracts

- Create runs as `pending`; only explicit authenticated start actions may dispatch them.
- Scope every read and mutation to the authenticated owner.
- Runtime-validate `{ id, keyword }` before sending it to the fixed n8n research webhook and persist only a schema-validated, non-empty execution identifier.
- Never expose webhook URLs, response bodies, or internal errors in the UI.
- Development n8n logs use the run ID for correlation, omit authorization data and raw webhook URLs, and do not alter error propagation.
- Prevent duplicate dispatch by atomically claiming only `pending` or `failed` runs.
- Keep expected n8n failures in the Effect error channel, unexpected faults as defects, and the public dispatcher Promise-compatible.

## Work Guidance

- Provide fetch, logging, destination, and timeout through the local n8n Effect layer and retain a bounded timeout.
- Do not retry webhook submission until n8n idempotency is guaranteed.
- Fix response compatibility at the shared n8n boundary, not in individual callers.

## Verification

- Run `bun test lib/research` and `bun run typecheck`.

## Child DOX Index

- None.
