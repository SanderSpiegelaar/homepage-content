## ADDED Requirements

### Requirement: Owner-only research run details
The system SHALL provide an authenticated details page for each research run and MUST scope the run and result query to the authenticated owner. The page SHALL show the run keyword, lifecycle status, run identifier, execution identifier when available, error when available, creation time, update time, start time when available, and result receipt time when available. The research history SHALL link each run to its details page.

#### Scenario: Owner opens a research run
- **WHEN** an authenticated user opens the details route for a run they own
- **THEN** the system displays all available run metadata without exposing another user's data

#### Scenario: User opens an unavailable research run
- **WHEN** an authenticated user requests a missing run or a run owned by another user
- **THEN** the system returns the same not-found result in both cases

#### Scenario: User follows research history link
- **WHEN** an authenticated user activates a run link in their Exa Research history
- **THEN** the system opens that run's details page

### Requirement: Research result details display
The research run details page SHALL list every persisted website result in callback order. For each result it SHALL display website name, domain, website type, `pos_1`, `pos_1_3`, `pos_10`, relevant topics, relevant sections, and estimated SEO research value. The presentation MUST remain usable at mobile and desktop viewport widths.

#### Scenario: Completed run has results
- **WHEN** the owner opens a completed run with a persisted result dataset
- **THEN** the page displays every website record and every validated field

#### Scenario: Run results have not arrived
- **WHEN** the owner opens a pending, starting, started, or failed run without a persisted result
- **THEN** the page displays the available run metadata and a state-appropriate message instead of an empty result table

#### Scenario: Result contains multiple topics and sections
- **WHEN** a website result has multiple relevant topics or sections
- **THEN** the page presents every value without discarding their submitted order

## MODIFIED Requirements

### Requirement: Explicit row start action
Each pending or failed run row SHALL provide an actions menu with a start action. The system MUST authenticate the request, verify ownership, and prevent runs already starting, started, or completed from being started again.

#### Scenario: User opens row actions
- **WHEN** the user opens the actions menu for a pending run
- **THEN** the menu offers an action to start that run

#### Scenario: User starts another user's run
- **WHEN** an authenticated user submits a start request for a run they do not own
- **THEN** the system rejects the request and does not call n8n

#### Scenario: User repeats a start request
- **WHEN** a run is already `starting`, `started`, or `completed`
- **THEN** the system does not send another n8n request for that action

### Requirement: Research-run state feedback
The Exa Research table and run details page SHALL communicate each run's current status and SHALL expose the persisted n8n execution identifier for successfully started runs.

#### Scenario: Start is in progress
- **WHEN** the system has claimed a run and is waiting for n8n
- **THEN** the run displays a `starting` state and its start action is unavailable

#### Scenario: Run starts successfully
- **WHEN** the run has been started successfully and results have not arrived
- **THEN** the run displays a `started` state and the stored execution identifier

#### Scenario: Run start fails
- **WHEN** the run has a failed start attempt
- **THEN** the run displays a `failed` state and permits the user to retry the start action

#### Scenario: Research results arrive
- **WHEN** a valid result callback is persisted for the run
- **THEN** the run displays a `completed` state and its start action remains unavailable
