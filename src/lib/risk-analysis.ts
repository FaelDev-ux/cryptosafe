import {
  AnalyzeTransactionInput,
  AnalyzeTransactionResponse,
  RiskLevel,
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

export function analyzeTransaction(input: AnalyzeTransactionInput): AnalyzeTransactionResponse {
  const reasons: string[] = [];
  const normalized = input.contractAddress.toLowerCase();
  const isUnknownContract = !SAFE_CONTRACTS.has(normalized);
  const isApprove = input.actionType === "approve";
  const isHighAmount = input.amount >= 10000;
  const isMediumAmount = input.amount >= 1000;

  let riskScore = 10;
  let riskLevel: RiskLevel = "LOW";

  if (isApprove && input.unlimitedApproval && isUnknownContract) {
    riskScore = 96;
    riskLevel = "CRITICAL";
    reasons.push("Aprovacao ilimitada para contrato desconhecido.");
  } else {
    if (isApprove && input.unlimitedApproval) {
      riskScore += 55;
      reasons.push("Aprovacao ilimitada detectada para operacao de approve.");
    }

    if (isUnknownContract) {
      riskScore += 30;
      reasons.push("Contrato fora da lista de contratos confiaveis.");
    }

    if (isHighAmount) {
      riskScore += 25;
      reasons.push("Valor alto aumenta impacto potencial do risco.");
    } else if (isMediumAmount) {
      riskScore += 12;
      reasons.push("Valor moderado com potencial de perda relevante.");
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
    }
  }

  riskScore = Math.min(riskScore, 100);

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
    recommendation: recommendationByRisk[riskLevel],
    submittedData: input,
  };
}
