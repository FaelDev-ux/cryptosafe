"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";

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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Falha no cadastro.");
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
      title="Cadastro"
      description="Crie uma conta simples para acessar o painel do CryptoSafe."
    >
      <section className="mx-auto w-full max-w-md">
        <form onSubmit={handleSubmit} className="premium-card rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Novo usuario</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Criar conta</h2>

          <div className="mt-6 space-y-4">
            <label className="block space-y-1 text-sm">
              <span className="text-slate-300">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@email.com"
                className="w-full rounded-lg border border-slate-700/70 bg-slate-950/80 px-3 py-2.5 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="text-slate-300">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="w-full rounded-lg border border-slate-700/70 bg-slate-950/80 px-3 py-2.5 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
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
            className="glow-cyan mt-6 w-full rounded-lg bg-linear-to-r from-cyan-400 via-cyan-300 to-indigo-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-70"
          >
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-300">
            Ja tem conta?{" "}
            <Link href="/login" className="text-cyan-300 hover:underline">
              Fazer login
            </Link>
          </p>
        </form>
      </section>
    </AppShell>
  );
}
