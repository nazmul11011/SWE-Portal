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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

    const usersWithSessions = await prisma.user.findMany({
        where: {
            sessionLogs: {
                some: {}, // only users with at least one session
            },
        },
        include: {
            sessionLogs: { orderBy: { createdAt: "desc" } }, // all login sessions
            role: true,
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
                <main className="flex flex-1 flex-col p-4 pt-0">
                    <Card className="w-full rounded-sm border mt-4">
                        <CardHeader>
                            <CardTitle>Users Login History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {usersWithSessions.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">No login history found</div>
                            ) : (
                                usersWithSessions.map((user) => (
                                    <Collapsible key={user.id} className="mb-3 border rounded">
                                        <CollapsibleTrigger
                                            className="flex w-full justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer font-semibold">
                                            <span>
                                                {user.fullName} ({user.regNo})
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {user.sessionLogs.length} sessions
                                            </span>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            <div className="overflow-x-auto">
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
                                                        {user.sessionLogs.map((log, index) => (
                                                            <TableRow key={log.id}>
                                                                <TableCell>{index + 1}</TableCell>
                                                                <TableCell>{log.ip ?? "-"}</TableCell>
                                                                <TableCell>{log.device ?? "-"}</TableCell>
                                                                <TableCell>{log.os ?? "-"}</TableCell>
                                                                <TableCell>{log.browser ?? "-"}</TableCell>
                                                                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}