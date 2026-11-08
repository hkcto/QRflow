import type { FieldErrors } from "@/lib/validation";

export type FormState = {
  error?: string;
  errors?: FieldErrors;
};
