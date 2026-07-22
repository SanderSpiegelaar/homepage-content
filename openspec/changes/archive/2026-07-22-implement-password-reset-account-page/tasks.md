## 1. Configure Password Recovery

- [x] 1.1 Configure Better Auth to send reset links through `sendEmail` with a non-enumerating public response and to revoke sessions after successful resets
- [x] 1.2 Add focused Bun coverage for reset-email construction, reset configuration, and delivery-failure handling without network calls

## 2. Add Public Recovery Pages

- [x] 2.1 Add a forgot-password page and form that validates email, requests an absolute `/reset-password` callback, and always shows generic confirmation after a valid request
- [x] 2.2 Add a forgot-password link to the existing sign-in form
- [x] 2.3 Add a reset-password page that handles Better Auth token/error query parameters, confirms the new password, submits the reset, and links back to sign-in or a new recovery request

## 3. Add Account Password Management

- [x] 3.1 Add a protected `/account` page that displays the current session user's name and email
- [x] 3.2 Add an account password-change form with current/new/confirmation validation, other-session revocation, and inline result feedback
- [x] 3.3 Add an Account item to the dashboard sidebar with correct active-state behavior

## 4. Verify the Change

- [x] 4.1 Add focused coverage for mismatch, success, and API-error behavior in the password reset and change flows using the existing test tooling
- [x] 4.2 Run the relevant Bun tests, TypeScript typecheck, ESLint, and production build; fix all regressions
