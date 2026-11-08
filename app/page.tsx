import Link from "next/link";
import { redirect } from "next/navigation";
import { signInWithGoogle } from "@/app/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { getUser } from "@/lib/auth";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.86c2.26-2.09 3.56-5.17 3.56-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a11.86 11.86 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function Logo() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M3 3h7v7H3V3Zm2 2v3h3V5H5Zm9-2h7v7h-7V3Zm2 2v3h3V5h-3ZM3 14h7v7H3v-7Zm2 2v3h3v-3H5Zm9 0h2v-2h-2v2Zm2 2h2v2h-2v-2Zm2-4h3v2h-3v-2Zm0 4h3v3h-2v-1h-1v-2Z" />
        </svg>
      </span>
      QRflow
    </span>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="QRflow home">
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
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Sign in
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {error === "auth" ? (
          <div className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
            >
              Sign in failed. Please try again.
            </p>
          </div>
        ) : null}

        <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Dynamic QR codes
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Print the QR code once.
              <span className="block text-indigo-600 dark:text-indigo-400">
                Change the destination forever.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Menus change. Listings sell. Events move. Your printed QR code
              should never go stale. Point it at a short link you control and
              update the destination in seconds.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <form action={signInWithGoogle}>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-offset-slate-950"
                >
                  <GoogleMark />
                  Continue with Google
                </button>
              </form>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Free to start. No credit card.
              </span>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-6 text-sm dark:border-slate-800">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Setup</dt>
                <dd className="mt-1 text-xl font-semibold">2 min</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Reprints</dt>
                <dd className="mt-1 text-xl font-semibold">Zero</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Scans tracked</dt>
                <dd className="mt-1 text-xl font-semibold">Live</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-indigo-200/60 via-sky-100/40 to-transparent blur-2xl dark:from-indigo-900/40 dark:via-sky-950/30" />
            <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
                <span className="text-xs text-slate-400">1,284 scans</span>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Short link
                </p>
                <p className="mt-1 font-mono text-sm text-slate-800 dark:text-slate-200">
                  qrflow.app/r/8f3k2pz
                </p>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Before</span>
                  <span className="text-slate-400 line-through">example.com/menu-v1</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2.5 text-sm dark:border-indigo-900 dark:bg-indigo-950/40">
                  <span className="text-indigo-700 dark:text-indigo-300">Now</span>
                  <span className="font-medium text-indigo-900 dark:text-indigo-100">
                    example.com/menu-v2
                  </span>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                Updated 2 minutes ago · same QR code
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3 sm:px-6">
            {[
              {
                title: "Print once, update anytime",
                body: "The QR image always encodes your stable /r/ link. Change the destination whenever you need to.",
              },
              {
                title: "Every scan counted",
                body: "See how many times each code was scanned. Know which table tent, flyer or sign is working.",
              },
              {
                title: "Google sign-in only",
                body: "No passwords to remember or reset. Your QR codes stay private to your account.",
              },
            ].map((feature) => (
              <div key={feature.title}>
                <h2 className="font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Three steps to a QR code that never expires
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { step: "1", title: "Create", body: "Name it, paste the destination, and generate a short link." },
              { step: "2", title: "Download", body: "Get a high-resolution PNG for stickers, menus and signs." },
              { step: "3", title: "Update", body: "Change the destination later. The printed code keeps working." },
            ].map((item) => (
              <li
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  {item.step}
                </span>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:px-6 dark:text-slate-400">
          <span>QRflow — dynamic QR codes for small teams.</span>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white">
              Terms
            </Link>
            <span>Weekend MVP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
