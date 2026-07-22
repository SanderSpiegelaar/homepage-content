## Why

Users cannot remove obsolete Exa research runs, and failed runs expose a generic start action rather than a clear retry option. Adding owner-scoped delete and retry actions makes research history manageable without creating duplicate runs.

## What Changes

- Add a delete action for user-owned Exa research runs, with confirmation before permanent removal.
- Cascade deletion to any stored result associated with the run.
- Present failed runs with an explicit retry action that reuses the existing run and dispatch flow.
- Keep delete and retry requests authenticated, owner-scoped, and unavailable while an action is in progress.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `exa-research-runs`: Add owner-scoped deletion and an explicit retry option for failed runs.

## Impact

- Extends the research run actions menu and dashboard Server Actions.
- Extends the research data-access and workflow layers with owner-scoped deletion.
- Reuses the existing n8n dispatch contract and database cascade; no new dependency or provider SDK is introduced.
