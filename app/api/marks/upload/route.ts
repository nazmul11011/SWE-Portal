import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, classCount, students } = body as {
      courseId: string;
      classCount: number;
      students: {
        regNo: string;
        attendance: string;
        termTest: string;
        evaluation: string;
        partA?: string;
        partB?: string;
      }[];
    };

    // Basic validation
    if (!courseId || !classCount || !students?.length) {
      return NextResponse.json(
        { error: "Missing required fields (courseId, classCount, students)" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const results: { regNo: string; status: string }[] = [];

    // Process each student's record
    for (const s of students) {
      const student = await prisma.user.findUnique({
        where: { regNo: s.regNo },
      });

      if (!student) {
        results.push({ regNo: s.regNo, status: "student_not_found" });
        continue;
      }

      // Convert marks safely
      const attendance = parseInt(s.attendance) || 0;
      const termTest = parseFloat(s.termTest) || 0;
      const evaluation = parseFloat(s.evaluation) || 0;
      const parta = parseFloat(s.partA ?? "") || 0;
      const partb = parseFloat(s.partB ?? "") || 0;

      // Upsert marks record
      await prisma.oRPS_Marks.upsert({
        where: {
          userId_courseId: {
            userId: student.id,
            courseId,
          },
        },
        update: {
          attendance,
          termTest,
          evaluation,
          parta,
          partb,
          classCount,
        },
        create: {
          userId: student.id,
          courseId,
          attendance,
          termTest,
          evaluation,
          parta,
          partb,
          classCount,
        },
      });

      results.push({ regNo: s.regNo, status: "success" });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Marks upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}