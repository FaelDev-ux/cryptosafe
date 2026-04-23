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
      title="Analysis Details"
      description="Detalhes completos de uma analise salva no historico."
    >
      {item ? (
        <AnalysisResultCard result={item} />
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-300">
          Analise nao encontrada no armazenamento local.{" "}
          <Link href="/history" className="text-cyan-300 hover:underline">
            Voltar ao historico
          </Link>
          .
        </div>
      )}
    </AppShell>
  );
}
