"use client"

import { useActionState } from "react"

import {
  updateAiConfigAction,
  type AiConfigActionState,
} from "@/app/(dashboard)/ai-config/actions"
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const initialState: AiConfigActionState = { status: "idle" }

type Config = {
  key: string
  label: string
  model: string
  instructions: string
  promptTemplate: string
}

export function AiConfigForm({ config }: { config: Config }) {
  const [state, formAction, pending] = useActionState(
    updateAiConfigAction,
    initialState
  )
  const errors = state.status === "error" ? state.fieldErrors : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.label}</CardTitle>
        <CardDescription>
          Runtime settings for <code>{config.key}</code>.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <input type="hidden" name="key" value={config.key} />
          <FieldGroup>
            <Field data-invalid={!!errors?.model} data-disabled={pending}>
              <FieldLabel htmlFor={`${config.key}-model`}>Model</FieldLabel>
              <Input
                id={`${config.key}-model`}
                name="model"
                defaultValue={config.model}
                maxLength={200}
                required
                disabled={pending}
                aria-invalid={!!errors?.model}
              />
              <FieldDescription>
                OpenRouter model identifier, including its provider.
              </FieldDescription>
              <FieldError>{errors?.model}</FieldError>
            </Field>

            <Field
              data-invalid={!!errors?.instructions}
              data-disabled={pending}
            >
              <FieldLabel htmlFor={`${config.key}-instructions`}>
                Instructions
              </FieldLabel>
              <Textarea
                id={`${config.key}-instructions`}
                name="instructions"
                defaultValue={config.instructions}
                maxLength={20_000}
                rows={6}
                required
                disabled={pending}
                aria-invalid={!!errors?.instructions}
              />
              <FieldError>{errors?.instructions}</FieldError>
            </Field>

            <Field
              data-invalid={!!errors?.promptTemplate}
              data-disabled={pending}
            >
              <FieldLabel htmlFor={`${config.key}-prompt-template`}>
                Prompt template
              </FieldLabel>
              <Textarea
                id={`${config.key}-prompt-template`}
                name="promptTemplate"
                defaultValue={config.promptTemplate}
                maxLength={20_000}
                rows={4}
                required
                disabled={pending}
                aria-invalid={!!errors?.promptTemplate}
              />
              <FieldDescription>
                Include <code>{"{{keyword}}"}</code> where the research keyword
                belongs.
              </FieldDescription>
              <FieldError>{errors?.promptTemplate}</FieldError>
            </Field>

            {state.status !== "idle" && (
              <Alert
                variant={state.status === "error" ? "destructive" : "default"}
                role="status"
              >
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save configuration"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
