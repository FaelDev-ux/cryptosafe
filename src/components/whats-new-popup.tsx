"use client";

import { useState, useEffect } from "react";

interface Update {
  version: string;
  date: string;
  title: string;
  description: string;
  features: {
    icon: "chart" | "shield" | "link" | "bell" | "eye" | "zap";
    title: string;
    description: string;
  }[];
}

const UPDATES: Update[] = [
  {
    version: "1.2.0",
    date: "Abril 2026",
    title: "Novos recursos de visualizacao e seguranca",
    description: "Adicionamos ferramentas avancadas para ajudar voce a entender melhor os riscos das suas transacoes.",
    features: [
      {
        icon: "chart",
        title: "Grafico de Tendencia de Risco",
        description: "Visualize a evolucao do seu score de risco ao longo do tempo com um grafico interativo no dashboard.",
      },
      {
        icon: "shield",
        title: "Score de Saude da Carteira",
        description: "Receba uma nota de A a F baseada na sua exposicao a riscos, aprovacoes ilimitadas e padroes de uso.",
      },
      {
        icon: "link",
        title: "Links para Exploradores",
        description: "Acesse rapidamente Etherscan, PolygonScan, BscScan e outros exploradores direto da analise.",
      },
      {
        icon: "bell",
        title: "Central de Notificacoes",
        description: "Receba alertas sobre padroes de risco, contratos repetidos e aprovacoes ilimitadas excessivas.",
      },
      {
        icon: "eye",
        title: "Mapa de Calor de Risco",
        description: "Visualize os riscos do contrato em 5 categorias com cores intuitivas e faceis de entender.",
      },
      {
        icon: "zap",
        title: "Transacao em Linguagem Simples",
        description: "Entenda o que a transacao faz antes de assinar, com simulacao de cenarios e recomendacoes.",
      },
    ],
  },
];

const SEEN_VERSIONS_KEY = "cryptosafe_seen_versions";
const CURRENT_VERSION = UPDATES[0].version;

function getSeenVersions(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEEN_VERSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markVersionSeen(version: string) {
  const seen = getSeenVersions();
  if (!seen.includes(version)) {
    seen.push(version);
    localStorage.setItem(SEEN_VERSIONS_KEY, JSON.stringify(seen));
  }
}

function IconComponent({ icon }: { icon: Update["features"][0]["icon"] }) {
  switch (icon) {
    case "chart":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      );
    case "shield":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "link":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      );
    case "bell":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
    case "eye":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case "zap":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
  }
}

export function WhatsNewPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUpdate] = useState<Update>(UPDATES[0]);

  useEffect(() => {
    const seen = getSeenVersions();
    if (!seen.includes(CURRENT_VERSION)) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    markVersionSeen(CURRENT_VERSION);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
        <div className="app-panel overflow-hidden rounded-3xl">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-500/20 via-teal-600/10 to-rose-500/10 px-6 py-8">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-400/20 blur-3xl" />
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-rose-400/20 blur-2xl" />
            
            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-300">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Versao {currentUpdate.version}
              </div>
              
              <h2 className="text-2xl font-black text-white">
                Novidades do CryptoSafe
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {currentUpdate.description}
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="max-h-[340px] overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              {currentUpdate.features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-teal-400/20 hover:bg-white/[0.04]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/20 to-teal-600/10 text-teal-300">
                    <IconComponent icon={feature.icon} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {currentUpdate.date}
              </p>
              <button
                onClick={handleClose}
                className="primary-button px-6 py-2.5 text-sm"
              >
                Entendi, vamos la!
              </button>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-800 text-slate-400 transition-colors hover:border-white/40 hover:text-white"
          aria-label="Fechar"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
