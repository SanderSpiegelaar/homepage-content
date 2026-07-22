"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const isSignUp = mode === "sign-up"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")

    const form = new FormData(event.currentTarget)
    const credentials = {
      email: String(form.get("email")),
      password: String(form.get("password")),
    }
    const result = isSignUp
      ? await authClient.signUp.email({
          ...credentials,
          name: String(form.get("name")),
        })
      : await authClient.signIn.email(credentials)

    if (result.error) {
      setError(result.error.message ?? "Authentication failed")
      setPending(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{isSignUp ? "Create an account" : "Welcome back"}</CardTitle>
        <CardDescription>
          {isSignUp
            ? "Enter your details to get started."
            : "Sign in to access the application."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={submit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" autoComplete="name" required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={pending}>
            {pending
              ? isSignUp
                ? "Creating account…"
                : "Signing in…"
              : isSignUp
                ? "Sign up"
                : "Sign in"}
          </Button>
        </CardContent>
      </form>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account?" : "Need an account?"}
        <Button
          render={<Link href={isSignUp ? "/sign-in" : "/sign-up"} />}
          variant="link"
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </Button>
      </CardFooter>
    </Card>
  )
}
