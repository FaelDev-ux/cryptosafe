import { beforeEach, describe, expect, it, vi } from "vitest";
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
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = String(input);
        if (url.includes("cloudflare-eth.com")) {
          return new Response(JSON.stringify({ result: "0x60006000" }), { status: 200 });
        }
        if (url.includes("dexscreener")) {
          return new Response(JSON.stringify({ pairs: [{ liquidity: { usd: 50_000 } }] }), {
            status: 200,
          });
        }
        return new Response("{}", { status: 200 });
      }),
    );
  });

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
    expect(Array.isArray(json.technicalDetails)).toBe(true);
    expect(json.onChainSignals).toBeDefined();
    expect(json.submittedData.contractAddress).toBe("0x0000000000000000000000000000000000001234");
  });
});
