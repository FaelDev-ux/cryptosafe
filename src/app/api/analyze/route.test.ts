import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/analyze/route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/analyze", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("POST /api/analyze", () => {
  it("retorna 400 para dados invalidos", async () => {
    const request = makeRequest({
      contractAddress: "",
      actionType: "",
      amount: 0,
      tokenName: "",
      unlimitedApproval: false,
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBeDefined();
    expect(Array.isArray(json.details)).toBe(true);
  });

  it("retorna analise valida para payload correto", async () => {
    const request = makeRequest({
      contractAddress: "0x0000000000000000000000000000000000001234",
      actionType: "approve",
      amount: 1200,
      tokenName: "USDT",
      unlimitedApproval: true,
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.riskLevel).toBeDefined();
    expect(json.riskScore).toBeTypeOf("number");
    expect(Array.isArray(json.reasons)).toBe(true);
    expect(json.submittedData.contractAddress).toBe("0x0000000000000000000000000000000000001234");
  });
});
