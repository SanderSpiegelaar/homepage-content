## Why

Server-side webhook failures currently surface only generic errors, making it difficult to compare what the application sent with what n8n returned. Development-only structured request and response logs will shorten that debugging loop without exposing integration details to users or production logs.

## What Changes

- Add Pino as the application logger and pino-pretty for readable local development output.
- Log outbound n8n request metadata and the corresponding HTTP response status and payload in the development console.
- Preserve safe UI errors and disable the detailed integration logs outside development.
- Redact credentials and other sensitive HTTP data from logged records.

## Capabilities

### New Capabilities

- `development-http-logging`: Development-only structured logging for outbound workflow requests and responses, with readable console output and redaction.

### Modified Capabilities

- None.

## Impact

- Adds `pino` and development-only `pino-pretty` dependencies.
- Adds a server-only logger configuration and logging at the shared n8n request boundary.
- Affects local development console output only; webhook payloads, response validation, database state, and user-facing behavior remain unchanged.
