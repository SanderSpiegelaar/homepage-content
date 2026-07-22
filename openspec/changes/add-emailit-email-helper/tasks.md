## 1. Dependency and Configuration

- [x] 1.1 Add `nodemailer` and its TypeScript declarations with Bun.
- [x] 1.2 Document `EMAILIT_API_KEY`, `EMAIL_FROM`, and the verified Emailit sending-domain prerequisite in the project README.

## 2. Email Helper

- [x] 2.1 Add a server-only email module with lazy, reusable Emailit SMTP transport configuration and clear validation for missing environment variables.
- [x] 2.2 Implement the typed `sendEmail` function with a fixed configured sender, required message content, delivery-result return value, and unchanged error propagation.

## 3. Verification

- [x] 3.1 Add focused Bun tests covering SMTP configuration, missing environment variables, sender enforcement, message forwarding, and delivery errors without contacting Emailit.
- [x] 3.2 Run the email tests, TypeScript typecheck, and ESLint; resolve any failures.
