export type ActionType = "transfer" | "approve" | "swap" | "stake";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AnalyzeTransactionInput {
  contractAddress: string;
  actionType: ActionType;
  amount: number;
  tokenName: string;
  unlimitedApproval: boolean;
}

export interface AnalyzeTransactionResponse {
  riskLevel: RiskLevel;
  riskScore: number;
  reasons: string[];
  technicalDetails: RiskFactorDetail[];
  onChainSignals: OnChainSignals;
  recommendation: string;
  submittedData: AnalyzeTransactionInput;
}

export interface RiskFactorDetail {
  label: string;
  weight: number;
  applied: boolean;
  description: string;
}

export interface OnChainSignals {
  contractDeployed: boolean | null;
  dexPairCount: number | null;
  totalLiquidityUsd: number | null;
  sources: string[];
}

export interface AnalysisHistoryItem extends AnalyzeTransactionResponse {
  id: string;
  createdAt: string;
}
