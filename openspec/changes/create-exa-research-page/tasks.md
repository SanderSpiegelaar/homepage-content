## 1. Persist Research Runs

- [x] 1.1 Add the user-owned Exa research-run table, lifecycle fields, constraints, relations, and owner/history index to the Drizzle schema
- [x] 1.2 Generate and review the additive PostgreSQL migration for the research-run table

## 2. Implement Run Operations

- [x] 2.1 Replace immediate intake dispatch with validated creation and newest-first listing of pending user-owned runs
- [x] 2.2 Update the server-only n8n helper to POST the exact keyword payload and validate `success` plus `executionId`
- [x] 2.3 Implement the authenticated, ownership-scoped start action with an atomic status claim, persisted success details, safe failure state, and route revalidation
- [x] 2.4 Add focused tests for keyword validation, n8n response handling, authorization/ownership, duplicate-start prevention, and lifecycle updates

## 3. Build the Exa Research Page

- [x] 3.1 Add only the required shadcn/ui table, badge, and dropdown-menu primitives
- [x] 3.2 Create the authenticated Exa Research route with the pending-run form, creation feedback, newest-first run table, and empty state
- [x] 3.3 Add accessible per-row actions that start pending or failed runs and disable starting or started runs
- [x] 3.4 Replace the root immediate-intake presentation and add Exa Research to the sidebar with correct active-destination feedback

## 4. Verify the Change

- [x] 4.1 Run the focused test suite, type checking, and linting; fix all failures
- [x] 4.2 Verify manually that create does not call n8n and that start stores the returned execution identifier and displays the updated state
