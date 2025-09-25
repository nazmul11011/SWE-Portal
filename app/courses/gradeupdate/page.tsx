import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import EnrollmentClient from "@/components/courses/GradeUpload"

export default async function EnrollmentPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true },
  });
  if (!user) return null;

  const courses = await prisma.course.findMany({
    orderBy: { code: "asc" },
  });

  return <EnrollmentClient courses={courses} user={user} />;
}