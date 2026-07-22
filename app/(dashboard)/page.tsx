import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Page() {
  return (
    <div className="flex w-full max-w-5xl flex-col gap-4">
      <div>
        <h2 className="text-lg font-medium">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Manage homepage content workflows.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Exa Research</CardTitle>
          <CardDescription>
            Create research runs, review their history, and start them when
            ready.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/exa-research" />}>
            Open Exa Research
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
