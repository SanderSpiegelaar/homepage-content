import "server-only"

import nodemailer, { type SendMailOptions } from "nodemailer"

interface EmailMessage {
  to: NonNullable<SendMailOptions["to"]>
  subject: string
}

export type SendEmailOptions = EmailMessage &
  ({ text: string; html?: string } | { text?: string; html: string })

let email:
  | {
      from: string
      transport: ReturnType<typeof nodemailer.createTransport>
    }
  | undefined

function getEmail() {
  if (email) return email

  const apiKey = process.env.EMAILIT_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey) throw new Error("EMAILIT_API_KEY is required")
  if (!from) throw new Error("EMAIL_FROM is required")

  return (email = {
    from,
    transport: nodemailer.createTransport({
      host: "smtp.emailit.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: "emailit", pass: apiKey },
    }),
  })
}

export function sendEmail(message: SendEmailOptions) {
  const { from, transport } = getEmail()

  return transport.sendMail({ ...message, from })
}
