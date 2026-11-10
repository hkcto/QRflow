import type { Options } from "qr-code-styling";

/**
 * QR styling is stored as JSON in `qrcodes.style` and validated against a
 * strict allow-list before it reaches the database or `qr-code-styling`.
 * Nothing here imports the renderer at runtime, so this module is safe to
 * use from Server Components and Server Actions.
 *
 * The model mirrors every visual option `qr-code-styling` exposes:
 * - dot shape, colour or gradient, optional rounded module sizes
 * - corner frame and corner dot shape, colour or gradient
 * - background colour, gradient, transparency and corner rounding
 * - overall shape (square or circle)
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

/** Corner squares accept the dot renderer's shapes plus `dot`/`extra-rounded`. */
export const CORNER_SQUARE_TYPES = [
  "square",
  "dot",
  "rounded",
  "dots",
  "classy",
  "classy-rounded",
  "extra-rounded",
] as const;
export type CornerSquareType = (typeof CORNER_SQUARE_TYPES)[number];

/** Corner dots accept the same shape vocabulary as corner squares. */
export const CORNER_DOT_TYPES = CORNER_SQUARE_TYPES;
export type CornerDotType = (typeof CORNER_SQUARE_TYPES)[number];

export const QR_SHAPES = ["square", "circle"] as const;
export type QrShape = (typeof QR_SHAPES)[number];

export const GRADIENT_TYPES = ["linear", "radial"] as const;
export type GradientType = (typeof GRADIENT_TYPES)[number];

export type QrGradient = {
  type: GradientType;
  rotation?: number;
  colorStops: { offset: number; color: string }[];
};

/** A solid colour, optionally replaced by a gradient. */
export type QrFill = {
  color: string;
  gradient?: QrGradient;
};

/**
 * Optional centre image. Stored as a data URL so the QR stays self-contained
 * and the renderer never fetches a third-party origin.
 */
export type QrLogo = {
  dataUrl: string;
  /** Share of the QR width, 0.1–0.5. */
  size: number;
  /** Quiet padding around the logo in rendered pixels, 0–24. */
  margin: number;
  /** Clear the modules behind the logo (recommended). */
  hideBackgroundDots: boolean;
};

export type QrStyle = {
  dots: QrFill & {
    type: DotType;
    /** Rounds the size of each module proportionally. */
    roundSize: boolean;
  };
  cornersSquare: QrFill & {
    type: CornerSquareType;
  };
  cornersDot: QrFill & {
    type: CornerDotType;
  };
  background: QrFill & {
    /** `#rrggbb` or `transparent`. */
    color: string;
    /** Corner rounding of the background, 0–1. */
    round: number;
  };
  shape: QrShape;
  logo?: QrLogo;
};

export type QrStylePreset = {
  id: string;
  label: string;
  description: string;
  style: QrStyle;
};

/** Fixed render parameters chosen to protect scan reliability. */
export const QR_ERROR_CORRECTION = "Q" as const;
/** A centre image hides modules, so it needs the strongest correction level. */
export const QR_ERROR_CORRECTION_WITH_LOGO = "H" as const;
/** Quiet zone as a share of the rendered width (~4 modules at typical sizes). */
export const QR_MARGIN_RATIO = 0.12;
/** qr-code-styling supports at most this many gradient colour stops. */
export const MAX_GRADIENT_STOPS = 5;

/** Logo data URL rules shared by the client upload flow and the server. */
export const LOGO_DATA_URL_PATTERN =
  /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/]+=*$/i;
export const MAX_LOGO_DATA_URL_LENGTH = 400_000;
export const LOGO_SIZE_MIN = 0.1;
export const LOGO_SIZE_MAX = 0.5;
export const LOGO_MARGIN_MAX = 24;
export const DEFAULT_LOGO_SIZE = 0.4;
export const DEFAULT_LOGO_MARGIN = 4;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const baseStyle = {
  dots: {
    type: "square",
    color: "#0f172a",
    roundSize: false,
  },
  cornersSquare: {
    type: "square",
    color: "#0f172a",
  },
  cornersDot: {
    type: "square",
    color: "#0f172a",
  },
  background: {
    color: "#ffffff",
    round: 0,
  },
  shape: "square",
} satisfies QrStyle;

export const QR_STYLE_PRESETS: QrStylePreset[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Maximum contrast, square modules.",
    style: structuredClone(baseStyle),
  },
  {
    id: "soft",
    label: "Soft",
    description: "Indigo rounded modules.",
    style: {
      ...structuredClone(baseStyle),
      dots: { type: "extra-rounded", color: "#4f46e5", roundSize: false },
      cornersSquare: { type: "extra-rounded", color: "#4f46e5" },
      cornersDot: { type: "rounded", color: "#4338ca" },
    },
  },
  {
    id: "dots",
    label: "Dots",
    description: "Slate circular modules.",
    style: {
      ...structuredClone(baseStyle),
      dots: { type: "dots", color: "#334155", roundSize: false },
      cornersSquare: { type: "dot", color: "#334155" },
      cornersDot: { type: "dot", color: "#334155" },
    },
  },
  {
    id: "sunset",
    label: "Sunset",
    description: "Warm orange-to-pink gradient.",
    style: {
      ...structuredClone(baseStyle),
      dots: {
        type: "extra-rounded",
        color: "#f97316",
        roundSize: false,
        gradient: {
          type: "linear",
          rotation: 45,
          colorStops: [
            { offset: 0, color: "#f97316" },
            { offset: 1, color: "#db2777" },
          ],
        },
      },
      cornersSquare: {
        type: "extra-rounded",
        color: "#ea580c",
        gradient: {
          type: "linear",
          rotation: 45,
          colorStops: [
            { offset: 0, color: "#ea580c" },
            { offset: 1, color: "#db2777" },
          ],
        },
      },
      cornersDot: { type: "rounded", color: "#db2777" },
    },
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "Radial indigo-to-sky gradient on a tinted card.",
    style: {
      ...structuredClone(baseStyle),
      dots: {
        type: "rounded",
        color: "#4f46e5",
        roundSize: true,
        gradient: {
          type: "radial",
          colorStops: [
            { offset: 0, color: "#4f46e5" },
            { offset: 1, color: "#0ea5e9" },
          ],
        },
      },
      cornersSquare: {
        type: "extra-rounded",
        color: "#4338ca",
      },
      cornersDot: { type: "dot", color: "#0284c7" },
      background: {
        color: "#eef2ff",
        round: 0.35,
        gradient: {
          type: "linear",
          rotation: 135,
          colorStops: [
            { offset: 0, color: "#eef2ff" },
            { offset: 1, color: "#e0f2fe" },
          ],
        },
      },
    },
  },
  {
    id: "ring",
    label: "Ring",
    description: "Circular code with a soft ring background.",
    style: {
      ...structuredClone(baseStyle),
      shape: "circle",
      dots: { type: "dots", color: "#111827", roundSize: false },
      cornersSquare: { type: "dot", color: "#111827" },
      cornersDot: { type: "dot", color: "#111827" },
      background: { color: "#f8fafc", round: 1 },
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

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

/**
 * Only self-contained raster data URLs are accepted. SVG is rejected because
 * an inline SVG can carry script and the value is rendered straight into the
 * canvas. Oversized payloads are dropped rather than truncated (a truncated
 * base64 image cannot be decoded).
 */
function normalizeLogo(value: unknown): QrLogo | undefined {
  if (!isRecord(value)) return undefined;

  const dataUrl = typeof value.dataUrl === "string" ? value.dataUrl.trim() : "";
  if (
    !dataUrl ||
    dataUrl.length > MAX_LOGO_DATA_URL_LENGTH ||
    !LOGO_DATA_URL_PATTERN.test(dataUrl)
  ) {
    return undefined;
  }

  return {
    dataUrl,
    size: clampNumber(value.size, LOGO_SIZE_MIN, LOGO_SIZE_MAX, DEFAULT_LOGO_SIZE),
    margin: Math.round(
      clampNumber(value.margin, 0, LOGO_MARGIN_MAX, DEFAULT_LOGO_MARGIN)
    ),
    hideBackgroundDots: value.hideBackgroundDots !== false,
  };
}

function normalizeGradient(value: unknown): QrGradient | undefined {
  if (!isRecord(value)) return undefined;
  if (!GRADIENT_TYPES.includes(value.type as GradientType)) return undefined;
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
    .filter((stop): stop is { offset: number; color: string } => stop !== null)
    .sort((a, b) => a.offset - b.offset)
    .slice(0, MAX_GRADIENT_STOPS);

  if (colorStops.length < 2) return undefined;

  const rotation =
    typeof value.rotation === "number" && Number.isFinite(value.rotation)
      ? Math.min(360, Math.max(0, value.rotation))
      : undefined;

  return {
    type: value.type as GradientType,
    ...(rotation === undefined ? {} : { rotation }),
    colorStops,
  };
}

function normalizeFill(
  value: unknown,
  fallbackColor: string,
  options: { allowTransparent?: boolean } = {}
): QrFill {
  const record = isRecord(value) ? value : {};
  const gradient = normalizeGradient(record.gradient);

  const backgroundColor =
    options.allowTransparent && record.color === "transparent"
      ? "transparent"
      : validColor(record.color, fallbackColor);

  return {
    color: backgroundColor,
    ...(gradient ? { gradient } : {}),
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

  if (!isRecord(value)) return structuredClone(DEFAULT_QR_STYLE);

  const dots = isRecord(value.dots) ? value.dots : {};
  const cornersSquare = isRecord(value.cornersSquare)
    ? value.cornersSquare
    : {};
  const cornersDot = isRecord(value.cornersDot) ? value.cornersDot : {};
  const background = isRecord(value.background) ? value.background : {};

  const dotsFill = normalizeFill(dots, "#0f172a");
  const cornersSquareFill = normalizeFill(cornersSquare, "#0f172a");
  const cornersDotFill = normalizeFill(cornersDot, "#0f172a");
  const backgroundFill = normalizeFill(background, "#ffffff", {
    allowTransparent: true,
  });

  const round =
    typeof background.round === "number" && Number.isFinite(background.round)
      ? clamp01(background.round)
      : 0;

  const logo = normalizeLogo(value.logo);

  return {
    dots: {
      ...dotsFill,
      type: pickEnum(dots.type, DOT_TYPES, "square"),
      roundSize: dots.roundSize === true,
    },
    cornersSquare: {
      ...cornersSquareFill,
      type: pickEnum(cornersSquare.type, CORNER_SQUARE_TYPES, "square"),
    },
    cornersDot: {
      ...cornersDotFill,
      type: pickEnum(cornersDot.type, CORNER_DOT_TYPES, "square"),
    },
    background: {
      ...backgroundFill,
      round,
      // A gradient replaces the fill, so transparent has nothing to show.
      ...(backgroundFill.gradient ? { color: validColor(backgroundFill.color, "#ffffff") } : {}),
    },
    shape: pickEnum(value.shape, QR_SHAPES, "square"),
    ...(logo ? { logo } : {}),
  };
}

/** Reads the hidden `style` form field. Bad JSON falls back to the default. */
export function parseQrStyleField(value: FormDataEntryValue | null): QrStyle {
  if (typeof value !== "string" || !value) return structuredClone(DEFAULT_QR_STYLE);
  try {
    return normalizeQrStyle(JSON.parse(value));
  } catch {
    return structuredClone(DEFAULT_QR_STYLE);
  }
}

/** Reads the `style` jsonb column (already parsed by Supabase). */
export function parseQrStyle(value: unknown): QrStyle {
  return normalizeQrStyle(value);
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isRecord(value)) return value;
  return Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = stableValue(value[key]);
      return acc;
    }, {});
}

/** Order-independent key, used to match the active preset. */
export function qrStyleKey(style: QrStyle): string {
  return JSON.stringify(stableValue(normalizeQrStyle(style)));
}

function fillToOptions(fill: QrFill) {
  return fill.gradient
    ? { gradient: fill.gradient }
    : { color: fill.color };
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
  const logo = safe.logo;

  return {
    type,
    shape: safe.shape,
    width: size,
    height: size,
    margin: Math.round(size * QR_MARGIN_RATIO),
    data,
    // A centre image covers modules, so bump Q → H whenever one is present.
    qrOptions: {
      errorCorrectionLevel: logo
        ? QR_ERROR_CORRECTION_WITH_LOGO
        : QR_ERROR_CORRECTION,
    },
    ...(logo ? { image: logo.dataUrl } : {}),
    dotsOptions: {
      ...fillToOptions(safe.dots),
      type: safe.dots.type,
      // `qr-code-styling`'s circular branch computes a fractional padding
      // unless module sizes are floored, then passes it to `isDark`, which
      // throws. Integer sizes are therefore mandatory for `shape: circle`.
      roundSize: safe.shape === "circle" ? true : safe.dots.roundSize,
    },
    cornersSquareOptions: {
      ...fillToOptions(safe.cornersSquare),
      type: safe.cornersSquare.type,
    },
    cornersDotOptions: {
      ...fillToOptions(safe.cornersDot),
      type: safe.cornersDot.type,
    },
    backgroundOptions: {
      ...fillToOptions(safe.background),
      round: safe.background.round,
    },
    imageOptions: logo
      ? {
          hideBackgroundDots: logo.hideBackgroundDots,
          imageSize: logo.size,
          margin: logo.margin,
        }
      : { hideBackgroundDots: true, imageSize: 0.4, margin: 0 },
  };
}
