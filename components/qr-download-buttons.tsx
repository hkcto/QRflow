"use client";

import { useCallback, useState } from "react";
import { qrStyleToOptions, type QrStyle } from "@/lib/qr-style";

type Extension = "png" | "svg";

function safeFileName(value: string): string {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return cleaned || "qr-code";
}

export function QrDownloadButtons({
  data,
  style,
  name,
  disabled = false,
  className,
}: {
  data: string | null;
  style: QrStyle;
  name: string;
  disabled?: boolean;
  className?: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(
    async (extension: Extension, size?: number) => {
      if (!data) return;

      const key = extension === "png" ? `png-${size}` : "svg";
      setBusy(key);
      setError(null);

      try {
        const { default: QRCodeStyling } = await import("qr-code-styling");
        const qr = new QRCodeStyling(
          qrStyleToOptions({
            data,
            style,
            size: size ?? 512,
            type: extension === "svg" ? "svg" : "canvas",
          })
        );

        await qr.download({
          name: safeFileName(name),
          extension,
        });
      } catch (downloadError) {
        console.error("[qr-download] failed", downloadError);
        setError("Download failed. Please try again.");
      } finally {
        setBusy(null);
      }
    },
    [data, name, style]
  );

  const isDisabled = disabled || !data;

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => download("png", 512)}
          disabled={isDisabled || busy !== null}
          className="flex-1 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === "png-512" ? "Preparing…" : "PNG 512"}
        </button>
        <button
          type="button"
          onClick={() => download("png", 1024)}
          disabled={isDisabled || busy !== null}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {busy === "png-1024" ? "Preparing…" : "PNG 1024"}
        </button>
        <button
          type="button"
          onClick={() => download("svg")}
          disabled={isDisabled || busy !== null}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {busy === "svg" ? "Preparing…" : "SVG"}
        </button>
      </div>
      {error ? (
        <p
          role="alert"
          className="mt-2 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
