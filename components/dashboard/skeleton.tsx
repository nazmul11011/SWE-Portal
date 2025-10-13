"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function DashboardSkeleton() {
  return (
    <SidebarProvider>
      {/* Sidebar space preserved */}
      <SidebarInset>
        {/* Header skeleton */}
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <Skeleton className="h-4 w-20" />
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    <Skeleton className="h-4 w-12" />
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </header>

        {/* Main content skeleton */}
        <main className="flex flex-1 flex-col gap-2 p-4 pt-0">
          <Card className="w-full rounded-sm p-6 shadow-sm border mt-4 animate-pulse">
            <CardHeader className="-mx-6 mb-4">
              <CardTitle>
                <Skeleton className="h-6 w-56" />
              </CardTitle>
            </CardHeader>

            {/* Profile + Info Grid */}
            <div className="flex flex-col md:flex-row -ml-6">
              {/* Profile Picture */}
              <div className="w-36 h-40 border border-gray-300 mx-auto mb-4 md:mb-0 md:mx-0 md:ml-6 order-first md:order-last rounded-md overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>

              {/* Left Info Grid */}
              <CardContent className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-28 mb-2" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>

            <Separator className="my-6" />

            {/* Personal Info */}
            <CardTitle className="mb-4">
              <Skeleton className="h-6 w-48" />
            </CardTitle>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-5 w-40" />
                </div>
              ))}
            </div>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
