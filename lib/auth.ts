import "server-only"

import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"

import { db } from "@/lib/db"
import * as schema from "@/lib/auth-schema"
import { sendPasswordResetEmail } from "@/lib/password-reset-email"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail(user.email, url)
    },
  },
  plugins: [nextCookies()],
})
