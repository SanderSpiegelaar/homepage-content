## Why

Research requests currently start immediately and are not retained, so users cannot stage work, review prior runs, or recover the external execution identifier. A dedicated Exa Research page will make each run durable and let users explicitly decide when it starts.

## What Changes

- Add an authenticated Exa Research page with a keyword form and a data table of previous runs.
- Persist each submitted keyword as a pending research run instead of dispatching it immediately.
- Add a per-row actions menu that can start a pending run.
- On start, POST `{ "keyword": "..." }` to the configured n8n Exa research webhook and persist the returned `executionId` when the response reports success.
- Show run state and execution details in the table, including start failures without losing the pending record.
- Add Exa Research to the dashboard navigation.

## Capabilities

### New Capabilities

- `exa-research-runs`: Durable creation, listing, and explicit n8n-backed starting of Exa research runs.

### Modified Capabilities

- `research-intake`: Change keyword submission from immediate dispatch to creation of a pending, persisted run.
- `dashboard-shell`: Add the Exa Research page as an identifiable primary navigation destination.

## Impact

- Adds an authenticated dashboard route and shadcn/ui form, data table, and row actions menu.
- Adds a research-run table and migration to the existing Drizzle/PostgreSQL schema.
- Replaces the current immediate research dispatch flow with create and start server operations.
- Integrates with `https://n8n.office.vinden.nl/webhook/ace/v2/exa-agent-research` through the existing n8n boundary; no provider-specific AI or search SDK is added.
