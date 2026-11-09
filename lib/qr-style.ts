import type { Options } from "qr-code-styling";

/**
 * QR styling is stored as JSON in `qrcodes.style` and validated against a
 * strict allow-list before it reaches the database or `qr-code-styling`.
 * Nothing here imports the renderer at runtime, so this module is safe to
 * use from Server Components and Server Actions.
 */

export const DOT_TYPES = [
  "square",
  "rounded",
  "dots",
  "classy",
  "classy-rounded",
  "extra-rounded",
] as const;
export type DotType = (typeof DOT_TYPES)[number];

export const CORNER_SQUARE_TYPES = [
  "square",
  "dot",
  "rounded",
  "extra-rounded",
] as const;
export type CornerSquareType = (typeof CORNER_SQUARE_TYPES)[number];

export const CORNER_DOT_TYPES = ["square", "dot", "rounded"] as const;
export type CornerDotType = (typeof CORNER_DOT_TYPES)[number];

export type QrGradient = {
  type: "linear" | "radial";
  rotation?: number;
  colorStops: { offset: number; color: string }[];
};

export type QrStyle = {
  dots: {
    type: DotType;
    color: string;
    gradient?: QrGradient;
  };
  cornersSquare: {
    type: CornerSquareType;
    color: string;
  };
  cornersDot: {
    type: CornerDotType;
    color: string;
  };
  background: {
    /** `#rrggbb` or `transparent`. */
    color: string;
  };
};

export type QrStylePreset = {
  id: string;
  label: string;
  description: string;
  style: QrStyle;
};

/** Fixed render parameters chosen to protect scan reliability. */
export const QR_ERROR_CORRECTION = "Q" as const;
/** Quiet zone as a share of the rendered width (~4 modules at typical sizes). */
export const QR_MARGIN_RATIO = 0.12;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const QR_STYLE_PRESETS: QrStylePreset[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Maximum contrast, square modules.",
    style: {
      dots: { type: "square", color: "#0f172a" },
      cornersSquare: { type: "square", color: "#0f172a" },
      cornersDot: { type: "square", color: "#0f172a" },
      background: { color: "#ffffff" },
    },
  },
  {
    id: "soft",
    label: "Soft",
    description: "Indigo rounded modules.",
    style: {
      dots: { type: "extra-rounded", color: "#4f46e5" },
      cornersSquare: { type: "extra-rounded", color: "#4f46e5" },
      cornersDot: { type: "rounded", color: "#4338ca" },
      background: { color: "#ffffff" },
    },
  },
  {
    id: "dots",
    label: "Dots",
    description: "Slate circular modules.",
    style: {
      dots: { type: "dots", color: "#334155" },
      cornersSquare: { type: "dot", color: "#334155" },
      cornersDot: { type: "dot", color: "#334155" },
      background: { color: "#ffffff" },
    },
  },
  {
    id: "sunset",
    label: "Sunset",
    description: "Warm orange-to-pink gradient.",
    style: {
      dots: {
        type: "extra-rounded",
        color: "#f97316",
        gradient: {
          type: "linear",
          rotation: 45,
          colorStops: [
            { offset: 0, color: "#f97316" },
            { offset: 1, color: "#db2777" },
          ],
        },
      },
      cornersSquare: { type: "extra-rounded", color: "#ea580c" },
      cornersDot: { type: "rounded", color: "#db2777" },
      background: { color: "#ffffff" },
    },
  },
];

export const DEFAULT_QR_STYLE: QrStyle = QR_STYLE_PRESETS[0].style;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validColor(value: unknown, fallback: string): string {
  return typeof value === "string" && HEX_COLOR.test(value) ? value : fallback;
}

function pickEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function normalizeGradient(value: unknown): QrGradient | undefined {
  if (!isRecord(value)) return undefined;
  if (value.type !== "linear" && value.type !== "radial") return undefined;
  if (!Array.isArray(value.colorStops)) return undefined;

  const colorStops = value.colorStops
    .map((stop) => {
      if (!isRecord(stop)) return null;
      const offset = typeof stop.offset === "number" ? stop.offset : NaN;
      if (!Number.isFinite(offset) || offset < 0 || offset > 1) return null;
      const color = validColor(stop.color, "");
      if (!color) return null;
      return { offset, color };
    })
    .filter((stop): stop is { offset: number; color: string } => stop !== null);

  if (colorStops.length < 2) return undefined;

  const rotation =
    typeof value.rotation === "number" && Number.isFinite(value.rotation)
      ? Math.min(360, Math.max(0, value.rotation))
      : undefined;

  return {
    type: value.type,
    ...(rotation === undefined ? {} : { rotation }),
    colorStops: colorStops.slice(0, 5),
  };
}

/**
 * Coerces any stored/raw value into a safe `QrStyle`. Unknown keys are dropped,
 * unknown enum values fall back to the classic preset, and only `#rrggbb` is
 * accepted (`transparent` is allowed for the background).
 */
export function normalizeQrStyle(input: unknown): QrStyle {
  let value = input;

  // Some clients may already have stringified the JSON before sending it.
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      value = undefined;
    }
  }

  if (!isRecord(value)) return DEFAULT_QR_STYLE;

  const dots = isRecord(value.dots) ? value.dots : {};
  const cornersSquare = isRecord(value.cornersSquare)
    ? value.cornersSquare
    : {};
  const cornersDot = isRecord(value.cornersDot) ? value.cornersDot : {};
  const background = isRecord(value.background) ? value.background : {};

  const gradient = normalizeGradient(dots.gradient);
  const backgroundColor =
    background.color === "transparent"
      ? "transparent"
      : validColor(background.color, "#ffffff");

  return {
    dots: {
      type: pickEnum(dots.type, DOT_TYPES, "square"),
      color: validColor(dots.color, "#0f172a"),
      ...(gradient ? { gradient } : {}),
    },
    cornersSquare: {
      type: pickEnum(cornersSquare.type, CORNER_SQUARE_TYPES, "square"),
      color: validColor(cornersSquare.color, "#0f172a"),
    },
    cornersDot: {
      type: pickEnum(cornersDot.type, CORNER_DOT_TYPES, "square"),
      color: validColor(cornersDot.color, "#0f172a"),
    },
    background: { color: backgroundColor },
  };
}

/** Reads the hidden `style` form field. Bad JSON falls back to the default. */
export function parseQrStyleField(value: FormDataEntryValue | null): QrStyle {
  if (typeof value !== "string" || !value) return DEFAULT_QR_STYLE;
  try {
    return normalizeQrStyle(JSON.parse(value));
  } catch {
    return DEFAULT_QR_STYLE;
  }
}

/** Reads the `style` jsonb column (already parsed by Supabase). */
export function parseQrStyle(value: unknown): QrStyle {
  return normalizeQrStyle(value);
}

/** Options passed to `qr-code-styling` on the client. */
export function qrStyleToOptions({
  data,
  style,
  size,
  type = "canvas",
}: {
  data: string;
  style: QrStyle;
  size: number;
  type?: "canvas" | "svg";
}): Options {
  const safe = normalizeQrStyle(style);

  return {
    type,
    width: size,
    height: size,
    margin: Math.round(size * QR_MARGIN_RATIO),
    data,
    qrOptions: { errorCorrectionLevel: QR_ERROR_CORRECTION },
    dotsOptions: {
      type: safe.dots.type,
      ...(safe.dots.gradient
        ? { gradient: safe.dots.gradient }
        : { color: safe.dots.color }),
    },
    cornersSquareOptions: {
      type: safe.cornersSquare.type,
      color: safe.cornersSquare.color,
    },
    cornersDotOptions: {
      type: safe.cornersDot.type,
      color: safe.cornersDot.color,
    },
    backgroundOptions: { color: safe.background.color },
    imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0 },
  };
}
