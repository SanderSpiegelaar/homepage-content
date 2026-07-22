## Context

The dashboard currently validates a research keyword, generates a provider-specific query through OpenRouter and the Vercel AI SDK, then creates an Exa Agent run. It also exposes database-backed AI prompt configuration and contains a direct Serper client plus credentials and dependencies for other backend providers. n8n will become the owner of AI, search, and workflow orchestration; this application remains responsible for authenticated user intake and immediate submission feedback.

## Goals / Non-Goals

**Goals:**
- Route validated workflow requests to server-configured n8n webhooks.
- Remove direct AI, research-run, and search-provider execution from the application.
- Keep webhook URLs secret and preserve authorization, validation, pending, success, and safe error states.
- Remove obsolete provider dependencies, configuration, UI, and database state.

**Non-Goals:**
- Building, deploying, or monitoring n8n workflows.
- Polling for workflow completion or displaying generated research results.
- Persisting request history, retries, or webhook responses.
- Creating a user-editable webhook administration interface.

## Decisions

### Use one server-side webhook URL per workflow

Configure the research workflow through `N8N_RESEARCH_WEBHOOK_BASE_URL`. The browser submits only the workflow input to the existing authenticated Server Action; it never receives or selects a webhook URL. This is simpler and safer than a generic client-supplied destination or a database-backed webhook registry. Additional workflows can add their own explicit environment variable when they exist.

### Send a small, stable JSON request contract

The research action sends `{ "type": "research", "keyword": <validated keyword> }` with `Content-Type: application/json`. n8n owns all query generation, provider calls, and asynchronous run management after accepting that payload. User/session data is not forwarded because the current workflow does not require it.

Alternative: preserve the generated query and Exa-shaped response contract. Rejected because it leaks the backend implementation that this change is removing.

### Treat webhook acceptance as the application success boundary

Any 2xx webhook response means the request was submitted. Missing configuration, transport failures, and non-2xx responses produce one logged server error and a provider-neutral message to the user; response bodies and webhook URLs are not exposed. The application does not parse an n8n response or wait for downstream workflow completion.

Alternative: persist and retry failed requests. Rejected because reliability policy belongs in n8n and durable delivery is not currently required.

### Keep a minimal server-only dispatcher

Use the platform `fetch` API in a small server-only module that validates configured URLs and performs the JSON POST. The Server Action retains session and form validation. No n8n SDK or general integration framework is needed.

### Remove obsolete implementation rather than retaining compatibility paths

Delete the AI Config route, navigation item, actions, components, prompt helpers, research orchestration, Serper client, and their tests. Remove the `ai_config` schema and add a migration that drops its table. Remove direct-provider packages, credentials, and documentation. Historical migrations stay intact so existing databases can migrate forward reproducibly.

## Risks / Trade-offs

- [A synchronous webhook call can delay form completion] → Stop at webhook acceptance and use a bounded request timeout.
- [n8n downtime makes submissions fail without automatic retry] → Return a retryable user message and rely on n8n availability; add durable delivery only if loss becomes measurable.
- [Removing `ai_config` discards saved prompts] → Export any values needed by n8n before applying the drop migration.
- [A webhook URL could be accidentally exposed] → Read it only in server code and redact destination and response details from user-facing errors.
- [Existing consumers may expect Exa run metadata] → Replace the UI and action state together with a provider-neutral acknowledgment.

## Migration Plan

1. Configure `N8N_RESEARCH_WEBHOOK_BASE_URL` and verify the target workflow accepts the documented payload.
2. Deploy the webhook dispatcher and updated research submission flow together.
3. Remove provider dependencies, credentials, AI configuration UI/code, direct search clients, and research-run code.
4. Apply the generated migration that drops `ai_config` after exporting any configuration needed by n8n.
5. Roll back by restoring the prior application version and recreating/restoring `ai_config`; provider credentials would also need to be restored.

## Open Questions

- The production n8n webhook URL is deployment-specific and must be supplied through environment configuration.
