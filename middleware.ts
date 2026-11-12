import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  // Signed-in visitors skip the marketing homepage. The session is validated
  // above, so an expired cookie can never bounce between `/` and `/dashboard`.
  if (user && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";

    const redirect = NextResponse.redirect(url);
    for (const cookie of response.headers.getSetCookie()) {
      redirect.headers.append("set-cookie", cookie);
    }
    return redirect;
  }

  return response;
}

export const config = {
  // Only refresh the session where it can change: the homepage (signed-in
  // redirect), protected pages and the OAuth callback. Public marketing and
  // legal pages stay on the CDN cache without invoking auth.
  matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
};
