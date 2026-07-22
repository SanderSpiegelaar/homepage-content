# Effectful Server Workflows

## Purpose

Define safe, incremental adoption of Effect for server-side workflows while preserving existing caller compatibility and explicit operational boundaries.

## Requirements

### Requirement: Incremental Effect workflow adoption
The system SHALL use Effect for the n8n research dispatch workflow and SHALL permit other server workflows to remain Promise-based until they are intentionally migrated. Migrated workflows MUST expose a Promise-compatible adapter when an existing framework or domain caller requires one.

#### Scenario: Existing caller dispatches research
- **WHEN** the Promise-based research orchestration invokes the migrated n8n dispatcher
- **THEN** the adapter runs the Effect workflow and resolves with the validated execution identifier on success

#### Scenario: Unrelated workflow remains unchanged
- **WHEN** a server workflow has not been selected for Effect migration
- **THEN** the system continues to support its existing Promise-based implementation without requiring an Effect wrapper

### Requirement: Typed expected failures
An Effect-based server workflow MUST represent expected configuration, validation, timeout, transport, remote rejection, and response-validation failures in its typed error channel. It MUST preserve unexpected programming faults as defects rather than silently converting every throwable value into an expected failure.

#### Scenario: Expected integration failure occurs
- **WHEN** the n8n dispatcher encounters a timeout, transport failure, rejected response, or malformed successful response
- **THEN** its Effect result identifies the corresponding tagged failure category for exhaustive handling

#### Scenario: Unexpected defect occurs
- **WHEN** the workflow encounters a programming defect outside its declared expected failures
- **THEN** the defect remains distinguishable from the typed expected error channel

### Requirement: Runtime-validated side-effect boundaries
An Effect-based workflow MUST runtime-validate untrusted outbound and inbound values before using them and MUST NOT perform an outbound side effect when its outbound payload is invalid. Validation failures exposed outside the server boundary MUST NOT reveal provider response bodies, webhook URLs, or schema internals.

#### Scenario: Outbound payload is invalid
- **WHEN** the n8n Effect workflow receives an invalid run identifier or keyword
- **THEN** it returns a typed validation failure without invoking fetch

#### Scenario: Inbound payload is valid
- **WHEN** n8n returns a successful response matching the declared runtime schema
- **THEN** the workflow returns the validated, normalized execution identifier

#### Scenario: Inbound payload is invalid
- **WHEN** n8n returns a successful response that does not match the declared runtime schema
- **THEN** the workflow returns a typed response-validation failure without exposing response details to the caller

### Requirement: Explicit dependency provision
An Effect-based server workflow SHALL declare replaceable external dependencies in its Effect requirements and SHALL provide production implementations at a local composition boundary. Tests MUST be able to provide deterministic substitutes without making real network requests.

#### Scenario: Production dependencies are provided
- **WHEN** the Promise adapter runs the n8n Effect workflow in the application
- **THEN** it provides the application logger, fetch implementation, configured HTTPS destination, and timeout needed by the workflow

#### Scenario: Test dependencies are provided
- **WHEN** a focused test runs the n8n Effect workflow with test dependencies
- **THEN** the test controls network responses, logging, destination, and timeout without mutating global application state

### Requirement: Safe timeout and observability behavior
The migrated workflow MUST retain bounded request execution and correlated structured logging. It MUST interrupt an in-flight fetch after the configured timeout, classify the failure as a timeout, and MUST NOT add automatic retries until webhook idempotency is guaranteed.

#### Scenario: Request exceeds timeout
- **WHEN** the n8n fetch remains in flight beyond the configured timeout
- **THEN** the workflow interrupts the request, logs a correlated timeout failure, and returns the typed timeout category

#### Scenario: Request succeeds
- **WHEN** the n8n request and response validation succeed within the timeout
- **THEN** the workflow logs correlated request and response records without authorization data or raw webhook URLs

#### Scenario: Submission fails
- **WHEN** the n8n submission returns any expected failure
- **THEN** the workflow does not automatically retry the non-idempotent submission
