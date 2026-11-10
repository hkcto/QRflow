"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import {
  parseQrContentField,
  parseQrKind,
  validateQrContent,
  type QrKind,
} from "@/lib/qr-content";
import { createClient } from "@/lib/supabase/server";
import { generateCode } from "@/lib/qr";
import { parseQrStyleField } from "@/lib/qr-style";
import { hasErrors, validateQrInput } from "@/lib/validation";
import type { FormState } from "@/lib/types";
import type { Database, Json } from "@/types/database";

type QrInsert = Database["public"]["Tables"]["qrcodes"]["Insert"];
type QrUpdate = Database["public"]["Tables"]["qrcodes"]["Update"];

const CONTENT_SCHEMA_ERROR =
  "Text, Wi-Fi and vCard codes need the latest database schema. Run supabase/schema.sql, then try again.";

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

/** `kind` and `payload` were added after the first release. */
function isMissingContentColumn(error: { code?: string; message: string }) {
  return (
    (error.code === "42703" && /kind|payload/i.test(error.message)) ||
    (error.code === "PGRST204" && /kind|payload/i.test(error.message))
  );
}

export async function createQr(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getUser();
  if (!user) redirect("/");

  const content = parseQrContentField(formData.get("content"));
  const kind = content.kind;
  const { name, targetUrl, errors } = validateQrInput(
    formData.get("name"),
    formData.get("target_url"),
    { requireUrl: kind === "url" }
  );

  const validatedContent = validateQrContent(kind, content);
  if (validatedContent.error) errors.content = validatedContent.error;
  if (hasErrors(errors)) return { errors };

  const style = parseQrStyleField(formData.get("style"));
  const target = kind === "url" ? targetUrl : "";
  const contentPayload = validatedContent.payload as unknown as Json;
  const supabase = await createClient();

  let includeStyle = true;
  let includeContent = true;
  let attempt = 0;

  while (attempt < 5) {
    const base = {
      user_id: user.id,
      name,
      code: generateCode(),
      target_url: target,
    };

    const payload: QrInsert = {
      ...base,
      ...(includeStyle ? { style: style as unknown as Json } : {}),
      ...(includeContent ? { kind, payload: contentPayload } : {}),
    };

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

    if (includeContent && isMissingContentColumn(error)) {
      if (kind !== "url") return { error: CONTENT_SCHEMA_ERROR };
      console.warn("[createQr] kind/payload columns missing; retrying without them");
      includeContent = false;
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

  const requestedContent = parseQrContentField(formData.get("content"));
  const supabase = await createClient();

  // Read the stored type first: it is locked, so an edit can never turn a
  // printed text code into a different type.
  const existing = await supabase
    .from("qrcodes")
    .select("kind,payload,target_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  let contentColumns = true;
  let existingKind: QrKind = "url";

  if (existing.error) {
    if (!isMissingContentColumn(existing.error)) {
      return { error: logAndMessage("updateQr", existing.error) };
    }
    // Pre-migration rows can only be URL codes.
    contentColumns = false;
  } else if (!existing.data) {
    return { error: "QR code not found." };
  } else {
    existingKind = parseQrKind(
      (existing.data as { kind?: unknown }).kind
    );
  }

  if (!contentColumns && requestedContent.kind !== "url") {
    return { error: CONTENT_SCHEMA_ERROR };
  }

  const kind = contentColumns ? existingKind : "url";

  if (contentColumns && requestedContent.kind !== existingKind) {
    return { error: "The QR type cannot be changed after creation." };
  }

  const { name, targetUrl, errors } = validateQrInput(
    formData.get("name"),
    formData.get("target_url"),
    { requireUrl: kind === "url" }
  );

  const validatedContent = validateQrContent(kind, requestedContent);
  if (validatedContent.error) errors.content = validatedContent.error;
  if (hasErrors(errors)) return { errors };

  const style = parseQrStyleField(formData.get("style"));
  const target = kind === "url" ? targetUrl : "";
  const contentPayload = validatedContent.payload as unknown as Json;

  let includeStyle = true;
  let includeContent = contentColumns;
  let data: { id: string }[] | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const payload: QrUpdate = {
      name,
      target_url: target,
      ...(includeStyle ? { style: style as unknown as Json } : {}),
      ...(includeContent ? { kind, payload: contentPayload } : {}),
    };

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

    if (includeContent && isMissingContentColumn(result.error)) {
      if (kind !== "url") return { error: CONTENT_SCHEMA_ERROR };
      console.warn("[updateQr] kind/payload columns missing; retrying without them");
      includeContent = false;
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
