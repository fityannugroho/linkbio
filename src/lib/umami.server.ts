type UmamiLoginResponse =
  | { token: string }
  | { accessToken: string }
  | { data: { token: string } }
  | { data: { accessToken: string } };

type UmamiDataShape = { token?: string; accessToken?: string };

let cachedToken: { value: string; expiresAt: number } | null = null;

function extractToken(response: UmamiLoginResponse): string | null {
  if ("token" in response && typeof response.token === "string")
    return response.token;
  if ("accessToken" in response && typeof response.accessToken === "string")
    return response.accessToken;
  if (
    "data" in response &&
    response.data &&
    typeof response.data === "object"
  ) {
    const data = response.data as UmamiDataShape;
    if (typeof data.token === "string") return data.token;
    if (typeof data.accessToken === "string") return data.accessToken;
  }
  return null;
}

export async function getUmamiToken(apiUrl: string): Promise<string | null> {
  const envToken = process.env.UMAMI_API_TOKEN;
  if (envToken) return envToken;

  const username = process.env.UMAMI_USERNAME;
  const password = process.env.UMAMI_PASSWORD;
  if (!username || !password) return null;

  if (cachedToken && Date.now() < cachedToken.expiresAt)
    return cachedToken.value;

  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(
      `Umami login failed: ${response.status} ${response.statusText}`,
    );
  }

  const json = (await response.json()) as UmamiLoginResponse;
  const token = extractToken(json);
  if (!token)
    throw new Error("Umami login failed: token not found in response");

  cachedToken = { value: token, expiresAt: Date.now() + 55 * 60 * 1000 };
  return token;
}
