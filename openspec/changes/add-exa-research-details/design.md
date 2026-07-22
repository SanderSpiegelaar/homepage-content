## Context

Exa research runs are stored before dispatch and currently end in `started` after n8n accepts the request. The application has no representation of downstream completion, no callback boundary, and no owner-scoped details read. n8n will POST `{ runId, data }`, where `data` is an array of website records with ranking counts, topic and section lists, and an SEO value classification.

The callback is machine-to-machine, while the details UI remains inside the authenticated dashboard. Existing Drizzle, Effect schema patterns, and shadcn/ui primitives are sufficient; no new dependency is needed.

## Goals / Non-Goals

**Goals:**
- Validate and authenticate n8n callbacks at the server boundary.
- Store the complete validated result once and transition the associated run to `completed` atomically.
- Let only the run owner view run metadata and every returned website field.
- Give useful pending/started/completed states before and after results arrive.

**Non-Goals:**
- Editing, deleting, filtering, or exporting result records.
- Callback retries that replace an already stored result.
- General-purpose webhook infrastructure or provider SDK integration.
- Normalizing result fields for cross-run analytics.

## Decisions

### Store one validated JSONB result per run

Add an `exa_research_result` table keyed by `run_id`, with a JSONB `data` column and `received_at`. The run foreign key cascades on deletion, and the primary key enforces one accepted payload per run.

This mirrors the callback contract, preserves array order, and avoids a wide child table when the immediate requirement is whole-run display. A normalized website-row table was considered, but adds transaction and mapping complexity without a current query requirement.

### Add an explicit completed lifecycle state

Extend the existing run status enum with `completed`. Callback persistence and the run transition happen in one database transaction, and callbacks are accepted only for a known run that has not already completed. The details page can therefore distinguish an accepted workflow from received results without inferring state from a nullable join.

Leaving status as `started` and checking for a result was considered, but would make lifecycle presentation and future querying ambiguous.

### Authenticate the callback with a server-only bearer secret

The route reads a dedicated environment secret and requires an exact `Authorization: Bearer ...` match before processing the body. Missing server configuration fails closed. Responses remain generic: unauthorized requests receive `401`, malformed payloads `400`, unknown runs `404`, duplicate/conflicting callbacks `409`, and successful creation `201`.

A user session cannot authenticate n8n, and accepting the run UUID alone would make the UUID a bearer credential. Request signing was considered but is unnecessary unless replay resistance beyond one-time persistence becomes required.

### Validate the complete payload at the route boundary

Define a runtime schema for `runId` and every supplied website field. Ranking positions are non-negative integers; topic and section fields are string arrays; website type and SEO value are constrained non-empty strings so n8n can add classifications without a database migration. Reject an empty result array and unknown extra fields only if the repository's existing schema convention does so consistently.

Database checks protect the one-result relationship, while the runtime schema protects JSON shape. Duplicating every classification as a database enum was rejected because those values are workflow-owned and may evolve.

### Render details as an authenticated server page

Add `/exa-research/[id]` under the existing dashboard route group. The page resolves the session, fetches the run and optional result with `user_id` included in the query, and returns the framework not-found response when no owned run exists. The history keyword links to this route. Existing cards, badges, tables, and responsive overflow styling present metadata and all website fields; no client state is needed.

## Risks / Trade-offs

- [JSONB is not optimized for cross-run website analytics] → Normalize later only when a concrete query or indexing requirement appears.
- [A leaked callback secret permits forged callbacks] → Keep it server-only, fail closed when absent, and allow operational rotation in both services.
- [n8n may retry after a lost success response] → Return `409` without replacing stored data; add an idempotent identical-payload success policy only if retry behavior requires it.
- [Large result arrays can increase request and render cost] → Apply a bounded array length in validation and use the existing request-body limits; paginate only after observed payload size requires it.
- [Workflow classifications may evolve] → Validate stable field types while storing classification strings rather than database enums.

## Migration Plan

1. Add the `completed` enum value and `exa_research_result` table through a generated Drizzle migration.
2. Deploy the application with the callback secret configured.
3. Configure n8n to POST the documented payload and bearer credential to the new endpoint.
4. Existing runs remain valid in their current states and show a waiting state until a result is received.

Rollback removes application use of the new route and table; received result rows must be exported before dropping the table if they need preservation. The enum value can remain harmlessly in PostgreSQL during rollback.

## Open Questions

- Confirm the production callback URL and the environment variable name shared with n8n during implementation; the proposed application name is `N8N_EXA_RESEARCH_INGEST_SECRET`.
- Confirm the practical maximum websites per callback; use a conservative validation bound if n8n has no documented limit.
