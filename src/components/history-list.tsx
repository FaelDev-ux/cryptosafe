"use client";

import Link from "next/link";
import { AnalysisHistoryItem, RiskLevel } from "@/types/analysis";
import { RiskBadge } from "@/components/risk-badge";

export function HistoryList({
  items,
  onDelete,
}: {
  items: AnalysisHistoryItem[];
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-300">
        Nenhuma analise encontrada com os filtros atuais.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <RiskBadge risk={item.riskLevel as RiskLevel} />
              <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm text-slate-200">
              {item.submittedData.actionType} de {item.submittedData.amount} {item.submittedData.tokenName}
            </p>
            <p className="text-xs text-slate-400">{item.submittedData.contractAddress}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/analysis/${item.id}`}
              className="rounded-md border border-cyan-500/40 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/10"
            >
              Ver detalhes
            </Link>
            <button
              onClick={() => onDelete(item.id)}
              className="rounded-md border border-rose-500/30 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-500/10"
            >
              Excluir
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
