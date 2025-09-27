"use server";

import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mood-toggles";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Github, Linkedin, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  searchParams?: { search?: string };
}

export default async function SearchUserPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();
  const id = session.user.id;
  const student = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!student) return notFound();

  const searchQuery = searchParams?.search?.trim()?.toLowerCase() ?? "";

  // Only fetch users if search query exists
  const users = searchQuery
    ? await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: searchQuery, mode: "insensitive" } },
          { nickName: { contains: searchQuery, mode: "insensitive" } },
          { regNo: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        regNo: true,
        fullName: true,
        nickName: true,
        profilePic: true,
        session: true,
        bloodGroup: true,
        hometown: true,
        facebook: true,
        githubId: true,
        linkedinId: true,
      },
      orderBy: { regNo: "asc" },
    })
    : [];

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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Search Users</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Lists</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="mr-8">
            <ModeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card className="w-full rounded-sm shadow-sm border mt-4">
            <CardHeader>
              <CardTitle>Search Students</CardTitle>
            </CardHeader>

            <CardContent>
              {/* Search Input (SSR, GET form) */}
              <form method="get" className="mb-4 flex gap-2">
                <Input
                  name="search"
                  placeholder="Search by name or reg no..."
                  defaultValue={searchParams?.search ?? ""}
                  className="flex-1"
                />
                <Button type="submit" variant="default">
                  Search
                </Button>
              </form>

              {/* Results Table */}
              {searchQuery && users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Registration No.</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Hometown</TableHead>
                      <TableHead>Social</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={u.profilePic ?? ""} />
                              <AvatarFallback>{u.fullName?.[0] ?? "U"}</AvatarFallback>
                            </Avatar>
                            <span>{u.fullName} ({u.nickName})</span>
                          </div>
                        </TableCell>
                        <TableCell>{u.regNo}</TableCell>
                        <TableCell>{u.session}</TableCell>
                        <TableCell>{u.bloodGroup}</TableCell>
                        <TableCell>{u.hometown}</TableCell>
                        <TableCell className="flex gap-3">
                          {u.facebook && (
                            <a href={u.facebook} target="_blank" rel="noopener noreferrer">
                              <Facebook size={18} />
                            </a>
                          )}
                          {u.linkedinId && (
                            <a href={`${u.linkedinId}`} target="_blank" rel="noopener noreferrer">
                              <Linkedin size={18} />
                            </a>
                          )}
                          {u.githubId && (
                            <a href={`${u.githubId}`} target="_blank" rel="noopener noreferrer">
                              <Github size={18} />
                            </a>
                          )}
                          {/* {u.whatsapp && (
                            <a href={`https://wa.me/${u.whatsapp}`} target="_blank" rel="noopener noreferrer">
                              <Phone size={18} />
                            </a>
                          )} */}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground mt-4">Enter a name or registration number to see results.</p>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
