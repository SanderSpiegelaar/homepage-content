export type ResearchActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldError?: string }
  | { status: "success"; message: string }

type CreateDependencies = {
  create: (keyword: string) => Promise<void>
  logError?: (error: unknown) => void
}

type StartDependencies = {
  claim: (
    userId: string,
    id: string
  ) => Promise<{ id: string; keyword: string } | undefined>
  dispatch: (id: string, keyword: string) => Promise<string>
  complete: (userId: string, id: string, executionId: string) => Promise<void>
  fail: (userId: string, id: string) => Promise<void>
  logError?: (error: unknown) => void
}

export async function createResearchRequest(
  value: FormDataEntryValue | null,
  { create, logError = console.error }: CreateDependencies
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
    await create(keyword)
    return { status: "success", message: "Research run created." }
  } catch (error) {
    logError(error)
    return {
      status: "error",
      message: "Research run could not be created. Please try again.",
    }
  }
}

export async function startResearchRequest(
  userId: string,
  id: string,
  {
    claim,
    dispatch,
    complete,
    fail,
    logError = console.error,
  }: StartDependencies
): Promise<void> {
  const run = await claim(userId, id)
  if (!run) return

  let executionId: string
  try {
    executionId = await dispatch(run.id, run.keyword)
  } catch (error) {
    logError(error)
    await fail(userId, run.id)
    return
  }

  try {
    await complete(userId, run.id, executionId)
  } catch (error) {
    logError(error)
  }
}
