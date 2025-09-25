import { prisma } from "@/lib/db";
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
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ChangePasswordPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();
  const id = session.user.id;
  const student = await prisma.user.findUnique({
    where: { id },
    include: { role: true, skills: { include: { skill: true } } },
  });
  if (!student) return notFound();

  return (
    <SidebarProvider>
      <AppSidebar user={{
        name: student.fullName ?? "",
        email: student.email ?? "",
        avatar: student.profilePic ?? "",
      }}
        permission={student.role?.permission ?? 0}
      />
      <SidebarInset>
        {/* Header */}
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger/>
            <Separator orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/account">Account</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Change Password</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="mr-8"><ModeToggle /></div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-2 p-4 pt-0 items-center">
          {/* Student Card */}
          <Card className="w-full max-w-lg rounded-sm shadow-sm border mt-4">
            <CardHeader>
              <CardTitle>
                Change Password
              </CardTitle>
            </CardHeader>

            <CardContent>
                <ChangePasswordForm />
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}