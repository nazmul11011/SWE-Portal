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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ModeToggle } from "@/components/mood-toggles";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return notFound();
    const id = session.user.id;
    const student = await prisma.user.findUnique({
        where: { id },
        include: {
            role: true,
            skills: { include: { skill: true } },
            sessionLogs: { orderBy: { createdAt: "desc" }, take: 10 }, // last 10 logins
        },
    });
    if (!student) return notFound();

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
                        <SidebarTrigger />
                        <Separator orientation="vertical" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">Account</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Session</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="mr-8"><ModeToggle /></div>
                </header>

                {/* Main Content */}
                <main className="flex flex-1 flex-col gap-2 p-4 pt-0">
                    {/* Student Card */}
                    <Card className="w-full rounded-sm shadow-sm border mt-4">
                        <CardHeader>
                            <CardTitle>
                                Login History
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            {student.sessionLogs.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">No login history found</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>IP</TableHead>
                                            <TableHead>Device</TableHead>
                                            <TableHead>OS</TableHead>
                                            <TableHead>Browser</TableHead>
                                            <TableHead>Time</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {student.sessionLogs.map((log, index) => (
                                            <TableRow key={log.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{log.ip ?? "-"}</TableCell>
                                                <TableCell>{log.device ?? "-"}</TableCell>
                                                <TableCell>{log.os ?? "-"}</TableCell>
                                                <TableCell>{log.browser ?? "-"}</TableCell>
                                                <TableCell>
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}