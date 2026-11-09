const CODE_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export const CODE_LENGTH = 7;
export const CODE_PATTERN = /^[a-z0-9]{7}$/;

/** 7-character lowercase alphanumeric code, ~78 billion combinations. */
export function generateCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);

  let code = "";
  for (const byte of bytes) {
    code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  }

  return code;
}

export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;

  // Sensible fallbacks so preview deployments still produce working QR codes.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

/** The value encoded inside the QR image. Never depends on target_url. */
export function getRedirectUrl(code: string): string {
  return `${getAppUrl()}/r/${code}`;
}
