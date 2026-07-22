"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { dispatchResearchRequest } from "@/lib/n8n"
import { createResearchRequest, type ResearchActionState } from "@/lib/research"

export async function submitResearch(
  _previousState: ResearchActionState,
  formData: FormData
): Promise<ResearchActionState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { status: "error", message: "Sign in to submit research." }
  }

  return createResearchRequest(formData.get("keyword"), {
    dispatch: dispatchResearchRequest,
  })
}
