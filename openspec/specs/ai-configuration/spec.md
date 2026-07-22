# AI Configuration

## Purpose

Manage database-backed AI settings for application AI use cases.

## Requirements

### Requirement: Database-backed AI configuration
The system SHALL store the active model identifier, instructions, and prompt template for each application AI use case in the database under a stable use-case key.

#### Scenario: Initial configuration is deployed
- **WHEN** the database migration is applied
- **THEN** the system stores a `research-query` configuration containing the model, instructions, and prompt template previously used by the research workflow

#### Scenario: Configuration is loaded
- **WHEN** application code requests a known AI use-case key
- **THEN** the system returns that use case's active model identifier, instructions, and prompt template from the database

### Requirement: AI Config page
The system SHALL provide signed-in users with an AI Config page that lists every configured AI use case and exposes its model identifier, instructions, and prompt template as editable labeled fields.

#### Scenario: Signed-in user opens AI Config
- **WHEN** a signed-in user follows the AI Config dashboard navigation item
- **THEN** the system displays the stored values for every configured AI use case

#### Scenario: Unauthenticated user requests AI Config
- **WHEN** a user without an authenticated session requests the AI Config page
- **THEN** the system applies the dashboard's existing unauthenticated access behavior and does not expose configuration values

### Requirement: AI configuration updates
The system SHALL allow a signed-in user to persist edited model and prompt values and SHALL use the persisted values for subsequent AI invocations.

#### Scenario: Valid configuration is saved
- **WHEN** a signed-in user submits non-empty model, instructions, and prompt-template values for a known use case
- **THEN** the system updates that database row, confirms success, and presents the saved values

#### Scenario: Unauthenticated update is attempted
- **WHEN** an AI configuration update is submitted without an authenticated session
- **THEN** the system rejects the update and leaves the stored configuration unchanged

### Requirement: AI configuration validation
The system MUST reject blank model identifiers, instructions, or prompt templates and MUST enforce the required template variables for each known use case before changing stored configuration.

#### Scenario: Blank configuration field is submitted
- **WHEN** a configuration update contains a model, instructions, or prompt template that is empty after trimming
- **THEN** the system returns a validation message and leaves the stored configuration unchanged

#### Scenario: Required research variable is omitted
- **WHEN** the `research-query` prompt template does not contain the `{{keyword}}` token
- **THEN** the system returns a validation message and leaves the stored configuration unchanged

### Requirement: Missing runtime configuration
The system MUST fail safely without invoking an AI provider when the requested use-case configuration is absent.

#### Scenario: Known workflow has no configuration row
- **WHEN** an AI workflow requests its stable use-case key and no matching database row exists
- **THEN** the system reports the operation failure without invoking the AI provider or exposing internal configuration details
