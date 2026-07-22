## Why

AI model identifiers and prompts are currently hard-coded, so changing AI behavior requires a code change and deployment. A database-backed AI Config page will let signed-in users adjust the application's AI configuration at runtime.

## What Changes

- Add an AI Config page to the authenticated application navigation.
- Store each AI use case's model identifier and prompts in the database.
- Allow signed-in users to view and update AI configuration with validation.
- Resolve AI models and prompts from stored configuration when AI features run.
- Seed the current research-query model and instructions as the initial configuration.

## Capabilities

### New Capabilities
- `ai-configuration`: Database-backed viewing, editing, validation, and runtime use of AI models and prompts.

### Modified Capabilities
- `research-intake`: Generate the research query using the model and instructions saved in AI Config instead of hard-coded values.

## Impact

- Adds database schema and migration changes for AI configuration.
- Adds an authenticated dashboard route, navigation entry, form, and server actions.
- Changes the research submission AI call to load its model and instructions from the database.
- Uses the existing Drizzle, OpenRouter provider, Vercel AI SDK, Better Auth session checks, and shadcn/ui components; no new dependency is required.
