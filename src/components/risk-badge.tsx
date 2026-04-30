import { RiskLevel } from "@/types/analysis";

const stylesByRisk: Record<RiskLevel, string> = {
  LOW: "bg-emerald-400/15 text-emerald-100 border-emerald-300/35",
  MEDIUM: "bg-amber-400/15 text-amber-100 border-amber-300/35",
  HIGH: "bg-orange-400/15 text-orange-100 border-orange-300/35",
  CRITICAL: "bg-rose-400/15 text-rose-100 border-rose-300/40",
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${stylesByRisk[risk]}`}>
      {risk}
    </span>
  );
}
