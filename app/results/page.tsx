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
import Marquee from "react-fast-marquee";

export default async function ResultsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return notFound();
    const id = session.user.id;

    const student = await prisma.user.findUnique({
        where: { id },
        include: {
            role: true,
            student: true,
            enrollments: { include: { course: true } },
            orpsMarks: { include: { course: true } },
        },
    });

    if (!student) return notFound();

    const studentInfo = {
        id: student.id,
        cgpa: student.student?.cgpa ?? "N/A",
        creditCompleted: student.student?.creditCompleted ?? "N/A",
        position: student.student?.position ?? "N/A",
    };

    // Get all students from the same session for marquee
    const sameSessionStudents = await prisma.user.findMany({
        where: { session: student.session ?? undefined },
        select: {
            id: true,
            fullName: true,
            nickName: true,
            student: { select: { position: true } },
        },
        orderBy: { student: { position: "asc" } },
    });

    // Merge enrollments + ORPS by courseId
    const merged = student.enrollments.map((e) => {
        const orps = student.orpsMarks.find((m) => m.courseId === e.courseId);
        return {
            id: e.id,
            semester: e.course.semester,
            code: e.course.code,
            title: e.course.title,
            credit: e.course.credit,
            grade: e.grade || "N/A",
            attendance: orps?.attendance ?? "N/A",
            classCount: orps?.classCount ?? "N/A",
            termTest: orps?.termTest ?? "N/A",
            evaluation: orps?.evaluation ?? "N/A",
            parta: orps?.parta ?? "N/A",
            partb: orps?.partb ?? "N/A",
        };
    });

    const groupedBySemester: Record<string, typeof merged> = {};
    for (const row of merged) {
        if (!groupedBySemester[row.semester]) {
            groupedBySemester[row.semester] = [];
        }
        groupedBySemester[row.semester].push(row);
    }

    // Calculate semester-wise CGPA
    const semesterCgpa: Record<string, number> = {};
    for (const [semester, rows] of Object.entries(groupedBySemester)) {
        let totalCredits = 0;
        let totalPoints = 0;

        for (const row of rows) {
            const grade = parseFloat(row.grade);
            if (!isNaN(grade)) {
                totalCredits += row.credit;
                totalPoints += grade * row.credit;
            }
        }
        semesterCgpa[semester] = totalCredits > 0 ? totalPoints / totalCredits : 0;
    }

    return (
        <SidebarProvider>
            <AppSidebar
                user={{
                    name: student.fullName,
                    email: student.email,
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
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Results</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="mr-8"><ModeToggle /></div>
                </header>

                <main className="flex flex-col gap-4 p-4 pt-2">
                    <Card className="w-full flex flex-row rounded-sm shadow-sm overflow-hidden">
                        <div className="ml-5">Ranks</div>
                        <CardContent className="max-w-6xl -ml-5">
                            <Marquee
                                gradient={false}
                                speed={50} // adjust speed if needed
                                pauseOnHover
                                loop={0}
                            >
                                {sameSessionStudents.map((s) => (
                                    <span key={s.id} className="mx-2 text-sm font-medium">
                                        <span
                                            className={
                                                s.id === student.id
                                                    ? "text-cyan-400 font-semibold"
                                                    : "text-gray-500"
                                            }
                                        >
                                            {s.nickName ?? s.fullName} — {" "}
                                            <span className="text-amber-500 font-bold">
                                                {s.student?.position ?? "N/A"}
                                            </span>
                                        </span>
                                    </span>
                                ))}
                            </Marquee>
                        </CardContent>
                    </Card>

                    {/* CGPA, Credits, Position */}
                    <Card className="w-full rounded-sm shadow-sm">
                        <CardHeader>
                            <CardTitle>Final Result</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <strong>CGPA:</strong> {studentInfo.cgpa} &nbsp;
                            <strong>Credits:</strong> {studentInfo.creditCompleted} &nbsp;
                            <strong>Position:</strong> {studentInfo.position}
                        </CardContent>
                    </Card>
                    {Object.entries(groupedBySemester).map(([semester, rows]) => (
                        <Card key={semester} className="w-full rounded-sm shadow-sm">
                            <CardHeader>
                                <CardTitle>Semester {semester}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {merged.length === 0 ? (
                                    <p>No result data available.</p>
                                ) : (
                                    <Table className="border">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Course</TableHead>
                                                <TableHead>Credit</TableHead>
                                                <TableHead>Attendance</TableHead>
                                                <TableHead>Term Test</TableHead>
                                                <TableHead>Evaluation</TableHead>
                                                <TableHead>Part A</TableHead>
                                                <TableHead>Part B</TableHead>
                                                <TableHead>Grade</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rows.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>{row.code}</TableCell>
                                                    <TableCell>{row.title}</TableCell>
                                                    <TableCell>{row.credit}</TableCell>
                                                    <TableCell>{row.attendance} / {row.classCount}</TableCell>
                                                    <TableCell>{row.termTest}</TableCell>
                                                    <TableCell>{row.evaluation}</TableCell>
                                                    <TableCell>{row.parta}</TableCell>
                                                    <TableCell>{row.partb}</TableCell>
                                                    <TableCell>{row.grade}</TableCell>
                                                </TableRow>
                                            ))}

                                            <TableRow className="font-semibold">
                                                <TableCell colSpan={8} className="text-left">Semester CGPA</TableCell>
                                                <TableCell>
                                                    {semesterCgpa[semester] > 0 ? semesterCgpa[semester].toFixed(2) : "N/A"}
                                                </TableCell>
                                            </TableRow>
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
