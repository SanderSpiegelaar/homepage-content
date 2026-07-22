## 1. Result Data Model

- [x] 1.1 Extend the research run status with `completed` and add the one-per-run JSONB result table, typed website payload shape, relations, and callback runtime schema.
- [x] 1.2 Generate and inspect the Drizzle migration for the enum and result table.

## 2. Result Ingestion

- [x] 2.1 Add the server-only transactional persistence function that distinguishes unknown runs, existing results, and successful completion without replacing data.
- [x] 2.2 Add the n8n callback route with bearer-secret authentication, payload validation, safe status responses, and the documented environment configuration.
- [x] 2.3 Add focused tests for callback authentication and validation plus atomic unknown-run, duplicate-result, and success behavior.

## 3. Research Run Details

- [x] 3.1 Add an owner-scoped data-access function returning one run and its optional persisted result.
- [x] 3.2 Read the installed Next.js App Router guidance, then add the authenticated `/exa-research/[id]` server page with not-found handling, full run metadata, waiting states, and a responsive display of every result field.
- [x] 3.3 Link run keywords in Exa Research history to their details pages and add the `completed` status presentation while keeping completed start actions unavailable.
- [x] 3.4 Add focused tests for owner-only details access and result-field rendering behavior where supported by the existing test setup.

## 4. Verification and Documentation

- [x] 4.1 Run formatting, research tests, type checking, linting, and `bun run fallow`; resolve issues introduced by the change.
- [x] 4.2 Perform the DOX closeout pass and update the nearest owning AGENTS.md files for the new result-ingestion and details-page contracts.
