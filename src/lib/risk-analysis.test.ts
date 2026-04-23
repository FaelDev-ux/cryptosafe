import { describe, expect, it } from "vitest";
import { analyzeTransaction, validateAnalysisInput } from "@/lib/risk-analysis";
import { AnalyzeTransactionInput } from "@/types/analysis";

function makeInput(overrides: Partial<AnalyzeTransactionInput> = {}): AnalyzeTransactionInput {
  return {
    contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    actionType: "transfer",
    amount: 100,
    tokenName: "USDC",
    unlimitedApproval: false,
    ...overrides,
  };
}

describe("validateAnalysisInput", () => {
  it("retorna erros para payload invalido", () => {
    const result = validateAnalysisInput({
      contractAddress: "",
      actionType: "invalid",
      amount: 0,
      tokenName: "",
      unlimitedApproval: true,
    });

    expect(result.data).toBeUndefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("retorna data para payload valido", () => {
    const result = validateAnalysisInput(makeInput());
    expect(result.errors).toHaveLength(0);
    expect(result.data).toEqual(makeInput());
  });
});

describe("analyzeTransaction", () => {
  it("marca como CRITICAL approve ilimitado em contrato desconhecido", () => {
    const result = analyzeTransaction(
      makeInput({
        actionType: "approve",
        unlimitedApproval: true,
        contractAddress: "0x0000000000000000000000000000000000001234",
      }),
    );

    expect(result.riskLevel).toBe("CRITICAL");
    expect(result.riskScore).toBeGreaterThanOrEqual(90);
  });

  it("marca transferencia simples de baixo valor como LOW", () => {
    const result = analyzeTransaction(
      makeInput({
        actionType: "transfer",
        amount: 50,
      }),
    );

    expect(result.riskLevel).toBe("LOW");
    expect(result.reasons.join(" ")).toContain("baixo valor");
  });

  it("eleva risco quando contrato e desconhecido e valor e alto", () => {
    const result = analyzeTransaction(
      makeInput({
        contractAddress: "0x0000000000000000000000000000000000009876",
        amount: 20000,
      }),
    );

    expect(["MEDIUM", "HIGH", "CRITICAL"]).toContain(result.riskLevel);
    expect(result.riskScore).toBeGreaterThan(40);
  });
});
