import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateQr } from "@/app/dashboard/actions";
import { QrForm } from "@/components/qr-form";
import { requireUser } from "@/lib/auth";
import { parseQrStyle } from "@/lib/qr-style";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit QR code",
};

export default async function EditQrPage({
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

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/dashboard/qrcodes/${qr.id}`}
        className="text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        ← Back to QR code
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        Edit QR code
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        The short link{" "}
        <span className="font-mono text-slate-800 dark:text-slate-200">
          /r/{qr.code}
        </span>{" "}
        stays exactly the same. Only the destination and appearance change.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <QrForm
          action={updateQr}
          submitLabel="Save changes"
          initialName={qr.name}
          initialTargetUrl={qr.target_url}
          initialStyle={parseQrStyle(qr.style)}
          qrId={qr.id}
          cancelHref={`/dashboard/qrcodes/${qr.id}`}
        />
      </div>
    </div>
  );
}
