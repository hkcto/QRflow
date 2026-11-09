"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { generateCode } from "@/lib/qr";
import { parseQrStyleField } from "@/lib/qr-style";
import { hasErrors, validateQrInput } from "@/lib/validation";
import type { FormState } from "@/lib/types";
import type { Database, Json } from "@/types/database";

type QrInsert = Database["public"]["Tables"]["qrcodes"]["Insert"];
type QrUpdate = Database["public"]["Tables"]["qrcodes"]["Update"];

function logAndMessage(context: string, error: { code?: string; message: string }) {
  console.error(`[${context}]`, error.code ?? "unknown", error.message);
  return "Something went wrong. Please try again.";
}

/**
 * `style` is a newer column. If the SQL migration has not been applied yet,
 * PostgREST rejects the write with 42703 / PGRST204. Retry once without it so
 * the app keeps working before the migration is run.
 */
function isMissingStyleColumn(error: { code?: string; message: string }) {
  return (
    error.code === "42703" ||
    (error.code === "PGRST204" && /style/i.test(error.message))
  );
}

export async function createQr(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getUser();
  if (!user) redirect("/");

  const { name, targetUrl, errors } = validateQrInput(
    formData.get("name"),
    formData.get("target_url")
  );
  if (hasErrors(errors)) return { errors };

  const style = parseQrStyleField(formData.get("style"));
  const supabase = await createClient();

  let includeStyle = true;
  let attempt = 0;

  while (attempt < 5) {
    const base = {
      user_id: user.id,
      name,
      code: generateCode(),
      target_url: targetUrl,
    };

    const payload: QrInsert = includeStyle
      ? { ...base, style: style as unknown as Json }
      : base;

    const { data, error } = await supabase
      .from("qrcodes")
      .insert(payload)
      .select("id")
      .single();

    if (!error) {
      revalidatePath("/dashboard");
      redirect(`/dashboard/qrcodes/${data.id}`);
    }

    if (includeStyle && isMissingStyleColumn(error)) {
      console.warn("[createQr] style column missing; retrying without it");
      includeStyle = false;
      continue;
    }

    if (error.code === "23505") {
      attempt += 1;
      continue;
    }

    return { error: logAndMessage("createQr", error) };
  }

  return { error: "Could not generate a unique short code. Please try again." };
}

export async function updateQr(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getUser();
  if (!user) redirect("/");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing QR code id." };
  }

  const { name, targetUrl, errors } = validateQrInput(
    formData.get("name"),
    formData.get("target_url")
  );
  if (hasErrors(errors)) return { errors };

  const style = parseQrStyleField(formData.get("style"));
  const supabase = await createClient();

  let includeStyle = true;
  let data: { id: string }[] | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const payload: QrUpdate = includeStyle
      ? {
          name,
          target_url: targetUrl,
          style: style as unknown as Json,
        }
      : { name, target_url: targetUrl };

    const result = await supabase
      .from("qrcodes")
      .update(payload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id");

    if (!result.error) {
      data = result.data;
      break;
    }

    if (includeStyle && isMissingStyleColumn(result.error)) {
      console.warn("[updateQr] style column missing; retrying without it");
      includeStyle = false;
      continue;
    }

    return { error: logAndMessage("updateQr", result.error) };
  }

  if (!data || data.length === 0) return { error: "QR code not found." };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/qrcodes/${id}`);
  redirect(`/dashboard/qrcodes/${id}`);
}

export async function deleteQr(formData: FormData): Promise<void> {
  const user = await getUser();
  if (!user) redirect("/");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("qrcodes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    logAndMessage("deleteQr", error);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
