import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { getUser } from "@/lib/auth";
import { features } from "@/lib/features";

export const metadata: Metadata = {
  title: "Pricing",
};

const freeFeatures = [
  "Unlimited dynamic QR codes",
  "PNG download (512 px)",
  "Live scan counts",
  "Edit destinations anytime",
  "Google sign-in",
];

const proFeatures = [
  "Pause and resume short links",
  "Custom short codes",
  "Per-scan detail (time, device)",
  "Custom domain",
  "CSV export",
];

export default async function PricingPage() {
  const user = await getUser();
  const proEnabled = features.pro;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-semibold tracking-tight">
            QRflow
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href={user ? "/dashboard" : "/"}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              {user ? "Dashboard" : "Sign in"}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple pricing while we validate demand
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
            Everything you need to launch is free during the beta. Pro exists as
            a feature flag so we can turn it on later without a rewrite.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Free</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              For restaurants, agents and event organizers.
            </p>
            <p className="mt-5 text-4xl font-bold">
              $0
              <span className="ml-1 text-base font-normal text-slate-500 dark:text-slate-400">
                / month
              </span>
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {freeFeatures.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-emerald-600 dark:text-emerald-400">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href={user ? "/dashboard" : "/"}
              className="mt-7 block rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {user ? "Go to dashboard" : "Get started"}
            </Link>
          </section>

          <section className="relative rounded-2xl border border-indigo-300 bg-white p-6 shadow-sm dark:border-indigo-800 dark:bg-slate-900">
            <div className="absolute right-4 top-4">
              {proEnabled ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Enabled
                </span>
              ) : (
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  Coming soon
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold">Pro</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              For agencies and multi-location teams.
            </p>
            <p className="mt-5 text-4xl font-bold">
              $9
              <span className="ml-1 text-base font-normal text-slate-500 dark:text-slate-400">
                / month
              </span>
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {proFeatures.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-indigo-600 dark:text-indigo-400">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled
              className="mt-7 block w-full cursor-not-allowed rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-400 dark:border-slate-700 dark:text-slate-500"
            >
              {proEnabled ? "Billing not connected yet" : "Not available yet"}
            </button>
          </section>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-slate-500 dark:text-slate-400">
          Billing is intentionally not implemented in this MVP. Pro is controlled
          by the server-only <code className="font-mono">ENABLE_PRO</code> environment
          flag, ready for a Stripe integration later.
        </p>
      </main>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:px-6 dark:text-slate-400">
          <span>QRflow — dynamic QR codes for small teams.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
              Home
            </Link>
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
