"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

interface HeaderProps {
  title?: string;
  userName?: string;
  userImage?: string;
}

export function Header({ title, userName = "User", userImage }: HeaderProps) {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Left: Page title */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">{title || "Dashboard"}</h1>
      </div>

      {/* Right: User menu */}
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-1">
              <Avatar className="w-8 h-8">
                {userImage ? <AvatarImage src={userImage} /> : <AvatarFallback>{userName[0]}</AvatarFallback>}
              </Avatar>
              <span className="hidden sm:inline-block">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log("Go to profile")}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
