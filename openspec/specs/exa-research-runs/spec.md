# Exa Research Runs

## Purpose

Provide durable, user-owned creation, history, and explicit n8n-backed starting of Exa research runs.

## Requirements

### Requirement: Persisted research-run history
The system SHALL persist every newly submitted Exa research run with its owner, trimmed keyword, lifecycle status, and timestamps before any external workflow is invoked. The Exa Research page SHALL list all persisted runs owned by the authenticated user, including keyword, status, execution identifier when available, and creation time.

#### Scenario: User creates a pending run
- **WHEN** an authenticated user submits a valid keyword on the Exa Research page
- **THEN** the system stores a user-owned run with the trimmed keyword and `pending` status without calling n8n

#### Scenario: User views previous runs
- **WHEN** an authenticated user opens the Exa Research page
- **THEN** the system displays all runs owned by that user with the newest runs first

#### Scenario: User has no previous runs
- **WHEN** an authenticated user with no stored runs opens the Exa Research page
- **THEN** the system displays an empty-state message instead of run rows

### Requirement: Explicit row start action
Each pending or failed run row SHALL provide an actions menu with a start action. The system MUST authenticate the request, verify ownership, and prevent runs already starting or started from being started again.

#### Scenario: User opens row actions
- **WHEN** the user opens the actions menu for a pending run
- **THEN** the menu offers an action to start that run

#### Scenario: User starts another user's run
- **WHEN** an authenticated user submits a start request for a run they do not own
- **THEN** the system rejects the request and does not call n8n

#### Scenario: User repeats a start request
- **WHEN** a run is already `starting` or `started`
- **THEN** the system does not send another n8n request for that action

### Requirement: n8n research dispatch
When a run is explicitly started, the system SHALL send a server-side POST request to `https://n8n.office.vinden.nl/webhook/ace/v2/exa-agent-research` with JSON body `{ "keyword": "<stored keyword>" }`. The system MUST treat only an HTTP-success response containing `success: true` and a non-empty `executionId` as a successful start.

#### Scenario: n8n accepts a run
- **WHEN** the start request receives an HTTP-success response with `success: true` and a non-empty `executionId`
- **THEN** the system stores that execution identifier on the run and marks the run `started`

#### Scenario: n8n rejects a run
- **WHEN** n8n returns a non-success HTTP response, `success` is not true, or `executionId` is missing
- **THEN** the system marks the run `failed`, retains the run and keyword, and shows a safe retryable failure state

### Requirement: Research-run state feedback
The Exa Research table SHALL communicate each run's current status and SHALL expose the persisted n8n execution identifier for successfully started runs.

#### Scenario: Start is in progress
- **WHEN** the system has claimed a run and is waiting for n8n
- **THEN** the row displays a `starting` state and its start action is unavailable

#### Scenario: Run starts successfully
- **WHEN** the run has been started successfully
- **THEN** the row displays a `started` state and the stored execution identifier

#### Scenario: Run start fails
- **WHEN** the run has a failed start attempt
- **THEN** the row displays a `failed` state and permits the user to retry the start action
