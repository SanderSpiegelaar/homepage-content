## Why

The application needs one reusable, typed path for sending transactional email instead of duplicating SMTP setup at each call site. Emailit provides the SMTP relay while Nodemailer supplies the established Node.js transport and message API.

## What Changes

- Add Nodemailer as the SMTP email dependency.
- Add a server-only email helper that reuses an Emailit SMTP transporter.
- Configure Emailit credentials and sender identity through environment variables.
- Expose a typed send function supporting recipients, subject, plain-text content, and HTML content.
- Add focused tests for configuration validation and message forwarding without making network calls.
- Document the required Emailit API key and verified sender domain setup.

## Capabilities

### New Capabilities
- `transactional-email`: Send transactional messages through a reusable Nodemailer helper backed by Emailit SMTP.

### Modified Capabilities

None.

## Impact

- Adds the `nodemailer` runtime dependency and its TypeScript types if required by the installed release.
- Adds server-side email utility and test files.
- Adds Emailit SMTP and sender environment variables to the documented application configuration.
- Requires an Emailit API key and a verified sending domain; no public API or database schema changes are introduced.
