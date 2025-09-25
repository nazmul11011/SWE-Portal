// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Get JWT token from NextAuth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If token does not exist, redirect to sign-in page
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // Session exists, allow access
  return NextResponse.next();
}

// Paths where middleware should run
export const config = {
  matcher: ["/students/:path*", "/admin/:path*", "/super-admin/:path*"],
};