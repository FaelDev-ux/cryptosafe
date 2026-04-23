"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AnalysisResultCard } from "@/components/analysis-result-card";
import { TransactionForm } from "@/components/transaction-form";
import { saveAnalysis } from "@/lib/history";
import { AnalyzeTransactionResponse } from "@/types/analysis";

export default function AnalyzePage() {
  const [result, setResult] = useState<AnalyzeTransactionResponse | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  function handleSuccess(response: AnalyzeTransactionResponse) {
    const item = saveAnalysis(response);
    setSavedId(item.id);
    setResult(response);
  }

  return (
    <AppShell
      title="Analyze Transaction"
      description="Envie uma transacao para o endpoint interno POST /api/analyze e visualize o retorno real da API."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <TransactionForm onSuccess={handleSuccess} />

        <div className="space-y-4">
          {result ? (
            <>
              <AnalysisResultCard result={result} />
              {savedId ? (
                <Link
                  href={`/analysis/${savedId}`}
                  className="inline-flex rounded-md border border-cyan-500/40 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/10"
                >
                  Abrir detalhes desta analise
                </Link>
              ) : null}
            </>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-300">
              A resposta da API aparecera aqui apos o envio do formulario.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
