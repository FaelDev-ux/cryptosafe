import { UserRecord } from "@/lib/auth";

export const USERS_COOKIE = "cryptosafe_users";

export const usersCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

function isUserRecord(value: unknown): value is UserRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<UserRecord>;
  return (
    typeof record.email === "string" &&
    typeof record.passwordHash === "string" &&
    typeof record.createdAt === "string"
  );
}

export function readUsersCookie(value?: string): UserRecord[] {
  if (!value) return [];

  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isUserRecord) : [];
  } catch {
    return [];
  }
}

export function createUsersCookieValue(users: UserRecord[]) {
  const uniqueUsers = new Map<string, UserRecord>();

  for (const user of users) {
    uniqueUsers.set(user.email, user);
  }

  return Buffer.from(JSON.stringify(Array.from(uniqueUsers.values())), "utf8").toString(
    "base64url",
  );
}
