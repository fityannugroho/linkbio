import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Facebook, Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const getPublicProfile = createServerFn({ method: "GET" }).handler(async () => {
	const { db } = await import("../db");
	const { links, profile, user } = await import("../db/schema");
	const { eq, count } = await import("drizzle-orm");

	const userProfile = await db.select().from(profile).limit(1);
	const userLinks = await db
		.select()
		.from(links)
		.where(eq(links.isVisible, true))
		.orderBy(links.order);
	const userCountResult = await db.select({ value: count() }).from(user);

	return {
		profile: userProfile[0] || null,
		links: userLinks,
		userExists: userCountResult[0].value > 0,
	};
});

export const Route = createFileRoute("/")({
	head: () => {
		const umamiId = import.meta.env.UMAMI_WEBSITE_ID;
		const umamiUrl = import.meta.env.UMAMI_API_URL || "https://cloud.umami.is";

		return {
			meta: [
				{
					name: "description",
					content: "Links and social media profile",
				},
			],
			scripts: umamiId
				? [
						{
							src: `${umamiUrl}/script.js`,
							"data-website-id": umamiId,
							defer: true,
						},
					]
				: [],
		};
	},
	component: App,
	loader: async () => await getPublicProfile(),
});

function App() {
	const { profile, links, userExists } = Route.useLoaderData();

	if (!profile) {
		return (
			<div className="flex h-screen items-center justify-center bg-zinc-950 text-white px-4">
				<div className="text-center max-w-sm">
					<h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-blue-500">
						Linktree Clone
					</h1>
					<p className="mt-4 text-zinc-400">
						{!userExists
							? "Welcome! Start by setting up your admin account."
							: "Your profile is not yet configured. Please login to get started."}
					</p>
					<div className="mt-8 flex flex-col gap-3">
						{!userExists ? (
							<Button
								asChild
								className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
							>
								<a href="/setup">🚀 Create Admin Account</a>
							</Button>
						) : (
							<Button asChild className="w-full bg-zinc-800 hover:bg-zinc-700">
								<a href="/login">Login to Dashboard</a>
							</Button>
						)}
					</div>
				</div>
			</div>
		);
	}

	const theme = (profile.theme as any) || {};
	const bgStyle = theme.background?.startsWith("#")
		? { backgroundColor: theme.background }
		: {
				backgroundImage:
					theme.background || "linear-gradient(to bottom, #18181b, #09090b)",
			};

	const fontColor = theme.font || "#ffffff";
	const buttonStyle = theme.buttonStyle || "default";

	return (
		<div
			className="min-h-screen w-full flex flex-col items-center py-12 px-4 transition-colors"
			style={{ ...bgStyle, color: fontColor }}
		>
			<div className="mb-8 text-center max-w-md w-full">
				<Avatar className="h-24 w-24 mx-auto mb-4 border-2 border-white/10 shadow-xl">
					<AvatarImage
						src={profile.avatarUrl || ""}
						alt={profile.displayName}
					/>
					<AvatarFallback>
						{profile.displayName.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<h1 className="text-xl font-bold tracking-tight">
					{profile.displayName}
				</h1>
				{profile.bio && (
					<p className="mt-2 text-sm opacity-80">{profile.bio}</p>
				)}

				{profile.socialLinks && (
					<div className="flex justify-center gap-4 mt-6">
						{Object.entries(profile.socialLinks as Record<string, string>).map(
							([key, url]) => {
								if (!url) return null;
								const Icon = {
									instagram: Instagram,
									twitter: Twitter,
									github: Github,
									linkedin: Linkedin,
									facebook: Facebook,
								}[key.toLowerCase()];

								if (!Icon) return null;

								return (
									<a
										key={key}
										href={url}
										target="_blank"
										rel="noreferrer"
										className="hover:scale-110 transition-transform text-current opacity-80 hover:opacity-100"
									>
										<Icon className="h-6 w-6" />
									</a>
								);
							},
						)}
					</div>
				)}
			</div>

			<div className="flex flex-col gap-4 w-full max-w-lg pb-12">
				{links.map((link) => (
					<a
						key={link.id}
						href={link.url}
						target="_blank"
						rel="noreferrer"
						className="w-full group"
						data-umami-event="click-link"
						data-umami-event-url={link.url}
					>
						<div
							className={`
                    w-full py-4 px-6 rounded-full text-center font-medium transition-all duration-300 ease-out
                    hover:scale-[1.03] hover:shadow-lg active:scale-[0.98] flex items-center justify-center relative
                    ${buttonStyle === "outline" ? "border-2 border-current hover:bg-white/10" : ""}
                    ${buttonStyle === "glass" ? "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/25 hover:shadow-xl" : ""}
                    ${buttonStyle === "default" ? "bg-white text-black hover:bg-gray-50 shadow-md hover:shadow-xl" : ""}
                `}
							style={
								buttonStyle === "default"
									? undefined
									: { borderColor: fontColor }
							}
						>
							{link.title}
						</div>
					</a>
				))}
				{links.length === 0 && (
					<div className="text-center opacity-50 text-sm mt-4">
						No links added yet.
					</div>
				)}
			</div>

			<footer className="mt-auto pt-8 pb-4 text-xs opacity-40">
				<a
					href="https://linktr.ee"
					target="_blank"
					rel="noreferrer"
					className="hover:underline"
				>
					Linktree Clone
				</a>
			</footer>
		</div>
	);
}
