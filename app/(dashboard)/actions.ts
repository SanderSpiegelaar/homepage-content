"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { dispatchResearchRequest } from "@/lib/n8n"
import {
  claimResearchRun,
  completeResearchRun,
  createResearchRun,
  failResearchRun,
} from "@/lib/research-runs"
import {
  createResearchRequest,
  startResearchRequest,
  type ResearchActionState,
} from "@/lib/research"

export async function submitResearch(
  _previousState: ResearchActionState,
  formData: FormData
): Promise<ResearchActionState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { status: "error", message: "Sign in to create a research run." }
  }

  const result = await createResearchRequest(formData.get("keyword"), {
    create: (keyword) => createResearchRun(session.user.id, keyword),
  })

  if (result.status === "success") revalidatePath("/exa-research")
  return result
}

export async function startResearch(id: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return

  await startResearchRequest(session.user.id, id, {
    claim: claimResearchRun,
    dispatch: dispatchResearchRequest,
    complete: completeResearchRun,
    fail: failResearchRun,
  })
  revalidatePath("/exa-research")
}
