import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Deduplicated per-request user lookup. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/** Use in protected pages and server actions. */
export async function requireUser() {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  return user;
}
