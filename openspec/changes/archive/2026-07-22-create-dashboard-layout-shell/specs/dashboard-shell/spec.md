## ADDED Requirements

### Requirement: Shared authenticated dashboard shell
The system SHALL render authenticated dashboard pages inside one shared application shell containing navigation, a header, and a main content region. Unauthenticated requests to a dashboard page MUST be redirected to the sign-in page.

#### Scenario: Authenticated user opens the dashboard
- **WHEN** an authenticated user opens the root dashboard route
- **THEN** the system renders the dashboard page inside the shared application shell

#### Scenario: Unauthenticated user opens the dashboard
- **WHEN** an unauthenticated user opens a dashboard route
- **THEN** the system redirects the user to the sign-in page

### Requirement: Responsive primary navigation
The shell SHALL provide primary navigation that is persistently visible at desktop widths and available through an explicit menu control at mobile widths.

#### Scenario: Desktop navigation
- **WHEN** the dashboard is displayed at a desktop viewport width
- **THEN** the primary navigation is visible alongside the page content

#### Scenario: Mobile navigation
- **WHEN** the dashboard is displayed at a mobile viewport width
- **THEN** the primary navigation is hidden until the user activates the labeled menu control

### Requirement: Current destination feedback
The primary navigation SHALL visually and programmatically identify the active destination.

#### Scenario: Active dashboard destination
- **WHEN** the user is viewing the root dashboard route
- **THEN** the dashboard navigation item is presented as the current destination

### Requirement: Dashboard header controls
The shell SHALL provide a header containing page context, a mobile navigation trigger when applicable, and access to the existing sign-out action.

#### Scenario: User signs out from the shell
- **WHEN** an authenticated user activates the sign-out action in the dashboard header
- **THEN** the existing sign-out flow is invoked

### Requirement: Independent page content
The shell SHALL render each dashboard route's content within a main landmark that adapts to the available viewport without requiring the route to reproduce shell markup.

#### Scenario: Dashboard page supplies content
- **WHEN** a dashboard route renders its page content
- **THEN** the content appears in the shell's main region with responsive spacing
