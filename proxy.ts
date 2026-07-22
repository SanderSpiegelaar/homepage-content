import { NextResponse, type NextRequest } from "next/server"

import { auth } from "@/lib/auth/auth"

const authPages = new Set(["/sign-in", "/sign-up"])

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path.startsWith("/api/auth/")) return NextResponse.next()

  const session = await auth.api.getSession({ headers: request.headers })

  if (!session && !authPages.has(path)) {
    if (path.startsWith("/api/")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (session && authPages.has(path)) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
