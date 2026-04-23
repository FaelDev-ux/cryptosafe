import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function Home() {
  return (
    <AppShell
      title="CryptoSafe MVP"
      description="Analise de risco para transacoes cripto com fluxo real frontend e backend."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Fluxo real</h2>
          <p className="mt-2 text-sm text-slate-300">
            Envie transacoes via `fetch` para a API interna e receba resposta validada no servidor.
          </p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Historico</h2>
          <p className="mt-2 text-sm text-slate-300">
            Resultados salvos localmente com busca, filtros por risco e gerenciamento de itens.
          </p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Regras de risco</h2>
          <p className="mt-2 text-sm text-slate-300">
            Regras no backend para detectar aprovacoes perigosas, contratos desconhecidos e valores altos.
          </p>
        </article>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/analyze"
          className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Comecar analise
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          Ver dashboard
        </Link>
        <Link
          href="/history"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          Abrir historico
        </Link>
      </section>
    </AppShell>
  );
}
