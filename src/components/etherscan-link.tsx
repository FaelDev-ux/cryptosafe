"use client";

interface EtherscanLinkProps {
  contractAddress: string;
  network?: "ethereum" | "polygon" | "bsc" | "arbitrum" | "optimism" | "base";
  showIcon?: boolean;
  className?: string;
}

const EXPLORER_URLS: Record<string, { name: string; url: string }> = {
  ethereum: { name: "Etherscan", url: "https://etherscan.io" },
  polygon: { name: "PolygonScan", url: "https://polygonscan.com" },
  bsc: { name: "BscScan", url: "https://bscscan.com" },
  arbitrum: { name: "Arbiscan", url: "https://arbiscan.io" },
  optimism: { name: "Optimism", url: "https://optimistic.etherscan.io" },
  base: { name: "BaseScan", url: "https://basescan.org" },
};

export function EtherscanLink({
  contractAddress,
  network = "ethereum",
  showIcon = true,
  className = "",
}: EtherscanLinkProps) {
  const explorer = EXPLORER_URLS[network];
  const explorerUrl = `${explorer.url}/address/${contractAddress}`;

  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 transition-colors ${className}`}
    >
      {showIcon && (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
      <span className="text-xs font-medium">Ver no {explorer.name}</span>
    </a>
  );
}

interface ContractExplorerLinksProps {
  contractAddress: string;
}

export function ContractExplorerLinks({ contractAddress }: ContractExplorerLinksProps) {
  const networks = Object.keys(EXPLORER_URLS) as Array<keyof typeof EXPLORER_URLS>;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h4 className="mb-3 text-sm font-semibold text-slate-200">
        Verificar contrato em explorers
      </h4>
      <div className="flex flex-wrap gap-2">
        {networks.map((network) => {
          const explorer = EXPLORER_URLS[network];
          const url = `${explorer.url}/address/${contractAddress}`;
          return (
            <a
              key={network}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-teal-500/50 hover:bg-teal-500/10 hover:text-teal-300"
            >
              <span>{explorer.name}</span>
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Verifique a verificacao do contrato, transacoes recentes e holders em cada rede.
      </p>
    </div>
  );
}
