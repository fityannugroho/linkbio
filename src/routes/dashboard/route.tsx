import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/AppSidebar";
import { PreviewPanel } from "@/components/PreviewPanel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/authClient";
import { cn } from "@/lib/utils";
import { getDashboardData } from "@/server/dashboard/links";

const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  });
  return session;
});

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    return { session };
  },
  loader: async () => await getDashboardData(),
  component: DashboardLayout,
  head: () => ({
    meta: [{ title: "Dashboard | LinkBio" }],
  }),
});

function DashboardLayout() {
  const router = useRouter();
  const { session } = Route.useRouteContext();
  const { profile, links } = Route.useLoaderData();
  const [activeView, setActiveView] = useState<"editor" | "preview">("editor");
  const pathname = router.state.location.pathname;
  const showPreview =
    pathname === "/dashboard" || pathname === "/dashboard/design";
  const sections = [
    { path: "/dashboard/design", label: "Design" },
    { path: "/dashboard/analytics", label: "Analytics" },
    { path: "/dashboard", label: "Links" },
  ];
  const currentSection =
    sections.find(
      (section) =>
        pathname === section.path || pathname.startsWith(`${section.path}/`),
    ) ?? sections[sections.length - 1];
  const userName =
    profile?.displayName || session?.user?.name || "Your profile";
  const userEmail = session?.user?.email || "";
  const userAvatar = profile?.avatarUrl || session?.user?.image || "";

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully");
          router.navigate({ to: "/login" });
        },
      },
    });
  };

  return (
    <SidebarProvider>
      <AppSidebar
        pathname={pathname}
        user={{
          name: userName,
          email: userEmail,
          avatar: userAvatar,
        }}
        onLogout={handleLogout}
        onNavigate={() => setActiveView("editor")}
        viewHref="/"
      />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-14 p-2 shrink-0 items-center gap-2 bg-background border-b border-border px-4 transition-[width,height] ease-linear">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentSection.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2 md:gap-4 lg:hidden">
            {showPreview && (
              <Tabs
                value={activeView}
                onValueChange={(v) => setActiveView(v as "editor" | "preview")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="editor" className="text-xs">
                    Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs">
                    Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </header>
        <div className="flex flex-1 min-h-0">
          <main
            className={cn(
              "flex-1 min-h-0 overflow-y-auto lg:block",
              activeView === "editor" ? "block" : "hidden",
            )}
          >
            <div className="mx-auto w-full max-w-4xl p-4">
              <Outlet />
            </div>
          </main>
          {showPreview && (
            <aside
              className={cn(
                "w-full min-h-0 border-l border-border bg-muted/20 lg:flex lg:w-90",
                activeView === "preview" ? "flex" : "hidden",
              )}
            >
              <PreviewPanel profile={profile} links={links} />
            </aside>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
