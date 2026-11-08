import type { ReactNode } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : (user.email ?? "Account");
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
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
              QRflow
            </Link>
            <nav className="hidden items-center gap-4 text-sm font-medium text-slate-600 sm:flex dark:text-slate-300">
              <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white">
                QR codes
              </Link>
              <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white">
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <div className="hidden items-center gap-2 sm:flex">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  width={32}
                  height={32}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full ring-1 ring-slate-200 dark:ring-slate-700"
                />
              ) : null}
              <span className="max-w-[10rem] truncate text-sm text-slate-600 dark:text-slate-300">
                {fullName}
              </span>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
