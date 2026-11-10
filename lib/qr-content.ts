/**
 * Content model for the four QR types. URL codes keep the redirect + tracking
 * behaviour; text, Wi-Fi and vCard codes encode their content directly and are
 * never routed through `/r/<code>`.
 *
 * Everything here is pure (no DOM, no database) so it can be shared by the
 * static tool, the dashboard form, Server Actions and unit tests.
 */

import { getRedirectUrl } from "./qr";
import {
  buildStaticPayload,
  buildVCardPayload,
  buildWifiPayload,
  type StaticPayloadResult,
  type VCardInput,
  type WifiEncryption,
  type WifiInput,
} from "./qr-payload";

export const QR_KINDS = ["url", "text", "wifi", "vcard"] as const;
export type QrKind = (typeof QR_KINDS)[number];

export const QR_KIND_LABELS: Record<QrKind, string> = {
  url: "Link",
  text: "Text",
  wifi: "Wi-Fi",
  vcard: "vCard",
};

export type QrTextPayload = { text: string };
export type QrWifiPayload = { wifi: WifiInput };
export type QrVCardPayload = { vcard: VCardInput };
export type QrPayload =
  | QrTextPayload
  | QrWifiPayload
  | QrVCardPayload
  | Record<string, never>;

export type QrContentState = {
  kind: QrKind;
  /** Only used when `kind === "url"`. */
  url: string;
  text: string;
  wifi: WifiInput;
  vcard: VCardInput;
};

const WIFI_ENCRYPTIONS: readonly WifiEncryption[] = ["WPA", "WEP", "nopass"];

function emptyWifi(): WifiInput {
  return { ssid: "", password: "", encryption: "WPA", hidden: false };
}

function emptyVCard(): VCardInput {
  return {
    firstName: "",
    lastName: "",
    organization: "",
    title: "",
    phone: "",
    email: "",
    website: "",
    address: "",
  };
}

export function emptyQrContent(): QrContentState {
  return {
    kind: "url",
    url: "",
    text: "",
    wifi: emptyWifi(),
    vcard: emptyVCard(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function parseQrKind(value: unknown): QrKind {
  return typeof value === "string" &&
    (QR_KINDS as readonly string[]).includes(value)
    ? (value as QrKind)
    : "url";
}

function normalizeWifi(value: unknown): WifiInput {
  const record = isRecord(value) ? value : {};
  const encryption = WIFI_ENCRYPTIONS.includes(
    record.encryption as WifiEncryption
  )
    ? (record.encryption as WifiEncryption)
    : "WPA";

  return {
    ssid: text(record.ssid),
    password: text(record.password),
    encryption,
    hidden: record.hidden === true,
  };
}

function normalizeVCard(value: unknown): VCardInput {
  const record = isRecord(value) ? value : {};
  return {
    firstName: text(record.firstName),
    lastName: text(record.lastName),
    organization: text(record.organization),
    title: text(record.title),
    phone: text(record.phone),
    email: text(record.email),
    website: text(record.website),
    address: text(record.address),
  };
}

/** Coerces the stored/raw payload into the shape expected for `kind`. */
export function parseQrPayload(kind: QrKind, value: unknown): QrPayload {
  const record = isRecord(value) ? value : {};

  if (kind === "text") return { text: text(record.text) };
  if (kind === "wifi") return { wifi: normalizeWifi(record.wifi) };
  if (kind === "vcard") return { vcard: normalizeVCard(record.vcard) };
  return {};
}

/** Coerces the hidden form field / client state into a safe content object. */
export function parseQrContent(value: unknown): QrContentState {
  const record = isRecord(value) ? value : {};
  return {
    kind: parseQrKind(record.kind),
    url: text(record.url),
    text: text(record.text),
    wifi: normalizeWifi(record.wifi),
    vcard: normalizeVCard(record.vcard),
  };
}

/** Reads the hidden `content` form field (JSON). */
export function parseQrContentField(
  value: FormDataEntryValue | null
): QrContentState {
  if (typeof value !== "string" || !value) return emptyQrContent();
  try {
    return parseQrContent(JSON.parse(value));
  } catch {
    return emptyQrContent();
  }
}

export type QrContentRow = {
  code: string;
  target_url?: string | null;
  kind?: unknown;
  payload?: unknown;
};

/** Rebuilds editable form state from a database row. */
export function qrContentFromRow(row: QrContentRow): QrContentState {
  const kind = parseQrKind(row.kind);
  const payload = parseQrPayload(kind, row.payload);
  const content = emptyQrContent();
  content.kind = kind;

  if (kind === "url") {
    content.url = text(row.target_url);
  } else if (kind === "text") {
    content.text = (payload as QrTextPayload).text;
  } else if (kind === "wifi") {
    content.wifi = (payload as QrWifiPayload).wifi;
  } else {
    content.vcard = (payload as QrVCardPayload).vcard;
  }

  return content;
}

function normalizeContentForKind(
  kind: QrKind,
  content: QrContentState
): QrContentState {
  return {
    kind,
    url: text(content.url),
    text: text(content.text),
    wifi: normalizeWifi(content.wifi),
    vcard: normalizeVCard(content.vcard),
  };
}

/** The string that will be encoded inside the QR image for this content. */
export function buildQrContentData(
  kind: QrKind,
  content: QrContentState
): StaticPayloadResult {
  const normalized = normalizeContentForKind(kind, content);
  return buildStaticPayload(kind === "url" ? "link" : kind, {
    link: normalized.url,
    text: normalized.text,
    wifi: normalized.wifi,
    vcard: normalized.vcard,
  });
}

export function payloadFromContent(
  kind: QrKind,
  content: QrContentState
): QrPayload {
  const normalized = normalizeContentForKind(kind, content);
  if (kind === "text") return { text: normalized.text };
  if (kind === "wifi") return { wifi: normalized.wifi };
  if (kind === "vcard") return { vcard: normalized.vcard };
  return {};
}

export type ValidatedQrContent = {
  kind: QrKind;
  payload: QrPayload;
  /** Encoded payload for non-URL types; `null` for URL codes. */
  data: string | null;
  error: string | null;
};

/**
 * Server-side allow-list check. URL codes are validated separately (only
 * `http:`/`https:`), while direct-content types must fit in a reliable QR and
 * contain the required fields.
 */
export function validateQrContent(
  kind: QrKind,
  content: QrContentState
): ValidatedQrContent {
  if (kind === "url") {
    return { kind, payload: {}, data: null, error: null };
  }

  const result = buildQrContentData(kind, content);
  return {
    kind,
    payload: payloadFromContent(kind, content),
    data: result.data,
    error: result.error,
  };
}

/** The exact string rendered/downloaded for a stored row. */
export function qrContentData(row: QrContentRow): string | null {
  const kind = parseQrKind(row.kind);
  if (kind === "url") return getRedirectUrl(row.code);

  const payload = parseQrPayload(kind, row.payload);
  if (kind === "text") {
    const value = (payload as QrTextPayload).text;
    return value ? value : null;
  }
  if (kind === "wifi") {
    const wifi = (payload as QrWifiPayload).wifi;
    return wifi.ssid.trim() ? buildWifiPayload(wifi) : null;
  }
  return buildVCardPayload((payload as QrVCardPayload).vcard);
}

export type QrContentSummary = {
  kind: QrKind;
  label: string;
  /** One-line description used on cards and detail pages. */
  detail: string;
};

export function qrContentSummary(row: QrContentRow): QrContentSummary {
  const kind = parseQrKind(row.kind);
  const payload = parseQrPayload(kind, row.payload);

  if (kind === "url") {
    return { kind, label: "Link", detail: text(row.target_url) };
  }

  if (kind === "text") {
    return { kind, label: "Text", detail: (payload as QrTextPayload).text };
  }

  if (kind === "wifi") {
    const wifi = (payload as QrWifiPayload).wifi;
    return {
      kind,
      label: "Wi-Fi",
      detail: wifi.ssid ? `Network: ${wifi.ssid}` : "Wi-Fi network",
    };
  }

  const vcard = (payload as QrVCardPayload).vcard;
  const name =
    [vcard.firstName, vcard.lastName].filter(Boolean).join(" ") ||
    vcard.organization ||
    "Contact";
  return { kind, label: "vCard", detail: name };
}

export type QrContentDetail = { label: string; value: string };

/** Human-readable fields for the dashboard detail page. */
export function qrContentDetails(
  kind: QrKind,
  payload: QrPayload
): QrContentDetail[] {
  if (kind === "text") {
    return [{ label: "Text", value: (payload as QrTextPayload).text }];
  }

  if (kind === "wifi") {
    const wifi = (payload as QrWifiPayload).wifi;
    return [
      { label: "Network (SSID)", value: wifi.ssid },
      {
        label: "Security",
        value:
          wifi.encryption === "nopass"
            ? "Open network"
            : wifi.encryption,
      },
      ...(wifi.encryption === "nopass" || !wifi.password
        ? []
        : [{ label: "Password", value: wifi.password }]),
      ...(wifi.hidden ? [{ label: "Hidden", value: "Yes" }] : []),
    ];
  }

  if (kind === "vcard") {
    const vcard = (payload as QrVCardPayload).vcard;
    return [
      {
        label: "Name",
        value: [vcard.firstName, vcard.lastName].filter(Boolean).join(" "),
      },
      { label: "Company", value: vcard.organization },
      { label: "Job title", value: vcard.title },
      { label: "Phone", value: vcard.phone },
      { label: "Email", value: vcard.email },
      { label: "Website", value: vcard.website },
      { label: "Address", value: vcard.address },
    ].filter((detail) => detail.value);
  }

  return [];
}
