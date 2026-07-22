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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth/client"

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
        <CardContent>
          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {isSignUp && (
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" name="name" autoComplete="name" required />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                minLength={8}
                required
              />
            </Field>
            <Button className="w-full" type="submit" disabled={pending}>
              {pending
                ? isSignUp
                  ? "Creating account…"
                  : "Signing in…"
                : isSignUp
                  ? "Sign up"
                  : "Sign in"}
            </Button>
          </FieldGroup>
        </CardContent>
      </form>
      <CardFooter className="flex-col justify-center gap-1 text-sm text-muted-foreground">
        {!isSignUp && (
          <Button render={<Link href="/forgot-password" />} variant="link">
            Forgot password?
          </Button>
        )}
        <p>
          {isSignUp ? "Already have an account?" : "Need an account?"}
          <Button
            render={<Link href={isSignUp ? "/sign-in" : "/sign-up"} />}
            variant="link"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </Button>
        </p>
      </CardFooter>
    </Card>
  )
}
