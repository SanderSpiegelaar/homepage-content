## ADDED Requirements

### Requirement: Domain-owned library modules
The codebase SHALL place authentication, research, and email library modules in subdirectories named for their owning domains, while shared database composition SHALL reside in a dedicated database subdirectory.

#### Scenario: Locate a domain library module
- **WHEN** a maintainer looks for library code owned by authentication, research, or email
- **THEN** the module is located under the corresponding `lib/<domain>/` directory

#### Scenario: Locate shared database composition
- **WHEN** a maintainer looks for database client or schema composition code
- **THEN** the code is located under `lib/db/` rather than assigned to an unrelated business domain

### Requirement: Domain-owned feature components
The codebase SHALL place feature components in subdirectories named for their owning domain or application area, while generic shadcn primitives SHALL remain under `components/ui/`.

#### Scenario: Locate a feature component
- **WHEN** a maintainer looks for an authentication, research, or application-layout component
- **THEN** the component is located under the corresponding domain or application-area subdirectory of `components/`

#### Scenario: Locate a generic UI primitive
- **WHEN** a maintainer looks for a reusable shadcn primitive
- **THEN** the primitive remains available under `components/ui/`

### Requirement: Per-domain Drizzle schemas
Each domain that owns persisted entities SHALL declare those entities in its own schema file, and the system SHALL provide one composed schema surface to both the runtime database client and Drizzle Kit.

#### Scenario: Inspect authentication persistence
- **WHEN** a maintainer inspects the authentication domain schema
- **THEN** it contains the authentication-owned tables and relationships

#### Scenario: Inspect research persistence
- **WHEN** a maintainer inspects the research domain schema
- **THEN** it contains the research-run enum, table, and relationships, including its explicit dependency on the authentication user table

#### Scenario: Consume the complete schema
- **WHEN** the runtime database client or Drizzle Kit loads the schema
- **THEN** all domain schema exports are available through the shared composition point

### Requirement: Behavior-preserving reorganization
The reorganization MUST preserve existing application behavior and persisted database identifiers while updating all internal consumers to the new module paths.

#### Scenario: Validate application behavior
- **WHEN** the reorganized codebase is tested, type-checked, linted, and built
- **THEN** existing authentication, research, email, and dashboard behavior passes the repository validation commands

#### Scenario: Validate database neutrality
- **WHEN** Drizzle compares the reorganized domain schema files with the existing migration state
- **THEN** no database migration is required solely because source files moved

#### Scenario: Search for obsolete imports
- **WHEN** the repository is searched for module paths removed by the reorganization
- **THEN** application code and tests contain no imports or mocks targeting those old paths
