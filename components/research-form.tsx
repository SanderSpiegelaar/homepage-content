"use client"

import { useActionState } from "react"

import { submitResearch } from "@/app/(dashboard)/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { ResearchActionState } from "@/lib/research"

const initialState: ResearchActionState = { status: "idle" }

export function ResearchForm() {
  const [state, formAction, pending] = useActionState(
    submitResearch,
    initialState
  )
  const fieldError = state.status === "error" ? state.fieldError : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create research run</CardTitle>
        <CardDescription>
          Save a topic now, then start it from the runs table.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!fieldError} data-disabled={pending}>
              <FieldLabel htmlFor="keyword">Research keyword</FieldLabel>
              <Input
                id="keyword"
                name="keyword"
                placeholder="e.g. edge AI adoption"
                required
                maxLength={100}
                disabled={pending}
                aria-invalid={!!fieldError}
                aria-describedby={fieldError ? "keyword-error" : undefined}
              />
              <FieldDescription>
                Use a topic up to 100 characters.
              </FieldDescription>
              <FieldError id="keyword-error">{fieldError}</FieldError>
            </Field>

            <Button type="submit" disabled={pending}>
              {pending ? "Creating run…" : "Create run"}
            </Button>

            {state.status === "error" && !fieldError && (
              <Alert variant="destructive">
                <AlertTitle>Unable to create run</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            {state.status === "success" && (
              <Alert role="status">
                <AlertTitle>Research run created</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
