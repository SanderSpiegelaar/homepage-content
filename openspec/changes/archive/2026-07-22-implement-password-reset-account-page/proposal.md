## Why

Users can create and access accounts but have no way to recover a forgotten password or manage their password after signing in. Adding email-based recovery and an authenticated account page closes that core account-management gap using the existing Better Auth and transactional email infrastructure.

## What Changes

- Add a “Forgot password?” flow that accepts an email address and always shows a non-enumerating confirmation response.
- Send single-use, expiring password-reset links through the existing Emailit-backed email helper.
- Add a reset-password page that validates the reset token and lets the user choose a new password.
- Add an authenticated `/account` page where users can view their account identity and change their password.
- Revoke existing sessions after a successful password reset and provide clear success, validation, expired-link, and submission-failure states.
- Add account navigation to the existing dashboard sidebar.

## Capabilities

### New Capabilities
- `password-management`: Recover a forgotten password by email and change a password from an authenticated account.
- `account-page`: View account identity and access password-management actions from a protected `/account` page.

### Modified Capabilities

None.

## Impact

- Updates the Better Auth server configuration and uses its password-reset and password-change APIs.
- Uses the existing `sendEmail` helper and Emailit environment configuration; no new runtime dependency is required.
- Adds public forgot/reset password routes, a protected `/account` route, reusable form UI, and dashboard navigation.
- Adds focused tests for reset-email delivery and password-management form behavior; no database schema change is expected.
