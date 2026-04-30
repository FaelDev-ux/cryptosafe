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
      title="Historico de analises"
      description="Busque, filtre, exporte e revise as transacoes que voce ja avaliou."
    >
      <section className="app-panel mb-4 grid gap-3 rounded-3xl p-4 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por contrato, token ou acao"
          className="field text-sm"
        />
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "ALL")}
          className="field text-sm"
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
          className="rounded-xl border border-rose-300/30 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/10"
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
          className="rounded-xl border border-teal-300/30 px-3 py-2 text-sm font-semibold text-teal-100 transition hover:bg-teal-300/10"
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
          className="rounded-xl border border-slate-300/20 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
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
