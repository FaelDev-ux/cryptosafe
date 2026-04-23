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
  recommendation: string;
  submittedData: AnalyzeTransactionInput;
}

export interface AnalysisHistoryItem extends AnalyzeTransactionResponse {
  id: string;
  createdAt: string;
}
