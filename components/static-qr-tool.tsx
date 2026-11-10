"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { QrCode } from "@/components/qr-code";
import { QrContentEditor } from "@/components/qr-content-editor";
import { QrDownloadButtons } from "@/components/qr-download-buttons";
import { QrStyleEditor } from "@/components/qr-style-editor";
import {
  buildQrContentData,
  emptyQrContent,
  type QrContentState,
} from "@/lib/qr-content";
import { DEFAULT_QR_STYLE, type QrStyle } from "@/lib/qr-style";

export function StaticQrTool() {
  const [content, setContent] = useState<QrContentState>(emptyQrContent);
  const [style, setStyle] = useState<QrStyle>(DEFAULT_QR_STYLE);

  const result = useMemo(
    () => buildQrContentData(content.kind, content),
    [content]
  );

  const downloadName =
    content.kind === "wifi"
      ? `wifi-${content.wifi.ssid || "network"}`
      : content.kind === "vcard"
        ? `vcard-${content.vcard.firstName}-${content.vcard.lastName}`.replace(
            /^-+|-+$/g,
            ""
          ) || "contact"
        : content.kind === "text"
          ? "qr-text"
          : "qr-link";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <QrContentEditor value={content} onChange={setContent} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <QrStyleEditor value={style} onChange={setStyle} />
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto w-full max-w-[280px] rounded-xl bg-white p-3 ring-1 ring-slate-200 dark:ring-slate-700">
            {result.data ? (
              <QrCode
                data={result.data}
                style={style}
                size={256}
                className="mx-auto"
                label="Static QR code preview"
              />
            ) : (
              <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 p-4 text-center dark:border-slate-700">
                <svg
                  viewBox="0 0 24 24"
                  className="h-10 w-10 text-slate-300 dark:text-slate-600"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3 3h7v7H3V3Zm2 2v3h3V5H5Zm9-2h7v7h-7V3Zm2 2v3h3V5h-3ZM3 14h7v7H3v-7Zm2 2v3h3v-3H5Zm9 3h2v2h-2v-2Zm3-3h4v4h-2v-2h-2v-2Zm-3-3h4v2h-4v-2Z" />
                </svg>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your QR code will appear here.
                </p>
              </div>
            )}
          </div>

          <p
            aria-live="polite"
            className={
              result.data
                ? "mt-3 text-center text-xs text-slate-500 dark:text-slate-400"
                : "mt-3 text-center text-xs text-amber-600 dark:text-amber-400"
            }
          >
            {result.data
              ? `Scan with your phone before printing · ${result.bytes} bytes`
              : result.error}
          </p>

          <QrDownloadButtons
            data={result.data}
            style={style}
            name={downloadName}
            className="mt-4"
          />

          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            No account required. Generated in your browser. Nothing is stored.
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 dark:border-indigo-900 dark:bg-indigo-950/40">
          <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
            Need to change it later?
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-indigo-800 dark:text-indigo-200">
            Static text, Wi-Fi and vCard codes freeze their content the moment
            you print them. A dynamic link QR points at a short link you can edit
            forever — no reprints.
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300"
          >
            Create a dynamic QR code →
          </Link>
        </div>
      </aside>
    </div>
  );
}
