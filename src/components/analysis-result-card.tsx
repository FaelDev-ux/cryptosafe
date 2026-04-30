import { AnalyzeTransactionResponse } from "@/types/analysis";
import { RiskBadge } from "@/components/risk-badge";
import { ContractRiskHeatmap } from "@/components/contract-risk-heatmap";

export function AnalysisResultCard({ result }: { result: AnalyzeTransactionResponse }) {
  const technicalDetails = result.technicalDetails ?? [];
  const onChainSignals = result.onChainSignals ?? {
    contractDeployed: null,
    dexPairCount: null,
    totalLiquidityUsd: null,
    sources: [],
  };

  return (
    <section className="app-panel rounded-3xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-white">Resultado da analise</h2>
        <RiskBadge risk={result.riskLevel} />
      </div>

      <div className="mb-4 rounded-2xl border border-teal-300/20 bg-teal-300/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-100/80">Risk Score</p>
        <p className="mt-1 text-4xl font-black text-white">{result.riskScore}/100</p>
      </div>

      <div className="mb-4">
        <ContractRiskHeatmap result={result} />
      </div>

      <div className="grid gap-3 text-sm text-slate-200 md:grid-cols-2">
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <span className="text-slate-400">Token:</span> {result.submittedData.tokenName}
        </p>
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <span className="text-slate-400">Acao:</span> {result.submittedData.actionType}
        </p>
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <span className="text-slate-400">Valor:</span> {result.submittedData.amount}
        </p>
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:col-span-2">
          <span className="text-slate-400">Contrato:</span> {result.submittedData.contractAddress}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-slate-100">Recomendacao:</span> {result.recommendation}
        </p>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-200">Motivos</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          {result.reasons.map((reason) => (
            <li key={reason} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <h3 className="mb-2 text-sm font-semibold text-slate-200">Detalhe tecnico de risco</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          {technicalDetails.map((factor) => (
            <li key={`${factor.label}-${factor.description}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="font-medium text-slate-100">
                {factor.label} ({factor.weight > 0 ? "+" : ""}
                {factor.weight})
              </p>
              <p className="mt-1 text-xs text-slate-400">{factor.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <h3 className="text-sm font-semibold text-slate-100">Sinais on-chain em tempo real</h3>
        <div className="mt-2 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
          <p>
            <span className="text-slate-400">Contrato implantado:</span>{" "}
            {onChainSignals.contractDeployed === null
              ? "desconhecido"
              : onChainSignals.contractDeployed
                ? "sim"
                : "nao"}
          </p>
          <p>
            <span className="text-slate-400">Pares em DEX:</span>{" "}
            {onChainSignals.dexPairCount ?? "desconhecido"}
          </p>
          <p>
            <span className="text-slate-400">Liquidez total (USD):</span>{" "}
            {onChainSignals.totalLiquidityUsd ?? "desconhecido"}
          </p>
          <p>
            <span className="text-slate-400">Fontes:</span>{" "}
            {onChainSignals.sources.length > 0
              ? onChainSignals.sources.join(", ")
              : "indisponiveis"}
          </p>
        </div>
      </div>
    </section>
  );
}
