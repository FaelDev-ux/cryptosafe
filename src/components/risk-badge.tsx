import { RiskLevel } from "@/types/analysis";

const stylesByRisk: Record<RiskLevel, string> = {
  LOW: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  MEDIUM: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  HIGH: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  CRITICAL: "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${stylesByRisk[risk]}`}>
      {risk}
    </span>
  );
}
