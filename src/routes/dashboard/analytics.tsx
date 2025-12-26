import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import {
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subHours,
  subMonths,
} from "date-fns";
import {
  Activity,
  BarChart3,
  MousePointerClick,
  TrendingUp,
  Users,
} from "lucide-react";
import { DateRangeFilter } from "@/components/dashboard/analytics/DateRangeFilter";
import {
  type AnalyticsSearch,
  analyticsSearchSchema,
} from "@/components/dashboard/analytics/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getUmamiToken } from "@/lib/umami.server";

interface UmamiEvent {
  id: string;
  websiteId: string;
  sessionId: string;
  createdAt: string;
  hostname: string;
  urlPath: string;
  urlQuery: string;
  referrerPath: string;
  referrerQuery: string;
  referrerDomain: string;
  country: string;
  city: string;
  device: string;
  os: string;
  browser: string;
  pageTitle: string;
  eventType: number;
  eventName: string;
  hasData: number;
}

interface UmamiEventData {
  websiteId: string;
  sessionId: string;
  eventId: string;
  urlPath: string;
  eventName: string;
  dataKey: string;
  stringValue: string | null;
  numberValue: number | null;
  dateValue: string | null;
  dataType: number;
  createdAt: string;
}

export type { AnalyticsSearch };

const getAnalytics = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => analyticsSearchSchema.parse(d))
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({
      headers: getRequestHeaders(),
    });
    if (!session) throw new Error("Unauthorized");

    const apiUrl =
      process.env.VITE_UMAMI_API_URL ?? import.meta.env.VITE_UMAMI_API_URL;
    const websiteId =
      process.env.VITE_UMAMI_WEBSITE_ID ??
      import.meta.env.VITE_UMAMI_WEBSITE_ID;

    if (!websiteId) {
      return {
        error: "Umami API not configured",
        hasConfig: false,
      };
    }

    try {
      const apiToken = await getUmamiToken(apiUrl);
      if (!apiToken) {
        return {
          error: "Umami API not configured",
          hasConfig: false,
        };
      }

      let startDate: number;
      let endDate: number = Date.now();

      if (data.range === "custom" && data.from && data.to) {
        startDate = data.from;
        endDate = data.to;
      } else {
        switch (data.range) {
          case "today":
            startDate = startOfDay(new Date()).getTime();
            break;
          case "24h":
            startDate = subHours(new Date(), 24).getTime();
            break;
          case "this_week":
            startDate = startOfWeek(new Date(), { weekStartsOn: 1 }).getTime();
            break;
          case "7d":
            startDate = subDays(new Date(), 7).getTime();
            break;
          case "this_month":
            startDate = startOfMonth(new Date()).getTime();
            break;
          case "30d":
            startDate = subDays(new Date(), 30).getTime();
            break;
          case "90d":
            startDate = subDays(new Date(), 90).getTime();
            break;
          case "this_year":
            startDate = startOfYear(new Date()).getTime();
            break;
          case "6m":
            startDate = subMonths(new Date(), 6).getTime();
            break;
          case "12m":
            startDate = subMonths(new Date(), 12).getTime();
            break;
          case "all":
            startDate = new Date(0).getTime(); // Beginning of time
            break;
          default:
            startDate = subDays(new Date(), 30).getTime();
        }
      }

      const headers = {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      };

      const pageviewsResponse = await fetch(
        `${apiUrl}/api/websites/${websiteId}/events?startAt=${startDate}&endAt=${endDate}&path=/&pageSize=1000`,
        { headers },
      );

      if (!pageviewsResponse.ok) {
        throw new Error(`Pageviews API error: ${pageviewsResponse.statusText}`);
      }

      const pageviewsData = await pageviewsResponse.json();

      const pageviews = (pageviewsData.data || []).filter(
        (event: UmamiEvent) => event.eventType === 1 && event.urlPath === "/",
      );
      const pageviewCount = pageviews.length;

      const uniqueVisitors = new Set(
        pageviews.map((event: UmamiEvent) => event.sessionId),
      ).size;

      const statsResponse = await fetch(
        `${apiUrl}/api/websites/${websiteId}/stats?startAt=${startDate}&endAt=${endDate}`,
        { headers },
      );

      const stats = statsResponse.ok ? await statsResponse.json() : {};

      const eventsResponse = await fetch(
        `${apiUrl}/api/websites/${websiteId}/events?startAt=${startDate}&endAt=${endDate}&pageSize=100`,
        { headers },
      );

      if (!eventsResponse.ok) {
        return {
          hasConfig: true,
          stats: {
            pageviews: { value: pageviewCount },
            visitors: { value: uniqueVisitors },
            bounceRate:
              uniqueVisitors > 0
                ? ((stats.bounces || 0) / uniqueVisitors) * 100
                : 0,
          },
          linkClicks: [],
          socialClicks: [],
        };
      }

      const eventsData = await eventsResponse.json();

      const allEvents = eventsData.data || [];
      const clickLinkEvents = allEvents.filter(
        (event: UmamiEvent) =>
          event.eventType === 2 && event.eventName === "click-link",
      );
      const clickSocialEvents = allEvents.filter(
        (event: UmamiEvent) =>
          event.eventType === 2 && event.eventName === "click-social",
      );

      const linkEventDataPromises = clickLinkEvents.map(
        async (event: UmamiEvent) => {
          try {
            const eventDataResponse = await fetch(
              `${apiUrl}/api/websites/${websiteId}/event-data/${event.id}`,
              { headers },
            );
            if (eventDataResponse.ok) {
              const eventData: UmamiEventData[] =
                await eventDataResponse.json();
              const urlData = eventData.find(
                (data: UmamiEventData) => data.dataKey === "url",
              );
              return {
                url: urlData?.stringValue || "Unknown",
                id: event.id,
              };
            }
          } catch {
            // Gracefully handle individual event fetch failures
          }
          return null;
        },
      );

      const socialEventDataPromises = clickSocialEvents.map(
        async (event: UmamiEvent) => {
          try {
            const eventDataResponse = await fetch(
              `${apiUrl}/api/websites/${websiteId}/event-data/${event.id}`,
              { headers },
            );
            if (eventDataResponse.ok) {
              const eventData: UmamiEventData[] =
                await eventDataResponse.json();
              const platformData = eventData.find(
                (data: UmamiEventData) => data.dataKey === "platform",
              );
              return {
                platform: platformData?.stringValue || "Unknown",
                id: event.id,
              };
            }
          } catch {
            // Gracefully handle individual event fetch failures
          }
          return null;
        },
      );

      const [linkEventDetails, socialEventDetails] = await Promise.all([
        Promise.all(linkEventDataPromises),
        Promise.all(socialEventDataPromises),
      ]);

      const validLinkDetails = linkEventDetails.filter(Boolean);
      const validSocialDetails = socialEventDetails.filter(Boolean);

      const clicksByUrl: Record<string, number> = {};
      validLinkDetails.forEach((detail) => {
        if (detail) {
          const url = detail.url;
          clicksByUrl[url] = (clicksByUrl[url] || 0) + 1;
        }
      });

      const clicksByPlatform: Record<string, number> = {};
      validSocialDetails.forEach((detail) => {
        if (detail) {
          const platform = detail.platform;
          clicksByPlatform[platform] = (clicksByPlatform[platform] || 0) + 1;
        }
      });

      const linkClicksFormatted = Object.entries(clicksByUrl).map(
        ([url, count]) => ({
          value: url,
          total: count,
        }),
      );

      const socialClicksFormatted = Object.entries(clicksByPlatform).map(
        ([platform, count]) => ({
          value: platform,
          total: count,
        }),
      );

      const bounceCount =
        typeof stats?.bounces === "number"
          ? stats.bounces
          : stats?.bounces?.value || 0;
      const visitCount =
        typeof stats?.visits === "number"
          ? stats.visits
          : stats?.visits?.value || 0;

      return {
        hasConfig: true,
        stats: {
          pageviews: { value: pageviewCount },
          visitors: { value: uniqueVisitors },
          visits: { value: visitCount },
          bounceRate: visitCount > 0 ? (bounceCount / visitCount) * 100 : 0,
        },
        linkClicks: linkClicksFormatted,
        socialClicks: socialClicksFormatted,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to fetch analytics",
        hasConfig: true,
      };
    }
  });

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
  validateSearch: (search: Record<string, unknown>): AnalyticsSearch =>
    analyticsSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search } }) => await getAnalytics({ data: search }),
});

function AnalyticsPage() {
  const data = Route.useLoaderData();

  if (!data.hasConfig) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              Analytics not configured
            </h3>
            <p className="text-muted-foreground mb-4">
              To enable analytics, add your Umami configuration to the{" "}
              <code className="bg-muted px-2 py-1 rounded">.env</code> file:
            </p>
            <div className="bg-muted p-4 rounded-lg text-left text-sm font-mono">
              <div>VITE_UMAMI_WEBSITE_ID=your-website-id</div>
              <div>VITE_UMAMI_API_URL=https://your-umami-instance.com</div>
              <div>UMAMI_USERNAME=your-username</div>
              <div>UMAMI_PASSWORD=your-password</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <Card>
          <CardContent className="p-12 text-center text-destructive">
            {data.error}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <div className="flex items-center space-x-2">
          <DateRangeFilter />
        </div>
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total views</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats?.pageviews?.value}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique visitors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats?.visitors?.value}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats?.visits?.value}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats?.bounceRate?.toFixed(1) ?? "0.0"}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Link clicks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.linkClicks?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No link clicks recorded yet.
              </p>
            )}
            {data.linkClicks?.map((event: { value: string; total: number }) => (
              <div
                key={event.value}
                className="flex items-center justify-between"
              >
                <div className="text-sm font-medium">{event.value}</div>
                <div className="text-sm text-muted-foreground">
                  {event.total}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social clicks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.socialClicks?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No social clicks recorded yet.
              </p>
            )}
            {data.socialClicks?.map(
              (event: { value: string; total: number }) => (
                <div
                  key={event.value}
                  className="flex items-center justify-between"
                >
                  <div className="text-sm font-medium capitalize">
                    {event.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.total}
                  </div>
                </div>
              ),
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
