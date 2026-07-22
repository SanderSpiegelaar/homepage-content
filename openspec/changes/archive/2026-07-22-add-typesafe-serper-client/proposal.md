## Why

The application needs a single type-safe way to call Serper.dev without duplicating request setup, endpoint strings, and response casting throughout server code.

## What Changes

- Add a server-only TypeScript module for authenticated Serper.dev requests.
- Provide typed request and response contracts for the Serper search endpoints used by the application.
- Normalize configuration, HTTP errors, and malformed-response handling behind one client interface.
- Add focused tests for request construction and error behavior.

## Capabilities

### New Capabilities

- `serper-client`: A type-safe server-side client for configuring, calling, and handling responses from Serper.dev.

### Modified Capabilities

None.

## Impact

- Adds a new module under `lib/` and its tests.
- Introduces the `SERPER_API_KEY` server environment variable.
- Uses the platform `fetch` API; no new runtime dependency is required.
- Establishes the interface future application features will use for Serper.dev access.
