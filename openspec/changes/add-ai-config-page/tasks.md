## 1. Persist AI Configuration

- [x] 1.1 Add the `ai_config` Drizzle table with stable key, label, model, instructions, prompt template, and update timestamp fields
- [x] 1.2 Generate a migration that creates the table and seeds the current `research-query` configuration
- [x] 1.3 Add a small server-only configuration module that loads known use cases, validates updates, renders `{{keyword}}` as JSON-encoded data, and fails when configuration is missing
- [x] 1.4 Add focused tests for blank fields, the required research template token, safe keyword rendering, and missing configuration

## 2. Build the AI Config Page

- [x] 2.1 Add the authenticated `/ai-config` page and an AI Config item to the dashboard sidebar
- [x] 2.2 Build the shadcn/ui form that lists stored use cases and edits their model, instructions, and prompt template values
- [x] 2.3 Add a server action that independently verifies the Better Auth session, validates a known configuration, persists valid edits, and returns accessible success or error feedback
- [x] 2.4 Add focused tests for authorized updates, rejected unauthenticated updates, invalid submissions, and unchanged data after rejection

## 3. Use Runtime Configuration

- [x] 3.1 Update research submission to load `research-query`, render its prompt template, and pass the stored model and instructions to the existing AI SDK call
- [x] 3.2 Update research tests to verify configured values are used and missing configuration prevents both AI and Exa calls

## 4. Verify the Change

- [x] 4.1 Run the focused test suite, type checking, and linting, and fix any regressions
- [x] 4.2 Apply the migration in a test database and verify saved AI Config edits are used by the next research submission
