"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";

export default function LoginPage() {
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Falha no login.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Nao foi possivel conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Login"
      description="Acesse seu painel de analise de risco."
    >
      <section className="grid min-h-[calc(100vh-7rem)] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
            CryptoSafe Console
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">
            Analise antes de assinar.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            Entre para revisar contratos, aprovacoes e historico de risco em um painel direto,
            feito para evitar decisoes perigosas em transacoes cripto.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Score claro", "Sinais on-chain", "Historico local"].map((item) => (
              <div key={item} className="app-panel rounded-2xl p-4">
                <div className="mb-3 h-1.5 w-10 rounded-full bg-teal-300" />
                <p className="text-sm font-bold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="app-panel rounded-3xl p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-200/80">Acesso seguro</p>
          <h2 className="mt-2 text-2xl font-black text-white">Entrar no painel</h2>
          <p className="mt-2 text-sm text-slate-400">Use seu email e senha cadastrados neste navegador.</p>

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
            {loading ? "Entrando..." : "Login"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-300">
            Nao tem conta?{" "}
            <Link href="/register" className="font-semibold text-teal-200 hover:underline">
              Criar cadastro
            </Link>
          </p>
        </form>
      </section>
    </AppShell>
  );
}
