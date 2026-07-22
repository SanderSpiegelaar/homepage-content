# Research Library

## Purpose

Own research request validation, persisted run and result lifecycles, and server-side n8n integration.

## Ownership

- `research.ts` owns framework-independent request orchestration.
- `runs.ts` and `schema.ts` own user-scoped persistence, result storage, payload schemas, and lifecycle transitions.
- `status.ts` owns best-effort page-open reconciliation from normalized n8n execution state to Exa run state.
- `n8n.ts` owns the Effect-based outbound HTTPS webhook boundary, typed dispatch failures, local dependency layer, Promise adapter, development request/response logging, and request/response schemas.
- `ingestion.ts` owns callback authentication, validation, safe responses, and persistence orchestration.

## Local Contracts

- Create runs as `pending`; only explicit authenticated start actions may dispatch them.
- Scope every read and mutation to the authenticated owner.
- Runtime-validate `{ id, keyword }` before sending it to the fixed n8n research webhook and persist only a schema-validated, non-empty execution identifier.
- Never expose webhook URLs, response bodies, or internal errors in the UI.
- Development n8n logs use the run ID for correlation, omit authorization data and raw webhook URLs, and do not alter error propagation.
- Prevent duplicate dispatch by atomically claiming only `pending` or `failed` runs.
- Delete runs with one owner-scoped mutation; rely on the result foreign key cascade and do not imply that deletion cancels n8n work.
- Accept one validated result per known run, persist it with the `completed` transition atomically, and never replace it on callback retry.
- Scope details reads to the authenticated owner; callback writes authenticate with the server-only shared secret instead of a user session.
- Keep expected n8n failures in the Effect error channel, unexpected faults as defects, and the public dispatcher Promise-compatible.
- Reconcile only owner-scoped runs with execution identifiers; preserve completed runs and current executions during concurrent callbacks or retries.
- Treat page-open status checks as best effort: persist terminal success or failure, leave active runs unchanged, and render stored data when lookup fails.

## Work Guidance

- Provide fetch, logging, destination, and timeout through the local n8n Effect layer and retain a bounded timeout.
- Do not retry webhook submission until n8n idempotency is guaranteed.
- Fix response compatibility at the shared n8n boundary, not in individual callers.

## Verification

- Run `bun test lib/research` and `bun run typecheck`.

## Child DOX Index

- None.
