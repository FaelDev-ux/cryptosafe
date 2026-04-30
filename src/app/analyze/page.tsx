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
      title="Analise de transacoes"
      description="Cheque contrato, permissao, valor e liquidez antes de assinar qualquer operacao."
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
                  className="inline-flex rounded-xl border border-teal-300/30 px-4 py-2 text-sm font-semibold text-teal-100 transition hover:bg-teal-300/10"
                >
                  Abrir detalhes desta analise
                </Link>
              ) : null}
            </>
          ) : (
            <div className="app-panel rounded-3xl p-6 text-sm text-slate-300">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200/80">
                Resposta
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">Aguardando transacao</h2>
              <p className="mt-3 leading-6">
                O resultado aparecera aqui com score, motivos, recomendacao e sinais on-chain
                encontrados em tempo real.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {["Score", "Motivos", "Sinais"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-bold text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
