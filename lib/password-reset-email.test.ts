import { expect, mock, test } from "bun:test"

mock.module("server-only", () => ({}))

const { sendPasswordResetEmail } = await import("./password-reset-email")

test("sends reset links and logs delivery failures", async () => {
  const send = mock(async () => undefined)

  await sendPasswordResetEmail(
    "person@example.com",
    "https://example.com/api/auth/reset-password/token",
    send
  )

  expect(send).toHaveBeenLastCalledWith({
    to: "person@example.com",
    subject: "Reset your password",
    text: "Reset your password: https://example.com/api/auth/reset-password/token",
  })

  const failure = new Error("SMTP unavailable")
  const error = mock(() => undefined)
  const originalError = console.error
  console.error = error
  send.mockRejectedValueOnce(failure)

  await expect(
    sendPasswordResetEmail(
      "person@example.com",
      "https://example.com/reset",
      send
    )
  ).resolves.toBeUndefined()
  expect(error).toHaveBeenCalledWith(
    "Failed to send password reset email",
    failure
  )

  console.error = originalError
})
