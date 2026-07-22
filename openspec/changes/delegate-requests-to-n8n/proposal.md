## Why

The application currently owns provider-specific AI, search, and research orchestration that will instead be managed by n8n. Moving workflow execution behind n8n webhooks keeps this application focused on authenticated request intake and removes duplicated backend configuration and dependencies.

## What Changes

- **BREAKING** Remove direct Exa, OpenRouter/Vercel AI SDK, Firecrawl, DataForSEO, and Serper integrations and their server credentials from the application.
- **BREAKING** Remove application-owned research query generation, Exa research-run creation, and provider-specific run results.
- Remove the AI configuration page, actions, database access, schema, and related prompt configuration because n8n owns workflow configuration.
- Send each authenticated, validated workflow request to its configured n8n webhook URL as JSON.
- Keep request validation, authorization, pending feedback, and safe success/failure feedback in the application without exposing webhook details.

## Capabilities

### New Capabilities
- `n8n-request-dispatch`: Dispatch validated application workflow requests to server-configured n8n webhook URLs with safe response handling.

### Modified Capabilities
- `research-intake`: Replace internal query generation and Exa run creation with submission of the validated research request to n8n.
- `serper-client`: Remove the application-owned Serper client because external search execution moves behind n8n.

## Impact

- Affects the dashboard research form, its Server Action, navigation, AI configuration UI, database schema/migrations, environment documentation, and focused tests.
- Removes provider SDK dependencies and provider credentials from the application and lockfile.
- Adds server-side n8n webhook configuration and an outbound JSON webhook call.
- Changes the successful research submission contract from Exa query/run metadata to an n8n request acknowledgment.
