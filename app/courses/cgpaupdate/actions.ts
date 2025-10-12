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

export async function updateStudentPositionsAction(session: string) {
  if (!session) {
    return { success: false, message: "Session is required." };
  }

  try {
    // Fetch all students in the given session with CGPA + creditCompleted + regNo
    const students = await prisma.student.findMany({
      where: { user: { session: session } },
      include: { user: { select: { regNo: true }}},
      orderBy: [{ cgpa: "desc" }, { creditCompleted: "desc" }],
    });

    if (students.length === 0) {
      return {
        success: false,
        message: `No students found for session ${session}`,
      };
    }

    // Assign positions (handle ties)
    let position = 0;
    let lastCgpa: number | null = null;
    let sameRankCount = 0;

    for (let i = 0; i < students.length; i++) {
      const s = students[i];

      if (s.cgpa === lastCgpa) {
        sameRankCount += 1;
      } else {
        position = i + 1;
        sameRankCount = 1;
      }
      lastCgpa = s.cgpa;

      await prisma.student.update({
        where: { id: s.id },
        data: { position },
      });
    }

    return {
      success: true,
      message: `Positions updated successfully for ${session}`,
    };
  } catch (error) {
    console.error("Error updating positions:", error);
    return { success: false, message: "Error updating positions" };
  }
}
