import { AnalysisHistoryItem, AnalyzeTransactionResponse } from "@/types/analysis";

const STORAGE_KEY = "cryptosafe_history";

function isClient() {
  return typeof window !== "undefined";
}

export function getHistory(): AnalysisHistoryItem[] {
  if (!isClient()) return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as AnalysisHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAnalysis(response: AnalyzeTransactionResponse): AnalysisHistoryItem {
  const newItem: AnalysisHistoryItem = {
    ...response,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const history = getHistory();
  const updated = [newItem, ...history].slice(0, 50);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return newItem;
}

export function deleteHistoryItem(id: string): void {
  const filtered = getHistory().filter((item) => item.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearHistory(): void {
  if (!isClient()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function exportHistoryAsJson(items: AnalysisHistoryItem[]): string {
  return JSON.stringify(items, null, 2);
}

export function exportHistoryAsCsv(items: AnalysisHistoryItem[]): string {
  const headers = [
    "id",
    "createdAt",
    "riskLevel",
    "riskScore",
    "actionType",
    "tokenName",
    "amount",
    "contractAddress",
    "unlimitedApproval",
    "recommendation",
  ];
  const rows = items.map((item) => [
    item.id,
    item.createdAt,
    item.riskLevel,
    item.riskScore.toString(),
    item.submittedData.actionType,
    item.submittedData.tokenName,
    item.submittedData.amount.toString(),
    item.submittedData.contractAddress,
    item.submittedData.unlimitedApproval ? "true" : "false",
    item.recommendation.replaceAll('"', "'"),
  ]);
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
