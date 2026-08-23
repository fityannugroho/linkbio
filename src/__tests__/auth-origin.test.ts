import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { describe, expect, it, vi } from "vitest";
import { authBaseURL, trustedOrigins } from "@/lib/auth";

// Avoid constructing the real Postgres client when importing @/lib/auth.
vi.mock("@/db", () => ({ db: {}, schema: {} }));

vi.hoisted(() => {
  process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";
});

/**
 * Standalone instance reusing the REAL auth config (no drift).
 *
 * `disableOriginCheck: false` is required: better-auth silently skips the
 * origin check whenever it detects a test environment, which would make these
 * assertions pass vacuously.
 */
const testAuth = betterAuth({
  baseURL: authBaseURL,
  trustedOrigins,
  database: memoryAdapter({
    user: [],
    session: [],
    account: [],
    verification: [],
  }),
  emailAndPassword: { enabled: true },
  advanced: { disableOriginCheck: false },
});

async function signInWithOrigin(origin: string): Promise<Response> {
  return testAuth.handler(
    new Request(`${authBaseURL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin,
      },
      body: JSON.stringify({ email: "admin@example.com", password: "wrong" }),
    }),
  );
}

describe("better-auth origin configuration", () => {
  it("trusts the local dev origin and the production origin", () => {
    expect(trustedOrigins).toContain("http://localhost:3000");
    expect(trustedOrigins).toContain("https://link.fityan.tech");
  });

  it("accepts sign-in from the production origin behind a proxy", async () => {
    const response = await signInWithOrigin("https://link.fityan.tech");
    const body = await response.text();
    // Origin check passed -> request proceeds to credential validation.
    expect(response.status).not.toBe(403);
    expect(body).not.toContain("Invalid origin");
  });

  it("accepts sign-in from the local dev origin", async () => {
    const response = await signInWithOrigin("http://localhost:3000");
    const body = await response.text();
    expect(response.status).not.toBe(403);
    expect(body).not.toContain("Invalid origin");
  });

  it("still rejects untrusted origins", async () => {
    const response = await signInWithOrigin("https://evil.example.com");
    const body = await response.text();
    expect(response.status).toBe(403);
    expect(body).toContain("Invalid origin");
  });
});
