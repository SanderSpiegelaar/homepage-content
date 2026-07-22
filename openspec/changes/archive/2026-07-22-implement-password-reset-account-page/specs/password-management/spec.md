## ADDED Requirements

### Requirement: Request password recovery
The system SHALL allow a signed-out user to request a password-reset email by submitting a valid email address.

#### Scenario: Request submitted
- **WHEN** a user submits a syntactically valid email address on the forgot-password page
- **THEN** the system displays the same check-your-email confirmation regardless of whether an account exists for that address

#### Scenario: Invalid email input
- **WHEN** a user submits an invalid email address
- **THEN** the system rejects the submission and identifies the invalid field without sending a reset request

### Requirement: Deliver a secure reset link
The system SHALL send registered users a reset link through the configured transactional email service using a Better Auth single-use, expiring token.

#### Scenario: Registered account requests recovery
- **WHEN** a password-reset request matches an email/password account
- **THEN** the system sends that address a link to the reset-password page containing a Better Auth reset token

#### Scenario: Unknown account requests recovery
- **WHEN** a password-reset request does not match an account
- **THEN** the system sends no account-specific information in the response

### Requirement: Reset a forgotten password
The system SHALL allow a user with a valid reset token to set and confirm a new password that satisfies the server password policy.

#### Scenario: Valid reset
- **WHEN** a user submits matching valid passwords with an unexpired, unused reset token
- **THEN** the system updates the password, consumes the token, revokes the user's active sessions, and offers a path to sign in

#### Scenario: Invalid or expired link
- **WHEN** the reset page receives a missing, invalid, expired, or previously consumed token
- **THEN** the system does not show an active reset form and offers a path to request a new link

#### Scenario: Password confirmation mismatch
- **WHEN** the new-password and confirmation values do not match
- **THEN** the system rejects the submission without calling the password-reset endpoint

#### Scenario: Password policy rejection
- **WHEN** Better Auth rejects the proposed password
- **THEN** the system preserves the reset page and displays an actionable error without consuming a valid token on the client

### Requirement: Change an authenticated password
The system SHALL allow a signed-in email/password user to change their password by providing the current password and a confirmed new password.

#### Scenario: Password changed
- **WHEN** a signed-in user submits the correct current password and matching valid new passwords
- **THEN** the system changes the password, keeps the current session, revokes other sessions, and displays confirmation

#### Scenario: Current password rejected
- **WHEN** the supplied current password is incorrect
- **THEN** the system leaves the password unchanged and displays an error

#### Scenario: New passwords do not match
- **WHEN** the new-password and confirmation values differ
- **THEN** the system rejects the submission without calling the change-password endpoint
