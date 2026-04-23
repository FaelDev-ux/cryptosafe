import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

interface UserRecord {
  email: string;
  passwordHash: string;
  createdAt: string;
}

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
  await ensureUsersFile();
  const content = await fs.readFile(USERS_FILE, "utf8");
  const parsed = JSON.parse(content) as UserRecord[];
  return Array.isArray(parsed) ? parsed : [];
}

async function writeUsers(users: UserRecord[]) {
  await ensureUsersFile();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export async function registerUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();
  const exists = users.some((user) => user.email === normalizedEmail);
  if (exists) {
    return { ok: false, error: "Usuario ja cadastrado." };
  }

  users.push({
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  });

  await writeUsers(users);
  return { ok: true };
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();
  const user = users.find((record) => record.email === normalizedEmail);
  if (!user) {
    return { ok: false, error: "Usuario nao encontrado." };
  }

  if (user.passwordHash !== hashPassword(password)) {
    return { ok: false, error: "Senha invalida." };
  }

  return { ok: true };
}
