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
 * and never evaluated during server rendering. The same instance is reused and
 * `.update()` is called when the payload or style changes.
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

    if (!instanceRef.current) {
      const instance = new renderer(options);
      instanceRef.current = instance;
      container.replaceChildren();
      instance.append(container);
      return;
    }

    instanceRef.current.update(options);
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
