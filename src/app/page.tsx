import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function Home() {
  return (
    <AppShell
      title="CryptoSafe MVP"
      description="Analise de risco para transacoes cripto com fluxo real frontend e backend."
    >
      <section className="premium-card rounded-2xl p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Trusted by Builders</p>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-white md:text-4xl">
          Detecte riscos antes de assinar qualquer transacao.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-300">
          Motor de analise no backend com respostas em tempo real para proteger operacoes sensiveis.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="premium-card rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white">Fluxo real</h2>
          <p className="mt-2 text-sm text-slate-300">
            Envie transacoes via `fetch` para a API interna e receba resposta validada no servidor.
          </p>
        </article>
        <article className="premium-card rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white">Historico</h2>
          <p className="mt-2 text-sm text-slate-300">
            Resultados salvos localmente com busca, filtros por risco e gerenciamento de itens.
          </p>
        </article>
        <article className="premium-card rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white">Regras de risco</h2>
          <p className="mt-2 text-sm text-slate-300">
            Regras no backend para detectar aprovacoes perigosas, contratos desconhecidos e valores altos.
          </p>
        </article>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/analyze"
          className="glow-cyan rounded-lg bg-gradient-to-r from-cyan-400 via-cyan-300 to-indigo-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
        >
          Comecar analise
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
        >
          Ver dashboard
        </Link>
        <Link
          href="/history"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
        >
          Abrir historico
        </Link>
      </section>
    </AppShell>
  );
}
