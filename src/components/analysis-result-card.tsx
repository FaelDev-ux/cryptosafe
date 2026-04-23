import { AnalyzeTransactionResponse } from "@/types/analysis";
import { RiskBadge } from "@/components/risk-badge";

export function AnalysisResultCard({ result }: { result: AnalyzeTransactionResponse }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Resultado da Analise</h2>
        <RiskBadge risk={result.riskLevel} />
      </div>

      <div className="grid gap-3 text-sm text-slate-200 md:grid-cols-2">
        <p>
          <span className="text-slate-400">Risk score:</span> {result.riskScore}/100
        </p>
        <p>
          <span className="text-slate-400">Token:</span> {result.submittedData.tokenName}
        </p>
        <p>
          <span className="text-slate-400">Acao:</span> {result.submittedData.actionType}
        </p>
        <p>
          <span className="text-slate-400">Valor:</span> {result.submittedData.amount}
        </p>
        <p className="md:col-span-2">
          <span className="text-slate-400">Contrato:</span> {result.submittedData.contractAddress}
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/70 p-4">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-slate-100">Recomendacao:</span> {result.recommendation}
        </p>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-200">Motivos</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          {result.reasons.map((reason) => (
            <li key={reason} className="rounded-md border border-slate-800 bg-slate-950/50 p-2">
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
