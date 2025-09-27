// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const protectedRoutes = [
  { url: "/students/add", minPermission: 5 },
  { url: "/students", minPermission: 5 },
  { url: "/courses", minPermission: 3 },
  { url: "/courses/gradeupdate", minPermission: 3 },
  { url: "/courses/marks-update", minPermission: 3 },
  { url: "/courses/cgpaupdate", minPermission: 3 },
  { url: "/info-update", minPermission: 2 },
  { url: "/account", minPermission: 1 },
  { url: "/account/change-password", minPermission: 1 },
]

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })

  // Convert role to a number safely (default = 0 if not set)
  const userPermission = token?.permission ?? 0

  const pathname = req.nextUrl.pathname

  const matched = protectedRoutes.find((r) => pathname.startsWith(r.url))

  if (matched && userPermission < matched.minPermission) {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/students/:path*",
    "/courses/:path*",
    "/info-update",
    "/account/:path*",
  ],
}