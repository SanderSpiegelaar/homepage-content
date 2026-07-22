import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { ChangePasswordForm } from "@/components/auth/password-forms"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { auth } from "@/lib/auth/auth"

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect("/sign-in")

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-medium">Account</h2>
        <p className="text-sm text-muted-foreground">
          View your account and manage your password.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account identity.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-4">
            <div>
              <dt className="text-xs text-muted-foreground">Name</dt>
              <dd>{session.user.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd>{session.user.email}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      <ChangePasswordForm />
    </div>
  )
}
