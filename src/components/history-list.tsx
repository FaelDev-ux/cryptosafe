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
      <div className="app-panel rounded-3xl p-6 text-sm text-slate-300">
        Nenhuma analise encontrada com os filtros atuais.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="app-panel flex flex-col gap-3 rounded-3xl p-4 md:flex-row md:items-center md:justify-between"
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
              className="rounded-xl border border-teal-300/30 px-3 py-1.5 text-xs font-semibold text-teal-100 transition hover:bg-teal-300/10"
            >
              Ver detalhes
            </Link>
            <button
              onClick={() => onDelete(item.id)}
              className="rounded-xl border border-rose-300/30 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/10"
            >
              Excluir
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
