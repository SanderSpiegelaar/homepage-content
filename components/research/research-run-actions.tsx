"use client"

import { DotsThreeIcon, PlayIcon } from "@phosphor-icons/react"
import { useTransition } from "react"

import { startResearch } from "@/app/(dashboard)/actions"
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
  status: "pending" | "starting" | "started" | "failed"
}

export function ResearchRunActions({ id, status }: Props) {
  const [pending, startTransition] = useTransition()
  const canStart = status === "pending" || status === "failed"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={
              pending ? "Starting research run" : "Research run actions"
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
            disabled={!canStart || pending}
            onClick={() => startTransition(() => startResearch(id))}
          >
            <PlayIcon />
            {pending ? "Starting…" : "Start run"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
