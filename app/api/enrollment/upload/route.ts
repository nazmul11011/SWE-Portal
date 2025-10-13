import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, students } = body as {
      courseId: string;
      students: { regNo: string; grade: string }[];
    };

    if (!courseId || !students?.length) {
      return NextResponse.json(
        { error: "Missing courseId or students data" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const results: { regNo: string; status: string }[] = [];

    for (const s of students) {
      const student = await prisma.user.findUnique({
        where: { regNo: s.regNo },
      });

      if (!student) {
        results.push({ regNo: s.regNo, status: "student_not_found" });
        continue;
      }

      await prisma.enrollment.upsert({
        where: {
          userId_courseId: { userId: student.id, courseId },
        },
        update: { grade: s.grade },
        create: {
          userId: student.id,
          courseId,
          grade: s.grade,
        },
      });

      results.push({ regNo: s.regNo, status: "success" });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Enrollment upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}