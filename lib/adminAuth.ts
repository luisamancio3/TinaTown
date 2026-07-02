import { NextRequest } from "next/server";

/** Admin secret; in local dev defaults to "dev" so the admin flow is testable. */
export function getAdminSecret(): string | undefined {
  if (process.env.ADMIN_SECRET) return process.env.ADMIN_SECRET;
  if (process.env.NODE_ENV !== "production") return "dev";
  return undefined;
}

export function isAuthorized(req: NextRequest): boolean {
  const secret = getAdminSecret();
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
