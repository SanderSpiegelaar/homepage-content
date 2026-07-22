## Why

Research runs can remain displayed as in progress after their n8n execution has already finished or failed. The application needs a reusable, stage-agnostic way to reconcile local stage state with n8n when a user opens a page.

## What Changes

- Add a server-side stage status check that queries the n8n REST API using a persisted execution identifier.
- Normalize n8n execution outcomes into the application's stage lifecycle states and persist the reconciled state safely.
- Automatically check non-terminal Exa research runs when the Exa Research page is opened, while skipping runs already known to have completed successfully.
- Keep n8n credentials and raw API responses server-only and expose safe failures without preventing the page from rendering.

## Capabilities

### New Capabilities
- `stage-status-checking`: Stage-agnostic n8n execution status lookup, normalization, and persistence contracts.

### Modified Capabilities
- `exa-research-runs`: Reconcile non-terminal Exa research run status from n8n when an Exa Research page is opened.

## Impact

- Affects the server-side research page loading path, research lifecycle persistence, and the n8n integration boundary.
- Requires server configuration for the n8n REST API base URL and API key; no provider-specific SDK is added.
- Adds outbound authenticated GET requests to n8n for runs with persisted execution identifiers.
