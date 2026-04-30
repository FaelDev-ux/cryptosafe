"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

const links = [
  { href: "/dashboard", label: "Painel" },
  { href: "/analyze", label: "Analisar" },
  { href: "/history", label: "Historico" },
];

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="soft-grid absolute inset-0 opacity-80" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07110f]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-teal-300/25 bg-teal-300/10 text-sm font-black text-teal-200">
              CS
            </span>
            <span className="leading-tight">
              <span className="block text-base font-black tracking-wide text-white">CryptoSafe</span>
              <span className="block text-xs text-slate-400">risk intelligence</span>
            </span>
          </Link>

          {isAuthPage ? (
            <Link
              href={pathname === "/login" ? "/register" : "/login"}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-teal-300/40 hover:bg-teal-300/10 hover:text-white"
            >
              {pathname === "/login" ? "Criar conta" : "Entrar"}
            </Link>
          ) : (
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-xl px-3 py-2 font-semibold transition-all duration-200 ${
                      active
                        ? "bg-teal-300 text-slate-950 shadow-[0_12px_30px_rgba(45,212,191,0.22)]"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/login");
                  router.refresh();
                }}
                className="rounded-xl border border-rose-300/20 px-3 py-2 font-semibold text-rose-100 transition hover:bg-rose-400/10"
              >
                Sair
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8">
        {!isAuthPage ? (
          <section className="mb-8 border-b border-white/10 pb-6">
            <div className="inline-flex items-center rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-200">
              Secure Crypto Intelligence
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-white md:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              {description}
            </p>
          </section>
        ) : null}
        {children}
      </main>
    </div>
  );
}
