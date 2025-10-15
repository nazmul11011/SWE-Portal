import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { revalidatePath } from "next/cache";

export default async function CoursesPage() {
    // SSR session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return notFound();

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true },
    });
    if (!user) return notFound();

    // Fetch courses
    const courses = await prisma.course.findMany({
        orderBy: { semester: "asc" },
    });

    return (
        <SidebarProvider>
            <AppSidebar
                user={{
                    name: user.fullName,
                    email: user.email,
                    avatar: user.profilePic ?? "",
                }}
                permission={user.role?.permission ?? 0}
            />
            <SidebarInset>
                {/* Header */}
                <header className="flex justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger />
                        <Separator orientation="vertical"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Lists & Add</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="mr-8"><ModeToggle /></div>
                </header>

                {/* Main */}
                <main className="flex flex-col gap-4 p-4 pt-2">
                    {/* Courses List */}
                    <Card className="w-full rounded-sm shadow-sm">
                        <CardHeader>
                            <CardTitle>Courses List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {courses.length === 0 ? (
                                <p>No courses added yet.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Credits</TableHead>
                                            <TableHead>Semester</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courses.map((course) => (
                                            <TableRow key={course.id}>
                                                <TableCell>{course.code}</TableCell>
                                                <TableCell>{course.title}</TableCell>
                                                <TableCell>{course.credit}</TableCell>
                                                <TableCell>{course.semester}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Add Course Form */}
                    <Card className="w-full rounded-sm shadow-sm border">
                        <CardHeader>
                            <CardTitle>Add New Course</CardTitle>
                            <CardDescription className="text-red-500">Caution: Don&apos;t duplicate course</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                action={async (formData: FormData) => {
                                    "use server";

                                    const code = formData.get("code")?.toString();
                                    const title = formData.get("title")?.toString();
                                    const credit = Number(formData.get("credit"));
                                    const semester = Number(formData.get("semester"));

                                    if (!code || !title || !credit || !semester) return;

                                    await prisma.course.create({
                                        data: {
                                            code,
                                            title,
                                            credit,
                                            semester,
                                        },
                                    });

                                    // Refresh page
                                    revalidatePath("/courses");
                                }}
                                className="flex flex-col gap-2"
                            >
                                <Input
                                    name="code"
                                    placeholder="Course Code"
                                    required
                                />
                                <Input
                                    name="title"
                                    placeholder="Course Title"
                                    required
                                />
                                <Input
                                    type="float"
                                    name="credit"
                                    placeholder="Credit"
                                    required
                                />
                                <Input
                                    type="number"
                                    name="semester"
                                    placeholder="Semester"
                                    required
                                />
                                <Button type="submit" className="mt-2">Add Course</Button>
                            </form>
                        </CardContent>
                    </Card>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
