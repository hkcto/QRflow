"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { QrStyleEditor } from "@/components/qr-style-editor";
import { DEFAULT_QR_STYLE, type QrStyle } from "@/lib/qr-style";
import type { FormState } from "@/lib/types";

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500";

export function QrForm({
  action,
  submitLabel,
  initialName = "",
  initialTargetUrl = "",
  initialStyle,
  qrId,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  initialName?: string;
  initialTargetUrl?: string;
  initialStyle?: QrStyle;
  qrId?: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [style, setStyle] = useState<QrStyle>(initialStyle ?? DEFAULT_QR_STYLE);

  return (
    <form action={formAction} className="space-y-5">
      {qrId ? <input type="hidden" name="id" value={qrId} /> : null}
      <input type="hidden" name="style" value={JSON.stringify(style)} />

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={initialName}
          required
          maxLength={100}
          placeholder="Spring menu — table tents"
          aria-invalid={Boolean(state.errors?.name)}
          aria-describedby={state.errors?.name ? "name-error" : undefined}
          className={inputClass}
        />
        {state.errors?.name ? (
          <p id="name-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {state.errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="target_url"
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Destination URL
        </label>
        <input
          id="target_url"
          name="target_url"
          type="url"
          defaultValue={initialTargetUrl}
          required
          placeholder="https://example.com/menu"
          aria-invalid={Boolean(state.errors?.targetUrl)}
          aria-describedby={
            state.errors?.targetUrl ? "target-url-error" : "target-url-hint"
          }
          className={inputClass}
        />
        {state.errors?.targetUrl ? (
          <p
            id="target-url-error"
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
          >
            {state.errors.targetUrl}
          </p>
        ) : (
          <p
            id="target-url-hint"
            className="mt-1.5 text-xs text-slate-500 dark:text-slate-400"
          >
            You can change this anytime. The printed QR code never changes.
          </p>
        )}
      </div>

      <div>
        <QrStyleEditor value={style} onChange={setStyle} />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
