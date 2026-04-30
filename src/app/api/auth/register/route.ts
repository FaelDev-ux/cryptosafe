import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Cadastro local ativo. Use a tela de cadastro para salvar o usuario no localStorage do navegador.",
    },
    { status: 410 },
  );
}
