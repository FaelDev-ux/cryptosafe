import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Login local ativo. Use a tela de login para validar o usuario salvo no localStorage do navegador.",
    },
    { status: 410 },
  );
}
