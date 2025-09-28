import StudentTable from "@/components/tables/StudentTable";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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

function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function StudentsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return notFound();
    }
    const id = session.user.id;
    const student = await prisma.user.findUnique({
        where: { id },
        include: { role: true },
    });
    if (!student) return notFound();

    const users = await prisma.user.findMany({
        select: {
            id: true,
            regNo: true,
            fullName: true,
            email: true,
            session: true,
            profilePic: true,
            lastLogIn: true,
            role: { select: { name: true } },
        },
        orderBy: { regNo: "asc" },
    });

    return (
        <SidebarProvider>
            <AppSidebar user={{
                name: student.fullName ?? "",
                email: student.email,
                avatar: student.profilePic ?? "",
            }}
                permission={student.role.permission}
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
                                    <BreadcrumbLink href="#">Users</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Lists</BreadcrumbPage>
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
                                Students List
                            </CardTitle>
                        </CardHeader>

                        <StudentTable
                            rows={users.map((u) => ({
                                id: u.id,
                                regNo: u.regNo,
                                fullName: u.fullName ?? "",
                                email: u.email,
                                session: u.session ?? "-",
                                lastLogIn: formatDate(u.lastLogIn),
                                avatarUrl: u.profilePic ?? undefined,
                                role: u.role.name,
                            }))}
                        />
                    </Card>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
