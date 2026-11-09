"use client";

import {
  CORNER_DOT_TYPES,
  CORNER_SQUARE_TYPES,
  DEFAULT_QR_STYLE,
  DOT_TYPES,
  GRADIENT_TYPES,
  MAX_GRADIENT_STOPS,
  QR_SHAPES,
  QR_STYLE_PRESETS,
  qrStyleKey,
  type GradientType,
  type QrFill,
  type QrGradient,
  type QrStyle,
} from "@/lib/qr-style";

const selectClass =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
const labelClass =
  "block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400";
const colorClass =
  "mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-950";
const rangeClass =
  "mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600 dark:bg-slate-700";

function presetKey(style: QrStyle): string {
  return qrStyleKey(style);
}

function cssGradient(gradient: QrGradient): string {
  const stops = [...gradient.colorStops]
    .sort((a, b) => a.offset - b.offset)
    .map((stop) => `${stop.color} ${Math.round(stop.offset * 100)}%`)
    .join(", ");
  return gradient.type === "radial"
    ? `radial-gradient(circle, ${stops})`
    : `linear-gradient(90deg, ${stops})`;
}

function PresetSwatch({ style }: { style: QrStyle }) {
  const stops = style.dots.gradient?.colorStops;
  const first = stops?.[0]?.color ?? style.dots.color;
  const second = stops?.[stops.length - 1]?.color ?? first;
  const radius =
    style.dots.type === "square"
      ? "1px"
      : style.dots.type === "dots"
        ? "9999px"
        : "3px";

  return (
    <span
      className="grid h-10 w-10 shrink-0 grid-cols-3 gap-0.5 p-1 ring-1 ring-slate-200 dark:ring-slate-700"
      style={{
        borderRadius: style.shape === "circle" ? "9999px" : `${4 + style.background.round * 8}px`,
        backgroundColor:
          style.background.gradient || style.background.color === "transparent"
            ? undefined
            : style.background.color,
        backgroundImage: style.background.gradient
          ? cssGradient(style.background.gradient)
          : undefined,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: 9 }, (_, index) => (
        <span
          key={index}
          style={{
            background:
              style.dots.gradient && index % 2 === 0
                ? cssGradient(style.dots.gradient)
                : index % 2 === 0
                  ? first
                  : second,
            borderRadius: radius,
          }}
        />
      ))}
    </span>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="mt-1.5 flex rounded-lg border border-slate-300 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-950">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className={
                active
                  ? "flex-1 rounded-md bg-slate-900 px-2 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                  : "flex-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={colorClass}
      />
    </div>
  );
}

function GradientEditor({
  idPrefix,
  value,
  onChange,
  onRemove,
}: {
  idPrefix: string;
  value: QrGradient;
  onChange: (gradient: QrGradient) => void;
  onRemove: () => void;
}) {
  const stops = value.colorStops;

  function updateStop(index: number, patch: Partial<QrGradient["colorStops"][number]>) {
    const next = stops.map((stop, i) => (i === index ? { ...stop, ...patch } : stop));
    onChange({ ...value, colorStops: next });
  }

  function addStop() {
    if (stops.length >= MAX_GRADIENT_STOPS) return;
    const sorted = [...stops].sort((a, b) => a.offset - b.offset);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const offset = Math.min(1, Math.max(0, (first.offset + last.offset) / 2));
    onChange({
      ...value,
      colorStops: [...stops, { offset, color: last.color }],
    });
  }

  function removeStop(index: number) {
    if (stops.length <= 2) return;
    onChange({ ...value, colorStops: stops.filter((_, i) => i !== index) });
  }

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-950/40">
      <div
        className="h-6 w-full rounded-md ring-1 ring-slate-200 dark:ring-slate-700"
        style={{ backgroundImage: cssGradient(value) }}
        aria-hidden="true"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-gradient-type`}>
            Gradient type
          </label>
          <select
            id={`${idPrefix}-gradient-type`}
            value={value.type}
            onChange={(event) =>
              onChange({ ...value, type: event.target.value as GradientType })
            }
            className={selectClass}
          >
            {GRADIENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-gradient-rotation`}>
            Rotation · {value.rotation ?? 0}°
          </label>
          <input
            id={`${idPrefix}-gradient-rotation`}
            type="range"
            min={0}
            max={360}
            step={5}
            value={value.rotation ?? 0}
            onChange={(event) =>
              onChange({ ...value, rotation: Number(event.target.value) })
            }
            className={rangeClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className={labelClass}>Colour stops</span>
        {stops.map((stop, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="color"
              aria-label={`Stop ${index + 1} colour`}
              value={stop.color}
              onChange={(event) => updateStop(index, { color: event.target.value })}
              className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"
            />
            <input
              type="range"
              aria-label={`Stop ${index + 1} position`}
              min={0}
              max={1}
              step={0.01}
              value={stop.offset}
              onChange={(event) =>
                updateStop(index, { offset: Number(event.target.value) })
              }
              className={rangeClass}
            />
            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {Math.round(stop.offset * 100)}%
            </span>
            <button
              type="button"
              onClick={() => removeStop(index)}
              disabled={stops.length <= 2}
              aria-label={`Remove stop ${index + 1}`}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              ✕
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={addStop}
            disabled={stops.length >= MAX_GRADIENT_STOPS}
            className="text-xs font-medium text-indigo-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40 dark:text-indigo-400"
          >
            + Add stop ({stops.length}/{MAX_GRADIENT_STOPS})
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-slate-500 hover:underline dark:text-slate-400"
          >
            Use solid colour
          </button>
        </div>
      </div>
    </div>
  );
}

function FillEditor({
  idPrefix,
  label,
  value,
  onChange,
  allowTransparent = false,
}: {
  idPrefix: string;
  label: string;
  value: QrFill;
  onChange: (fill: QrFill) => void;
  allowTransparent?: boolean;
}) {
  const mode: "solid" | "gradient" | "transparent" = value.gradient
    ? "gradient"
    : value.color === "transparent"
      ? "transparent"
      : "solid";

  const baseColor = value.color === "transparent" ? "#0f172a" : value.color;

  function setMode(next: "solid" | "gradient" | "transparent") {
    if (next === "solid") {
      onChange({ color: baseColor });
      return;
    }
    if (next === "transparent") {
      onChange({ color: "transparent" });
      return;
    }
    onChange({
      color: baseColor,
      gradient: {
        type: "linear",
        rotation: 45,
        colorStops: [
          { offset: 0, color: baseColor },
          { offset: 1, color: "#db2777" },
        ],
      },
    });
  }

  const modes = [
    { value: "solid" as const, label: "Solid" },
    { value: "gradient" as const, label: "Gradient" },
    ...(allowTransparent
      ? [{ value: "transparent" as const, label: "Transparent" }]
      : []),
  ];

  return (
    <div>
      <Segmented label={label} value={mode} options={modes} onChange={setMode} />

      {mode === "solid" ? (
        <div className="mt-3">
          <ColorField
            id={`${idPrefix}-color`}
            label="Colour"
            value={baseColor}
            onChange={(color) => onChange({ color })}
          />
        </div>
      ) : null}

      {mode === "gradient" && value.gradient ? (
        <GradientEditor
          idPrefix={idPrefix}
          value={value.gradient}
          onChange={(gradient) => onChange({ ...value, gradient })}
          onRemove={() => onChange({ color: baseColor })}
        />
      ) : null}

      {mode === "transparent" ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Nothing is painted behind the modules.
        </p>
      ) : null}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h3>
      {description ? (
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

export function QrStyleEditor({
  value,
  onChange,
}: {
  value: QrStyle;
  /**
   * Accepts a functional updater so several controls changed in the same tick
   * accumulate instead of each overwriting the others with stale state.
   */
  onChange: React.Dispatch<React.SetStateAction<QrStyle>>;
}) {
  const activePreset = presetKey(value);

  function update<K extends keyof QrStyle>(
    key: K,
    patch: Partial<QrStyle[K]>
  ) {
    onChange((previous) => {
      const current = previous[key] as Record<string, unknown>;
      const next: Record<string, unknown> = { ...current, ...patch };
      // Selecting Solid/Transparent (or "use solid colour") sends a colour
      // without a gradient and must replace the fill, not merge into it.
      if ("color" in patch && !("gradient" in patch)) delete next.gradient;
      return { ...previous, [key]: next } as QrStyle;
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Style
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Every option is available whether or not you sign in. High-contrast
          styles scan most reliably — test with your phone before printing.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {QR_STYLE_PRESETS.map((preset) => {
            const active = activePreset === presetKey(preset.style);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange(structuredClone(preset.style))}
                aria-pressed={active}
                title={preset.description}
                className={
                  active
                    ? "flex flex-col items-center gap-2 rounded-xl border-2 border-indigo-500 bg-indigo-50/60 p-2.5 text-xs font-semibold text-indigo-700 transition dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-200"
                    : "flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                }
              >
                <PresetSwatch style={preset.style} />
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <details className="group rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 marker:hidden dark:text-slate-200">
          Customize appearance
          <span className="text-xs text-slate-400 transition group-open:rotate-180">
            ▾
          </span>
        </summary>

        <div className="space-y-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800">
          <Section title="Modules" description="The dots that make up the code.">
            <div>
              <label className={labelClass} htmlFor="dots-type">
                Dot shape
              </label>
              <select
                id="dots-type"
                value={value.dots.type}
                onChange={(event) =>
                  update("dots", {
                    type: event.target.value as QrStyle["dots"]["type"],
                  })
                }
                className={selectClass}
              >
                {DOT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <FillEditor
              idPrefix="dots"
              label="Module fill"
              value={value.dots}
              onChange={(fill) => update("dots", fill)}
            />

            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={value.dots.roundSize || value.shape === "circle"}
                disabled={value.shape === "circle"}
                onChange={(event) =>
                  update("dots", { roundSize: event.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900"
              />
              Round module sizes
              {value.shape === "circle" ? (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  (required for circular codes)
                </span>
              ) : null}
            </label>
          </Section>

          <Section
            title="Corner frame"
            description="The three large squares that help scanners orient the code."
          >
            <div>
              <label className={labelClass} htmlFor="corner-square-type">
                Frame shape
              </label>
              <select
                id="corner-square-type"
                value={value.cornersSquare.type}
                onChange={(event) =>
                  update("cornersSquare", {
                    type: event.target
                      .value as QrStyle["cornersSquare"]["type"],
                  })
                }
                className={selectClass}
              >
                {CORNER_SQUARE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <FillEditor
              idPrefix="corner-square"
              label="Frame fill"
              value={value.cornersSquare}
              onChange={(fill) => update("cornersSquare", fill)}
            />
          </Section>

          <Section title="Corner dot" description="The centre block of each corner.">
            <div>
              <label className={labelClass} htmlFor="corner-dot-type">
                Dot shape
              </label>
              <select
                id="corner-dot-type"
                value={value.cornersDot.type}
                onChange={(event) =>
                  update("cornersDot", {
                    type: event.target.value as QrStyle["cornersDot"]["type"],
                  })
                }
                className={selectClass}
              >
                {CORNER_DOT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <FillEditor
              idPrefix="corner-dot"
              label="Dot fill"
              value={value.cornersDot}
              onChange={(fill) => update("cornersDot", fill)}
            />
          </Section>

          <Section title="Background" description="Canvas behind the modules.">
            <FillEditor
              idPrefix="background"
              label="Background fill"
              value={value.background}
              onChange={(fill) => update("background", fill)}
              allowTransparent
            />

            <div>
              <label
                className={labelClass}
                htmlFor="background-round"
              >
                Corner rounding · {Math.round(value.background.round * 100)}%
              </label>
              <input
                id="background-round"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={value.background.round}
                onChange={(event) =>
                  update("background", { round: Number(event.target.value) })
                }
                className={rangeClass}
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              A transparent background only works on light surfaces. Printing on
              dark paper can make the code unscannable.
            </p>
          </Section>

          <Section title="Overall shape" description="Circle trims the corners of the canvas.">
            <Segmented
              label="Shape"
              value={value.shape}
              options={QR_SHAPES.map((shape) => ({
                value: shape,
                label: shape,
              }))}
              onChange={(shape) =>
                onChange((previous) => ({ ...previous, shape }))
              }
            />
            {value.shape === "circle" ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Circular codes have less usable area. Keep the payload short and
                test before printing.
              </p>
            ) : null}
          </Section>

          <button
            type="button"
            onClick={() => onChange(structuredClone(DEFAULT_QR_STYLE))}
            className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Reset to classic
          </button>
        </div>
      </details>
    </div>
  );
}
