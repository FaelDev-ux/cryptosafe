import { AnalyzeTransactionResponse } from "@/types/analysis";

type HeatmapLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "UNKNOWN";

interface HeatmapCategory {
  name: string;
  level: HeatmapLevel;
  description: string;
  source?: string;
}

function getLevelColor(level: HeatmapLevel): string {
  switch (level) {
    case "LOW":
      return "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
    case "MEDIUM":
      return "bg-yellow-500/20 border-yellow-500/40 text-yellow-400";
    case "HIGH":
      return "bg-orange-500/20 border-orange-500/40 text-orange-400";
    case "CRITICAL":
      return "bg-red-500/20 border-red-500/40 text-red-400";
    case "UNKNOWN":
      return "bg-slate-500/20 border-slate-500/40 text-slate-400";
  }
}

function getLevelLabel(level: HeatmapLevel): string {
  switch (level) {
    case "LOW":
      return "Baixo";
    case "MEDIUM":
      return "Medio";
    case "HIGH":
      return "Alto";
    case "CRITICAL":
      return "Critico";
    case "UNKNOWN":
      return "Desconhecido";
  }
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function evaluateCategories(result: AnalyzeTransactionResponse): HeatmapCategory[] {
  const categories: HeatmapCategory[] = [];

  // 1. Permissoes
  const { actionType, unlimitedApproval } = result.submittedData;
  if (actionType === "approve") {
    if (unlimitedApproval) {
      categories.push({
        name: "Permissoes",
        level: "CRITICAL",
        description: "Aprovacao ilimitada solicitada pelo usuario.",
        source: `Acao: ${actionType}, Ilimitada: sim`,
      });
    } else {
      categories.push({
        name: "Permissoes",
        level: "MEDIUM",
        description: "Aprovacao limitada solicitada pelo usuario.",
        source: `Acao: ${actionType}, Ilimitada: nao`,
      });
    }
  } else {
    categories.push({
      name: "Permissoes",
      level: "LOW",
      description: "Operacao nao envolve aprovacao de tokens.",
      source: `Acao: ${actionType}`,
    });
  }

  // 2. Contrato implantado
  const onChain = result.onChainSignals ?? {
    contractDeployed: null,
    dexPairCount: null,
    totalLiquidityUsd: null,
    sources: [],
  };

  if (onChain.contractDeployed === null) {
    categories.push({
      name: "Contrato implantado",
      level: "UNKNOWN",
      description: "Nao verificado pela fonte atual.",
    });
  } else if (onChain.contractDeployed === false) {
    categories.push({
      name: "Contrato implantado",
      level: "HIGH",
      description: "Contrato nao encontrado na blockchain.",
      source: onChain.sources.length > 0 ? `Fonte: ${onChain.sources.join(", ")}` : undefined,
    });
  } else {
    categories.push({
      name: "Contrato implantado",
      level: "LOW",
      description: "Contrato verificado na blockchain.",
      source: onChain.sources.length > 0 ? `Fonte: ${onChain.sources.join(", ")}` : undefined,
    });
  }

  // 3. Liquidez em DEX
  if (onChain.totalLiquidityUsd === null) {
    categories.push({
      name: "Liquidez em DEX",
      level: "UNKNOWN",
      description: "Dados de liquidez indisponiveis.",
    });
  } else {
    let liquidityLevel: HeatmapLevel;
    let liquidityDesc: string;

    if (onChain.totalLiquidityUsd < 10000) {
      liquidityLevel = "HIGH";
      liquidityDesc = "Liquidez muito baixa. Aumenta o risco operacional.";
    } else if (onChain.totalLiquidityUsd < 1000000) {
      liquidityLevel = "MEDIUM";
      liquidityDesc = "Liquidez moderada.";
    } else {
      liquidityLevel = "LOW";
      liquidityDesc = "Liquidez alta.";
    }

    const pairInfo = onChain.dexPairCount !== null ? ` | Pares: ${onChain.dexPairCount}` : "";
    categories.push({
      name: "Liquidez em DEX",
      level: liquidityLevel,
      description: liquidityDesc,
      source: `${formatUsd(onChain.totalLiquidityUsd)}${pairInfo}`,
    });
  }

  // 4. Valor da operacao
  const amount = result.submittedData.amount;
  let amountLevel: HeatmapLevel;
  let amountDesc: string;

  if (amount >= 10000) {
    amountLevel = "HIGH";
    amountDesc = "Valor alto informado pelo usuario.";
  } else if (amount >= 1000) {
    amountLevel = "MEDIUM";
    amountDesc = "Valor moderado informado pelo usuario.";
  } else {
    amountLevel = "LOW";
    amountDesc = "Valor baixo informado pelo usuario.";
  }

  categories.push({
    name: "Valor da operacao",
    level: amountLevel,
    description: amountDesc,
    source: `${amount} ${result.submittedData.tokenName}`,
  });

  // 5. Sinais tecnicos
  const technicalDetails = result.technicalDetails ?? [];
  if (technicalDetails.length === 0) {
    categories.push({
      name: "Sinais tecnicos",
      level: "UNKNOWN",
      description: "Nenhum sinal tecnico disponivel.",
    });
  } else {
    const appliedFactors = technicalDetails.filter((f) => f.applied);
    const maxWeight = appliedFactors.reduce((max, f) => Math.max(max, f.weight), 0);

    let techLevel: HeatmapLevel;
    let techDesc: string;

    if (maxWeight >= 25) {
      techLevel = "HIGH";
      techDesc = "Fatores de alto peso detectados.";
    } else if (maxWeight >= 10) {
      techLevel = "MEDIUM";
      techDesc = "Fatores de peso moderado detectados.";
    } else if (appliedFactors.length > 0) {
      techLevel = "LOW";
      techDesc = "Fatores de baixo peso detectados.";
    } else {
      techLevel = "LOW";
      techDesc = "Nenhum fator de risco aplicado.";
    }

    const factorLabels = appliedFactors.slice(0, 2).map((f) => f.label).join(", ");
    categories.push({
      name: "Sinais tecnicos",
      level: techLevel,
      description: techDesc,
      source: factorLabels || undefined,
    });
  }

  return categories;
}

export function ContractRiskHeatmap({ result }: { result: AnalyzeTransactionResponse }) {
  const categories = evaluateCategories(result);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="mb-1 text-sm font-semibold text-slate-100">Mapa de Calor de Risco</h3>
      <p className="mb-4 text-xs text-slate-400">
        Este mapa mostra sinais de risco observaveis com base nos dados analisados. Ele nao substitui uma auditoria de contrato.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`rounded-xl border p-3 transition-colors ${getLevelColor(category.level)}`}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-200">{category.name}</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {getLevelLabel(category.level)}
              </span>
            </div>
            <p className="text-xs text-slate-300">{category.description}</p>
            {category.source && (
              <p className="mt-1 text-[10px] text-slate-500">{category.source}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
