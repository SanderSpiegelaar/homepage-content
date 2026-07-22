## REMOVED Requirements

### Requirement: Server-only Serper configuration
**Reason**: Serper configuration moves out of the application and into n8n.
**Migration**: Configure Serper credentials in n8n for workflows that require web search.

### Requirement: Type-safe web search contract
**Reason**: The application no longer constructs or consumes provider-specific Serper requests and responses.
**Migration**: Define any required search data mapping within the owning n8n workflow.

### Requirement: Authenticated search execution
**Reason**: Direct search-provider execution moves behind n8n webhooks.
**Migration**: Application workflows submit provider-neutral inputs to n8n, which performs the search.

### Requirement: Predictable failure handling
**Reason**: Provider-specific HTTP failure handling is no longer an application responsibility.
**Migration**: Handle Serper failures in n8n; the application handles only n8n webhook acceptance failures.
