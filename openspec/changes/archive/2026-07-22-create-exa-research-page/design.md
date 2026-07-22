## Context

The authenticated dashboard currently has a root-page keyword form whose server action immediately calls the generic n8n research webhook. No research-run model exists, so submitted work cannot be listed or associated with the execution identifier returned by n8n. The change crosses the dashboard UI, authenticated server actions, Drizzle schema, and the existing server-only n8n boundary.

## Goals / Non-Goals

**Goals:**

- Persist user-owned research runs before any external request is made.
- Provide one authenticated page for creating, listing, and explicitly starting runs.
- Store the n8n `executionId` and visible lifecycle state for each run.
- Prevent unauthorized access and accidental duplicate starts.
- Reuse the existing application stack and shadcn/ui components.

**Non-Goals:**

- Polling n8n for progress or results.
- Cancelling, deleting, editing, filtering, sorting, or paginating runs.
- Calling Exa directly or adding AI/search provider SDKs.
- Importing historical requests that were never persisted.

## Decisions

### Store user-owned run lifecycle records in PostgreSQL

Add an `exaResearchRun` Drizzle table with an application-generated text ID, owner `userId`, trimmed `keyword`, status, nullable `executionId` and failure message, plus created, updated, and started timestamps. Index the owner and creation timestamp for the page query. Listing and mutation queries are always scoped to the authenticated user.

A durable row is preferred over browser state or an audit-only event because it must survive sessions and be updated with the external execution identifier.

### Separate create from start

The create server action validates the current session and keyword, inserts a `pending` row, and never calls n8n. A separate row action starts only a pending or failed run owned by the current user. The action claims the row as `starting` before dispatch so repeated clicks cannot intentionally start the same row twice, then records `started`, `executionId`, and `startedAt` on success or `failed` with a safe message on failure.

This replaces immediate dispatch rather than adding a second path, ensuring every new run is persisted first.

### Keep n8n behind the existing server-only boundary

Adapt the existing n8n helper to POST JSON containing exactly `{ keyword }` to `https://n8n.office.vinden.nl/webhook/ace/v2/exa-agent-research`, retain the existing timeout and injectable fetch used by tests, and validate an OK JSON response with `success: true` and a non-empty `executionId`. Provider response details stay server-side; the database and UI receive only the validated identifier or a safe failure message.

A direct client request is rejected because it would bypass authentication and persistence. A provider SDK is unnecessary and prohibited by project constraints.

### Use a server-rendered list with minimal client controls

Render the current user's runs on the Exa Research route from the database. Compose the UI from shadcn/ui form, table, badge, button, and dropdown-menu primitives; use server actions and route revalidation after mutations. A full table-state library is unnecessary because sorting, filtering, and pagination are out of scope.

The existing root research intake is moved/replaced by this dedicated route, and the sidebar gains an Exa Research destination with active-state feedback.

## Risks / Trade-offs

- **[The n8n request succeeds but persisting the response fails]** → The row remains `starting` and may require operator reconciliation; never automatically retry an ambiguous external start.
- **[A worker dies after claiming a row]** → Display `starting` as non-startable to avoid duplicate external executions; operational recovery can update the row after checking n8n.
- **[Run history grows large]** → Initial rendering loads all runs for the current user as requested; add pagination only when measured volume requires it.
- **[Webhook response shape changes]** → Reject malformed responses and retain the run with a visible failed state rather than storing an invalid identifier.

## Migration Plan

1. Add and apply the research-run database migration before deploying the page.
2. Deploy the server actions, n8n response validation, Exa Research route, and navigation together.
3. Verify create leaves a pending row and start stores the returned execution identifier.
4. Roll back application code independently if needed; retain the additive table and its data.

## Open Questions

None required for implementation.
