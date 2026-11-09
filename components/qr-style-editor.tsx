"use client";

import {
  CORNER_DOT_TYPES,
  CORNER_SQUARE_TYPES,
  DEFAULT_QR_STYLE,
  DOT_TYPES,
  QR_STYLE_PRESETS,
  type QrStyle,
} from "@/lib/qr-style";

const selectClass =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
const labelClass =
  "block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400";
const colorClass =
  "mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-950";

function presetLabel(style: QrStyle): string {
  return JSON.stringify(style);
}

function PresetSwatch({ style }: { style: QrStyle }) {
  const stops = style.dots.gradient?.colorStops;
  const first = stops?.[0]?.color ?? style.dots.color;
  const second = stops?.[stops.length - 1]?.color ?? first;
  const radius = style.dots.type === "square" ? "1px" : "9999px";

  return (
    <span
      className="grid h-10 w-10 shrink-0 grid-cols-3 gap-0.5 rounded-md p-1 ring-1 ring-slate-200 dark:ring-slate-700"
      style={{
        backgroundColor:
          style.background.color === "transparent"
            ? "#ffffff"
            : style.background.color,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: 9 }, (_, index) => (
        <span
          key={index}
          style={{
            background: index % 2 === 0 ? first : second,
            borderRadius: radius,
          }}
        />
      ))}
    </span>
  );
}

export function QrStyleEditor({
  value,
  onChange,
}: {
  value: QrStyle;
  onChange: (style: QrStyle) => void;
}) {
  const activePreset = presetLabel(value);
  const gradient = value.dots.gradient;
  const gradientStart = gradient?.colorStops[0]?.color ?? value.dots.color;
  const gradientEnd =
    gradient?.colorStops[gradient.colorStops.length - 1]?.color ?? "#db2777";

  function update(patch: Partial<QrStyle>) {
    onChange({ ...value, ...patch });
  }

  function updateDots(patch: Partial<QrStyle["dots"]>) {
    onChange({ ...value, dots: { ...value.dots, ...patch } });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Style
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Pick a preset, then fine-tune it if you want. High-contrast styles scan
          most reliably — test with your phone before printing.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QR_STYLE_PRESETS.map((preset) => {
            const active = activePreset === presetLabel(preset.style);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange(preset.style)}
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

      <details className="group rounded-xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/40">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 marker:hidden dark:text-slate-200">
          Customize appearance
          <span className="text-xs text-slate-400 transition group-open:rotate-180">
            ▾
          </span>
        </summary>

        <div className="space-y-4 border-t border-slate-200 px-4 py-4 dark:border-slate-800">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="dots-type">
                Dot shape
              </label>
              <select
                id="dots-type"
                value={value.dots.type}
                onChange={(event) =>
                  updateDots({ type: event.target.value as QrStyle["dots"]["type"] })
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

            <div>
              <span className={labelClass}>Dot fill</span>
              <div className="mt-1.5 flex rounded-lg border border-slate-300 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => updateDots({ gradient: undefined })}
                  className={
                    gradient
                      ? "flex-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"
                      : "flex-1 rounded-md bg-slate-900 px-2 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                  }
                >
                  Solid
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (gradient) return;
                    updateDots({
                      gradient: {
                        type: "linear",
                        rotation: 45,
                        colorStops: [
                          { offset: 0, color: value.dots.color },
                          { offset: 1, color: "#db2777" },
                        ],
                      },
                    });
                  }}
                  className={
                    gradient
                      ? "flex-1 rounded-md bg-slate-900 px-2 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                      : "flex-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"
                  }
                >
                  Gradient
                </button>
              </div>
            </div>
          </div>

          {gradient ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="gradient-start">
                  Gradient start
                </label>
                <input
                  id="gradient-start"
                  type="color"
                  value={gradientStart}
                  onChange={(event) =>
                    updateDots({
                      gradient: {
                        type: gradient.type,
                        rotation: gradient.rotation,
                        colorStops: [
                          { offset: 0, color: event.target.value },
                          {
                            offset: 1,
                            color:
                              gradient.colorStops[gradient.colorStops.length - 1]
                                ?.color ?? "#db2777",
                          },
                        ],
                      },
                    })
                  }
                  className={colorClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="gradient-end">
                  Gradient end
                </label>
                <input
                  id="gradient-end"
                  type="color"
                  value={gradientEnd}
                  onChange={(event) =>
                    updateDots({
                      gradient: {
                        type: gradient.type,
                        rotation: gradient.rotation,
                        colorStops: [
                          {
                            offset: 0,
                            color: gradient.colorStops[0]?.color ?? value.dots.color,
                          },
                          { offset: 1, color: event.target.value },
                        ],
                      },
                    })
                  }
                  className={colorClass}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className={labelClass} htmlFor="dots-color">
                Dot color
              </label>
              <input
                id="dots-color"
                type="color"
                value={value.dots.color}
                onChange={(event) =>
                  updateDots({ color: event.target.value, gradient: undefined })
                }
                className={colorClass}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="corner-square-type">
                Corner frame
              </label>
              <select
                id="corner-square-type"
                value={value.cornersSquare.type}
                onChange={(event) =>
                  update({
                    cornersSquare: {
                      ...value.cornersSquare,
                      type: event.target
                        .value as QrStyle["cornersSquare"]["type"],
                    },
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
            <div>
              <label className={labelClass} htmlFor="corner-square-color">
                Corner frame color
              </label>
              <input
                id="corner-square-color"
                type="color"
                value={value.cornersSquare.color}
                onChange={(event) =>
                  update({
                    cornersSquare: {
                      ...value.cornersSquare,
                      color: event.target.value,
                    },
                  })
                }
                className={colorClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="corner-dot-type">
                Corner dot
              </label>
              <select
                id="corner-dot-type"
                value={value.cornersDot.type}
                onChange={(event) =>
                  update({
                    cornersDot: {
                      ...value.cornersDot,
                      type: event.target.value as QrStyle["cornersDot"]["type"],
                    },
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
            <div>
              <label className={labelClass} htmlFor="corner-dot-color">
                Corner dot color
              </label>
              <input
                id="corner-dot-color"
                type="color"
                value={value.cornersDot.color}
                onChange={(event) =>
                  update({
                    cornersDot: {
                      ...value.cornersDot,
                      color: event.target.value,
                    },
                  })
                }
                className={colorClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <div>
              <label className={labelClass} htmlFor="background-color">
                Background
              </label>
              <input
                id="background-color"
                type="color"
                value={
                  value.background.color === "transparent"
                    ? "#ffffff"
                    : value.background.color
                }
                disabled={value.background.color === "transparent"}
                onChange={(event) =>
                  update({ background: { color: event.target.value } })
                }
                className={`${colorClass} disabled:cursor-not-allowed disabled:opacity-50`}
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={value.background.color === "transparent"}
                onChange={(event) =>
                  update({
                    background: {
                      color: event.target.checked ? "transparent" : "#ffffff",
                    },
                  })
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
              />
              Transparent background
            </label>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            A transparent background only works on light surfaces. Printing on
            dark paper can make the code unscannable.
          </p>

          <button
            type="button"
            onClick={() => onChange(DEFAULT_QR_STYLE)}
            className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Reset to classic
          </button>
        </div>
      </details>
    </div>
  );
}
