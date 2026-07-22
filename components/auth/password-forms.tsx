"use client"

import Link from "next/link"
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

export function requestPasswordReset(email: string, origin: string) {
  return authClient.requestPasswordReset({
    email,
    redirectTo: `${origin}/reset-password`,
  })
}

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmation: string
) {
  if (newPassword !== confirmation) {
    return { error: "Passwords do not match." }
  }

  try {
    const result = await authClient.resetPassword({ token, newPassword })
    return { error: result.error?.message }
  } catch {
    return { error: "Unable to reset your password. Please try again." }
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmation: string
) {
  if (newPassword !== confirmation) {
    return { error: "Passwords do not match." }
  }

  try {
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    })
    return { error: result.error?.message }
  } catch {
    return { error: "Unable to change your password. Please try again." }
  }
}

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)

    const email = String(new FormData(event.currentTarget).get("email"))

    await requestPasswordReset(email, window.location.origin).catch(
      () => undefined
    )
    setSent(true)
    setPending(false)
  }

  if (sent) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account exists for that address, a password reset link is on
            its way.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" render={<Link href="/sign-in" />}>
            Back to sign in
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email address to request a reset link.
        </CardDescription>
      </CardHeader>
      <form onSubmit={submit}>
        <CardContent>
          <FieldGroup>
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
            <Button className="w-full" type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send reset link"}
            </Button>
          </FieldGroup>
        </CardContent>
      </form>
      <CardFooter className="justify-center">
        <Button render={<Link href="/sign-in" />} variant="link">
          Back to sign in
        </Button>
      </CardFooter>
    </Card>
  )
}

export function ResetPasswordForm({
  token,
  invalid,
}: {
  token?: string
  invalid: boolean
}) {
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [complete, setComplete] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return

    setError("")
    setPending(true)

    const form = new FormData(event.currentTarget)
    const result = await resetPassword(
      token,
      String(form.get("password")),
      String(form.get("confirmation"))
    )

    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }

    setComplete(true)
  }

  if (invalid || !token) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset link unavailable</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" render={<Link href="/forgot-password" />}>
            Request a new link
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (complete) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Password reset</CardTitle>
          <CardDescription>
            Your password has been updated. Sign in with your new password.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" render={<Link href="/sign-in" />}>
            Sign in
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>Enter and confirm your new password.</CardDescription>
      </CardHeader>
      <form onSubmit={submit}>
        <CardContent>
          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="password">New password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            <Field data-invalid={error === "Passwords do not match."}>
              <FieldLabel htmlFor="confirmation">
                Confirm new password
              </FieldLabel>
              <Input
                id="confirmation"
                name="confirmation"
                type="password"
                autoComplete="new-password"
                minLength={8}
                aria-invalid={error === "Passwords do not match."}
                required
              />
            </Field>
            <Button className="w-full" type="submit" disabled={pending}>
              {pending ? "Resetting…" : "Reset password"}
            </Button>
          </FieldGroup>
        </CardContent>
      </form>
      <CardFooter className="justify-center">
        <Button render={<Link href="/forgot-password" />} variant="link">
          Request a new link
        </Button>
      </CardFooter>
    </Card>
  )
}

export function ChangePasswordForm() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")
    setPending(true)

    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const result = await changePassword(
      String(form.get("currentPassword")),
      String(form.get("newPassword")),
      String(form.get("confirmation"))
    )

    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }

    formElement.reset()
    setSuccess("Password changed. Other sessions have been signed out.")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Enter your current password and choose a new one.
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
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="currentPassword">
                Current password
              </FieldLabel>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="newPassword">New password</FieldLabel>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            <Field data-invalid={error === "Passwords do not match."}>
              <FieldLabel htmlFor="changePasswordConfirmation">
                Confirm new password
              </FieldLabel>
              <Input
                id="changePasswordConfirmation"
                name="confirmation"
                type="password"
                autoComplete="new-password"
                minLength={8}
                aria-invalid={error === "Passwords do not match."}
                required
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Changing…" : "Change password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
