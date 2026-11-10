import type { Metadata } from "next";
import Link from "next/link";
import { createQr } from "@/app/dashboard/actions";
import { QrForm } from "@/components/qr-form";

export const metadata: Metadata = {
  title: "New QR code",
};

export default function NewQrPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        ← Back to dashboard
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        Create a QR code
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Choose a link, text, Wi-Fi or vCard code. Link codes get a short link you
        can change later without reprinting. Then style it however you like.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <QrForm
          action={createQr}
          submitLabel="Create QR code"
          cancelHref="/dashboard"
        />
      </div>
    </div>
  );
}
