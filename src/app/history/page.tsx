"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { HistoryList } from "@/components/history-list";
import { clearHistory, deleteHistoryItem, getHistory } from "@/lib/history";
import { RiskLevel } from "@/types/analysis";

const riskOptions: Array<RiskLevel | "ALL"> = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function HistoryPage() {
  const [history, setHistory] = useState<ReturnType<typeof getHistory>>(() => getHistory());
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "ALL">("ALL");

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
      <section className="mb-4 grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-[1fr_auto_auto]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por contrato, token ou acao"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
        />
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "ALL")}
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
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
          className="rounded-md border border-rose-500/30 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/10"
        >
          Limpar tudo
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
