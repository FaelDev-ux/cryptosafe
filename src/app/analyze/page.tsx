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
      title="Analise de transações"
      description="Analise suas transações cripto e pare de correr riscos."
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
                  className="inline-flex rounded-lg border border-cyan-500/40 px-3 py-2 text-sm text-cyan-100 transition hover:bg-cyan-500/10"
                >
                  Abrir detalhes desta analise
                </Link>
              ) : null}
            </>
          ) : (
            <div className="premium-card rounded-2xl p-6 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Live Response</p>
              <p className="mt-2">
                A resposta da API aparecera aqui apos o envio do formulario, com score, motivos e recomendacao.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
