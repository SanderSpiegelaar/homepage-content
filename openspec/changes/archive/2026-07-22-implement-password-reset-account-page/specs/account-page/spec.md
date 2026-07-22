## ADDED Requirements

### Requirement: Protect account settings
The system SHALL make `/account` available only to authenticated users through the existing protected dashboard shell.

#### Scenario: Signed-out account visit
- **WHEN** a signed-out visitor requests `/account`
- **THEN** the system redirects the visitor to the sign-in page

#### Scenario: Signed-in account visit
- **WHEN** a signed-in user requests `/account`
- **THEN** the system displays the account page inside the dashboard shell

### Requirement: Display account identity
The account page SHALL display the authenticated user's current name and email address as read-only account information.

#### Scenario: Account identity shown
- **WHEN** the account page loads for a signed-in user
- **THEN** the page shows the name and email from the authenticated session without exposing credential data

### Requirement: Provide password management
The account page SHALL provide the authenticated password-change form and clear success or error feedback.

#### Scenario: Password form available
- **WHEN** an authenticated email/password user views `/account`
- **THEN** the page presents fields for current password, new password, and new-password confirmation

#### Scenario: Password form result
- **WHEN** the password-change request succeeds or fails
- **THEN** the page displays the corresponding result without navigating away from `/account`

### Requirement: Navigate to account settings
The dashboard navigation SHALL include an Account destination and indicate it as active while the account page is displayed.

#### Scenario: Open account from navigation
- **WHEN** a signed-in user activates the Account navigation item
- **THEN** the system navigates to `/account` and marks Account as the current destination
