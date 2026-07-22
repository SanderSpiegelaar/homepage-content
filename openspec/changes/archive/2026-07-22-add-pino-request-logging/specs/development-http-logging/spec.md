## ADDED Requirements

### Requirement: Development webhook request logging
The system SHALL emit a structured, human-readable console record in development before sending an outbound n8n workflow request. The record MUST identify the workflow and include a correlation identifier, HTTP method, and request payload without logging authorization credentials or secret headers.

#### Scenario: Research webhook request is dispatched in development
- **WHEN** the application is running in development and dispatches a research request to n8n
- **THEN** the development console displays a readable structured request record correlated by the persisted research-run identifier

### Requirement: Development webhook response logging
The system SHALL emit a structured, human-readable console record in development for each n8n response or transport failure. A response record MUST include its correlation identifier, elapsed time, HTTP status, and caller-visible response payload, while a transport-failure record MUST identify the failure category without changing the propagated error.

#### Scenario: n8n returns an accepted response
- **WHEN** n8n returns an HTTP response to a development request
- **THEN** the development console displays the response status, elapsed time, and parsed response payload with the same correlation identifier as the request record

#### Scenario: n8n request times out or fails in transport
- **WHEN** a development n8n request times out or fails before an HTTP response is received
- **THEN** the development console displays a correlated error record and the application preserves its existing failure behavior

### Requirement: Production detail suppression
The system MUST NOT emit detailed webhook request payloads or response payloads through this development logging facility outside development environments. Existing safe user-facing errors and required server error handling SHALL remain unchanged.

#### Scenario: Research webhook runs outside development
- **WHEN** the application dispatches a research request while not running in development
- **THEN** no detailed request or response payload record is emitted by the development logger

### Requirement: Sensitive field redaction
The logger MUST redact credential-shaped fields if they are included in a structured record and MUST omit request and response authorization headers.

#### Scenario: Logged data contains a credential-shaped field
- **WHEN** a development log record contains a configured password, token, secret, cookie, or authorization field
- **THEN** the console record replaces or removes the sensitive value
