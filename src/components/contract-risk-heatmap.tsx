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
      return "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
    case "MEDIUM":
      return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
    case "HIGH":
      return "bg-orange-500/20 border-orange-500/50 text-orange-400";
    case "CRITICAL":
      return "bg-red-500/20 border-red-500/50 text-red-400";
    case "UNKNOWN":
      return "bg-slate-500/20 border-slate-500/50 text-slate-400";
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function evaluatePermissions(result: AnalyzeTransactionResponse): HeatmapCategory {
  const { actionType, unlimitedApproval } = result.submittedData;

  if (actionType === "approve" && unlimitedApproval === true) {
    return {
      name: "Permissoes",
      level: "CRITICAL",
      description: "Aprovacao ilimitada solicitada pelo usuario.",
      source: `Acao: ${actionType}, Aprovacao ilimitada: sim`,
    };
  }

  if (actionType === "approve" && unlimitedApproval === false) {
    return {
      name: "Permissoes",
      level: "MEDIUM",
      description: "Aprovacao limitada solicitada pelo usuario.",
      source: `Acao: ${actionType}, Aprovacao ilimitada: nao`,
    };
  }

  return {
    name: "Permissoes",
    level: "LOW",
    description: "Nenhuma aprovacao de token solicitada.",
    source: `Acao: ${actionType}`,
  };
}

function evaluateContractDeployed(result: AnalyzeTransactionResponse): HeatmapCategory {
  const { contractDeployed } = result.onChainSignals;

  if (contractDeployed === null) {
    return {
      name: "Contrato Implantado",
      level: "UNKNOWN",
      description: "Nao verificado pela fonte atual.",
      source: "Dados indisponiveis",
    };
  }

  if (contractDeployed === false) {
    return {
      name: "Contrato Implantado",
      level: "HIGH",
      description: "O contrato nao foi encontrado na blockchain.",
      source: "Contrato nao implantado",
    };
  }

  return {
    name: "Contrato Implantado",
    level: "LOW",
    description: "O contrato foi verificado como implantado.",
    source: "Contrato implantado",
  };
}

function evaluateLiquidity(result: AnalyzeTransactionResponse): HeatmapCategory {
  const { totalLiquidityUsd, dexPairCount } = result.onChainSignals;

  if (totalLiquidityUsd === null) {
    return {
      name: "Liquidez em DEX",
      level: "UNKNOWN",
      description: "Dados de liquidez indisponiveis.",
      source: dexPairCount !== null ? `Pares: ${dexPairCount}` : "Dados indisponiveis",
    };
  }

  const pairsInfo = dexPairCount !== null ? ` | Pares: ${dexPairCount}` : "";

  if (totalLiquidityUsd < 10000) {
    return {
      name: "Liquidez em DEX",
      level: "HIGH",
      description: "Liquidez baixa pode aumentar o risco operacional.",
      source: `${formatCurrency(totalLiquidityUsd)}${pairsInfo}`,
    };
  }

  if (totalLiquidityUsd < 1000000) {
    return {
      name: "Liquidez em DEX",
      level: "MEDIUM",
      description: "Liquidez moderada no mercado.",
      source: `${formatCurrency(totalLiquidityUsd)}${pairsInfo}`,
    };
  }

  return {
    name: "Liquidez em DEX",
    level: "LOW",
    description: "Liquidez saudavel no mercado.",
    source: `${formatCurrency(totalLiquidityUsd)}${pairsInfo}`,
  };
}

function evaluateOperationValue(result: AnalyzeTransactionResponse): HeatmapCategory {
  const { amount, tokenName } = result.submittedData;

  if (amount >= 10000) {
    return {
      name: "Valor da Operacao",
      level: "HIGH",
      description: "Valor elevado informado pelo usuario.",
      source: `${amount} ${tokenName}`,
    };
  }

  if (amount >= 1000) {
    return {
      name: "Valor da Operacao",
      level: "MEDIUM",
      description: "Valor moderado informado pelo usuario.",
      source: `${amount} ${tokenName}`,
    };
  }

  return {
    name: "Valor da Operacao",
    level: "LOW",
    description: "Valor baixo informado pelo usuario.",
    source: `${amount} ${tokenName}`,
  };
}

function evaluateTechnicalSignals(result: AnalyzeTransactionResponse): HeatmapCategory {
  const { technicalDetails } = result;

  if (!technicalDetails || technicalDetails.length === 0) {
    return {
      name: "Sinais Tecnicos",
      level: "UNKNOWN",
      description: "Nenhum sinal tecnico disponivel.",
      source: "Dados indisponiveis",
    };
  }

  const appliedFactors = technicalDetails.filter((f) => f.applied);
  const highWeightFactors = appliedFactors.filter((f) => f.weight >= 15);
  const mediumWeightFactors = appliedFactors.filter((f) => f.weight >= 5 && f.weight < 15);

  if (highWeightFactors.length > 0) {
    return {
      name: "Sinais Tecnicos",
      level: "HIGH",
      description: highWeightFactors[0].description,
      source: `${appliedFactors.length} fator(es) aplicado(s)`,
    };
  }

  if (mediumWeightFactors.length > 0) {
    return {
      name: "Sinais Tecnicos",
      level: "MEDIUM",
      description: mediumWeightFactors[0].description,
      source: `${appliedFactors.length} fator(es) aplicado(s)`,
    };
  }

  if (appliedFactors.length > 0) {
    return {
      name: "Sinais Tecnicos",
      level: "LOW",
      description: appliedFactors[0].description,
      source: `${appliedFactors.length} fator(es) aplicado(s)`,
    };
  }

  return {
    name: "Sinais Tecnicos",
    level: "LOW",
    description: "Nenhum fator de risco tecnico aplicado.",
    source: "0 fatores aplicados",
  };
}

export function ContractRiskHeatmap({ result }: { result: AnalyzeTransactionResponse }) {
  const categories: HeatmapCategory[] = [
    evaluatePermissions(result),
    evaluateContractDeployed(result),
    evaluateLiquidity(result),
    evaluateOperationValue(result),
    evaluateTechnicalSignals(result),
  ];

  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-950/70 p-4">
      <h3 className="mb-1 text-sm font-semibold text-slate-100">
        Mapa de Calor de Risco do Contrato
      </h3>
      <p className="mb-4 text-xs text-slate-400">
        Este mapa mostra sinais de risco observaveis com base nos dados analisados. Ele nao
        substitui uma auditoria de contrato.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`rounded-lg border p-3 transition-all ${getLevelColor(category.level)}`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-200">{category.name}</span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-semibold ${getLevelColor(category.level)}`}
              >
                {getLevelLabel(category.level)}
              </span>
            </div>
            <p className="text-xs text-slate-300">{category.description}</p>
            {category.source && (
              <p className="mt-2 text-xs text-slate-500">Fonte: {category.source}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
