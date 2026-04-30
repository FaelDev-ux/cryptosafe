import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export interface UserRecord {
  email: string;
  passwordHash: string;
  createdAt: string;
}

type RegisterUserResult =
  | { ok: true; user: UserRecord }
  | { ok: false; error: string };

type LoginUserResult = { ok: true } | { ok: false; error: string };

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function ensureUsersFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, "[]", "utf8");
  }
}

async function readUsers(): Promise<UserRecord[]> {
  try {
    await ensureUsersFile();
    const content = await fs.readFile(USERS_FILE, "utf8");
    const parsed = JSON.parse(content) as UserRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: UserRecord[]) {
  try {
    await ensureUsersFile();
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function mergeUsers(...userLists: UserRecord[][]) {
  const usersByEmail = new Map<string, UserRecord>();
  for (const users of userLists) {
    for (const user of users) {
      usersByEmail.set(user.email, user);
    }
  }
  return Array.from(usersByEmail.values());
}

export async function registerUser(
  email: string,
  password: string,
  extraUsers: UserRecord[] = [],
): Promise<RegisterUserResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const storedUsers = await readUsers();
  const users = mergeUsers(storedUsers, extraUsers);
  const exists = users.some((user) => user.email === normalizedEmail);
  if (exists) {
    return { ok: false, error: "Usuario ja cadastrado." };
  }

  const user = {
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  await writeUsers([...storedUsers, user]);
  return { ok: true, user };
}

export async function loginUser(
  email: string,
  password: string,
  extraUsers: UserRecord[] = [],
): Promise<LoginUserResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = mergeUsers(await readUsers(), extraUsers);
  const user = users.find((record) => record.email === normalizedEmail);
  if (!user) {
    return { ok: false, error: "Usuario nao encontrado." };
  }

  if (user.passwordHash !== hashPassword(password)) {
    return { ok: false, error: "Senha invalida." };
  }

  return { ok: true };
}
