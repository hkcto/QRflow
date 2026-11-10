"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy link",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked; the link is still selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={
        className ||
        "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      }
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
