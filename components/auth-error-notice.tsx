"use client";

import { useEffect, useState } from "react";

/**
 * Shows the OAuth failure banner from `?error=auth`.
 *
 * Reading the query string after hydration keeps the homepage fully static
 * (and edge-cacheable) instead of making the whole page dynamic for a rare
 * error state.
 */
export function AuthErrorNotice() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFailed(params.get("error") === "auth");
  }, []);

  if (!failed) return null;

  return (
    <div className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
      <p
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
      >
        Sign in failed. Please try again.
      </p>
    </div>
  );
}
