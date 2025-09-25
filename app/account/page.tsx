import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { getSkills } from "@/lib/skills"
import AccountForm from "./account-form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

export default async function AccountPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return <div className="p-6">Not authorized</div>
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            regNo: true,
            email: true,
            fullName: true,
            nickName: true,
            session: true,
            gender: true,
            profilePic: true,
            phoneNumber: true,
            linkedinId: true,
            githubId: true,
            codeforcesId: true,
            whatsapp: true,
            facebook: true,
            bloodGroup: true,
            school: true,
            college: true,
            hometown: true,
            bio: true,
            role:true,
            skills: {
                select: { skillId: true }
            }
        },
    })

    if (!user) return <div className="p-6">User not found</div>

    const skillList = await getSkills()

    const userSkillIds = user.skills.map((s: { skillId: any }) => s.skillId)

    return (
        <SidebarProvider>
            <AppSidebar user={{
                name: user.fullName ?? "",
                email: user.email ?? "",
                avatar: user.profilePic ?? "",
            }} 
                permission={user.role?.permission ?? 0}
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
                                    <BreadcrumbLink href="#">Account</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Edit Profile</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="mr-8"><ModeToggle /></div>
                </header>

                {/* Main Content */}
                <main className="flex flex-1 flex-col gap-2 p-4 pt-0">
                    <Card className="w-full rounded-sm shadow-sm border mt-4">
                        <CardHeader>
                            <CardTitle>
                                Account Settings
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <AccountForm 
                                user={{ ...user, skills: userSkillIds }} 
                                skillList={skillList} 
                            />
                        </CardContent>
                    </Card>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
