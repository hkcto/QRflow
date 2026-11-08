import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LEGAL_UPDATED, SITE_NAME } from "@/lib/site";

function Logo() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M3 3h7v7H3V3Zm2 2v3h3V5H5Zm9-2h7v7h-7V3Zm2 2v3h3V5h-3ZM3 14h7v7H3v-7Zm2 2v3h3v-3H5Zm9 0h2v-2h-2v2Zm2 2h2v2h-2v-2Zm2-4h3v2h-3v-2Zm0 4h3v3h-2v-1h-1v-2Z" />
        </svg>
      </span>
      {SITE_NAME}
    </span>
  );
}

export function LegalShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label={`${SITE_NAME} home`}>
            <Logo />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/pricing"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Pricing
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Last updated: {LEGAL_UPDATED}
        </p>
        <p className="mt-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {intro}
        </p>
        {children}
      </main>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:px-6 dark:text-slate-400">
          <span>
            {SITE_NAME} — dynamic QR codes for small teams.
          </span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
              Home
            </Link>
            <Link
              href="/pricing"
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/privacy"
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight">{heading}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}
