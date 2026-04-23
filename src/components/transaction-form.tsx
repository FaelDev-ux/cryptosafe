"use client";

import { FormEvent, useState } from "react";
import { AnalyzeTransactionInput, AnalyzeTransactionResponse } from "@/types/analysis";
import { analyzeTransactionRequest } from "@/lib/api";

const initialState: AnalyzeTransactionInput = {
  contractAddress: "",
  actionType: "transfer",
  amount: 0,
  tokenName: "",
  unlimitedApproval: false,
};

function validateClientInput(values: AnalyzeTransactionInput): string[] {
  const errors: string[] = [];
  if (!values.contractAddress.trim()) errors.push("Contract address e obrigatorio.");
  if (!values.actionType) errors.push("Action type e obrigatorio.");
  if (!values.tokenName.trim()) errors.push("Token name e obrigatorio.");
  if (!Number.isFinite(values.amount) || values.amount <= 0) errors.push("Amount deve ser maior que 0.");
  return errors;
}

export function TransactionForm({
  onSuccess,
}: {
  onSuccess: (result: AnalyzeTransactionResponse) => void;
}) {
  const [formData, setFormData] = useState<AnalyzeTransactionInput>(initialState);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const errors = validateClientInput(formData);
    if (errors.length > 0) {
      setErrorMessage(errors.join(" "));
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeTransactionRequest(formData);
      onSuccess(response);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro inesperado ao analisar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold text-white">Enviar transacao para analise</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-slate-300">Contract address</span>
          <input
            required
            value={formData.contractAddress}
            onChange={(e) => setFormData((prev) => ({ ...prev, contractAddress: e.target.value }))}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
            placeholder="0x..."
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-slate-300">Action type</span>
          <select
            required
            value={formData.actionType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                actionType: e.target.value as AnalyzeTransactionInput["actionType"],
              }))
            }
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
          >
            <option value="transfer">transfer</option>
            <option value="approve">approve</option>
            <option value="swap">swap</option>
            <option value="stake">stake</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-slate-300">Amount</span>
          <input
            required
            type="number"
            min="0.0000001"
            step="any"
            value={formData.amount || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
            placeholder="100"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-slate-300">Token name</span>
          <input
            required
            value={formData.tokenName}
            onChange={(e) => setFormData((prev) => ({ ...prev, tokenName: e.target.value }))}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
            placeholder="USDT"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={formData.unlimitedApproval}
          onChange={(e) => setFormData((prev) => ({ ...prev, unlimitedApproval: e.target.checked }))}
          className="h-4 w-4 rounded border-slate-700 bg-slate-950"
        />
        Unlimited approval
      </label>

      {errorMessage ? (
        <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{errorMessage}</p>
      ) : null}

      <button
        disabled={loading}
        type="submit"
        className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-800"
      >
        {loading ? "Analisando..." : "Analisar transacao"}
      </button>
    </form>
  );
}
