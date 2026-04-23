import {
  AnalyzeTransactionInput,
  AnalyzeTransactionResponse,
  OnChainSignals,
  RiskLevel,
  RiskFactorDetail,
} from "@/types/analysis";

const SAFE_CONTRACTS = new Set([
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "0x6b175474e89094c44da98b954eedeac495271d0f",
]);

const ACTION_TYPES = new Set(["transfer", "approve", "swap", "stake"]);

interface ValidationResult {
  data?: AnalyzeTransactionInput;
  errors: string[];
}

export function validateAnalysisInput(payload: unknown): ValidationResult {
  const errors: string[] = [];

  if (!payload || typeof payload !== "object") {
    return { errors: ["Body JSON invalido."] };
  }

  const raw = payload as Partial<AnalyzeTransactionInput>;
  const contractAddress = (raw.contractAddress ?? "").trim();
  const actionType = raw.actionType;
  const tokenName = (raw.tokenName ?? "").trim();
  const amount = Number(raw.amount);
  const unlimitedApproval = Boolean(raw.unlimitedApproval);

  if (!contractAddress) {
    errors.push("contractAddress e obrigatorio.");
  }

  if (!actionType || typeof actionType !== "string" || !ACTION_TYPES.has(actionType)) {
    errors.push("actionType e obrigatorio e deve ser valido.");
  }

  if (!tokenName) {
    errors.push("tokenName e obrigatorio.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push("amount deve ser maior que 0.");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors,
    data: {
      contractAddress,
      actionType: actionType as AnalyzeTransactionInput["actionType"],
      amount,
      tokenName,
      unlimitedApproval,
    },
  };
}

async function fetchOnChainSignals(contractAddress: string): Promise<OnChainSignals> {
  const normalizedAddress = contractAddress.toLowerCase();
  const signals: OnChainSignals = {
    contractDeployed: null,
    dexPairCount: null,
    totalLiquidityUsd: null,
    sources: [],
  };

  try {
    const rpcResponse = await fetch("https://cloudflare-eth.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getCode",
        params: [normalizedAddress, "latest"],
        id: 1,
      }),
      cache: "no-store",
    });
    if (rpcResponse.ok) {
      const data = (await rpcResponse.json()) as { result?: string };
      const code = data.result ?? "0x";
      signals.contractDeployed = code !== "0x";
      signals.sources.push("cloudflare-eth-rpc");
    }
  } catch {
    signals.contractDeployed = null;
  }

  try {
    const dexResponse = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${normalizedAddress}`,
      { cache: "no-store" },
    );
    if (dexResponse.ok) {
      const data = (await dexResponse.json()) as {
        pairs?: Array<{ liquidity?: { usd?: number } }>;
      };
      const pairs = data.pairs ?? [];
      const totalLiquidityUsd = pairs.reduce((sum, pair) => sum + (pair.liquidity?.usd ?? 0), 0);
      signals.dexPairCount = pairs.length;
      signals.totalLiquidityUsd = Number(totalLiquidityUsd.toFixed(2));
      signals.sources.push("dexscreener");
    }
  } catch {
    signals.dexPairCount = null;
    signals.totalLiquidityUsd = null;
  }

  return signals;
}

export async function analyzeTransaction(
  input: AnalyzeTransactionInput,
): Promise<AnalyzeTransactionResponse> {
  const reasons: string[] = [];
  const technicalDetails: RiskFactorDetail[] = [];
  const normalized = input.contractAddress.toLowerCase();
  const onChainSignals = await fetchOnChainSignals(normalized);
  const isKnownBySafeList = SAFE_CONTRACTS.has(normalized);
  const hasStrongDexLiquidity = (onChainSignals.totalLiquidityUsd ?? 0) >= 1_000_000;
  const hasDeployedCode = onChainSignals.contractDeployed === true;
  const isUnknownContract = !(isKnownBySafeList || (hasDeployedCode && hasStrongDexLiquidity));
  const isApprove = input.actionType === "approve";
  const isHighAmount = input.amount >= 10000;
  const isMediumAmount = input.amount >= 1000;

  let riskScore = 10;
  let riskLevel: RiskLevel = "LOW";

  if (isApprove && input.unlimitedApproval && isUnknownContract) {
    riskScore = 96;
    riskLevel = "CRITICAL";
    reasons.push("Aprovacao ilimitada para contrato desconhecido.");
    technicalDetails.push({
      label: "Combinacao critica",
      weight: 86,
      applied: true,
      description: "Approve + unlimitedApproval + contrato desconhecido.",
    });
  } else {
    if (isApprove && input.unlimitedApproval) {
      riskScore += 55;
      reasons.push("Aprovacao ilimitada detectada para operacao de approve.");
      technicalDetails.push({
        label: "Unlimited approval",
        weight: 55,
        applied: true,
        description: "Permite gasto ilimitado de tokens.",
      });
    }

    if (isUnknownContract) {
      riskScore += 30;
      reasons.push("Contrato fora da lista de contratos confiaveis.");
      technicalDetails.push({
        label: "Contrato desconhecido",
        weight: 30,
        applied: true,
        description: "Nao identificado em lista segura nem por sinais on-chain fortes.",
      });
    } else {
      technicalDetails.push({
        label: "Sinal de confianca on-chain",
        weight: -12,
        applied: true,
        description: "Contrato com sinais de liquidez/implantacao reduzindo risco.",
      });
      riskScore -= 12;
    }

    if (isHighAmount) {
      riskScore += 25;
      reasons.push("Valor alto aumenta impacto potencial do risco.");
      technicalDetails.push({
        label: "Valor alto",
        weight: 25,
        applied: true,
        description: "Montante elevado amplia perda potencial.",
      });
    } else if (isMediumAmount) {
      riskScore += 12;
      reasons.push("Valor moderado com potencial de perda relevante.");
      technicalDetails.push({
        label: "Valor moderado",
        weight: 12,
        applied: true,
        description: "Montante relevante exige mais cautela.",
      });
    } else {
      technicalDetails.push({
        label: "Baixo valor",
        weight: -5,
        applied: true,
        description: "Valor reduzido diminui impacto financeiro.",
      });
      riskScore -= 5;
    }

    if (riskScore >= 80) {
      riskLevel = "HIGH";
    } else if (riskScore >= 45) {
      riskLevel = "MEDIUM";
    } else {
      riskLevel = "LOW";
    }

    if (riskLevel === "LOW" && input.actionType === "transfer" && input.amount < 200) {
      reasons.push("Transferencia simples e de baixo valor.");
      technicalDetails.push({
        label: "Transferencia simples",
        weight: -5,
        applied: true,
        description: "Padrao tipico de baixo risco operacional.",
      });
    }
  }

  riskScore = Math.max(0, Math.min(riskScore, 100));

  const recommendationByRisk: Record<RiskLevel, string> = {
    LOW: "Prosseguir com monitoramento basico da transacao.",
    MEDIUM: "Revisar endereco e permissao antes de confirmar.",
    HIGH: "Evitar executar agora sem validacao manual adicional.",
    CRITICAL: "Nao assinar. Alto risco de perda de fundos.",
  };

  return {
    riskLevel,
    riskScore,
    reasons,
    technicalDetails,
    onChainSignals,
    recommendation: recommendationByRisk[riskLevel],
    submittedData: input,
  };
}
