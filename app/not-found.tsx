import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        This QR code is not available
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">
        The link may have been deleted, paused, or mistyped.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
      >
        Go to homepage
      </Link>
    </main>
  );
}
