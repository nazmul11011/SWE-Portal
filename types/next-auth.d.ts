import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      regNo: string
      role: string
      permission: number
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    regNo: string
    role: string
    permission: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    regNo: string
    role: string
    permission: number
  }
}