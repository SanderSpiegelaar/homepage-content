## MODIFIED Requirements

### Requirement: Research query transformation

The system SHALL load the `research-query` model, instructions, and prompt template from database-backed AI configuration and use them with the Vercel AI SDK to transform a valid keyword into one non-empty, self-contained natural-language query suitable for Exa Agent research. The system MUST render the submitted keyword into the template's `{{keyword}}` token as JSON-encoded data.

#### Scenario: Valid keyword is transformed

- **WHEN** an authenticated user submits a valid keyword, the `research-query` configuration exists, and the LLM succeeds
- **THEN** the system invokes the configured model with the configured prompts and produces one non-empty research query that incorporates the submitted topic

#### Scenario: Query transformation fails

- **WHEN** configuration loading or the LLM call fails, or the LLM returns empty text
- **THEN** the system reports that research could not be started and does not create an Exa Agent run
