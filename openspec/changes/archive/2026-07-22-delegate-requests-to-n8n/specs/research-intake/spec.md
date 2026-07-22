## MODIFIED Requirements

### Requirement: Keyword validation
The system MUST trim and server-validate the submitted keyword as a non-empty string no longer than 100 characters before invoking the n8n webhook.

#### Scenario: Blank keyword is submitted
- **WHEN** the submitted keyword is empty or contains only whitespace
- **THEN** the system returns a keyword validation message and does not call n8n

#### Scenario: Oversized keyword is submitted
- **WHEN** the trimmed keyword exceeds 100 characters
- **THEN** the system returns a keyword validation message and does not call n8n

### Requirement: Submission authorization
The system MUST verify the user's authenticated session within the server-side submission operation before invoking the n8n webhook.

#### Scenario: Unauthenticated submission is attempted
- **WHEN** a research submission is received without an authenticated session
- **THEN** the system rejects the submission and does not call n8n

### Requirement: Research start acknowledgment
The system SHALL present a provider-neutral acknowledgment after n8n accepts a research request.

#### Scenario: Request submission succeeds
- **WHEN** n8n accepts a valid research request
- **THEN** the dashboard displays that the research request was submitted without displaying generated query or provider run metadata

## REMOVED Requirements

### Requirement: Research query transformation
**Reason**: Query generation and prompt configuration move to the n8n-managed backend.
**Migration**: Send the validated keyword to the n8n research webhook and configure query generation inside its workflow.

### Requirement: Exa Agent run creation
**Reason**: The application no longer creates or manages provider-specific research runs.
**Migration**: Configure any required Exa or replacement-provider steps inside the n8n research workflow.
