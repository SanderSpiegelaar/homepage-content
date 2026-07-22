## Why

The n8n boundary currently relies on TypeScript types and handwritten response checks, so malformed runtime data can drift from the documented request and response contracts. Zod schemas will provide one explicit, reusable runtime contract for both directions.

## What Changes

- Add Zod as a runtime dependency.
- Define schemas for the outgoing research webhook payload and incoming acceptance response.
- Parse outgoing payloads before dispatch and reject invalid data without making a request.
- Parse incoming JSON before returning the normalized execution identifier.
- Update focused boundary tests for valid and invalid request and response data.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `n8n-request-dispatch`: Require runtime schema validation for outgoing workflow payloads and incoming webhook responses.

## Impact

- Affects `lib/research/n8n.ts` and its focused tests.
- Adds `zod` to application dependencies and the Bun lockfile.
- Does not change the valid n8n wire payload or successful return value.
