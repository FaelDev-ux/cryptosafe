import {
  AnalyzeTransactionInput,
  AnalyzeTransactionResponse,
} from "@/types/analysis";

interface AnalyzeApiError {
  error?: string;
  details?: string[];
}

export async function analyzeTransactionRequest(
  payload: AnalyzeTransactionInput,
): Promise<AnalyzeTransactionResponse> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as AnalyzeTransactionResponse & AnalyzeApiError;

  if (!response.ok) {
    const details = data.details?.join(" ");
    throw new Error(details || data.error || "Falha ao analisar transacao.");
  }

  return data;
}
