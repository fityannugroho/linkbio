import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/authClient";

export const Route = createFileRoute("/setup")({
  beforeLoad: async () => {
    const { hasUser, isLoggedIn } = await getSetupState();
    if (isLoggedIn) {
      throw redirect({ to: "/dashboard" });
    }
    if (hasUser) {
      throw redirect({ to: "/login" });
    }
  },
  component: SetupPage,
});

const getSetupState = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  });
  const userCountResult = await db
    .select({ value: user.id })
    .from(user)
    .limit(1);

  return {
    hasUser: userCountResult.length > 0,
    isLoggedIn: Boolean(session),
  };
});

const createInitialProfile = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const { db } = await import("@/db");
    const { profile } = await import("@/db/schema");
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({
      headers: getRequestHeaders(),
    });

    if (!session) throw new Error("Unauthorized");

    await db.insert(profile).values({
      userId: session.user.id,
      displayName: data.name,
      username: data.name.toLowerCase().replace(/\s+/g, "-"),
      bio: "Welcome to my LinkBio!",
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Setup admin</CardTitle>
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
                placeholder="Your name"
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
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
