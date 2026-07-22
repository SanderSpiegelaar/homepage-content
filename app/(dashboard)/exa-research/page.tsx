import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { ResearchForm } from "@/components/research-form"
import { ResearchRunActions } from "@/components/research-run-actions"
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
  EmptyMedia,
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
import { auth } from "@/lib/auth"
import { listResearchRuns } from "@/lib/research-runs"

const dateTime = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
})

const statusVariant = {
  pending: "secondary",
  starting: "outline",
  started: "default",
  failed: "destructive",
} as const

export default async function ExaResearchPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const runs = await listResearchRuns(session.user.id)

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-medium">Exa Research</h2>
        <p className="text-sm text-muted-foreground">
          Create research runs and start them when you are ready.
        </p>
      </div>

      <ResearchForm />

      <Card>
        <CardHeader>
          <CardTitle>Research runs</CardTitle>
          <CardDescription>
            Previous runs are listed newest first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <Empty className="min-h-48 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClockCounterClockwiseIcon />
                </EmptyMedia>
                <EmptyTitle>No research runs yet</EmptyTitle>
                <EmptyDescription>
                  Create a run above to add it to this history.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableCaption>Your Exa research runs.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Execution ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.keyword}</TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant={statusVariant[run.status]}>
                          {run.status}
                        </Badge>
                        {run.error && (
                          <span className="text-muted-foreground">
                            {run.error}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{run.executionId ?? "—"}</TableCell>
                    <TableCell>
                      <time dateTime={run.createdAt.toISOString()}>
                        {dateTime.format(run.createdAt)}
                      </time>
                    </TableCell>
                    <TableCell className="text-right">
                      <ResearchRunActions id={run.id} status={run.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
