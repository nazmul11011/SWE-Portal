"use server";

import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mood-toggles";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DashboardContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  const { data: student } = await supabase
    .from("User")
    .select(`
      id,
      fullName,
      nickName,
      school,
      session,
      college,
      phoneNumber,
      bio,
      bloodGroup,
      gender,
      linkedinId,
      githubId,
      codeforcesId,
      whatsapp,
      facebook,
      email,
      regNo,
      profilePic,
      Role(name, permission),
      UserSkill(id, Skill(name))
    `)
    .eq("id", session.user.id)
    .maybeSingle();

  if (!student) return notFound();

  const role = Array.isArray(student.Role) ? student.Role[0] : student.Role;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const skills = student.UserSkill?.map((s: any) => s.Skill?.name) || [];

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: student.fullName,
          email: student.email,
          avatar: student.profilePic ?? "",
        }}
        permission={role.permission}
      />
      <SidebarInset>
        {/* Header */}
        <header className="flex justify-between h-16 items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Home</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="mr-8"><ModeToggle /></div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-2 p-4 pt-0">
          <Card className="w-full rounded-sm p-6 shadow-sm border mt-4">
            <CardHeader className="-mx-6">
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <div className="flex flex-col md:flex-row -ml-6">
              <div className="w-36 h-40 relative flex-shrink-0 overflow-hidden border border-gray-300 mx-auto mb-4 md:mb-0 md:mx-0 md:ml-6 order-first md:order-last">
                {student.profilePic ? (
                  <Image
                    src={student.profilePic}
                    alt={student.fullName ?? ""}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200 text-xl font-bold text-gray-600">
                    {student.fullName?.[0] ?? ""}
                  </div>
                )}
              </div>

              <CardContent className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p>{student.fullName} ({student.nickName})</p>
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
            </div>

            <hr />

            <div>
              <CardTitle className="mb-4">Personal Information</CardTitle>
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
                  <p>{skills.length ? skills.join(", ") : "N/A"}</p>
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
