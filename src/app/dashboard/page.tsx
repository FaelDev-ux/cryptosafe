"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { getHistory } from "@/lib/history";

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
      title="Dashboard"
      description="Visao geral das analises salvas localmente para acompanhamento rapido."
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="premium-card rounded-2xl p-5">
          <p className="text-sm text-slate-300">Total de analises</p>
          <p className="mt-2 text-3xl font-semibold text-white">{metrics.total}</p>
        </article>
        <article className="premium-card rounded-2xl p-5">
          <p className="text-sm text-slate-300">Casos CRITICAL</p>
          <p className="mt-2 text-3xl font-semibold text-rose-300">{metrics.critical}</p>
        </article>
        <article className="premium-card rounded-2xl p-5">
          <p className="text-sm text-slate-300">Casos HIGH</p>
          <p className="mt-2 text-3xl font-semibold text-orange-300">{metrics.high}</p>
        </article>
        <article className="premium-card rounded-2xl p-5">
          <p className="text-sm text-slate-300">Score medio</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-300">{metrics.avgScore}</p>
        </article>
      </section>

      <section className="premium-card mt-6 rounded-2xl p-5 text-sm text-slate-300">
        {metrics.total === 0 ? (
          <>
            Ainda nao ha analises no historico.{" "}
            <Link href="/analyze" className="text-cyan-300 hover:underline">
              Fazer primeira analise
            </Link>
            .
          </>
        ) : (
          <>
            Voce pode revisar resultados detalhados em{" "}
            <Link href="/history" className="text-cyan-300 hover:underline">
              History
            </Link>
            .
          </>
        )}
      </section>
    </AppShell>
  );
}
