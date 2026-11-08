import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { CODE_PATTERN } from "@/lib/qr";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!CODE_PATTERN.test(code)) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: targetUrl, error } = await supabase.rpc("increment_scan", {
    p_code: code,
  });

  if (error) {
    console.error("[redirect] increment_scan failed:", error.message);
    return new NextResponse("Unable to resolve this QR code.", { status: 500 });
  }

  if (!targetUrl) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  try {
    new URL(targetUrl);
  } catch {
    console.error("[redirect] invalid stored target_url for code", code);
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  const response = NextResponse.redirect(targetUrl, 307);
  response.headers.set("X-Robots-Tag", "noindex");
  return response;
}
