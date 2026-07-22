import { sendPasswordResetEmail } from "@/lib/email/password-reset"

export const emailAndPassword = {
  enabled: true,
  revokeSessionsOnPasswordReset: true,
  sendResetPassword: async ({
    user,
    url,
  }: {
    user: { email: string }
    url: string
  }) => {
    void sendPasswordResetEmail(user.email, url)
  },
}
