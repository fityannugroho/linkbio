"use client";

import {
  BarChart3Icon,
  LayoutDashboardIcon,
  PaintbrushIcon,
} from "lucide-react";
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
  onNavigate?: () => void;
  viewHref?: string;
};

const navItems = [
  {
    title: "Links",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Design",
    url: "/dashboard/design",
    icon: PaintbrushIcon,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3Icon,
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
  onNavigate,
  viewHref = "/",
  ...props
}: AppSidebarProps) {
  const navMain = navItems.map((item) => ({
    ...item,
    isActive: isActiveRoute(pathname, item.url),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-14 flex items-center justify-center">
        <SidebarMenu>
          <SidebarMenuItem className="flex w-full items-center justify-center gap-2">
            <div className="relative size-8 group-data-[collapsible=icon]:block hidden">
              <img
                alt="LinkBio"
                className="absolute inset-0 size-full object-contain"
                src="/logo192.png"
              />
            </div>
            <div className="relative h-8 group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:dark:hidden">
              <img
                alt="LinkBio"
                className="h-full w-auto object-contain dark:opacity-0 transition-opacity duration-200"
                src="/logo-full.png"
              />
              <img
                alt="LinkBio"
                className="absolute inset-0 h-full w-auto object-contain opacity-0 dark:opacity-100 transition-opacity duration-200"
                src="/logo-full-light.png"
              />
            </div>
            <span className="sr-only">LinkBio</span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Manage" items={navMain} onNavigate={onNavigate} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onLogout={onLogout} viewHref={viewHref} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
