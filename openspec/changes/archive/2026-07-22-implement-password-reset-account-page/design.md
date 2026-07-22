## Context

The application already uses Better Auth 1.6.23 with email/password authentication, a protected dashboard route group, shadcn/ui forms, and a server-only `sendEmail` helper backed by Emailit SMTP. It lacks password recovery, password changes, and an account destination. The reset flow crosses public UI, Better Auth configuration, transactional email, and protected UI, and must not expose whether an email address is registered.

## Goals / Non-Goals

**Goals:**
- Use Better Auth's built-in, single-use password-reset tokens and client APIs.
- Keep forgot-password responses non-enumerating while sending reset links through the existing email helper.
- Revoke active sessions after recovery and support authenticated password changes.
- Fit the new pages into the existing auth and dashboard layouts with existing shadcn/ui components.
- Cover the security-sensitive configuration and primary form outcomes with focused tests.

**Non-Goals:**
- Building custom reset-token storage, email queues, templates, or retry infrastructure.
- Adding profile editing, account deletion, email-address changes, OAuth recovery, or administrator-driven resets.
- Changing password hashing, token lifetime, or the database schema unless Better Auth's current schema check shows it is required.

## Decisions

1. **Delegate token creation, validation, expiry, and consumption to Better Auth.** Configure `sendResetPassword` and `revokeSessionsOnPasswordReset`, then call `authClient.requestPasswordReset` and `authClient.resetPassword`. A custom token table was rejected because Better Auth already provides one-hour, single-use reset tokens and avoids security-sensitive duplicate code.

2. **Use `/forgot-password` and `/reset-password` inside the public auth route group.** The request form passes an absolute `/reset-password` redirect URL. Better Auth redirects valid links with `token` and invalid or expired links with `error=INVALID_TOKEN`; the reset page renders the appropriate form or recovery message from those parameters. An API proxy or server action was rejected because the existing Better Auth client already exposes the required endpoints.

3. **Keep the request response generic.** After a syntactically valid submission, the UI displays the same “check your email” result regardless of whether the account exists. Delivery runs through `sendEmail` from Better Auth's server-only callback and operational failures are logged without changing the public response. Account-specific success or failure messaging was rejected because it enables email enumeration.

4. **Use the protected dashboard route group for `/account`.** The existing layout supplies the session guard and shell. The page displays the signed-in user's name and email and hosts a client-side password form that calls `authClient.changePassword` with the current password, new password, and `revokeOtherSessions: true`. Duplicating an account-specific authorization check was rejected because the shared layout already enforces it.

5. **Reuse the current UI and validation conventions.** Compose existing Card, Alert, Button, Input, and form primitives; require password confirmation in the UI and use Better Auth's configured password policy as the server authority. No form library or new dependency is needed for these small forms.

6. **Test the narrow security boundaries.** Add focused tests that verify reset-email message construction/configuration and the important request/reset/change form outcomes, while leaving Better Auth's own token internals to its upstream tests. End-to-end email delivery and a custom token test harness are deferred because they duplicate provider and library behavior.

## Risks / Trade-offs

- [Reset email delivery can fail after the generic response] → Log the failure server-side and keep the public response non-enumerating; add durable background delivery only if reliability requirements justify it.
- [A reset URL uses the wrong deployment origin] → Build the absolute callback URL from the browser origin at request time and rely on Better Auth's trusted-origin validation.
- [A stolen reset link can change the password] → Rely on Better Auth's short-lived, single-use token and revoke all sessions after successful reset.
- [Changing a password signs out other devices] → Make the behavior explicit in the account form success copy; preserve the current session through Better Auth's `revokeOtherSessions` behavior.
- [UI validation can drift from Better Auth policy] → Keep client checks minimal and always surface Better Auth's server validation response.
