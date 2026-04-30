"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { registerLocalUser } from "@/lib/local-auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await registerLocalUser(email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Nao foi possivel salvar no armazenamento local do navegador.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Cadastro"
      description="Crie seu acesso ao CryptoSafe."
    >
      <section className="grid min-h-[calc(100vh-7rem)] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="app-panel order-2 rounded-3xl p-6 md:p-8 lg:order-1">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-200/80">Novo acesso</p>
          <h2 className="mt-2 text-2xl font-black text-white">Criar conta</h2>
          <p className="mt-2 text-sm text-slate-400">
            O cadastro fica salvo no localStorage deste navegador, sem gravar em arquivo no servidor.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block space-y-1 text-sm">
              <span className="text-slate-300">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@email.com"
                className="field"
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="text-slate-300">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="field"
              />
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="primary-button mt-6 w-full px-4 py-3 text-sm"
          >
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-300">
            Ja tem conta?{" "}
            <Link href="/login" className="font-semibold text-teal-200 hover:underline">
              Fazer login
            </Link>
          </p>
        </form>

        <div className="order-1 max-w-2xl lg:order-2">
          <div className="inline-flex items-center rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-100">
            Protecao antes da confirmacao
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">
            Sua area de risco cripto.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            Crie sua conta para analisar transacoes, salvar resultados e acompanhar sinais de
            risco como aprovacao ilimitada, contrato desconhecido e baixa liquidez.
          </p>
          <div className="mt-8 app-panel rounded-3xl p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Foco</p>
                <p className="mt-2 text-lg font-black text-white">Evitar perdas</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Analise</p>
                <p className="mt-2 text-lg font-black text-white">Score 0-100</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
