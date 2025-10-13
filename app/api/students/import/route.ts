import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const users = (body?.users ?? []) as Array<{
      regNo: string;
      email: string;
      session: string;
      fullName?: string;
      gender?: string;
      phoneNumber?: string;
    }>;

    if (!Array.isArray(users) || users.length === 0) {
      return new Response(JSON.stringify({ error: "No users provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let created = 0;
    let skipped = 0;
    const errors: Array<{ regNo?: string; error: string }> = [];

    for (const u of users) {
      try {
        if (!u.regNo) {
          skipped++;
          continue;
        }

        const existing = await prisma.user.findUnique({ where: { regNo: u.regNo } });
        if (existing) {
          skipped++;
          continue;
        }

        const roleId = '0a0474e9-95ad-4259-9043-7b473666f197';
        const fullName = (u.fullName?.trim() || u.email?.split("@")[0]?.replace(/\./g, " ") || u.regNo);
        await prisma.user.create({
          data: {
            regNo: u.regNo,
            fullName,
            nickName: fullName,
            gender: (u.gender || "Male"),
            email: u.email,
            phoneNumber: u.phoneNumber,
            session: u.session,
            roleId,
            password: "$setpassword",
          },
        });
        created++;
      } 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) {
        errors.push({ regNo: u.regNo, error: e?.message || "unknown error" });
      }
    }

    return new Response(
      JSON.stringify({ created, skipped, errors }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Invalid payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
