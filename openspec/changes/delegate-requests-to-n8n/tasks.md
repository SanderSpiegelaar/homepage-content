## 1. n8n Request Dispatch

- [x] 1.1 Add server-only n8n webhook dispatch using workflow-specific environment configuration, HTTPS JSON POST, a bounded timeout, and safe non-2xx handling
- [x] 1.2 Add focused dispatcher tests for payload and headers, missing or invalid configuration, acceptance, timeout, and non-2xx failure
- [x] 1.3 Document `N8N_RESEARCH_WEBHOOK_BASE_URL` in the environment example

## 2. Research Intake Migration

- [x] 2.1 Replace AI query generation and Exa run creation in the authenticated research Server Action with the validated `{ type: "research", keyword }` n8n request
- [x] 2.2 Replace provider-specific research action state and dashboard copy with pending, accepted, validation-error, and safe submission-error states
- [x] 2.3 Update focused research tests to verify authorization and validation prevent webhook calls and successful submissions return no provider run metadata

## 3. Remove Internal Provider Functionality

- [x] 3.1 Remove the AI Config page, navigation entry, actions, components, prompt/config modules, and related tests
- [x] 3.2 Remove the `ai_config` Drizzle schema and generate a forward migration that drops the table while retaining migration history
- [x] 3.3 Remove the direct Serper client and tests plus unused Exa, Vercel AI SDK/OpenRouter, Firecrawl, DataForSEO, and provider SDK dependencies
- [x] 3.4 Remove obsolete provider credentials and provider-specific documentation from the application

## 4. Verification

- [x] 4.1 Run the focused test suite, typecheck, lint, and production build
- [x] 4.2 Validate the OpenSpec change and verify no runtime imports, environment references, or UI routes remain for removed provider and AI configuration functionality
