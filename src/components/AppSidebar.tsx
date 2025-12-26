"use client";

import { BarChart3, LayoutDashboard, Paintbrush } from "lucide-react";
import type * as React from "react";

import { NavMain } from "@/components/NavMain";
import { NavUser } from "@/components/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  pathname: string;
  user: {
    name: string;
    email?: string | null;
    avatar?: string | null;
  };
  onLogout: () => void;
  viewHref?: string;
};

const navItems = [
  {
    title: "Links",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Design",
    url: "/dashboard/design",
    icon: Paintbrush,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
];

const isActiveRoute = (pathname: string, url: string) => {
  if (url === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === url || pathname.startsWith(`${url}/`);
};

export function AppSidebar({
  pathname,
  user,
  onLogout,
  viewHref = "/",
  ...props
}: AppSidebarProps) {
  const navMain = navItems.map((item) => ({
    ...item,
    isActive: isActiveRoute(pathname, item.url),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="justify-center">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
              <LayoutDashboard className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">LinkBio</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Manage" items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onLogout={onLogout} viewHref={viewHref} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
