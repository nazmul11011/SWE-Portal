"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Papa from "papaparse";
import { toast } from "sonner";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EnrollmentClient({ courses, user }: { courses: any[], user: any }) {
  const [selectedSemester, setSelectedSemester] = React.useState<string | undefined>(undefined);
  const [selectedCourse, setSelectedCourse] = React.useState("");
  const [csvData, setCsvData] = React.useState<{ regNo: string; grade: string }[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  // Filtered courses based on semester
  const filteredCourses = selectedSemester
    ? courses.filter((c) => c.semester.toString() === selectedSemester)
    : courses;

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      complete: (results: { data: any[] }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = results.data as any[];
        const parsed = data
          .filter(row => row.regNo && row.grade)
          .map(row => ({ regNo: row.regNo, grade: row.grade }));
        setCsvData(parsed);
      },
    });
  };

  // Upload to DB
  const handleUpload = async () => {
    if (!selectedCourse || csvData.length === 0) return;

    setIsUploading(true);

    const response = await fetch("/api/enrollment/upload", {
      method: "POST",
      body: JSON.stringify({ courseId: selectedCourse, students: csvData }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      toast.success("Enrollment data uploaded successfully");
      setCsvData([]);
      setSelectedCourse("");
      setSelectedSemester("");
    } else {
      toast.error("Upload failed");
    }
    setIsUploading(false);
  };

  // Get all unique semesters from courses
  const semesters = Array.from(new Set(courses.map(c => c.semester))).sort((a, b) => a - b);

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
        <header className="flex justify-between h-16 items-center gap-2 px-4">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Enrollment</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto"><ModeToggle /></div>
        </header>

        <main className="flex flex-col gap-4 p-4 pt-2">
          {/* Course Selection + CSV */}
          <Card className="w-full rounded-sm shadow-sm">
            <CardHeader>
              <CardTitle>Select Course & Upload CSV</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row gap-4 items-center">
              {/* Semester Filter */}
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Courses Filtered by Semester */}
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input type="file" accept=".csv" onChange={handleFileUpload} />
              <Button onClick={handleUpload} disabled={ isUploading || !selectedCourse || csvData.length === 0}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </CardContent>
            <p className="ml-6 text-sm text-muted-foreground">The CSV file must contain these headers: <b className="text-red-500">regNo, grade</b></p>
          </Card>

          {/* Preview CSV Data */}
          <Card className="w-full rounded-sm shadow-sm border">
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {csvData.length === 0 ? (
                <p>No data to display</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration No</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.regNo}</TableCell>
                        <TableCell>{row.grade}</TableCell>
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
