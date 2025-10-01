"use client"

import * as React from "react"
import {
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({
  user,
  permission, // numeric permission
}: {
  user: {
    name: string
    email: string
    avatar: string
  },
  permission: number
}) {
  // Nav items with minPermission for each
  const navMainItems = [
    {
      title: "Users",
      url: '#',
      icon: Users,
      items: [
        { title: "Add", url: "/students/add" },
        { title: "Sessions", url: "/students/sessions" },
        { title: "Lists", url: "/students" },
      ],
      minPermission: 5, // only admins and super-admins
    },
    {
      title: "Student Info",
      url: '#',
      icon: SquareTerminal,
      items: [
        { title: "Update", url: "/info-update" },
      ],
      minPermission: 2, // only collector
    },
    {
      title: "Courses",
      url: '#',
      icon: Bot,
      items: [
        { title: "Add Courses", url: "/courses" },
        { title: "Grade Update", url: "/courses/gradeupdate" },
        { title: "Marks Update", url: "/courses/marks-update" },
        { title: "CGPA Update", url: "/courses/cgpaupdate" },
      ],
      minPermission: 3, // moderators and above
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "Edit Profile", url: "/account" },
        { title: "Sessions", url: "/account/sessions" },
        { title: "Change Password", url: "/account/change-password" },
      ],
      minPermission: 1, // all logged-in users
    },
  ]

  // Filter nav items based on user's permission
  const navMain = navMainItems.filter(item => permission >= (item.minPermission ?? 0))

  const projects = [
    { name: "Dashboard", url: "/dashboard", icon: Frame },
    { name: "Search Users", url: "/search", icon: Map },
    { name: "Results", url: "/results", icon: PieChart },
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center gap-2">
        <Users className="h-5 w-5 mt-6" />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={projects} />
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}