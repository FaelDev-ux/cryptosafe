"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { AnalysisResultCard } from "@/components/analysis-result-card";
import { AppShell } from "@/components/app-shell";
import { getHistory } from "@/lib/history";

export default function AnalysisDetailsPage() {
  const params = useParams<{ id: string }>();

  const item = useMemo(() => {
    const history = getHistory();
    return history.find((entry) => entry.id === params.id);
  }, [params.id]);

  return (
    <AppShell
      title="Detalhes da analise"
      description="Revise o score, os motivos tecnicos e os sinais on-chain salvos no historico."
    >
      {item ? (
        <AnalysisResultCard result={item} />
      ) : (
        <div className="app-panel rounded-3xl p-5 text-sm text-slate-300">
          Analise nao encontrada no armazenamento local.{" "}
          <Link href="/history" className="font-semibold text-teal-200 hover:underline">
            Voltar ao historico
          </Link>
          .
        </div>
      )}
    </AppShell>
  );
}
