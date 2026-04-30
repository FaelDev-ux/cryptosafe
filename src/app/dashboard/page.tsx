"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { getHistory } from "@/lib/history";
import { RiskTrendChart } from "@/components/risk-trend-chart";
import { WalletHealthScore } from "@/components/wallet-health-score";
import { NotificationCenter } from "@/components/notification-center";
import { WhatsNewPopup } from "@/components/whats-new-popup";

export default function DashboardPage() {
  const history = useMemo(() => getHistory(), []);

  const metrics = useMemo(() => {
    const total = history.length;
    const critical = history.filter((item) => item.riskLevel === "CRITICAL").length;
    const high = history.filter((item) => item.riskLevel === "HIGH").length;
    const avgScore =
      total === 0
        ? 0
        : Math.round(history.reduce((acc, item) => acc + item.riskScore, 0) / total);
    return { total, critical, high, avgScore };
  }, [history]);

  return (
    <AppShell
      title="Painel de risco"
      description="Acompanhe suas analises salvas e identifique rapidamente transacoes que merecem atencao."
    >
      <WhatsNewPopup />

      <section className="mb-6">
        <NotificationCenter history={history} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="app-panel rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Total</p>
          <p className="mt-3 text-4xl font-black text-white">{metrics.total}</p>
          <p className="mt-2 text-sm text-slate-400">analises salvas</p>
        </article>
        <article className="app-panel rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Critico</p>
          <p className="mt-3 text-4xl font-black text-rose-200">{metrics.critical}</p>
          <p className="mt-2 text-sm text-slate-400">bloqueio recomendado</p>
        </article>
        <article className="app-panel rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Alto</p>
          <p className="mt-3 text-4xl font-black text-orange-200">{metrics.high}</p>
          <p className="mt-2 text-sm text-slate-400">revisao manual</p>
        </article>
        <article className="app-panel rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Media</p>
          <p className="mt-3 text-4xl font-black text-teal-200">{metrics.avgScore}</p>
          <p className="mt-2 text-sm text-slate-400">score de risco</p>
        </article>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <RiskTrendChart history={history} />
        <WalletHealthScore history={history} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="app-panel rounded-3xl p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200/80">
            Proxima acao
          </p>
          <h2 className="mt-3 text-2xl font-black text-white">
            {metrics.total === 0 ? "Comece com uma analise" : "Revise seus resultados"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            {metrics.total === 0
              ? "Envie contrato, token, valor e tipo de acao para receber um score com motivos tecnicos."
              : "Abra o historico para comparar riscos, filtrar casos criticos e exportar seus registros."}
          </p>
          <Link
            href={metrics.total === 0 ? "/analyze" : "/history"}
            className="primary-button mt-5 inline-flex px-5 py-3 text-sm"
          >
            {metrics.total === 0 ? "Fazer primeira analise" : "Abrir historico"}
          </Link>
        </div>

        <div className="app-panel rounded-3xl p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Status</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>Armazenamento</span>
              <span className="font-semibold text-teal-200">local</span>
            </p>
            <p className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>Modelo de risco</span>
              <span className="font-semibold text-teal-200">ativo</span>
            </p>
            <p className="flex items-center justify-between">
              <span>API on-chain</span>
              <span className="font-semibold text-teal-200">online</span>
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
