/**
 * Builders for the four static QR content types. Pure functions so they can be
 * unit-tested and reused anywhere (no DOM, no database).
 */

export type WifiEncryption = "WPA" | "WEP" | "nopass";

export type WifiInput = {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
};

export type VCardInput = {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  address: string;
};

/** Rough ceiling for a Q-level QR in byte mode (version 40 is 1663 bytes). */
export const MAX_STATIC_PAYLOAD_BYTES = 1200;

/** Escapes `\ ; , : "` as required by the Wi-Fi QR convention. */
export function escapeWifi(value: string): string {
  return value.replace(/([\\;,":])/g, "\\$1");
}

/** Escapes `\ ; ,` and line breaks for vCard 3.0 text values. */
export function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function buildWifiPayload(input: WifiInput): string {
  const encryption = input.encryption;
  const parts = [
    `WIFI:T:${encryption};`,
    `S:${escapeWifi(input.ssid.trim())};`,
  ];

  if (encryption !== "nopass" && input.password) {
    parts.push(`P:${escapeWifi(input.password)};`);
  }
  if (input.hidden) {
    parts.push("H:true;");
  }

  // Final semicolon is required by most scanner implementations.
  return `${parts.join("")};`;
}

export function buildVCardPayload(input: VCardInput): string {
  const first = input.firstName.trim();
  const last = input.lastName.trim();
  const fullName = [first, last].filter(Boolean).join(" ") || "Contact";

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
    `FN:${escapeVCard(fullName)}`,
  ];

  const organization = input.organization.trim();
  if (organization) lines.push(`ORG:${escapeVCard(organization)}`);

  const title = input.title.trim();
  if (title) lines.push(`TITLE:${escapeVCard(title)}`);

  const phone = input.phone.trim();
  if (phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(phone)}`);

  const email = input.email.trim();
  if (email) lines.push(`EMAIL:${escapeVCard(email)}`);

  const website = input.website.trim();
  if (website) lines.push(`URL:${escapeVCard(website)}`);

  const address = input.address.trim();
  if (address) lines.push(`ADR;TYPE=WORK:;;${escapeVCard(address)};;;;`);

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export type StaticQrKind = "link" | "text" | "wifi" | "vcard";

export type LinkInput = { url: string };

/** Adds `https://` when the user omits a scheme, then verifies the protocol. */
export function normalizeLink(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

export function measurePayload(payload: string): number {
  return new TextEncoder().encode(payload).length;
}

export type StaticPayloadResult = {
  data: string | null;
  error: string | null;
  bytes: number;
};

function tooLarge(bytes: number): StaticPayloadResult {
  return {
    data: null,
    bytes,
    error: `This content is too large for a reliable QR code (${bytes} bytes). Shorten it by about ${bytes - MAX_STATIC_PAYLOAD_BYTES} bytes.`,
  };
}

function finalize(payload: string): StaticPayloadResult {
  const bytes = measurePayload(payload);
  if (bytes > MAX_STATIC_PAYLOAD_BYTES) return tooLarge(bytes);
  return { data: payload, error: null, bytes };
}

export function buildStaticPayload(
  kind: StaticQrKind,
  input: {
    link: string;
    text: string;
    wifi: WifiInput;
    vcard: VCardInput;
  }
): StaticPayloadResult {
  if (kind === "link") {
    if (!input.link.trim()) {
      return { data: null, error: "Enter a link to generate a QR code.", bytes: 0 };
    }
    const url = normalizeLink(input.link);
    if (!url) {
      return {
        data: null,
        error: "Enter a valid http:// or https:// link.",
        bytes: 0,
      };
    }
    return finalize(url);
  }

  if (kind === "text") {
    if (!input.text.trim()) {
      return {
        data: null,
        error: "Type some text to generate a QR code.",
        bytes: 0,
      };
    }
    return finalize(input.text);
  }

  if (kind === "wifi") {
    if (!input.wifi.ssid.trim()) {
      return {
        data: null,
        error: "Enter the network name (SSID).",
        bytes: 0,
      };
    }
    return finalize(buildWifiPayload(input.wifi));
  }

  const vcard = input.vcard;
  const hasName = Boolean(vcard.firstName.trim() || vcard.lastName.trim());
  const hasContact = Boolean(
    vcard.phone.trim() || vcard.email.trim() || vcard.website.trim()
  );
  if (!hasName) {
    return {
      data: null,
      error: "Enter at least a first or last name.",
      bytes: 0,
    };
  }
  if (!hasContact) {
    return {
      data: null,
      error: "Add at least one contact method (phone, email or website).",
      bytes: 0,
    };
  }
  return finalize(buildVCardPayload(vcard));
}
