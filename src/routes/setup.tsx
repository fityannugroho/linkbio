import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { getWebRequest } from "vinxi/http";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/setup")({
	component: SetupPage,
});

const createInitialProfile = createServerFn({ method: "POST" })
	.inputValidator((data: { name: string }) => data)
	.handler(async ({ data }) => {
		const { db } = await import("@/db");
		const { profile } = await import("@/db/schema");
		const { auth } = await import("@/lib/auth");
		const session = await auth.api.getSession({
			headers: getWebRequest().headers,
		});

		if (!session) throw new Error("Unauthorized");

		await db.insert(profile).values({
			userId: session.user.id,
			displayName: data.name,
			username: data.name.toLowerCase().replace(/\s+/g, "-"),
			bio: "Welcome to my Linktree!",
			theme: {
				background: "linear-gradient(to bottom, #18181b, #09090b)",
				buttonStyle: "default",
				font: "#ffffff",
			},
		});
	});

function SetupPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		await authClient.signUp.email(
			{
				email: formData.email,
				password: formData.password,
				name: formData.name,
			},
			{
				onSuccess: async () => {
					await createInitialProfile({ data: { name: formData.name } });
					toast.success("Account created successfully!");
					router.navigate({ to: "/dashboard" });
				},
				onError: (ctx) => {
					toast.error(ctx.error.message || "Failed to create account");
				},
			},
		);

		setLoading(false);
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Setup Admin</CardTitle>
					<CardDescription>
						Create your admin account to get started.
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								type="text"
								placeholder="Your Name"
								required
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="admin@example.com"
								required
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								required
								value={formData.password}
								onChange={(e) =>
									setFormData({ ...formData, password: e.target.value })
								}
							/>
						</div>
					</CardContent>
					<CardFooter>
						<Button className="w-full" type="submit" disabled={loading}>
							{loading ? "Creating..." : "Create Account"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
