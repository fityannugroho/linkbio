import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { PublicProfileView } from "@/components/PublicProfileView";
import { Button } from "@/components/ui/button";
import { getUmami } from "@/lib/umami";

const getPublicProfile = createServerFn({ method: "GET" }).handler(async () => {
  const { getProfileByUserId } = await import("@/data/profile");
  const { db } = await import("../db");
  const { links, user } = await import("../db/schema");
  const { eq, count } = await import("drizzle-orm");

  // Get first user
  const users = await db.select().from(user).limit(1);
  const firstUser = users[0];

  if (!firstUser) {
    const userCountResult = await db.select({ value: count() }).from(user);
    return {
      profile: null,
      links: [],
      userExists: userCountResult[0].value > 0,
    };
  }

  const userProfile = await getProfileByUserId(firstUser.id);
  const userLinks = await db
    .select()
    .from(links)
    .where(eq(links.userId, firstUser.id))
    .orderBy(links.order);

  return {
    profile: userProfile,
    links: userLinks.filter((link) => link.isVisible),
    userExists: true,
  };
});

export const Route = createFileRoute("/")({
  head: () => {
    return {
      meta: [
        {
          name: "description",
          content: "Links and social media profile",
        },
      ],
    };
  },
  component: App,
  loader: async () => await getPublicProfile(),
});

function App() {
  const { profile, links, userExists } = Route.useLoaderData();

  useEffect(() => {
    const umami = getUmami();
    umami?.track();
  }, []);

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-3xl font-bold">LinkBio</h1>
          <p className="mt-4 text-muted-foreground">
            {!userExists
              ? "Welcome! Start by setting up your admin account."
              : "Your profile is not yet configured. Please login to get started."}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {!userExists ? (
              <Button asChild className="w-full">
                <a href="/setup">🚀 Create Admin Account</a>
              </Button>
            ) : (
              <Button asChild className="w-full">
                <a href="/login">Login to Dashboard</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <PublicProfileView profile={profile} links={links} />;
}
