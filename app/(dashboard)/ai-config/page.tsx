import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { AiConfigForm } from "@/components/ai-config-form"
import { getAiConfigs } from "@/lib/ai-config"
import { auth } from "@/lib/auth"

export default async function AiConfigPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const configs = await getAiConfigs()

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-medium">AI Config</h2>
        <p className="text-sm text-muted-foreground">
          Manage the models and prompts used by AI workflows.
        </p>
      </div>
      {configs.map((config) => (
        <AiConfigForm key={config.key} config={config} />
      ))}
    </div>
  )
}
