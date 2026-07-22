## ADDED Requirements

### Requirement: Owner-scoped research-run deletion
The system SHALL let an authenticated user permanently delete a research run they own from its row actions. The deletion MUST remove any stored result associated with the run, MUST NOT delete a run owned by another user, and SHALL require confirmation before submission.

#### Scenario: User deletes an owned run
- **WHEN** an authenticated user confirms deletion of a research run they own
- **THEN** the system removes the run and any associated result and refreshes the user's research history

#### Scenario: User cancels deletion
- **WHEN** a user declines the deletion confirmation
- **THEN** the system leaves the run and its associated result unchanged

#### Scenario: User deletes another user's run
- **WHEN** an authenticated user submits a delete request for a run they do not own
- **THEN** the system leaves that run and its result unchanged without revealing ownership information

## MODIFIED Requirements

### Requirement: Explicit row start action
Each pending run row SHALL provide an actions menu with a start action, and each failed run row SHALL provide an explicit retry action. Starting and retrying MUST use the same persisted run and dispatch workflow. The system MUST authenticate the request, verify ownership, and prevent runs already starting, started, or completed from being dispatched again.

#### Scenario: User opens pending row actions
- **WHEN** the user opens the actions menu for a pending run
- **THEN** the menu offers an action to start that run

#### Scenario: User opens failed row actions
- **WHEN** the user opens the actions menu for a failed run
- **THEN** the menu offers an action to retry that same run

#### Scenario: User retries a failed run
- **WHEN** an authenticated owner invokes retry for a failed run
- **THEN** the system claims and dispatches the existing run through the normal start workflow

#### Scenario: User starts another user's run
- **WHEN** an authenticated user submits a start or retry request for a run they do not own
- **THEN** the system rejects the request and does not call n8n

#### Scenario: User repeats a start request
- **WHEN** a run is already `starting`, `started`, or `completed`
- **THEN** the system does not send another n8n request for that action
