"use server";

import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

export async function uploadCgpaAction(
  data: { regNo: string; creditCompleted: string; cgpa: string }[]
) {
  try {
    for (const record of data) {
      const user = await prisma.user.findUnique({
        where: { regNo: record.regNo },
      });

      if (!user) continue;

      // Update Student row
      await prisma.student.upsert({
        where: { userId: user.id },
        update: {
          creditCompleted: parseInt(record.creditCompleted, 10),
          cgpa: parseFloat(record.cgpa),
        },
        create: {
          id: randomUUID(),
          userId: user.id,
          creditCompleted: parseInt(record.creditCompleted, 10),
          cgpa: parseFloat(record.cgpa),
        },
      });
    }

    return { success: true, message: "CGPA uploaded." };
  } catch (error) {
    console.error("CGPA upload error:", error);
    return { success: false, message: "Internal server error." };
  }
}