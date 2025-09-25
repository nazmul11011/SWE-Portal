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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function ResultsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return notFound();
    const id = session.user.id;

    // Fetch enrollments + ORPS marks
    const student = await prisma.user.findUnique({
        where: { id },
        include: {
            role: true,
            enrollments: { include: { course: true } },
            orpsMarks: { include: { course: true } },
            student: true,
        },
    });

    if (!student) return notFound();

    const studentInfo = {
        id: student.id,
        cgpa: student.student?.cgpa ?? "N/A",
        creditCompleted: student.student?.creditCompleted ?? "N/A",
    };
    // Merge enrollments + ORPS by courseId
    const merged = student.enrollments.map((e) => {
        const orps = student.orpsMarks.find(
            (m) => m.courseId === e.courseId
        );
        return {
            id: e.id,
            semester: e.course.semester,
            code: e.course.code,
            title: e.course.title,
            grade: e.grade || "N/A",
            attendance: orps?.attendance ?? "N/A",
            classCount: orps?.classCount ?? "N/A",
            termTest: orps?.termTest ?? "N/A",
            evaluation: orps?.evaluation ?? "N/A",
        };
    });
    const groupedBySemester: Record<string, typeof merged> = {};
    for (const row of merged) {
        if (!groupedBySemester[row.semester]) {
            groupedBySemester[row.semester] = [];
        }
        groupedBySemester[row.semester].push(row);
    }

    return (
        <SidebarProvider>
            <AppSidebar
                user={{
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
                        <SidebarTrigger />
                        <Separator orientation="vertical" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Results</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="mr-8"><ModeToggle /></div>
                </header>

                <main className="flex flex-col gap-4 p-4 pt-2">
                    <Card className="w-full rounded-sm shadow-sm">
                        <CardHeader>
                            <CardTitle>Final Result</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <strong>CGPA:</strong> {studentInfo.cgpa} &nbsp;
                            <strong>Credits:</strong> {studentInfo.creditCompleted}
                        </CardContent>
                    </Card>
                    {Object.entries(groupedBySemester).map(([semester, rows]) => (
                        <Card key={semester} className="w-full rounded-sm shadow-sm">
                            <CardHeader>
                                <CardTitle>Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {merged.length === 0 ? (
                                    <p>No result data available.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Course</TableHead>
                                                <TableHead>Attendance</TableHead>
                                                <TableHead>Term Test</TableHead>
                                                <TableHead>Evaluation</TableHead>
                                                <TableHead>Grade</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rows.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>{row.code}</TableCell>
                                                    <TableCell>{row.title}</TableCell>
                                                    <TableCell>{row.attendance} / {row.classCount}</TableCell>
                                                    <TableCell>{row.termTest}</TableCell>
                                                    <TableCell>{row.evaluation}</TableCell>
                                                    <TableCell>{row.grade}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
