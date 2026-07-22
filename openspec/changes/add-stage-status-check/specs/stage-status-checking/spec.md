## ADDED Requirements

### Requirement: Server-side n8n execution lookup
The system SHALL provide a stage-agnostic server operation that retrieves an n8n execution by its persisted execution identifier using the configured n8n REST API base URL and API key. The system MUST keep credentials and raw n8n responses server-only and MUST runtime-validate the response before using it.

#### Scenario: Execution status is retrieved
- **WHEN** a stage requests status for a valid persisted n8n execution identifier and n8n returns a valid response
- **THEN** the operation returns the normalized execution state without exposing n8n credentials or raw response data

#### Scenario: Execution identifier is unavailable
- **WHEN** a stage has no persisted n8n execution identifier
- **THEN** the system does not send an n8n REST API request

### Requirement: Stage-agnostic status normalization
The system SHALL normalize supported n8n execution states into `running`, `succeeded`, or `failed` without coupling the lookup operation to a stage-specific database model. Waiting or active n8n executions MUST normalize to `running`, successful terminal executions to `succeeded`, and unsuccessful terminal executions to `failed`.

#### Scenario: Execution remains active
- **WHEN** n8n reports a waiting or active execution
- **THEN** the operation returns `running`

#### Scenario: Execution succeeds
- **WHEN** n8n reports a successful terminal execution
- **THEN** the operation returns `succeeded`

#### Scenario: Execution ends unsuccessfully
- **WHEN** n8n reports an errored, canceled, or crashed terminal execution
- **THEN** the operation returns `failed`

### Requirement: Safe status-check failure
The system SHALL bound each n8n status request with a timeout and SHALL NOT automatically retry it. Authentication failure, transport failure, timeout, non-success response, or invalid response data MUST produce a safe server-side failure that does not expose credentials, URLs, or response bodies.

#### Scenario: n8n status lookup fails
- **WHEN** an n8n status request fails or returns an invalid response
- **THEN** the system reports a safe typed failure and does not infer or persist a new execution state
