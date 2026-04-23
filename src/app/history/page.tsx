"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { HistoryList } from "@/components/history-list";
import {
  clearHistory,
  deleteHistoryItem,
  exportHistoryAsCsv,
  exportHistoryAsJson,
  getHistory,
} from "@/lib/history";
import { RiskLevel } from "@/types/analysis";

const riskOptions: Array<RiskLevel | "ALL"> = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function HistoryPage() {
  const [history, setHistory] = useState<ReturnType<typeof getHistory>>(() => getHistory());
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "ALL">("ALL");

  function triggerDownload(filename: string, content: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const filtered = useMemo(
    () =>
      history.filter((item) => {
        const matchRisk = riskFilter === "ALL" || item.riskLevel === riskFilter;
        const term = search.toLowerCase().trim();
        const matchSearch =
          !term ||
          item.submittedData.contractAddress.toLowerCase().includes(term) ||
          item.submittedData.tokenName.toLowerCase().includes(term) ||
          item.submittedData.actionType.toLowerCase().includes(term);
        return matchRisk && matchSearch;
      }),
    [history, riskFilter, search],
  );

  return (
    <AppShell
      title="Analysis History"
      description="Busque, filtre e gerencie as analises armazenadas no localStorage."
    >
      <section className="premium-card mb-4 grid gap-3 rounded-2xl p-4 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por contrato, token ou acao"
          className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
        />
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "ALL")}
          className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
        >
          {riskOptions.map((risk) => (
            <option key={risk} value={risk}>
              {risk}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            clearHistory();
            setHistory([]);
          }}
          className="rounded-lg border border-rose-500/30 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/10"
        >
          Limpar tudo
        </button>
        <button
          onClick={() =>
            triggerDownload(
              "cryptosafe-history.json",
              exportHistoryAsJson(filtered),
              "application/json;charset=utf-8",
            )
          }
          className="rounded-lg border border-cyan-500/30 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/10"
        >
          Exportar JSON
        </button>
        <button
          onClick={() =>
            triggerDownload(
              "cryptosafe-history.csv",
              exportHistoryAsCsv(filtered),
              "text/csv;charset=utf-8",
            )
          }
          className="rounded-lg border border-indigo-500/30 px-3 py-2 text-sm text-indigo-200 transition hover:bg-indigo-500/10"
        >
          Exportar CSV
        </button>
      </section>

      <HistoryList
        items={filtered}
        onDelete={(id) => {
          deleteHistoryItem(id);
          setHistory((prev) => prev.filter((item) => item.id !== id));
        }}
      />
    </AppShell>
  );
}
