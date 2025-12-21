import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { BarChart3, MousePointerClick, TrendingUp, Users } from "lucide-react";
import { getWebRequest } from "vinxi/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

const getAnalytics = createServerFn({ method: "GET" }).handler(async () => {
	const session = await auth.api.getSession({
		headers: getWebRequest().headers,
	});
	if (!session) throw new Error("Unauthorized");

	const apiUrl = process.env.UMAMI_API_URL || "https://cloud.umami.is";
	const apiToken = process.env.UMAMI_API_TOKEN;
	const websiteId = process.env.UMAMI_WEBSITE_ID;

	if (!apiToken || !websiteId) {
		return {
			error: "Umami API not configured",
			hasConfig: false,
		};
	}

	try {
		// Get website stats for the last 30 days
		const endDate = Date.now();
		const startDate = endDate - 30 * 24 * 60 * 60 * 1000;

		const headers = {
			Authorization: `Bearer ${apiToken}`,
			"Content-Type": "application/json",
		};

		// Fetch stats
		const statsResponse = await fetch(
			`${apiUrl}/api/websites/${websiteId}/stats?startAt=${startDate}&endAt=${endDate}`,
			{ headers },
		);

		if (!statsResponse.ok) {
			throw new Error(`Stats API error: ${statsResponse.statusText}`);
		}

		const stats = await statsResponse.json();

		// Fetch events (link clicks)
		const eventsResponse = await fetch(
			`${apiUrl}/api/websites/${websiteId}/events?startAt=${startDate}&endAt=${endDate}`,
			{ headers },
		);

		const events = eventsResponse.ok ? await eventsResponse.json() : [];

		return {
			hasConfig: true,
			stats,
			events: events.data || [],
		};
	} catch (error) {
		console.error("Analytics fetch error:", error);
		return {
			error:
				error instanceof Error ? error.message : "Failed to fetch analytics",
			hasConfig: true,
		};
	}
});

export const Route = createFileRoute("/_dashboard/dashboard/analytics")({
	component: AnalyticsPage,
	loader: async () => await getAnalytics(),
});

function AnalyticsPage() {
	const data = Route.useLoaderData();

	if (!data.hasConfig) {
		return (
			<div className="space-y-6">
				<h1 className="text-3xl font-bold tracking-tight">Analytics</h1>

				<Card>
					<CardContent className="p-12 text-center">
						<BarChart3 className="h-16 w-16 mx-auto mb-4 text-zinc-400" />
						<h3 className="text-xl font-semibold mb-2">
							Analytics Not Configured
						</h3>
						<p className="text-zinc-500 mb-4">
							To enable analytics, add your Umami configuration to the{" "}
							<code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
								.env
							</code>{" "}
							file:
						</p>
						<div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg text-left text-sm font-mono">
							<div>UMAMI_WEBSITE_ID=your-website-id</div>
							<div>UMAMI_API_TOKEN=your-api-token</div>
							<div>UMAMI_API_URL=https://cloud.umami.is</div>
						</div>
						<p className="text-xs text-zinc-500 mt-4">
							Get your credentials from{" "}
							<a
								href="https://umami.is"
								target="_blank"
								rel="noreferrer"
								className="text-blue-500 hover:underline"
							>
								umami.is
							</a>
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (data.error) {
		return (
			<div className="space-y-6">
				<h1 className="text-3xl font-bold tracking-tight">Analytics</h1>

				<Card className="border-red-200 dark:border-red-900">
					<CardContent className="p-8 text-center">
						<p className="text-red-600 dark:text-red-400">
							Error: {data.error}
						</p>
						<p className="text-sm text-zinc-500 mt-2">
							Please check your Umami configuration
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const { stats, events } = data;
	const linkClicks = events.filter((e: any) => e.eventName === "click-link");

	// Group clicks by URL
	const clicksByUrl: Record<string, number> = {};
	linkClicks.forEach((event: any) => {
		const url = event.urlPath || "Unknown";
		clicksByUrl[url] = (clicksByUrl[url] || 0) + 1;
	});

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold tracking-tight">Analytics</h1>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Page Views</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats?.pageviews?.value || 0}
						</div>
						<p className="text-xs text-muted-foreground">Last 30 days</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Unique Visitors
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats?.visitors?.value || 0}
						</div>
						<p className="text-xs text-muted-foreground">Last 30 days</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
						<MousePointerClick className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{linkClicks.length}</div>
						<p className="text-xs text-muted-foreground">Link clicks tracked</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats?.bounces?.value || 0}%
						</div>
						<p className="text-xs text-muted-foreground">Last 30 days</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Link Clicks by URL</CardTitle>
				</CardHeader>
				<CardContent>
					{Object.keys(clicksByUrl).length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-8">
							No link clicks recorded yet
						</p>
					) : (
						<div className="space-y-3">
							{Object.entries(clicksByUrl)
								.sort((a, b) => b[1] - a[1])
								.map(([url, count]) => (
									<div
										key={url}
										className="flex items-center justify-between border-b pb-2"
									>
										<span className="text-sm font-medium truncate flex-1">
											{url}
										</span>
										<span className="text-sm text-muted-foreground ml-4">
											{count} clicks
										</span>
									</div>
								))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
