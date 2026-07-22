## Context

The project has no shared email transport. The new helper runs only on the server and connects to Emailit's documented SMTP endpoint (`smtp.emailit.com:587`) with STARTTLS, username `emailit`, and an API key as the password. Emailit requires the sender domain to be verified.

## Goals / Non-Goals

**Goals:**
- Provide one typed function for transactional email delivery.
- Keep SMTP credentials out of source and client bundles.
- Reuse a single Nodemailer transporter rather than rebuilding it per message.
- Fail clearly when required email configuration is absent.

**Non-Goals:**
- Email templates, queues, retries, scheduled sends, bulk marketing, or webhook handling.
- Supporting multiple SMTP providers or runtime-selectable transports.
- Managing Emailit domains, API keys, or DNS verification from the application.

## Decisions

1. **Use Nodemailer's SMTP transport in a server-only module.** The helper will import `server-only`, create the transport with Emailit's fixed host, port, username, and STARTTLS settings, and read only the API key from the environment. Using Emailit's REST API was considered, but SMTP through Nodemailer is the requested integration and avoids a custom HTTP wrapper.

2. **Expose one `sendEmail` function with a narrow typed input.** Callers provide recipients, subject, and at least one of plain-text or HTML content; the helper supplies the configured `from` address. Passing Nodemailer's full options through was considered, but allowing callers to override transport-owned fields weakens the shared defaults.

3. **Initialize configuration and the transporter lazily, then reuse it.** Lazy initialization avoids failing unrelated build-time imports while still surfacing configuration errors on first use. Creating a transporter for every send was rejected because the configuration is process-wide and immutable.

4. **Use two required environment variables.** `EMAILIT_API_KEY` authenticates SMTP and `EMAIL_FROM` identifies a sender on a verified Emailit domain. Host, port, username, and TLS behavior remain constants because this helper is intentionally Emailit-specific.

5. **Propagate delivery errors.** The helper returns Nodemailer's send result and does not swallow or retry errors, so each caller can apply workflow-specific handling. Generic retry and queue behavior is deferred until delivery requirements justify it.

## Risks / Trade-offs

- [A missing or invalid API key prevents delivery] → Validate required variables before creating the transport and preserve Nodemailer's actionable error.
- [An unverified `EMAIL_FROM` domain is rejected by Emailit] → Document the verification prerequisite and keep sender configuration centralized.
- [In-process delivery can add request latency or fail transiently] → Propagate failures; add a queue only if product workflows later require durable asynchronous delivery.
- [A reused transporter is process-local in serverless deployments] → Accept one transporter per runtime instance; no cross-instance state is required.
