## Why

Users can start Exa research runs but cannot inspect the completed research in the application, and n8n has no application endpoint for returning its generated dataset. Persisting callback results and exposing a run details page completes the workflow from submission through review.

## What Changes

- Add an authenticated Exa research run details page showing run metadata and the returned website research dataset when available.
- Make each user-owned run in the Exa Research history link to its details page.
- Add an n8n-facing POST endpoint accepting a run ID and validated website research records.
- Persist one result payload per research run and mark the run complete when valid data is received.
- Reject unauthenticated, malformed, unknown-run, and conflicting callback requests without exposing other users' data.

## Capabilities

### New Capabilities
- `exa-research-result-ingestion`: Accept, validate, authenticate, and persist n8n research result callbacks for an existing run.

### Modified Capabilities
- `exa-research-runs`: Add completed-run state, owner-only run details, navigation from history, and display of persisted research results.

## Impact

- Adds a database table associated with Exa research runs and a migration.
- Adds an n8n callback route and server-side payload validation/authentication.
- Extends the research data-access layer and run lifecycle.
- Adds an authenticated dashboard details route and result presentation components.
- Requires a server-only callback secret shared with n8n; no new provider SDK is introduced.
