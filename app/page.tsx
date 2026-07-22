import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { SignOutButton } from "@/components/sign-out-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/auth"

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect("/sign-in")

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome, {session.user.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="truncate text-sm text-muted-foreground">
            {session.user.email}
          </p>
          <SignOutButton />
        </CardContent>
      </Card>
    </main>
  )
}
