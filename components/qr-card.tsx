import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { DeleteForm } from "@/components/delete-form";
import { QrCode } from "@/components/qr-code";
import { deleteQr } from "@/app/dashboard/actions";
import {
  qrContentData,
  qrContentSummary,
} from "@/lib/qr-content";
import { getRedirectUrl } from "@/lib/qr";
import { parseQrStyle } from "@/lib/qr-style";
import type { QrCodeRow } from "@/types/database";

export function QrCard({ qr }: { qr: QrCodeRow }) {
  const summary = qrContentSummary(qr);
  const data = qrContentData(qr);
  const isUrl = summary.kind === "url";

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex gap-4">
        <Link
          href={`/dashboard/qrcodes/${qr.id}`}
          className="shrink-0 rounded-xl bg-white p-1 ring-1 ring-slate-200 dark:ring-slate-700"
        >
          {data ? (
            <QrCode
              data={data}
              style={parseQrStyle(qr.style)}
              size={88}
              label={`QR code for ${qr.name}`}
              className="pointer-events-none"
            />
          ) : (
            <div className="grid h-[88px] w-[88px] place-items-center p-1 text-center text-[10px] text-red-600 dark:text-red-400">
              Fix content
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-slate-900 dark:text-white">
            <Link href={`/dashboard/qrcodes/${qr.id}`} className="hover:underline">
              {qr.name}
            </Link>
          </h2>
          <p className="mt-1 line-clamp-2 break-all text-xs text-slate-500 dark:text-slate-400">
            {summary.detail}
          </p>
          <p className="mt-2 font-mono text-[11px] text-slate-400 dark:text-slate-500">
            {isUrl ? `/r/${qr.code}` : summary.label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            {isUrl ? (
              <>
                <span className="text-lg font-semibold tabular-nums text-slate-900 dark:text-white">
                  {qr.scan_count.toLocaleString("en-US")}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {qr.scan_count === 1 ? "scan" : "scans"}
                </span>
              </>
            ) : (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                Encoded directly
              </span>
            )}
            {!qr.is_active ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Paused
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <CopyButton
          value={isUrl ? getRedirectUrl(qr.code) : (data ?? "")}
          label={isUrl ? "Copy link" : "Copy content"}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        />
        <div className="flex items-center gap-3 text-sm">
          <Link
            href={`/dashboard/qrcodes/${qr.id}/edit`}
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Edit
          </Link>
          <DeleteForm
            id={qr.id}
            action={deleteQr}
            className="font-medium text-red-600 hover:underline dark:text-red-400"
          />
        </div>
      </div>
    </article>
  );
}
