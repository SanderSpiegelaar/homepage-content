import { expect, mock, test } from "bun:test"

mock.module("server-only", () => ({}))

const { emailAndPassword } = await import("./options")

test("configures password reset delivery and session revocation", () => {
  expect(emailAndPassword.enabled).toBe(true)
  expect(emailAndPassword.revokeSessionsOnPasswordReset).toBe(true)
  expect(emailAndPassword.sendResetPassword).toBeFunction()
})
