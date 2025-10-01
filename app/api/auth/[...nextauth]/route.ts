import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import { UAParser } from "ua-parser-js";
import { randomUUID } from "crypto";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        regNo: { label: "Registration No", type: "number" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.regNo || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { regNo: credentials.regNo },
          include: { role: true },
        });

        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogIn: new Date() },
        });

        // Parse headers from req
        const ua = req?.headers?.["user-agent"] ?? "";
        const forwarded = req?.headers?.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(",")[0] : "unknown";

        const parser = new UAParser(ua);
        const result = parser.getResult();

        // Store login log
        await prisma.sessionLog.create({
          data: {
            id: randomUUID(),
            userId: user.id,
            ip: Array.isArray(ip) ? ip[0] : ip,
            device: result.device.model || result.device.type || "Unknown",
            os: result.os.name || "Unknown",
            browser: result.browser.name || "Unknown",
          },
        });

        return {
          id: user.id,
          name: user.fullName,
          regNo: user.regNo,
          role: user.role.name,
          permission: user.role.permission,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 1 * 60 * 60,
    updateAge: 45 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.regNo = user.regNo;
        token.role = user.role;
        token.permission = user.permission;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.regNo = token.regNo as string;
        session.user.role = token.role as string;
        session.user.permission = token.permission as number;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
