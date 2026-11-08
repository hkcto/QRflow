"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { generateCode } from "@/lib/qr";
import { hasErrors, validateQrInput } from "@/lib/validation";
import type { FormState } from "@/lib/types";

function logAndMessage(context: string, error: { code?: string; message: string }) {
  console.error(`[${context}]`, error.code ?? "unknown", error.message);
  return "Something went wrong. Please try again.";
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

  const supabase = await createClient();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await supabase
      .from("qrcodes")
      .insert({
        user_id: user.id,
        name,
        code: generateCode(),
        target_url: targetUrl,
      })
      .select("id")
      .single();

    if (!error) {
      revalidatePath("/dashboard");
      redirect(`/dashboard/qrcodes/${data.id}`);
    }

    if (error.code !== "23505") {
      return { error: logAndMessage("createQr", error) };
    }
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qrcodes")
    .update({ name, target_url: targetUrl })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) return { error: logAndMessage("updateQr", error) };
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
