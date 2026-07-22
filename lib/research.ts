export type ResearchActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldError?: string }
  | {
      status: "success"
      query: string
      runId: string
      runStatus: string
    }

type ResearchQueryConfig = {
  model: string
  instructions: string
  promptTemplate: string
}

type ConfiguredQueryDependencies = {
  loadConfig: () => Promise<ResearchQueryConfig>
  renderPrompt: (template: string, keyword: string) => string
  generate: (options: {
    model: string
    instructions: string
    prompt: string
  }) => Promise<string>
}

export async function generateConfiguredResearchQuery(
  keyword: string,
  { loadConfig, renderPrompt, generate }: ConfiguredQueryDependencies
) {
  const config = await loadConfig()
  return generate({
    model: config.model,
    instructions: config.instructions,
    prompt: renderPrompt(config.promptTemplate, keyword),
  })
}

type ResearchDependencies = {
  generateQuery: (keyword: string) => Promise<string>
  createRun: (query: string) => Promise<{ id: string; status: string }>
  logError?: (error: unknown) => void
}

export async function startResearch(
  value: FormDataEntryValue | null,
  { generateQuery, createRun, logError = console.error }: ResearchDependencies
): Promise<ResearchActionState> {
  const keyword = typeof value === "string" ? value.trim() : ""

  if (!keyword || keyword.length > 100) {
    return {
      status: "error",
      message: "Check the keyword and try again.",
      fieldError: "Enter a keyword between 1 and 100 characters.",
    }
  }

  try {
    const query = (await generateQuery(keyword)).trim()
    if (!query) throw new Error("The model returned an empty research query")

    const run = await createRun(query)
    return {
      status: "success",
      query,
      runId: run.id,
      runStatus: run.status,
    }
  } catch (error) {
    logError(error)
    return {
      status: "error",
      message: "Research could not be started. Please try again.",
    }
  }
}
