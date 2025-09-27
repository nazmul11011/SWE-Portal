import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

// NextAuth configuration
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        regNo: { label: "Registration No", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.regNo || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { regNo: credentials.regNo },
          include: { role: true },
        });

        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        // Return only the necessary user info
        return {
          id: user.id,
          name: user.fullName,
          regNo: user.regNo,
          role: user.role?.name || "student",
          permission: user.role?.permission || 0,
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