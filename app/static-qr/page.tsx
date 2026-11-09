import type { Metadata } from "next";
import Link from "next/link";
import { StaticQrTool } from "@/components/static-qr-tool";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free static QR code generator",
  description:
    "Generate a styled QR code for a link, text, Wi-Fi network or contact card. No account, no tracking — everything happens in your browser.",
};

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
          <path d="M3 3h7v7H3V3Zm2 2v3h3V5H5Zm9-2h7v7h-7V3Zm2 2v3h3V5h-3ZM3 14h7v7H3v-7Zm2 2v3h3v-3H5Zm9 3h2v2h-2v-2Zm3-3h4v4h-2v-2h-2v-2Zm-3-3h4v2h-4v-2Z" />
        </svg>
      </span>
      {SITE_NAME}
    </span>
  );
}

export default function StaticQrPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label={`${SITE_NAME} home`}>
            <Logo />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:block dark:text-slate-300 dark:hover:text-white"
            >
              Dynamic QR
            </Link>
            <Link
              href="/pricing"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:block dark:text-slate-300 dark:hover:text-white"
            >
              Pricing
            </Link>
            <ThemeToggle />
            <Link
              href="/"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            No account required
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Free static QR code generator
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Create a styled QR code for a link, plain text, a Wi-Fi network or a
            contact card. Everything is generated in your browser and nothing is
            stored on our servers.
          </p>
        </div>

        <div className="mt-8">
          <StaticQrTool />
        </div>

        <section className="mt-14 grid gap-6 border-t border-slate-200 pt-10 sm:grid-cols-3 dark:border-slate-800">
          {[
            {
              title: "Four content types",
              body: "Links, free text, Wi-Fi credentials and vCard contact cards.",
            },
            {
              title: "Print-ready files",
              body: "Download PNG at 512 px or 1024 px, or a scalable SVG.",
            },
            {
              title: "Private by design",
              body: "No upload, no database, no scan tracking. Close the tab and it is gone.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.body}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:px-6 dark:text-slate-400">
          <span>{SITE_NAME} — dynamic QR codes for small teams.</span>
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
