## Context

Exa research runs persist the n8n execution identifier after webhook dispatch and currently reach `completed` only when n8n posts a result callback. If that callback is delayed or fails, opening the UI can show stale state even though n8n already has a terminal execution outcome. The status lookup must be reusable by future workflow stages, remain server-only, preserve owner scoping, and follow the existing Effect-based n8n boundary.

## Goals / Non-Goals

**Goals:**
- Provide one stage-agnostic server function that retrieves and runtime-validates an n8n execution by its execution identifier.
- Normalize n8n outcomes to a small internal execution state and let each stage own the persistence mapping.
- Reconcile eligible Exa research runs before rendering their list or detail page.
- Keep page rendering available when n8n status lookup fails.

**Non-Goals:**
- Poll n8n continuously, schedule background jobs, or subscribe to execution events.
- Replace the existing result callback or retrieve result payloads through the status endpoint.
- Query runs that do not have an n8n execution identifier.
- Add an n8n SDK or expose n8n credentials to the browser.

## Decisions

### Use the n8n execution endpoint

The server will issue an authenticated `GET` to the configured n8n REST API execution endpoint for the persisted execution identifier. The base URL and API key remain server environment values, and the response is runtime-decoded at the boundary. This uses the identifier already stored on a run and avoids ambiguous workflow-level searches. A workflow-list query was rejected because one workflow can have many executions and would require extra correlation logic.

### Keep lookup generic and persistence stage-owned

The n8n boundary will return a normalized result such as `running`, `succeeded`, or `failed`; it will not import Exa tables or statuses. Exa orchestration will map `running` to no transition, `succeeded` to `completed`, and terminal unsuccessful outcomes to `failed`, using an owner-scoped conditional update. This is the smallest reusable seam for future stages without introducing a generalized stage table or framework.

### Reconcile during authenticated server page loading

The authenticated Exa list and detail page loaders will reconcile only owned runs that have an execution identifier and are not already `completed`. The rendered data will be read after reconciliation so the opened page reflects persisted state. A client polling component was rejected because the request is required only on page open and would add browser state and an extra application endpoint.

### Treat lookup failure as stale data, not page failure

Authentication, transport, timeout, non-success response, or decode errors will be logged safely on the server and leave the local run unchanged. Reconciliation is advisory; stale status is preferable to blocking access to persisted research data. Requests retain a bounded timeout and do not retry automatically.

### Preserve callback idempotency

Conditional updates will never move a `completed` run backward. The existing callback remains authoritative for result persistence and may safely observe a run already marked `completed`; its existing one-result and ownership/correlation constraints remain intact.

## Risks / Trade-offs

- [n8n is unavailable when a page opens] → Render the last persisted state and allow a later page open to retry.
- [Many non-terminal rows create many REST requests] → Check only eligible displayed runs and use bounded concurrent requests; add batching or a background reconciler only if measured load requires it.
- [Execution succeeds before its result callback arrives] → Show the execution as completed while retaining the existing empty-result message until ingestion finishes.
- [n8n adds execution states] → Fail response decoding safely until the normalization schema is intentionally updated.
- [Concurrent callback and status reconciliation race] → Use conditional updates that preserve `completed` and stored results.

## Migration Plan

1. Add server-only n8n REST API configuration and the generic status boundary.
2. Add Exa reconciliation persistence/orchestration and focused tests.
3. Invoke reconciliation from authenticated Exa page loading and deploy without a database migration.
4. Roll back by removing the page-load invocation and status configuration; existing persisted run data remains valid.

## Open Questions

- Confirm the deployment-specific n8n REST API base URL and API-key environment variable values before enabling the lookup in production.
