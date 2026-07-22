## Why

Users need a simple starting point for the research pipeline instead of manually turning a keyword into an effective research task. Converting the keyword into a focused query before starting Exa research gives the downstream agent clearer intent and more useful results.

## What Changes

- Replace the dashboard placeholder with a form that accepts a research keyword.
- Validate the submitted keyword and use the Vercel AI SDK with a dedicated prompt to transform it into a research query.
- Start an asynchronous Exa Agent API run with the generated query and return enough run information for subsequent pipeline steps.
- Surface submission, validation, and service failures to the user without exposing credentials or internal errors.

## Capabilities

### New Capabilities

- `research-intake`: Accept a keyword, transform it into a research query, and start an Exa Agent research run.

### Modified Capabilities

None.

## Impact

- Affects the authenticated dashboard page and adds a server-side research submission path.
- Adds the Vercel AI SDK and its selected model provider integration; reuses the installed official `exa-js` SDK and existing shadcn/ui components.
- Requires server-side AI provider and `EXA_API_KEY` configuration.
- Creates asynchronous Exa Agent runs, which are not a Zero Data Retention API surface.
