import "server-only"

import { eq } from "drizzle-orm"

import { aiConfig } from "@/lib/auth-schema"
import {
  requireAiConfig,
  type AiConfigKey,
  type AiConfigValues,
} from "@/lib/ai-config-values"
import { db } from "@/lib/db"

export * from "@/lib/ai-config-values"

export async function getAiConfig(key: AiConfigKey) {
  const [config] = await db
    .select()
    .from(aiConfig)
    .where(eq(aiConfig.key, key))
    .limit(1)

  return requireAiConfig(config, key)
}

export function getAiConfigs() {
  return db.select().from(aiConfig).orderBy(aiConfig.label)
}

export async function updateAiConfig(values: AiConfigValues) {
  const [config] = await db
    .update(aiConfig)
    .set({
      model: values.model,
      instructions: values.instructions,
      promptTemplate: values.promptTemplate,
    })
    .where(eq(aiConfig.key, values.key))
    .returning()

  return requireAiConfig(config, values.key)
}
