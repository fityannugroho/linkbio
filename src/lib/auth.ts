import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { count } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
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
