## ADDED Requirements

### Requirement: Page-open research status reconciliation
When an authenticated user opens an Exa Research list or detail page, the system SHALL check n8n execution status for each displayed run owned by that user that has a persisted execution identifier and is not already `completed`. The system SHALL persist a successful terminal execution as `completed`, an unsuccessful terminal execution as `failed`, and SHALL leave an active execution in its current non-terminal state before rendering refreshed run data.

#### Scenario: Page opens with a successful execution
- **WHEN** an authenticated owner opens an Exa Research page for a non-completed run whose n8n execution is successful
- **THEN** the system marks the run `completed` and renders the completed state

#### Scenario: Page opens with a failed execution
- **WHEN** an authenticated owner opens an Exa Research page for a non-completed run whose n8n execution ended unsuccessfully
- **THEN** the system marks the run `failed` and renders the failed state

#### Scenario: Page opens with an active execution
- **WHEN** an authenticated owner opens an Exa Research page for a non-completed run whose n8n execution remains active or waiting
- **THEN** the system leaves the run non-terminal and renders its current persisted state

#### Scenario: Completed run is displayed
- **WHEN** an authenticated owner opens an Exa Research page containing a run already marked `completed`
- **THEN** the system does not request n8n execution status for that run

#### Scenario: Run has no execution identifier
- **WHEN** an authenticated owner opens an Exa Research page containing a non-completed run without a persisted n8n execution identifier
- **THEN** the system does not request n8n execution status for that run

#### Scenario: Status lookup fails
- **WHEN** n8n status reconciliation fails while an authenticated owner opens an Exa Research page
- **THEN** the system leaves the run unchanged and renders the page from persisted data

#### Scenario: Another user's run exists
- **WHEN** an authenticated user opens an Exa Research page
- **THEN** the system neither checks nor changes a run owned by another user
