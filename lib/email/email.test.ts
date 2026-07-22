import { expect, mock, test } from "bun:test"

const delivery = {
  envelope: { from: "mail@example.com", to: ["person@example.com"] },
  messageId: "sent",
  accepted: ["person@example.com"],
  rejected: [],
  pending: [],
  response: "250 OK",
}
const sendMail = mock(async () => delivery)
const createTransport = mock(() => ({ sendMail }))

mock.module("server-only", () => ({}))
mock.module("nodemailer", () => ({
  default: { createTransport },
  createTransport,
}))

const { sendEmail } = await import("./email")
const message = { to: "person@example.com", subject: "Hello", text: "Hi" }

test("sends transactional email through Emailit", async () => {
  delete process.env.EMAILIT_API_KEY
  delete process.env.EMAIL_FROM
  expect(() => sendEmail(message)).toThrow("EMAILIT_API_KEY is required")

  process.env.EMAILIT_API_KEY = "test-key"
  expect(() => sendEmail(message)).toThrow("EMAIL_FROM is required")

  process.env.EMAIL_FROM = "App <mail@example.com>"
  await expect(sendEmail(message)).resolves.toEqual(delivery)
  expect(createTransport).toHaveBeenCalledWith({
    host: "smtp.emailit.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: "emailit", pass: "test-key" },
  })
  expect(sendMail).toHaveBeenLastCalledWith({
    ...message,
    from: "App <mail@example.com>",
  })

  await sendEmail({
    to: ["one@example.com", "two@example.com"],
    subject: "HTML",
    html: "<p>Hi</p>",
    from: "ignored@example.com",
  } as Parameters<typeof sendEmail>[0] & { from: string })
  expect(createTransport).toHaveBeenCalledTimes(1)
  expect(sendMail).toHaveBeenLastCalledWith({
    to: ["one@example.com", "two@example.com"],
    subject: "HTML",
    html: "<p>Hi</p>",
    from: "App <mail@example.com>",
  })

  const failure = new Error("SMTP unavailable")
  sendMail.mockImplementationOnce(async () => {
    throw failure
  })
  await expect(sendEmail(message)).rejects.toBe(failure)
})
