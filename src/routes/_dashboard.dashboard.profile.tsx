import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { Github, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getWebRequest } from "vinxi/http";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/db";
import { links, profile } from "@/db/schema";
import { auth } from "@/lib/auth";

const getDashboardData = createServerFn({ method: "GET" }).handler(async () => {
	const session = await auth.api.getSession({
		headers: getWebRequest().headers,
	});
	if (!session) throw new Error("Unauthorized");

	const userProfile = await db
		.select()
		.from(profile)
		.where(eq(profile.userId, session.user.id))
		.limit(1);
	const allLinks = await db.select().from(links).orderBy(links.order);

	return {
		profile: userProfile[0] || null,
		links: allLinks,
	};
});

const updateProfile = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			displayName: string;
			bio: string;
			avatarUrl: string;
			socialLinks: Record<string, string>;
			theme: any;
		}) => data,
	)
	.handler(async ({ data }) => {
		const session = await auth.api.getSession({
			headers: getWebRequest().headers,
		});
		if (!session) throw new Error("Unauthorized");

		const existing = await db
			.select()
			.from(profile)
			.where(eq(profile.userId, session.user.id))
			.limit(1);
		if (existing.length === 0) {
			await db.insert(profile).values({
				userId: session.user.id,
				displayName: data.displayName,
				username: data.displayName.toLowerCase().replace(/\s+/g, "-"),
				bio: data.bio,
				avatarUrl: data.avatarUrl,
				socialLinks: data.socialLinks,
				theme: data.theme,
			});
		} else {
			await db
				.update(profile)
				.set({
					displayName: data.displayName,
					bio: data.bio,
					avatarUrl: data.avatarUrl,
					socialLinks: data.socialLinks,
					theme: data.theme,
				})
				.where(eq(profile.id, existing[0].id));
		}
	});

export const Route = createFileRoute("/_dashboard/dashboard/profile")({
	component: DashboardProfilePage,
	loader: async () => await getDashboardData(),
});

function DashboardProfilePage() {
	const { profile } = Route.useLoaderData();
	const router = useRouter();

	const [formData, setFormData] = useState({
		displayName: profile?.displayName || "",
		bio: profile?.bio || "",
		avatarUrl: profile?.avatarUrl || "",
		background: (profile?.theme as any)?.background || "",
		buttonStyle: (profile?.theme as any)?.buttonStyle || "default",
		font: (profile?.theme as any)?.font || "#ffffff",
		instagram: (profile?.socialLinks as any)?.instagram || "",
		twitter: (profile?.socialLinks as any)?.twitter || "",
		github: (profile?.socialLinks as any)?.github || "",
		linkedin: (profile?.socialLinks as any)?.linkedin || "",
		youtube: (profile?.socialLinks as any)?.youtube || "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await updateProfile({
				data: {
					displayName: formData.displayName,
					bio: formData.bio,
					avatarUrl: formData.avatarUrl,
					socialLinks: {
						instagram: formData.instagram,
						twitter: formData.twitter,
						github: formData.github,
						linkedin: formData.linkedin,
						youtube: formData.youtube,
					},
					theme: {
						background: formData.background,
						buttonStyle: formData.buttonStyle,
						font: formData.font,
					},
				},
			});
			toast.success("Profile updated!");
			router.invalidate();
		} catch (_err) {
			toast.error("Failed to update profile");
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold tracking-tight">Appearance</h1>

			<form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Profile Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-2">
								<Label>Display Name</Label>
								<Input
									value={formData.displayName}
									onChange={(e) =>
										setFormData({ ...formData, displayName: e.target.value })
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label>Bio</Label>
								<Textarea
									value={formData.bio}
									onChange={(e) =>
										setFormData({ ...formData, bio: e.target.value })
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label>Avatar URL</Label>
								<Input
									value={formData.avatarUrl}
									onChange={(e) =>
										setFormData({ ...formData, avatarUrl: e.target.value })
									}
									placeholder="https://..."
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Theme & Styles</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-2">
								<Label>Background (Color or Linear Gradient)</Label>
								<Input
									value={formData.background}
									onChange={(e) =>
										setFormData({ ...formData, background: e.target.value })
									}
									placeholder="linear-gradient(...)"
								/>
								<p className="text-xs text-muted-foreground">
									Accepts CSS color or gradient string
								</p>
							</div>

							<div className="grid gap-2">
								<Label>Button Style</Label>
								<select
									className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									value={formData.buttonStyle}
									onChange={(e) =>
										setFormData({ ...formData, buttonStyle: e.target.value })
									}
								>
									<option value="default">Default (White Block)</option>
									<option value="outline">Outline</option>
									<option value="glass">Glassmorphism</option>
								</select>
							</div>

							<div className="grid gap-2">
								<Label>Font/Text Color</Label>
								<Input
									type="color"
									value={formData.font}
									onChange={(e) =>
										setFormData({ ...formData, font: e.target.value })
									}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Social Links</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-2">
								<Label className="flex items-center gap-2">
									<Instagram size={16} />
									Instagram
								</Label>
								<Input
									value={formData.instagram}
									onChange={(e) =>
										setFormData({ ...formData, instagram: e.target.value })
									}
									placeholder="https://instagram.com/..."
								/>
							</div>

							<div className="grid gap-2">
								<Label className="flex items-center gap-2">
									<Twitter size={16} />
									Twitter / X
								</Label>
								<Input
									value={formData.twitter}
									onChange={(e) =>
										setFormData({ ...formData, twitter: e.target.value })
									}
									placeholder="https://x.com/..."
								/>
							</div>

							<div className="grid gap-2">
								<Label className="flex items-center gap-2">
									<Github size={16} />
									GitHub
								</Label>
								<Input
									value={formData.github}
									onChange={(e) =>
										setFormData({ ...formData, github: e.target.value })
									}
									placeholder="https://github.com/..."
								/>
							</div>

							<div className="grid gap-2">
								<Label className="flex items-center gap-2">
									<Linkedin size={16} />
									LinkedIn
								</Label>
								<Input
									value={formData.linkedin}
									onChange={(e) =>
										setFormData({ ...formData, linkedin: e.target.value })
									}
									placeholder="https://linkedin.com/in/..."
								/>
							</div>

							<div className="grid gap-2">
								<Label className="flex items-center gap-2">
									<Youtube size={16} />
									YouTube
								</Label>
								<Input
									value={formData.youtube}
									onChange={(e) =>
										setFormData({ ...formData, youtube: e.target.value })
									}
									placeholder="https://youtube.com/@..."
								/>
							</div>
						</CardContent>
					</Card>

					<Button type="submit" size="lg" className="w-full">
						Save Changes
					</Button>
				</div>
			</form>
		</div>
	);
}
