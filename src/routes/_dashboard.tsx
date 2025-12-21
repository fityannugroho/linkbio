import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
	useRouter,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
	BarChart3,
	ExternalLink,
	LayoutDashboard,
	LogOut,
	User,
} from "lucide-react";
import { toast } from "sonner";
import { getWebRequest } from "vinxi/http";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";

const getSession = createServerFn({ method: "GET" }).handler(async () => {
	const session = await auth.api.getSession({
		headers: getWebRequest().headers,
	});
	return session;
});

export const Route = createFileRoute("/_dashboard")({
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/login" });
		}
		return { session };
	},
	component: DashboardLayout,
});

function DashboardLayout() {
	const router = useRouter();

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
		<div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-zinc-950">
			<aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-b md:border-r border-gray-200 dark:border-zinc-800 p-4 flex flex-col gap-4">
				<div className="flex items-center gap-2 font-bold text-xl px-2">
					<span>Linktree Clone</span>
				</div>

				<nav className="flex flex-col gap-2 mt-4">
					<Link
						to="/dashboard"
						className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors [&.active]:bg-gray-100 dark:[&.active]:bg-zinc-800 font-medium text-sm"
					>
						<LayoutDashboard size={18} />
						Links
					</Link>
					<Link
						to="/dashboard/profile"
						className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors [&.active]:bg-gray-100 dark:[&.active]:bg-zinc-800 font-medium text-sm"
					>
						<User size={18} />
						Profile
					</Link>
					<Link
						to="/dashboard/analytics"
						className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors [&.active]:bg-gray-100 dark:[&.active]:bg-zinc-800 font-medium text-sm"
					>
						<BarChart3 size={18} />
						Analytics
					</Link>
				</nav>

				<div className="mt-auto flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
					<a
						href="/"
						target="_blank"
						className="flex items-center gap-3 px-3 py-2 text-xs text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
						rel="noopener"
					>
						<ExternalLink size={14} /> View Live Page
					</a>
					<Button
						variant="ghost"
						size="sm"
						className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
						onClick={handleLogout}
					>
						<LogOut size={18} /> Logout
					</Button>
				</div>
			</aside>

			<main className="flex-1 p-6 md:p-10 overflow-auto">
				<div className="max-w-4xl mx-auto">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
