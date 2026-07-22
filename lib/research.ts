export type ResearchActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldError?: string }
  | { status: "success"; message: string }

type ResearchDependencies = {
  dispatch: (keyword: string) => Promise<void>
  logError?: (error: unknown) => void
}

export async function createResearchRequest(
  value: FormDataEntryValue | null,
  { dispatch, logError = console.error }: ResearchDependencies
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
    await dispatch(keyword)
    return { status: "success", message: "Research request submitted." }
  } catch (error) {
    logError(error)
    return {
      status: "error",
      message: "Research could not be submitted. Please try again.",
    }
  }
}
