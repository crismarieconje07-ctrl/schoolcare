"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useFirebase } from "@/firebase";
import { logOut } from "@/lib/actions";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const AppHeader = () => {
  const { user, userProfile } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    const result = await logOut();
    if (result.success) {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push("/login");
    } else {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: result.error,
      });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 sticky top-0 z-30">
        <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* Can add breadcrumbs or page title here */}
      </div>
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user.photoURL || undefined}
                  alt={userProfile?.displayName || ""}
                />
                <AvatarFallback>
                  {getInitials(userProfile?.displayName)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {userProfile?.displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};

export default AppHeader;
