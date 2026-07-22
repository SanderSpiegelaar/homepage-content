## ADDED Requirements

### Requirement: Authenticated n8n result callback
The system SHALL expose a server-side POST endpoint for Exa research result callbacks and MUST require the configured server-only bearer secret before reading or persisting callback data. The endpoint MUST fail closed when the secret is not configured and MUST NOT expose the secret or internal error details in its response.

#### Scenario: Authorized callback
- **WHEN** n8n sends a POST request with the configured bearer secret and a valid payload
- **THEN** the system processes the callback

#### Scenario: Missing or invalid callback credential
- **WHEN** a callback omits the bearer credential or supplies a value that does not match the configured secret
- **THEN** the system returns an unauthorized response and stores no data

#### Scenario: Callback secret is not configured
- **WHEN** the endpoint receives a callback while its server-side secret is unavailable
- **THEN** the system fails closed and stores no data

### Requirement: Complete callback payload validation
The system MUST runtime-validate a callback shaped as `{ "runId": "<UUID>", "data": [<website records>] }` before database access. Each website record SHALL contain non-empty `websiteName`, `domain`, `websiteType`, and `estimatedSeoResearchValue` strings; non-negative integer `pos_1`, `pos_1_3`, and `pos_10` values; and string arrays named `relevantTopics` and `relevantSections`. The `data` array MUST contain at least one record and MUST be bounded to prevent an unreasonably large callback.

#### Scenario: Valid research result payload
- **WHEN** the callback contains a UUID run ID and one or more website records satisfying every field contract
- **THEN** the system accepts the payload for persistence

#### Scenario: Malformed research result payload
- **WHEN** the callback run ID, result array, or any website field violates the runtime schema
- **THEN** the system returns a bad-request response and stores no part of the payload

#### Scenario: Empty result dataset
- **WHEN** the callback contains an empty `data` array
- **THEN** the system returns a bad-request response and does not complete the run

### Requirement: Atomic one-time result persistence
The system SHALL store the validated website dataset as one result associated with the referenced research run and SHALL transition that run to `completed` in the same database transaction. The system MUST preserve the submitted record order and every validated field. It MUST NOT replace an existing result for the run.

#### Scenario: Result received for an existing run
- **WHEN** an authorized valid callback references an existing run without a stored result
- **THEN** the system stores the complete dataset, records its receipt time, marks the run `completed`, and returns a created response

#### Scenario: Callback references an unknown run
- **WHEN** an authorized valid callback references no persisted research run
- **THEN** the system returns a not-found response and stores no result

#### Scenario: Callback repeats for a completed run
- **WHEN** a callback references a run that already has a stored result
- **THEN** the system returns a conflict response and leaves the original result unchanged

#### Scenario: Persistence transaction fails
- **WHEN** either result insertion or run completion cannot be committed
- **THEN** neither change is persisted and the endpoint returns a safe failure response
