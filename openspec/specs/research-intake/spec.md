# Research Intake

## Purpose

Accept a research keyword, transform it into a focused query, and start an asynchronous Exa Agent research run.

## Requirements

### Requirement: Keyword research form

The system SHALL provide authenticated dashboard users with a labeled form that accepts one research keyword and communicates submission progress.

#### Scenario: User views the research intake

- **WHEN** an authenticated user opens the dashboard
- **THEN** the system displays a labeled, required keyword input and a research submit control

#### Scenario: Research submission is pending

- **WHEN** a valid research submission is being processed
- **THEN** the system disables repeat submission and communicates that processing is in progress

### Requirement: Keyword validation

The system MUST trim and server-validate the submitted keyword as a non-empty string no longer than 100 characters before invoking an external service.

#### Scenario: Blank keyword is submitted

- **WHEN** the submitted keyword is empty or contains only whitespace
- **THEN** the system returns a keyword validation message and does not call the LLM or Exa

#### Scenario: Oversized keyword is submitted

- **WHEN** the trimmed keyword exceeds 100 characters
- **THEN** the system returns a keyword validation message and does not call the LLM or Exa

### Requirement: Submission authorization

The system MUST verify the user's authenticated session within the server-side submission operation before invoking the LLM or Exa.

#### Scenario: Unauthenticated submission is attempted

- **WHEN** a research submission is received without an authenticated session
- **THEN** the system rejects the submission and does not call the LLM or Exa

### Requirement: Research query transformation

The system SHALL use the Vercel AI SDK and a fixed research-query prompt to transform a valid keyword into one non-empty, self-contained natural-language query suitable for Exa Agent research.

#### Scenario: Valid keyword is transformed

- **WHEN** an authenticated user submits a valid keyword and the LLM succeeds
- **THEN** the system produces one non-empty research query that incorporates the submitted topic

#### Scenario: Query transformation fails

- **WHEN** the LLM call fails or returns empty text
- **THEN** the system reports that research could not be started and does not create an Exa Agent run

### Requirement: Exa Agent run creation

The system SHALL use the official `exa-js` SDK to create one asynchronous Exa Agent run using the generated research query.

#### Scenario: Exa accepts the research query

- **WHEN** a non-empty generated query is submitted successfully to Exa
- **THEN** the system returns the generated query, Exa run identifier, and initial run status

#### Scenario: Exa rejects the research query

- **WHEN** Exa run creation fails
- **THEN** the system reports that research could not be started without exposing credentials or internal provider details

### Requirement: Research start acknowledgment

The system SHALL present the successful start state to the user and make the generated query and Exa run identifier available for the next pipeline step.

#### Scenario: Run creation succeeds

- **WHEN** Exa returns a newly created run
- **THEN** the dashboard displays a research-started acknowledgment with the generated query and run identifier
