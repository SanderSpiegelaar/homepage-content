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
        <h2 className="text-lg font-medium">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Your dashboard workspace is ready.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Dashboard features will appear here as they are added.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the navigation to move between workspace pages.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
