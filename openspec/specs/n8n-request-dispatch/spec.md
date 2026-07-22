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
The system SHALL send each validated workflow request to its configured n8n webhook as an HTTPS JSON POST with a stable workflow type and input payload.

#### Scenario: Research request is dispatched
- **WHEN** an authenticated user submits a valid research keyword
- **THEN** the system posts a JSON payload containing the `research` workflow type and trimmed keyword to the configured research webhook

### Requirement: Webhook response handling
The system SHALL treat a 2xx n8n webhook response as request acceptance and MUST map timeouts, transport failures, and non-2xx responses to a safe error without exposing webhook URLs or response bodies.

#### Scenario: n8n accepts a request
- **WHEN** the configured webhook returns a 2xx response
- **THEN** the system reports that the request was submitted without waiting for downstream workflow completion

#### Scenario: n8n rejects a request
- **WHEN** the configured webhook returns a non-2xx response
- **THEN** the system reports a retryable submission failure without exposing n8n details

#### Scenario: n8n does not respond in time
- **WHEN** the webhook request exceeds the configured application timeout
- **THEN** the system aborts the request and reports a retryable submission failure
