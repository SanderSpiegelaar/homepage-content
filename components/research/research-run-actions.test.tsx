import { beforeEach, expect, mock, test } from "bun:test"
import type { ReactElement, ReactNode } from "react"

const React = await import("react")
const deleteResearch = mock(async () => {})
const startResearch = mock(async () => {})
const confirmDelete = mock(() => false)

function useTransition(): ReturnType<typeof React.useTransition> {
  return [false, (action) => void action()]
}

mock.module("react", () => ({ ...React, useTransition }))
mock.module("@/app/(dashboard)/actions", () => ({
  deleteResearch,
  startResearch,
}))

const { ResearchRunActions } = await import("./research-run-actions")

type ElementProps = {
  children?: ReactNode
  onClick?: () => void
  variant?: string
}

function elements(node: ReactNode): Array<ReactElement<ElementProps>> {
  if (!React.isValidElement<ElementProps>(node)) return []

  return [
    node,
    ...React.Children.toArray(node.props.children).flatMap(elements),
  ]
}

function text(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return `${node}`
  if (!React.isValidElement<ElementProps>(node)) return ""
  return React.Children.toArray(node.props.children).map(text).join("")
}

beforeEach(() => {
  deleteResearch.mockClear()
  startResearch.mockClear()
  confirmDelete.mockClear()
  globalThis.confirm = confirmDelete
})

test("labels a failed run action as retry", () => {
  expect(text(ResearchRunActions({ id: "run-1", status: "failed" }))).toContain(
    "Retry run"
  )
})

test("canceling deletion does not invoke the delete action", () => {
  const tree = ResearchRunActions({ id: "run-1", status: "failed" })
  const deleteItem = elements(tree).find(
    (element) => element.props.variant === "destructive"
  )
  if (!deleteItem) throw new Error("Delete action not found")

  deleteItem.props.onClick?.()

  expect(confirmDelete).toHaveBeenCalledTimes(1)
  expect(deleteResearch).not.toHaveBeenCalled()
})
