import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip static assets, the public redirect endpoint and the QR image endpoint.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|r/|api/qr).*)"],
};
