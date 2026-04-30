import { AnalyzeTransactionResponse } from "@/types/analysis";

interface ConsequenceData {
  main: string;
  worst: string;
  action: string;
}

function getHumanReadableAction(result: AnalyzeTransactionResponse): string {
  const { actionType, unlimitedApproval, amount, tokenName } = result.submittedData;

  switch (actionType) {
    case "approve":
      if (unlimitedApproval) {
        return `Voce esta permitindo que este contrato mova seus tokens ${tokenName} sem um limite definido.`;
      }
      return `Voce esta permitindo que este contrato mova ate ${amount} ${tokenName}.`;
    case "transfer":
      return `Voce esta enviando ${amount} ${tokenName} para uma transacao envolvendo este contrato.`;
    case "swap":
      return `Voce esta tentando trocar ${amount} ${tokenName} usando este contrato.`;
    case "stake":
      return `Voce esta tentando aplicar ${amount} ${tokenName} em uma operacao de staking.`;
    default:
      return `Voce esta realizando uma operacao com ${amount} ${tokenName}.`;
  }
}

function getConsequences(result: AnalyzeTransactionResponse): ConsequenceData {
  const { actionType, unlimitedApproval } = result.submittedData;

  if (actionType === "approve" && unlimitedApproval) {
    return {
      main: "A permissao pode continuar ativa apos esta transacao ate ser revogada.",
      worst: "Se o contrato for malicioso ou comprometido, seus tokens aprovados podem ficar expostos.",
      action: "Considere evitar aprovacao ilimitada ou revisar a permissao antes de confirmar.",
    };
  }

  if (actionType === "approve") {
    return {
      main: "O contrato podera movimentar ate o limite informado.",
      worst: "Se o contrato nao for confiavel, o valor aprovado pode ficar em risco.",
      action: "Confirme se o contrato e conhecido antes de aprovar.",
    };
  }

  if (actionType === "transfer") {
    return {
      main: "A transferencia pode ser irreversivel apos confirmada.",
      worst: "Se o endereco ou contrato estiver errado, pode nao ser possivel recuperar os fundos.",
      action: "Confira o contrato e o valor antes de confirmar.",
    };
  }

  if (actionType === "swap") {
    return {
      main: "A troca pode depender da liquidez disponivel.",
      worst: "Baixa liquidez pode causar preco ruim, falha ou execucao desfavoravel.",
      action: "Confira liquidez e contrato antes de trocar.",
    };
  }

  if (actionType === "stake") {
    return {
      main: "Seus tokens podem ficar bloqueados conforme as regras do contrato.",
      worst: "Se o contrato for desconhecido, pode haver risco de perda ou bloqueio dos fundos.",
      action: "Revise o contrato e os sinais on-chain antes de aplicar.",
    };
  }

  return {
    main: "A operacao pode ter consequencias dependendo do contrato.",
    worst: "Se o contrato nao for confiavel, pode haver risco.",
    action: "Revise os detalhes antes de confirmar.",
  };
}

function formatLiquidity(value: number | null): string {
  if (value === null) {
    return "Liquidez nao verificada.";
  }
  return `Liquidez observada: US$ ${value.toLocaleString("pt-BR")}.`;
}

function getContractDeployedMessage(deployed: boolean | null): string | null {
  if (deployed === false) {
    return "O contrato nao parece ter codigo implantado pela fonte consultada.";
  }
  if (deployed === null) {
    return "Nao foi possivel verificar a implantacao do contrato.";
  }
  return null;
}

function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "LOW":
      return "text-teal-400";
    case "MEDIUM":
      return "text-amber-400";
    case "HIGH":
      return "text-orange-400";
    case "CRITICAL":
      return "text-rose-400";
    default:
      return "text-slate-400";
  }
}

export function HumanReadableTransaction({ result }: { result: AnalyzeTransactionResponse }) {
  const humanAction = getHumanReadableAction(result);
  const consequences = getConsequences(result);
  const onChainSignals = result.onChainSignals ?? {
    contractDeployed: null,
    totalLiquidityUsd: null,
  };
  const contractDeployedMessage = getContractDeployedMessage(onChainSignals.contractDeployed);
  const liquidityMessage = formatLiquidity(onChainSignals.totalLiquidityUsd);

  return (
    <div className="space-y-4">
      {/* Transacao em Linguagem Humana */}
      <div className="rounded-2xl border border-teal-300/20 bg-teal-300/5 p-4">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-teal-100/80">
          O que esta transacao faz
        </h3>
        <p className="text-lg font-semibold leading-relaxed text-white">
          {humanAction}
        </p>

        <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
          <p className="text-slate-300">
            <span className="text-slate-400">Contrato:</span>{" "}
            <span className="break-all font-mono text-xs">{result.submittedData.contractAddress}</span>
          </p>
          <p className="text-slate-300">
            <span className="text-slate-400">Nivel de risco:</span>{" "}
            <span className={`font-semibold ${getRiskColor(result.riskLevel)}`}>
              {result.riskLevel}
            </span>
          </p>
          <p className="text-slate-300">
            <span className="text-slate-400">Score:</span>{" "}
            <span className="font-semibold text-white">{result.riskScore}/100</span>
          </p>
          <p className="text-slate-300">
            <span className="text-slate-400">Recomendacao:</span>{" "}
            {result.recommendation}
          </p>
        </div>

        {/* Alertas on-chain */}
        <div className="mt-3 space-y-1 text-sm">
          {contractDeployedMessage && (
            <p className="text-amber-400">{contractDeployedMessage}</p>
          )}
          <p className="text-slate-400">{liquidityMessage}</p>
        </div>
      </div>

      {/* Modo "E se eu assinar?" */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
          E se eu assinar?
        </h3>

        <div className="grid gap-3 md:grid-cols-3">
          {/* Consequencia provavel */}
          <div className="rounded-xl border border-teal-300/20 bg-teal-300/5 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-400">
              Consequencia provavel
            </p>
            <p className="text-sm leading-relaxed text-slate-200">{consequences.main}</p>
          </div>

          {/* Pior cenario */}
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-400">
              Pior cenario
            </p>
            <p className="text-sm leading-relaxed text-slate-200">{consequences.worst}</p>
          </div>

          {/* Acao sugerida */}
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-400">
              Acao sugerida
            </p>
            <p className="text-sm leading-relaxed text-slate-200">{consequences.action}</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Esta explicacao e baseada nos dados disponiveis e nao substitui auditoria ou analise profissional.
        </p>
      </div>
    </div>
  );
}
