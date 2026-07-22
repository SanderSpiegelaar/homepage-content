export const AI_CONFIG_KEYS = ["research-query"] as const
export type AiConfigKey = (typeof AI_CONFIG_KEYS)[number]

export type AiConfigValues = {
  key: AiConfigKey
  model: string
  instructions: string
  promptTemplate: string
}

export type AiConfigValidation =
  | { success: true; data: AiConfigValues }
  | {
      success: false
      message: string
      fieldErrors: Partial<Record<keyof AiConfigValues, string>>
    }

const limits = { model: 200, instructions: 20_000, promptTemplate: 20_000 }

export function validateAiConfig(input: Record<string, unknown>): AiConfigValidation {
  const fieldErrors: Partial<Record<keyof AiConfigValues, string>> = {}
  const key = typeof input.key === "string" ? input.key : ""
  const model = typeof input.model === "string" ? input.model.trim() : ""
  const instructions =
    typeof input.instructions === "string" ? input.instructions.trim() : ""
  const promptTemplate =
    typeof input.promptTemplate === "string" ? input.promptTemplate.trim() : ""

  if (!AI_CONFIG_KEYS.includes(key as AiConfigKey)) {
    fieldErrors.key = "Unknown AI configuration."
  }

  for (const [field, value] of Object.entries({
    model,
    instructions,
    promptTemplate,
  }) as [keyof typeof limits, string][]) {
    if (!value) fieldErrors[field] = "This field is required."
    else if (value.length > limits[field]) {
      fieldErrors[field] = `Must be ${limits[field].toLocaleString()} characters or fewer.`
    }
  }

  if (key === "research-query" && !promptTemplate.includes("{{keyword}}")) {
    fieldErrors.promptTemplate = "Include the {{keyword}} token."
  }

  if (Object.keys(fieldErrors).length) {
    return {
      success: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    }
  }

  return {
    success: true,
    data: { key: key as AiConfigKey, model, instructions, promptTemplate },
  }
}

export function requireAiConfig<T>(config: T | undefined, key: AiConfigKey): T {
  if (!config) throw new Error(`AI configuration not found: ${key}`)
  return config
}

export function renderResearchPrompt(template: string, keyword: string) {
  if (!template.includes("{{keyword}}")) {
    throw new Error("Research prompt template is missing {{keyword}}")
  }

  return template.replaceAll("{{keyword}}", JSON.stringify(keyword))
}
