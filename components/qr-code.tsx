"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type QRCodeStyling from "qr-code-styling";
import { qrStyleToOptions, type QrStyle } from "@/lib/qr-style";

type QrCodeProps = {
  /** The exact string encoded in the QR code. */
  data: string;
  style: QrStyle;
  /** Rendered size in CSS pixels. */
  size?: number;
  className?: string;
  label?: string;
};

/**
 * Thin client-side wrapper around `qr-code-styling`.
 *
 * The library is browser-only (Canvas/SVG), so it is loaded inside an effect
 * and never evaluated during server rendering. A fresh instance is rendered
 * once per animation frame so bursts of style changes cannot overlap.
 */
export function QrCode({
  data,
  style,
  size = 256,
  className,
  label = "QR code",
}: QrCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<QRCodeStyling | null>(null);
  const [renderer, setRenderer] = useState<typeof QRCodeStyling | null>(null);

  useEffect(() => {
    let active = true;

    import("qr-code-styling")
      .then((module) => {
        if (active) setRenderer(() => module.default);
      })
      .catch((error) => {
        console.error("[qr-code] could not load the renderer", error);
      });

    return () => {
      active = false;
    };
  }, []);

  // JSON key keeps the memo stable even when callers pass a fresh object.
  const styleKey = JSON.stringify(style);
  const options = useMemo(
    () => qrStyleToOptions({ data, style, size, type: "canvas" }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, size, styleKey]
  );

  useEffect(() => {
    if (!renderer) return;
    const container = containerRef.current;
    if (!container) return;

    // Coalesce bursts (slider drags, rapid typing) into a single render per
    // frame and build a fresh instance each time. Mutating an existing
    // instance with `.update()` raced with its in-flight draw and could throw
    // inside `isDark` when several style changes landed in the same tick.
    const frame = requestAnimationFrame(() => {
      const instance = new renderer(options);
      instanceRef.current = instance;
      container.replaceChildren();
      instance.append(container);
    });

    return () => cancelAnimationFrame(frame);
  }, [renderer, options]);

  useEffect(() => {
    const container = containerRef.current;
    return () => {
      if (container) container.replaceChildren();
      instanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={label}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
