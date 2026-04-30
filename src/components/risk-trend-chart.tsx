"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalysisHistoryItem } from "@/types/analysis";

interface RiskTrendChartProps {
  history: AnalysisHistoryItem[];
}

export function RiskTrendChart({ history }: RiskTrendChartProps) {
  const chartData = useMemo(() => {
    if (history.length === 0) return [];

    // Pegar as ultimas 20 analises e inverter para ordem cronologica
    const recentHistory = history.slice(0, 20).reverse();

    return recentHistory.map((item, index) => {
      const date = new Date(item.createdAt);
      return {
        index: index + 1,
        score: item.riskScore,
        label: date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        token: item.submittedData.tokenName,
        riskLevel: item.riskLevel,
      };
    });
  }, [history]);

  const averageScore = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.round(
      chartData.reduce((acc, item) => acc + item.score, 0) / chartData.length
    );
  }, [chartData]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return "stable";
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));

    const firstAvg =
      firstHalf.reduce((acc, item) => acc + item.score, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((acc, item) => acc + item.score, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 5) return "increasing";
    if (secondAvg < firstAvg - 5) return "decreasing";
    return "stable";
  }, [chartData]);

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
          Tendencia de Risco
        </h3>
        <p className="mt-4 text-center text-sm text-slate-400">
          Sem dados suficientes para exibir a tendencia.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
            Tendencia de Risco
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Ultimas {chartData.length} analises
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white">{averageScore}</p>
          <p className="text-xs text-slate-400">media</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        {trend === "increasing" && (
          <span className="flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-1 text-xs font-medium text-rose-300">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            Risco aumentando
          </span>
        )}
        {trend === "decreasing" && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            Risco diminuindo
          </span>
        )}
        {trend === "stable" && (
          <span className="flex items-center gap-1 rounded-full bg-slate-500/20 px-2 py-1 text-xs font-medium text-slate-300">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14"
              />
            </svg>
            Risco estavel
          </span>
        )}
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10 }}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value: number, _name: string, props) => {
                const payload = props.payload as (typeof chartData)[0];
                return [
                  <span key="value">
                    Score: <strong>{value}</strong> ({payload.riskLevel})
                    <br />
                    Token: {payload.token}
                  </span>,
                ];
              }}
              labelFormatter={() => ""}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#14b8a6"
              strokeWidth={2}
              fill="url(#riskGradient)"
              dot={{ fill: "#14b8a6", strokeWidth: 0, r: 3 }}
              activeDot={{ fill: "#14b8a6", strokeWidth: 2, stroke: "#fff", r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Baixo (0-30)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Medio (31-60)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Alto (61-100)
          </span>
        </div>
      </div>
    </div>
  );
}
