// app/students/[id]/page.tsx
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Image from "next/image";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mood-toggles";

export const runtime = "nodejs";

interface PageProps {
  params: { id: string };
}

export default async function StudentPage({ params }: PageProps) {
  const awaitedParams = await params;
  const session = await getServerSession(authOptions);
  const id = awaitedParams.id;

  if (!session?.user?.id) {
    return notFound();
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }, include: { role: true },
  });

  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: true } },
    },
  });

  if (!student) return notFound();
  if (!user) return notFound();

  return (
    <SidebarProvider>
      <AppSidebar user={{
        name: user.fullName ?? "",
        email: user.email ?? "",
        avatar: user.profilePic ?? "",
      }}
        permission={user.role?.permission ?? 0}
      />
      <SidebarInset>
        {/* Header */}
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/students">Student Info</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{student.fullName} ({student.nickName})</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="mr-8"><ModeToggle /></div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-2 p-4 pt-0">
          {/* Student Card */}
          <Card className="w-full rounded-sm p-6 shadow-sm border mt-4">
            <CardHeader className="-mx-6">
              <CardTitle>
                Academic Information
              </CardTitle>
            </CardHeader>

            <div className="flex flex-col md:flex-row -ml-6">
              {/* Left Info Grid */}
              <CardContent className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p>{student.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registration No</p>
                    <p>{student.regNo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p>Software Engineering</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">School</p>
                    <p>{student.school || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Degree</p>
                    <p>Bachelor of Science (Engineering)</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Session</p>
                    <p>{student.session || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">College</p>
                    <p>{student.college || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{student.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p>{student.phoneNumber || "N/A"}</p>
                  </div>
                </div>
              </CardContent>

              {/* Right Image */}
              <div className="w-36 h-40 relative flex-shrink-0 overflow-hidden border border-gray-300">
                {student.profilePic ? (
                  <Image
                    src={student.profilePic}
                    alt={student.fullName ?? ""}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200 text-xl font-bold text-gray-600">
                    {student.fullName??""[0]}
                  </div>
                )}
              </div>
            </div>

            <hr></hr>

            {/* Bottom Section */}
            <div>
              <CardTitle className="mb-4">
                Personal Information
              </CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Bio</p>
                  <p>{student.bio || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Blood Group</p>
                  <p>{student.bloodGroup || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p>{student.gender || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Skills</p>
                  <p>
                    {student.skills?.length
                      ? student.skills.map((s: { skill: { name: any; }; }) => s.skill.name).join(", ")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                  <p>{student.linkedinId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">GitHub</p>
                  <p>{student.githubId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Codeforces</p>
                  <p>{student.codeforcesId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                  <p>{student.whatsapp || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Facebook</p>
                  <p>{student.facebook || "N/A"}</p>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
