export type FieldErrors = {
  name?: string;
  targetUrl?: string;
};

export type ValidatedQrInput = {
  name: string;
  targetUrl: string;
  errors: FieldErrors;
};

export function validateQrInput(
  name: unknown,
  targetUrl: unknown
): ValidatedQrInput {
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanUrl = typeof targetUrl === "string" ? targetUrl.trim() : "";
  const errors: FieldErrors = {};

  if (!cleanName) {
    errors.name = "Name is required.";
  } else if (cleanName.length > 100) {
    errors.name = "Name must be 100 characters or fewer.";
  }

  if (!cleanUrl) {
    errors.targetUrl = "Destination URL is required.";
  } else {
    try {
      const parsed = new URL(cleanUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        errors.targetUrl = "Only http:// and https:// links are allowed.";
      }
    } catch {
      errors.targetUrl = "Enter a valid URL starting with https://";
    }
  }

  return { name: cleanName, targetUrl: cleanUrl, errors };
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
