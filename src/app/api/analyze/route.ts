import { NextRequest, NextResponse } from "next/server";
import { analyzeTransaction, validateAnalysisInput } from "@/lib/risk-analysis";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const validation = validateAnalysisInput(payload);

    if (!validation.data) {
      return NextResponse.json(
        {
          error: "Dados invalidos para analise.",
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    const result = await analyzeTransaction(validation.data);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel processar a requisicao." },
      { status: 400 },
    );
  }
}
