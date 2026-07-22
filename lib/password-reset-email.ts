import "server-only"

import { sendEmail, type SendEmailOptions } from "@/lib/email"

export async function sendPasswordResetEmail(
  email: string,
  url: string,
  send: (message: SendEmailOptions) => Promise<unknown> = sendEmail
) {
  try {
    await send({
      to: email,
      subject: "Reset your password",
      text: `Reset your password: ${url}`,
    })
  } catch (error) {
    console.error("Failed to send password reset email", error)
  }
}
