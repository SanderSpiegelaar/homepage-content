"use client"

import { DotsThreeIcon, PlayIcon, TrashIcon } from "@phosphor-icons/react"
import { useTransition } from "react"

import { deleteResearch, startResearch } from "@/app/(dashboard)/actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
type Props = {
  id: string
  status: "pending" | "starting" | "started" | "failed" | "completed"
}

const startableStatuses = new Set<Props["status"]>(["pending", "failed"])

export function ResearchRunActions({ id, status }: Props) {
  const [pending, startTransition] = useTransition()
  const canStart = startableStatuses.has(status)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={
              pending ? "Updating research run" : "Research run actions"
            }
            disabled={pending}
          />
        }
      >
        <DotsThreeIcon weight="bold" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={[!canStart, pending].includes(true)}
            onClick={() => startTransition(() => startResearch(id))}
          >
            <PlayIcon />
            {pending
              ? "Starting…"
              : status === "failed"
                ? "Retry run"
                : "Start run"}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={pending}
            onClick={() => {
              if (
                globalThis.confirm(
                  "Delete this research run permanently? This does not cancel n8n work."
                )
              )
                startTransition(() => deleteResearch(id))
            }}
          >
            <TrashIcon />
            Delete run
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
