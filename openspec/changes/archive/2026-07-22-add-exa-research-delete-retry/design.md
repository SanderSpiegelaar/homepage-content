## Context

Exa research history already exposes a per-row dropdown and routes pending or failed runs through one authenticated start action. Failed runs can technically be started again, but the UI still labels that operation "Start run." Runs and their optional results are user-owned, and the result foreign key already cascades on run deletion.

## Goals / Non-Goals

**Goals:**
- Give failed runs a clear retry action without adding another dispatch path.
- Let authenticated owners permanently delete their runs and associated results.
- Keep both mutations owner-scoped and refresh the history after completion.

**Non-Goals:**
- Canceling an n8n execution when its local run is deleted.
- Restoring deleted runs or adding soft-delete retention.
- Retrying started or completed runs, or creating a new run during retry.

## Decisions

### Reuse the existing start flow for retry

The row action label will depend on status: pending runs show "Start run" and failed runs show "Retry run." Both call the existing Server Action, whose atomic claim already accepts only `pending` or `failed` runs before dispatch. This preserves duplicate-dispatch protection and avoids a second retry workflow. A separate retry action was rejected because its authorization, claim, dispatch, and failure behavior would duplicate the existing path.

### Delete through one owner-scoped database operation

Add a data-access function that deletes by both run ID and authenticated user ID. The Server Action resolves the session, invokes that function, and revalidates `/exa-research`. The existing result foreign key cascade removes stored result data in the same database operation. Fetch-then-delete was rejected because combining ownership and deletion in one statement is smaller and avoids a time-of-check/time-of-use gap.

### Use native confirmation in the existing actions menu

Add a destructive delete item to the existing dropdown and require native browser confirmation before invoking the Server Action. The component's existing transition state disables competing actions while the request is pending. A custom confirmation dialog and reusable mutation framework were rejected because the browser primitive covers this irreversible action without new UI infrastructure or dependencies.

Deletion removes only application state; it does not cancel an n8n execution already in progress. A later callback for a deleted run continues to receive the existing unknown-run response.

## Risks / Trade-offs

- [Deleting a started run does not cancel n8n work] → State this in the confirmation and rely on the existing callback rejection for unknown run IDs.
- [Native confirmation has limited styling] → Prefer the accessible platform behavior over adding a custom dialog for one action.
- [A repeated or stale delete request targets a missing run] → Treat the owner-scoped no-op as successful and refresh the list without revealing whether another user's run exists.
