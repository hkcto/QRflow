import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteQr } from "@/app/dashboard/actions";
import { CopyButton } from "@/components/copy-button";
import { DeleteForm } from "@/components/delete-form";
import { QrCode } from "@/components/qr-code";
import { QrDownloadButtons } from "@/components/qr-download-buttons";
import { requireUser } from "@/lib/auth";
import {
  parseQrKind,
  parseQrPayload,
  qrContentData,
  qrContentDetails,
  qrContentSummary,
} from "@/lib/qr-content";
import { getRedirectUrl } from "@/lib/qr";
import { parseQrStyle } from "@/lib/qr-style";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "QR code details",
};

export default async function QrDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: qr } = await supabase
    .from("qrcodes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!qr) notFound();

  const kind = parseQrKind(qr.kind);
  const payload = parseQrPayload(kind, qr.payload);
  const summary = qrContentSummary(qr);
  const details = qrContentDetails(kind, payload);
  const data = qrContentData(qr);
  const isUrl = kind === "url";
  const shortUrl = isUrl ? getRedirectUrl(qr.code) : null;
  const style = parseQrStyle(qr.style);
  const createdAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(qr.created_at));

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        ← Back to dashboard
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              {qr.name}
            </h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              {summary.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Created {createdAt}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={`/dashboard/qrcodes/${qr.id}/edit`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Edit
          </Link>
          <DeleteForm
            id={qr.id}
            action={deleteQr}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/70 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Delete
          </DeleteForm>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto w-full max-w-[320px] rounded-xl bg-white p-3 ring-1 ring-slate-200 dark:ring-slate-700">
            {data ? (
              <QrCode
                data={data}
                style={style}
                size={288}
                label={`QR code for ${qr.name}`}
                className="mx-auto"
              />
            ) : (
              <div className="grid aspect-square place-items-center rounded-lg border border-dashed border-red-300 p-4 text-center text-sm text-red-600 dark:border-red-800 dark:text-red-400">
                The stored content is incomplete. Edit this QR code to fix it.
              </div>
            )}
          </div>
          <QrDownloadButtons
            data={data}
            style={style}
            name={qr.name || qr.code}
            className="mt-4"
          />
          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            PNG at 512 px or 1024 px, or a scalable SVG. Ready to print.
          </p>
        </section>

        <div className="space-y-6">
          {isUrl && shortUrl ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Short link
              </h2>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  readOnly
                  value={shortUrl}
                  aria-label="Short link"
                  className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />
                <CopyButton
                  value={shortUrl}
                  className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                This is what the QR image encodes. It never changes, even when
                the destination does.
              </p>
            </section>
          ) : null}

          {isUrl ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Destination
              </h2>
              <a
                href={qr.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block break-all text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {qr.target_url}
              </a>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Changing this keeps the same QR code.
                </p>
                <Link
                  href={`/dashboard/qrcodes/${qr.id}/edit`}
                  className="shrink-0 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Change destination
                </Link>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Encoded content
              </h2>
              <dl className="mt-3 space-y-3">
                {details.map((detail) => (
                  <div key={detail.label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {detail.label}
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm text-slate-800 dark:text-slate-200">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Encoded directly. Changing it requires printing a new code.
                </p>
                <Link
                  href={`/dashboard/qrcodes/${qr.id}/edit`}
                  className="shrink-0 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Edit content
                </Link>
              </div>
            </section>
          )}

          <section className="grid grid-cols-2 gap-4">
            {isUrl ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Scans
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {qr.scan_count.toLocaleString("en-US")}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tracking
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Not tracked
                </p>
              </div>
            )}
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Status
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <span
                  className={
                    qr.is_active
                      ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                  }
                >
                  <span
                    className={
                      qr.is_active
                        ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                        : "h-1.5 w-1.5 rounded-full bg-amber-500"
                    }
                  />
                  {qr.is_active ? "Active" : "Paused"}
                </span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
