import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { CODE_PATTERN, generateQrPng } from "@/lib/qr";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return slug || "qr-code";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!CODE_PATTERN.test(code)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: name, error } = await supabase.rpc("get_qr_public", {
    p_code: code,
  });

  if (error) {
    console.error("[qr-image] get_qr_public failed:", error.message);
    return new NextResponse("Unable to generate this QR code.", { status: 500 });
  }

  if (!name) {
    return new NextResponse("Not found", { status: 404 });
  }

  const png = await generateQrPng(code);
  const download = new URL(request.url).searchParams.get("download") === "1";

  const headers = new Headers({
    "Content-Type": "image/png",
    "Cache-Control":
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    "X-Robots-Tag": "noindex",
  });

  if (download) {
    headers.set(
      "Content-Disposition",
      `attachment; filename="${slugify(name)}-${code}.png"`
    );
  }

  return new NextResponse(new Uint8Array(png), { headers });
}
