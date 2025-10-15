import NextAuth, { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { compare } from "bcryptjs";
import { UAParser } from "ua-parser-js";
/* eslint-disable @typescript-eslint/no-explicit-any */
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: { fetch },
  }
);

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        regNo: { label: "Registration No", type: "number" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.regNo || !credentials.password) return null;

        const { data: user, error } = await supabase
          .from("User")
          .select("id, fullName, regNo, password, Role(name, permission)")
          .eq("regNo", credentials.regNo)
          .maybeSingle();

        if (error || !user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        const now = new Date().toISOString();
        const ua = (req?.headers as Record<string, string>)?.["user-agent"] ?? "";
        const forwardedFor = (req?.headers as Record<string, string>)?.["x-forwarded-for"];
        const ip =
          forwardedFor?.split(",")[0]?.trim() ||
          (req?.headers as Record<string, string>)?.["x-real-ip"] ||
          "unknown";

        const parser = new UAParser(ua);
        const device = parser.getResult();

        await Promise.all([
          supabase.from("User").update({ lastLogIn: now }).eq("id", user.id),
          supabase.from("SessionLog").insert({
            userId: user.id,
            ip,
            device: device.device.model || device.device.type || "Unknown",
            os: device.os.name || "Unknown",
            browser: device.browser.name || "Unknown",
          }),
        ]);

        const role = Array.isArray(user.Role) ? user.Role[0] : user.Role;
        return {
          id: user.id,
          name: user.fullName,
          regNo: user.regNo,
          role: role.name,
          permission: role?.permission ?? 0,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
    updateAge: 45 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) Object.assign(token, user);
      return token;
    },
    async session({ session, token }) {
      session.user = token as any;
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
