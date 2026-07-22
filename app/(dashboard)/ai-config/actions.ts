"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import {
  updateAiConfig,
  validateAiConfig,
  type AiConfigValues,
} from "@/lib/ai-config"

export type AiConfigActionState =
  | { status: "idle" }
  | {
      status: "error"
      message: string
      fieldErrors?: Partial<Record<keyof AiConfigValues, string>>
    }
  | { status: "success"; message: string }

export async function updateAiConfigAction(
  _previousState: AiConfigActionState,
  formData: FormData
): Promise<AiConfigActionState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { status: "error", message: "Sign in to update AI configuration." }
  }

  const result = validateAiConfig(Object.fromEntries(formData))
  if (!result.success) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
    }
  }

  try {
    await updateAiConfig(result.data)
    return { status: "success", message: "AI configuration saved." }
  } catch (error) {
    console.error(error)
    return {
      status: "error",
      message: "AI configuration could not be saved. Please try again.",
    }
  }
}
