"use client";

import { useMemo } from "react";
import { AnalysisHistoryItem } from "@/types/analysis";

interface WalletHealthScoreProps {
  history: AnalysisHistoryItem[];
}

export function WalletHealthScore({ history }: WalletHealthScoreProps) {
  const healthMetrics = useMemo(() => {
    if (history.length === 0) {
      return {
        score: 100,
        grade: "A",
        description: "Sem analises. Sua carteira esta limpa.",
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        unlimitedApprovals: 0,
        uniqueContracts: 0,
        riskExposure: 0,
      };
    }

    const criticalCount = history.filter((h) => h.riskLevel === "CRITICAL").length;
    const highCount = history.filter((h) => h.riskLevel === "HIGH").length;
    const mediumCount = history.filter((h) => h.riskLevel === "MEDIUM").length;
    const lowCount = history.filter((h) => h.riskLevel === "LOW").length;
    const unlimitedApprovals = history.filter(
      (h) => h.submittedData.unlimitedApproval
    ).length;

    const uniqueContracts = new Set(
      history.map((h) => h.submittedData.contractAddress.toLowerCase())
    ).size;

    // Calcular score de saude (0-100, onde 100 = perfeito)
    // Penalizacoes:
    // - CRITICAL: -20 por ocorrencia
    // - HIGH: -10 por ocorrencia
    // - MEDIUM: -3 por ocorrencia
    // - Unlimited approval: -5 por ocorrencia
    let healthScore = 100;
    healthScore -= criticalCount * 20;
    healthScore -= highCount * 10;
    healthScore -= mediumCount * 3;
    healthScore -= unlimitedApprovals * 5;

    // Bonus por analises de baixo risco
    healthScore += lowCount * 2;

    // Limitar entre 0-100
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Calcular exposicao de risco (% de analises de alto risco)
    const riskExposure = Math.round(
      ((criticalCount + highCount) / history.length) * 100
    );

    // Determinar nota
    let grade: string;
    let description: string;

    if (healthScore >= 90) {
      grade = "A";
      description = "Excelente! Sua carteira tem baixa exposicao a riscos.";
    } else if (healthScore >= 75) {
      grade = "B";
      description = "Boa saude. Algumas transacoes merecem atencao.";
    } else if (healthScore >= 50) {
      grade = "C";
      description = "Atencao recomendada. Exposicao moderada a riscos.";
    } else if (healthScore >= 25) {
      grade = "D";
      description = "Cuidado! Alta exposicao a contratos de risco.";
    } else {
      grade = "F";
      description = "Critico! Revise urgentemente suas aprovacoes.";
    }

    return {
      score: healthScore,
      grade,
      description,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      unlimitedApprovals,
      uniqueContracts,
      riskExposure,
    };
  }, [history]);

  const gradeColor = {
    A: "text-emerald-400",
    B: "text-teal-400",
    C: "text-amber-400",
    D: "text-orange-400",
    F: "text-rose-400",
  }[healthMetrics.grade];

  const gradeBg = {
    A: "bg-emerald-500/20 border-emerald-500/30",
    B: "bg-teal-500/20 border-teal-500/30",
    C: "bg-amber-500/20 border-amber-500/30",
    D: "bg-orange-500/20 border-orange-500/30",
    F: "bg-rose-500/20 border-rose-500/30",
  }[healthMetrics.grade];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
        Saude da Carteira
      </h3>

      <div className="mt-4 flex items-center gap-6">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-2xl border ${gradeBg}`}
        >
          <span className={`text-4xl font-black ${gradeColor}`}>
            {healthMetrics.grade}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {healthMetrics.score}
            </span>
            <span className="text-sm text-slate-400">/ 100</span>
          </div>
          <p className="mt-1 text-sm text-slate-300">{healthMetrics.description}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="text-xs text-slate-400">Exposicao de Risco</p>
          <p className="mt-1 text-lg font-bold text-white">
            {healthMetrics.riskExposure}%
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="text-xs text-slate-400">Contratos Unicos</p>
          <p className="mt-1 text-lg font-bold text-white">
            {healthMetrics.uniqueContracts}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="text-xs text-slate-400">Aprovacoes Ilimitadas</p>
          <p
            className={`mt-1 text-lg font-bold ${
              healthMetrics.unlimitedApprovals > 0
                ? "text-amber-400"
                : "text-white"
            }`}
          >
            {healthMetrics.unlimitedApprovals}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="text-xs text-slate-400">Total Analises</p>
          <p className="mt-1 text-lg font-bold text-white">{history.length}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="mb-2 text-xs font-medium text-slate-400">
          Distribuicao por nivel
        </p>
        <div className="flex gap-2">
          {healthMetrics.criticalCount > 0 && (
            <span className="rounded-full bg-rose-500/20 px-2 py-1 text-xs font-medium text-rose-300">
              {healthMetrics.criticalCount} critico
            </span>
          )}
          {healthMetrics.highCount > 0 && (
            <span className="rounded-full bg-orange-500/20 px-2 py-1 text-xs font-medium text-orange-300">
              {healthMetrics.highCount} alto
            </span>
          )}
          {healthMetrics.mediumCount > 0 && (
            <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300">
              {healthMetrics.mediumCount} medio
            </span>
          )}
          {healthMetrics.lowCount > 0 && (
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
              {healthMetrics.lowCount} baixo
            </span>
          )}
          {history.length === 0 && (
            <span className="rounded-full bg-slate-500/20 px-2 py-1 text-xs font-medium text-slate-300">
              sem analises
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
