"use client";

interface LocalUserRecord {
  email: string;
  passwordHash: string;
  createdAt: string;
}

type LocalAuthResult = { ok: true } | { ok: false; error: string };

const USERS_STORAGE_KEY = "cryptosafe_users";
const SESSION_COOKIE = "cryptosafe_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readUsers(): LocalUserRecord[] {
  const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as LocalUserRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: LocalUserRecord[]) {
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const hash = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function setSessionCookie(email: string) {
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(
    email,
  )}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`;
}

export async function registerLocalUser(email: string, password: string): Promise<LocalAuthResult> {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password.trim()) {
    return { ok: false, error: "Email e senha sao obrigatorios." };
  }

  const users = readUsers();
  const exists = users.some((user) => user.email === normalizedEmail);
  if (exists) {
    return { ok: false, error: "Usuario ja cadastrado neste navegador." };
  }

  users.push({
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  });

  writeUsers(users);
  setSessionCookie(normalizedEmail);
  return { ok: true };
}

export async function loginLocalUser(email: string, password: string): Promise<LocalAuthResult> {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password.trim()) {
    return { ok: false, error: "Email e senha sao obrigatorios." };
  }

  const users = readUsers();
  const user = users.find((record) => record.email === normalizedEmail);
  if (!user) {
    return { ok: false, error: "Usuario nao encontrado neste navegador." };
  }

  if (user.passwordHash !== (await hashPassword(password))) {
    return { ok: false, error: "Senha invalida." };
  }

  setSessionCookie(normalizedEmail);
  return { ok: true };
}
