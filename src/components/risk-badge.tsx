import { RiskLevel } from "@/types/analysis";

const stylesByRisk: Record<RiskLevel, string> = {
  LOW: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
  MEDIUM: "bg-amber-500/20 text-amber-200 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
  HIGH: "bg-orange-500/20 text-orange-200 border-orange-400/40 shadow-[0_0_20px_rgba(249,115,22,0.2)]",
  CRITICAL: "bg-rose-500/20 text-rose-100 border-rose-400/50 shadow-[0_0_22px_rgba(244,63,94,0.25)]",
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${stylesByRisk[risk]}`}>
      {risk}
    </span>
  );
}
