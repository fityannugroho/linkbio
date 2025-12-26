import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export const getSessionOrThrow = async () => {
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  });
  if (!session) throw new Error("Unauthorized");
  return session;
};
