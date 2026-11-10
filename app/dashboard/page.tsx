import type { Metadata } from "next";
import Link from "next/link";
import { QrCard } from "@/components/qr-card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { QrCodeRow } from "@/types/database";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("qrcodes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const qrcodes: QrCodeRow[] = data ?? [];
  const totalScans = qrcodes.reduce((sum, qr) => sum + qr.scan_count, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Your QR codes
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Links stay editable forever. Text, Wi-Fi and vCard codes are encoded
            directly.
          </p>
        </div>
        <Link
          href="/dashboard/qrcodes/new"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
        >
          + New QR code
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            QR codes
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">
            {qrcodes.length.toLocaleString("en-US")}
          </dd>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total scans
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">
            {totalScans.toLocaleString("en-US")}
          </dd>
        </div>
      </dl>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          Could not load your QR codes. Please refresh the page.
        </p>
      ) : null}

      {qrcodes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 3h7v7H3V3Zm2 2v3h3V5H5Zm9-2h7v7h-7V3Zm2 2v3h3V5h-3ZM3 14h7v7H3v-7Zm2 2v3h3v-3H5Zm9 3h2v2h-2v-2Zm3-3h4v4h-2v-2h-2v-2Zm-3-3h4v2h-4v-2Z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold">No QR codes yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Create your first dynamic QR code and print it with confidence. You
            can change where it points whenever you need to.
          </p>
          <Link
            href="/dashboard/qrcodes/new"
            className="mt-6 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Create your first QR code
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {qrcodes.map((qr) => (
            <QrCard key={qr.id} qr={qr} />
          ))}
        </div>
      )}
    </div>
  );
}
