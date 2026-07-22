import { ResearchForm } from "@/components/research-form"

export default function Page() {
  return (
    <div className="flex w-full max-w-5xl flex-col gap-4">
      <div>
        <h2 className="text-lg font-medium">Research</h2>
        <p className="text-sm text-muted-foreground">
          Start a new AI-assisted research run.
        </p>
      </div>
      <ResearchForm />
    </div>
  )
}
