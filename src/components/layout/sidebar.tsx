"use client";

import { usePathname } from "next/navigation";
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
import { useAuth } from "@/lib/hooks";
import { logOut } from "@/lib/actions";
import { Logo } from "@/components/shared/logo";

const AppSidebar = () => {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === "admin";

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
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      asChild
                    >
                      <a>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )
          )}
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => logOut()}>
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
