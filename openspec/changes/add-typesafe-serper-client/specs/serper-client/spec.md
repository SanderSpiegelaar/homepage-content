## ADDED Requirements

### Requirement: Server-only Serper configuration
The system SHALL resolve the Serper API key from an explicit server-side option or `SERPER_API_KEY`, SHALL fail before making a request when no key is available, and SHALL prevent the integration module from being included in client bundles.

#### Scenario: Environment configuration is used
- **WHEN** a server caller searches without supplying an explicit API key and `SERPER_API_KEY` is configured
- **THEN** the system authenticates the Serper request with the configured key

#### Scenario: Configuration is missing
- **WHEN** a server caller searches without an explicit API key and `SERPER_API_KEY` is not configured
- **THEN** the system throws a configuration error without making a network request

### Requirement: Type-safe web search contract
The system SHALL expose TypeScript request and response types for Serper web search, including query text, supported query controls, search metadata, and common result sections such as organic results, answer boxes, knowledge graphs, people-also-ask entries, and related searches.

#### Scenario: Caller constructs a supported search
- **WHEN** a TypeScript caller supplies a query and supported optional controls
- **THEN** the compiler accepts the request and provides typed access to known response sections

#### Scenario: Response omits an optional section
- **WHEN** Serper returns a valid search response without one or more optional result sections
- **THEN** the response remains valid and the omitted sections are represented as absent

### Requirement: Authenticated search execution
The system SHALL send web-search requests to Serper over HTTPS as JSON with the API key header and SHALL return the decoded response for successful HTTP responses.

#### Scenario: Search succeeds
- **WHEN** Serper returns a successful JSON object for a valid search request
- **THEN** the system returns that object through the typed web-search response contract

#### Scenario: Test transport is provided
- **WHEN** a caller supplies a fetch-compatible transport override
- **THEN** the system uses that transport with the same URL, headers, and body as the default transport

### Requirement: Predictable failure handling
The system SHALL throw a provider-specific error for non-successful Serper HTTP responses, including the HTTP status and safe response details, and SHALL reject successful responses whose JSON payload is not an object.

#### Scenario: Serper rejects a request
- **WHEN** Serper returns a non-successful HTTP status
- **THEN** the system throws a Serper error containing the status without exposing the API key

#### Scenario: Serper returns a malformed success payload
- **WHEN** Serper returns a successful response whose JSON value is not an object
- **THEN** the system throws a malformed-response error

#### Scenario: Transport fails
- **WHEN** the network transport rejects before receiving an HTTP response
- **THEN** the original transport error remains distinguishable from a Serper HTTP error
