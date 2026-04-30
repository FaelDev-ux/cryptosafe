import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";
import { readUsersCookie, USERS_COOKIE } from "@/lib/auth-cookies";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as { email?: string; password?: string };
    const email = (payload.email ?? "").trim();
    const password = (payload.password ?? "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha sao obrigatorios." },
        { status: 400 },
      );
    }

    const cookieUsers = readUsersCookie(request.cookies.get(USERS_COOKIE)?.value);
    const result = await loginUser(email, password, cookieUsers);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("cryptosafe_session", email.toLowerCase(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Falha ao efetuar login." }, { status: 400 });
  }
}
