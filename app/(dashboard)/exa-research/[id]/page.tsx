import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { auth } from "@/lib/auth/auth"
import {
  getResearchRun,
  type ExaResearchResult,
  type ExaResearchRun,
} from "@/lib/research/runs"
import type { ResearchWebsite } from "@/lib/research/schema"
import { reconcileResearchRuns } from "@/lib/research/status"

const dateTime = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
})

const statusVariant = {
  pending: "secondary",
  starting: "outline",
  started: "default",
  failed: "destructive",
  completed: "default",
} as const

function DateValue({ value }: { value: Date | null }) {
  return value ? (
    <time dateTime={value.toISOString()}>{dateTime.format(value)}</time>
  ) : (
    "—"
  )
}

export function ResearchResultsTable({
  data,
}: {
  data: ReadonlyArray<ResearchWebsite>
}) {
  return (
    <Table>
      <TableCaption>Websites returned by the research workflow.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Website</TableHead>
          <TableHead>Domain</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Position 1</TableHead>
          <TableHead>Positions 1–3</TableHead>
          <TableHead>Positions 1–10</TableHead>
          <TableHead>Topics</TableHead>
          <TableHead>Sections</TableHead>
          <TableHead>SEO value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((website, index) => (
          <TableRow key={`${website.domain}-${index}`}>
            <TableCell className="font-medium whitespace-normal">
              {website.websiteName}
            </TableCell>
            <TableCell>{website.domain}</TableCell>
            <TableCell>{website.websiteType}</TableCell>
            <TableCell>{website.pos_1.toLocaleString()}</TableCell>
            <TableCell>{website.pos_1_3.toLocaleString()}</TableCell>
            <TableCell>{website.pos_10.toLocaleString()}</TableCell>
            <TableCell className="min-w-56 whitespace-normal">
              {website.relevantTopics.join(", ")}
            </TableCell>
            <TableCell className="min-w-64 whitespace-normal">
              {website.relevantSections.join(", ")}
            </TableCell>
            <TableCell>{website.estimatedSeoResearchValue}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function RunField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all">{value}</dd>
    </div>
  )
}

function RunInformation({
  run,
  result,
}: {
  run: ExaResearchRun
  result: ExaResearchResult | null
}) {
  const fields: Array<{ label: string; value: ReactNode }> = [
    {
      label: "Status",
      value: <Badge variant={statusVariant[run.status]}>{run.status}</Badge>,
    },
    { label: "Run ID", value: run.id },
    { label: "Execution ID", value: run.executionId ?? "—" },
    { label: "Created", value: <DateValue value={run.createdAt} /> },
    { label: "Updated", value: <DateValue value={run.updatedAt} /> },
    { label: "Started", value: <DateValue value={run.startedAt} /> },
    {
      label: "Results received",
      value: <DateValue value={result?.receivedAt ?? null} />,
    },
  ]
  if (run.error) fields.push({ label: "Error", value: run.error })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run information</CardTitle>
        <CardDescription>
          Workflow identifiers, lifecycle state, and timestamps.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <RunField key={field.label} {...field} />
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

function ResearchResults({
  status,
  result,
}: {
  status: ExaResearchRun["status"]
  result: ExaResearchResult | null
}) {
  const failed = status === "failed"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Research results</CardTitle>
        <CardDescription>
          Website opportunities returned by n8n in workflow order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result ? (
          <ResearchResultsTable data={result.data} />
        ) : (
          <Empty className="min-h-48 border">
            <EmptyHeader>
              <EmptyTitle>
                {failed
                  ? "Research has not completed"
                  : "Waiting for research results"}
              </EmptyTitle>
              <EmptyDescription>
                {failed
                  ? "Retry this run from the Exa Research page."
                  : "Results will appear here after n8n sends the callback."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}

export default async function ExaResearchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const { id } = await params
  const record = await getResearchRun(session.user.id, id)
  if (!record) notFound()

  await reconcileResearchRuns(session.user.id, [record.run])
  const refreshedRecord = await getResearchRun(session.user.id, id)
  if (!refreshedRecord) notFound()

  const { run, result } = refreshedRecord

  return (
    <div className="flex w-full max-w-7xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-medium">{run.keyword}</h2>
        <p className="text-sm text-muted-foreground">
          Exa research run details and returned website data.
        </p>
      </div>
      <RunInformation run={run} result={result} />
      <ResearchResults status={run.status} result={result} />
    </div>
  )
}
