## MODIFIED Requirements

### Requirement: Keyword research form
The system SHALL provide authenticated users with a labeled form on the Exa Research page that accepts one research keyword, creates a pending run, and communicates submission progress without starting the external workflow.

#### Scenario: User views the research intake
- **WHEN** an authenticated user opens the Exa Research page
- **THEN** the system displays a labeled, required keyword input and a create-run control

#### Scenario: Research submission is pending
- **WHEN** a valid research run is being created
- **THEN** the system disables repeat submission and communicates that creation is in progress

### Requirement: Keyword validation
The system MUST trim and server-validate the submitted keyword as a non-empty string no longer than 100 characters before storing a run.

#### Scenario: Blank keyword is submitted
- **WHEN** the submitted keyword is empty or contains only whitespace
- **THEN** the system returns a keyword validation message and does not store a run or call n8n

#### Scenario: Oversized keyword is submitted
- **WHEN** the trimmed keyword exceeds 100 characters
- **THEN** the system returns a keyword validation message and does not store a run or call n8n

### Requirement: Submission authorization
The system MUST verify the user's authenticated session within the server-side submission operation before storing a run or invoking n8n.

#### Scenario: Unauthenticated submission is attempted
- **WHEN** a research submission is received without an authenticated session
- **THEN** the system rejects the submission and does not store a run or call n8n

## ADDED Requirements

### Requirement: Research request acknowledgment
The system SHALL acknowledge successful creation of a pending research run and make the new row available in the run history.

#### Scenario: Run creation succeeds
- **WHEN** the system stores a valid research run
- **THEN** the Exa Research page confirms creation and displays the pending run in the table

## REMOVED Requirements

### Requirement: Research query transformation
**Reason**: The n8n Exa research workflow now accepts the user's validated keyword directly, so application-side LLM query transformation is no longer part of intake.

**Migration**: Send the stored keyword only when the user explicitly starts the run from its row actions menu.

### Requirement: Exa Agent run creation
**Reason**: The application must delegate Exa workflow execution to n8n and must not call Exa directly.

**Migration**: Use the explicit run start operation specified by `exa-research-runs`.

### Requirement: Research start acknowledgment
**Reason**: Submitting the form now creates a pending record instead of starting research.

**Migration**: Use the new research request acknowledgment for creation and the run table status for start feedback.
