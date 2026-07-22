## ADDED Requirements

### Requirement: Emailit SMTP configuration
The system SHALL configure a server-only Nodemailer transport for `smtp.emailit.com` on port 587 using STARTTLS, username `emailit`, and the configured Emailit API key as the password.

#### Scenario: Transport is initialized
- **WHEN** the email helper is first used with an Emailit API key and sender address configured
- **THEN** the system initializes an authenticated Emailit SMTP transport without exposing credentials to client code

#### Scenario: Required configuration is missing
- **WHEN** the email helper is used without the Emailit API key or sender address configured
- **THEN** the system rejects the send attempt with an error identifying the missing configuration

### Requirement: Reusable transactional email sending
The system SHALL provide a typed reusable function that sends a transactional email to one or more recipients with a subject and at least one plain-text or HTML body, using the configured sender address.

#### Scenario: Plain-text email is sent
- **WHEN** a caller provides recipients, a subject, and a plain-text body
- **THEN** the system submits the message through the shared Emailit SMTP transport and returns the delivery result

#### Scenario: HTML email is sent
- **WHEN** a caller provides recipients, a subject, and an HTML body
- **THEN** the system submits the message through the shared Emailit SMTP transport and returns the delivery result

#### Scenario: Delivery fails
- **WHEN** Emailit or Nodemailer rejects a message submission
- **THEN** the system propagates the delivery error to the caller

### Requirement: Verified sender identity
The system SHALL use the centrally configured sender address for every message and SHALL NOT allow individual callers to override it.

#### Scenario: Caller sends a message
- **WHEN** a caller submits valid message content
- **THEN** the message uses the configured sender address from an Emailit-verified sending domain
