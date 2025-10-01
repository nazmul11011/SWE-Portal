// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"

const protectedRoutes = [
  { url: "/students/add", minPermission: 5 },
  { url: "/students/sessions", minPermission: 5 },
  { url: "/students", minPermission: 5 },
  { url: "/courses", minPermission: 3 },
  { url: "/courses/gradeupdate", minPermission: 3 },
  { url: "/courses/marks-update", minPermission: 3 },
  { url: "/courses/cgpaupdate", minPermission: 3 },
  { url: "/info-update", minPermission: 2 },
]

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

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
    "/search",
    "/dashboard",
    "/results",
    "/account/:path*",
  ],
}