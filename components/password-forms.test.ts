import { expect, mock, test } from "bun:test"

type AuthResult = {
  data: object | null
  error: { message: string } | null
}

const requestPasswordReset = mock(async (): Promise<AuthResult> => ({
  data: {},
  error: null,
}))
const resetPasswordApi = mock(async (): Promise<AuthResult> => ({
  data: {},
  error: null,
}))
const changePasswordApi = mock(async (): Promise<AuthResult> => ({
  data: {},
  error: null,
}))

mock.module("@/lib/auth-client", () => ({
  authClient: {
    requestPasswordReset,
    resetPassword: resetPasswordApi,
    changePassword: changePasswordApi,
  },
}))

const { changePassword, resetPassword } = await import("./password-forms")

test("validates and submits password resets", async () => {
  expect(await resetPassword("token", "new-password", "different")).toEqual({
    error: "Passwords do not match.",
  })
  expect(resetPasswordApi).not.toHaveBeenCalled()

  expect(await resetPassword("token", "new-password", "new-password")).toEqual({
    error: undefined,
  })
  expect(resetPasswordApi).toHaveBeenLastCalledWith({
    token: "token",
    newPassword: "new-password",
  })

  resetPasswordApi.mockResolvedValueOnce({
    data: null,
    error: { message: "Invalid reset token" },
  })
  expect(
    await resetPassword("expired", "new-password", "new-password")
  ).toEqual({ error: "Invalid reset token" })
})

test("validates and submits authenticated password changes", async () => {
  expect(await changePassword("current", "new-password", "different")).toEqual({
    error: "Passwords do not match.",
  })
  expect(changePasswordApi).not.toHaveBeenCalled()

  expect(
    await changePassword("current", "new-password", "new-password")
  ).toEqual({ error: undefined })
  expect(changePasswordApi).toHaveBeenLastCalledWith({
    currentPassword: "current",
    newPassword: "new-password",
    revokeOtherSessions: true,
  })

  changePasswordApi.mockResolvedValueOnce({
    data: null,
    error: { message: "Current password is incorrect" },
  })
  expect(await changePassword("wrong", "new-password", "new-password")).toEqual(
    { error: "Current password is incorrect" }
  )
})
