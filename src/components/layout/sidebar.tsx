
"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  PlusCircle,
  BarChart2,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useFirebase } from "@/firebase";
import { auth } from "@/firebase/client";
import { signOut } from "firebase/auth";
import { Logo } from "@/components/shared/logo";
import { useToast } from "@/hooks/use-toast";

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { userProfile } = useFirebase();
  const isAdmin = userProfile?.role === "admin";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push("/login");
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message,
      });
    }
  };

  const menuItems = [
    {
      href: "/dashboard",
      label: "My Reports",
      icon: Home,
      adminOnly: false,
    },
    {
      href: "/dashboard/submit-report",
      label: "Submit Report",
      icon: PlusCircle,
      adminOnly: false,
    },
    {
      href: "/dashboard/admin",
      label: "Admin Dashboard",
      icon: LayoutDashboard,
      adminOnly: true,
    },
    {
      href: "/dashboard/admin/analytics",
      label: "Analytics",
      icon: BarChart2,
      adminOnly: true,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(
            (item) =>
              (!item.adminOnly || isAdmin) && (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    as={Link}
                    href={item.href}
                    isActive={pathname === item.href}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
          )}
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
