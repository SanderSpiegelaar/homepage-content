import { expect, mock, test } from "bun:test"

const betterAuth = mock((config: unknown) => config)
const drizzleAdapter = mock(() => "database")
const nextCookies = mock(() => "cookies")
const sendPasswordResetEmail = mock(async () => undefined)

mock.module("server-only", () => ({}))
mock.module("better-auth", () => ({ betterAuth }))
mock.module("better-auth/adapters/drizzle", () => ({ drizzleAdapter }))
mock.module("better-auth/next-js", () => ({ nextCookies }))
mock.module("./db", () => ({ db: {} }))
mock.module("./auth-schema", () => ({}))
mock.module("./password-reset-email", () => ({ sendPasswordResetEmail }))

const { auth } = await import("./auth")
const options = auth as unknown as {
  emailAndPassword: {
    revokeSessionsOnPasswordReset: boolean
    sendResetPassword: (data: {
      user: { email: string }
      url: string
      token: string
    }) => Promise<void>
  }
}

test("configures password reset delivery and session revocation", async () => {
  expect(options.emailAndPassword.revokeSessionsOnPasswordReset).toBe(true)

  await options.emailAndPassword.sendResetPassword({
    user: { email: "person@example.com" },
    url: "https://example.com/api/auth/reset-password/token",
    token: "token",
  })

  expect(sendPasswordResetEmail).toHaveBeenCalledWith(
    "person@example.com",
    "https://example.com/api/auth/reset-password/token"
  )
})
