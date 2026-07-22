# Research Intake

## Purpose

Accept a research keyword and persist it as a user-owned pending Exa research run without starting the external workflow.

## Requirements

### Requirement: Keyword research form
The system SHALL provide authenticated users with a labeled form on the Exa Research page that accepts one research keyword, creates a pending run, and communicates submission progress without starting the external workflow.

#### Scenario: User views the research intake
- **WHEN** an authenticated user opens the Exa Research page
- **THEN** the system displays a labeled, required keyword input and a create-run control

#### Scenario: Research submission is pending
- **WHEN** a valid research run is being created
- **THEN** the system disables repeat submission and communicates that creation is in progress

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

### Requirement: Research query transformation
The system SHALL load the `research-query` model, instructions, and prompt template from database-backed AI configuration and use them with the Vercel AI SDK to transform a valid keyword into one non-empty, self-contained natural-language query suitable for Exa Agent research. The system MUST render the submitted keyword into the template's `{{keyword}}` token as JSON-encoded data.

#### Scenario: Valid keyword is transformed
- **WHEN** an authenticated user submits a valid keyword, the `research-query` configuration exists, and the LLM succeeds
- **THEN** the system invokes the configured model with the configured prompts and produces one non-empty research query that incorporates the submitted topic

#### Scenario: Query transformation fails
- **WHEN** configuration loading or the LLM call fails, or the LLM returns empty text
- **THEN** the system reports that research could not be started and does not create an Exa Agent run
