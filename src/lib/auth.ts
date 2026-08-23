import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { count } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";

// Origins allowed to call the auth API. The public production origin must be
// listed explicitly: behind a reverse proxy the origin better-auth infers from
// the incoming request (proxy-internal host) differs from the browser's
// `Origin` header, which otherwise causes 403 "Invalid origin" on sign-in.
export const trustedOrigins = [
  "http://localhost:3000",
  "https://link.fityan.tech",
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
        .map((o) => o.trim())
        .filter(Boolean)
    : []),
];

// Canonical public base URL, used for origin validation, redirects and Secure
// cookies. Override via env for other deployments.
export const authBaseURL =
  process.env.BETTER_AUTH_URL ?? "https://link.fityan.tech";

export const auth = betterAuth({
  baseURL: authBaseURL,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async () => {
          const [result] = await db
            .select({ value: count() })
            .from(schema.user);
          if (result.value > 0) {
            throw new APIError("BAD_REQUEST", {
              message:
                "Registration is disabled. Only one admin account is allowed.",
            });
          }
        },
      },
    },
  },
  plugins: [tanstackStartCookies()],
});
