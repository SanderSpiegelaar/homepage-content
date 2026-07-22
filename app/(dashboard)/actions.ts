"use server"

import { openrouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import Exa from "exa-js"
import { headers } from "next/headers"

import { getAiConfig, renderResearchPrompt } from "@/lib/ai-config"
import { auth } from "@/lib/auth"
import {
  generateConfiguredResearchQuery,
  startResearch,
  type ResearchActionState,
} from "@/lib/research"

const exa = new Exa()

export async function submitResearch(
  _previousState: ResearchActionState,
  formData: FormData
): Promise<ResearchActionState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { status: "error", message: "Sign in to start research." }
  }

  return startResearch(formData.get("keyword"), {
    generateQuery: (keyword) =>
      generateConfiguredResearchQuery(keyword, {
        loadConfig: () => getAiConfig("research-query"),
        renderPrompt: renderResearchPrompt,
        generate: async ({ model, instructions, prompt }) => {
          const { text } = await generateText({
            model: openrouter(model),
            instructions,
            prompt,
            maxOutputTokens: 300,
          })
          return text
        },
      }),
    createRun: (query) => exa.agent.runs.create({ query }),
  })
}
