# n8n Request Dispatch

## Purpose

Dispatch validated workflow requests to server-configured n8n webhooks.

## Requirements

### Requirement: Server-only workflow configuration
The system MUST resolve each n8n workflow destination from a workflow-specific server environment variable and MUST NOT accept a webhook URL from a browser request.

#### Scenario: Research webhook is configured
- **WHEN** an authenticated research request is ready for dispatch
- **THEN** the system uses the server-configured research webhook URL without exposing it to the browser

#### Scenario: Research webhook is missing
- **WHEN** a research request is ready for dispatch but its webhook URL is not configured
- **THEN** the system fails before making an outbound request and reports a provider-neutral submission error

### Requirement: JSON webhook dispatch
The system SHALL validate each workflow request payload at runtime before sending it to its configured n8n webhook as an HTTPS JSON POST with the workflow's documented input payload. The system MUST NOT make the outbound request when payload validation fails.

#### Scenario: Research request is dispatched
- **WHEN** an authenticated user starts a stored research run with a valid keyword
- **THEN** the system validates and posts a JSON payload containing the stored run ID and keyword to the configured research webhook

#### Scenario: Outgoing payload is invalid
- **WHEN** a research workflow payload does not satisfy the runtime request schema
- **THEN** the system rejects the dispatch before making an outbound request

### Requirement: Webhook response handling
The system SHALL validate each successful n8n JSON response at runtime before using its data. It SHALL treat a schema-valid 2xx response as request acceptance and MUST map malformed responses, timeouts, transport failures, and non-2xx responses to a safe error without exposing validation details, webhook URLs, or response bodies.

#### Scenario: n8n accepts a request
- **WHEN** the configured webhook returns a 2xx response that satisfies the runtime response schema
- **THEN** the system reports that the request was submitted without waiting for downstream workflow completion

#### Scenario: n8n returns a malformed response
- **WHEN** the configured webhook returns a 2xx JSON response that does not satisfy the runtime response schema
- **THEN** the system reports a safe submission failure without exposing response or validation details

#### Scenario: n8n rejects a request
- **WHEN** the configured webhook returns a non-2xx response
- **THEN** the system reports a retryable submission failure without exposing n8n details

#### Scenario: n8n does not respond in time
- **WHEN** the webhook request exceeds the configured application timeout
- **THEN** the system aborts the request and reports a retryable submission failure
