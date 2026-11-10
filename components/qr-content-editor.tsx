"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  QR_KINDS,
  QR_KIND_LABELS,
  type QrContentState,
  type QrKind,
} from "@/lib/qr-content";
import type { VCardInput, WifiEncryption, WifiInput } from "@/lib/qr-payload";

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500";
const labelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-200";

const ENCRYPTION_LABELS: Record<WifiEncryption, string> = {
  WPA: "WPA / WPA2 / WPA3",
  WEP: "WEP",
  nopass: "Open network",
};

export function QrContentEditor({
  value,
  onChange,
  kindLocked = false,
  urlFieldName,
  urlError,
  contentError,
}: {
  value: QrContentState;
  onChange: Dispatch<SetStateAction<QrContentState>>;
  /** Types cannot be changed after creation so printed codes stay valid. */
  kindLocked?: boolean;
  /** Set on the dashboard so the hidden/URL field reaches the Server Action. */
  urlFieldName?: string;
  urlError?: string;
  contentError?: string;
}) {
  function setKind(kind: QrKind) {
    onChange((previous) => ({ ...previous, kind }));
  }

  function updateWifi(patch: Partial<WifiInput>) {
    onChange((previous) => ({
      ...previous,
      wifi: { ...previous.wifi, ...patch },
    }));
  }

  function updateVCard(patch: Partial<VCardInput>) {
    onChange((previous) => ({
      ...previous,
      vcard: { ...previous.vcard, ...patch },
    }));
  }

  return (
    <div className="space-y-4">
      <div>
        <span className={labelClass}>QR type</span>
        <div
          role="tablist"
          aria-label="QR content type"
          className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {QR_KINDS.map((kind) => {
            const active = value.kind === kind;
            return (
              <button
                key={kind}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={kindLocked && !active}
                onClick={() => setKind(kind)}
                className={
                  active
                    ? "rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-default"
                    : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }
              >
                {QR_KIND_LABELS[kind]}
              </button>
            );
          })}
        </div>
        {kindLocked ? (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            The QR type is locked so codes you already printed keep working. You
            can still change the content and appearance.
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        {value.kind === "url" ? (
          <div>
            <label className={labelClass} htmlFor="qr-content-url">
              Destination URL
            </label>
            <input
              id="qr-content-url"
              {...(urlFieldName ? { name: urlFieldName, required: true } : {})}
              type="text"
              inputMode="url"
              autoComplete="url"
              value={value.url}
              onChange={(event) =>
                onChange((previous) => ({
                  ...previous,
                  url: event.target.value,
                }))
              }
              placeholder="example.com/menu or https://…"
              aria-invalid={Boolean(urlError)}
              aria-describedby={urlError ? "qr-content-url-error" : undefined}
              className={inputClass}
            />
            {urlError ? (
              <p
                id="qr-content-url-error"
                className="mt-1.5 text-sm text-red-600 dark:text-red-400"
              >
                {urlError}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                We add <code className="font-mono">https://</code> if you leave
                it out. A short link is generated, so you can change the
                destination later without reprinting. Scans are counted.
              </p>
            )}
          </div>
        ) : null}

        {value.kind === "text" ? (
          <div>
            <label className={labelClass} htmlFor="qr-content-text">
              Text
            </label>
            <textarea
              id="qr-content-text"
              value={value.text}
              onChange={(event) =>
                onChange((previous) => ({
                  ...previous,
                  text: event.target.value,
                }))
              }
              rows={5}
              placeholder="Any text, a coupon code, a note, an address…"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Encoded directly in the image. No redirect and no scan tracking.
            </p>
          </div>
        ) : null}

        {value.kind === "wifi" ? (
          <>
            <div>
              <label className={labelClass} htmlFor="qr-content-wifi-ssid">
                Network name (SSID)
              </label>
              <input
                id="qr-content-wifi-ssid"
                value={value.wifi.ssid}
                onChange={(event) => updateWifi({ ssid: event.target.value })}
                autoComplete="off"
                placeholder="Cafe-Guest"
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className={labelClass}
                  htmlFor="qr-content-wifi-encryption"
                >
                  Security
                </label>
                <select
                  id="qr-content-wifi-encryption"
                  value={value.wifi.encryption}
                  onChange={(event) =>
                    updateWifi({
                      encryption: event.target.value as WifiEncryption,
                    })
                  }
                  className={inputClass}
                >
                  {(Object.keys(ENCRYPTION_LABELS) as WifiEncryption[]).map(
                    (encryption) => (
                      <option key={encryption} value={encryption}>
                        {ENCRYPTION_LABELS[encryption]}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label
                  className={labelClass}
                  htmlFor="qr-content-wifi-password"
                >
                  Password
                </label>
                <input
                  id="qr-content-wifi-password"
                  value={value.wifi.password}
                  onChange={(event) =>
                    updateWifi({ password: event.target.value })
                  }
                  autoComplete="new-password"
                  placeholder={
                    value.wifi.encryption === "nopass"
                      ? "Not required"
                      : "••••••••"
                  }
                  disabled={value.wifi.encryption === "nopass"}
                  className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={value.wifi.hidden}
                onChange={(event) => updateWifi({ hidden: event.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
              />
              Hidden network
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Encoded directly in the image. No redirect and no scan tracking.
            </p>
          </>
        ) : null}

        {value.kind === "vcard" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="qr-content-vcard-first">
                  First name
                </label>
                <input
                  id="qr-content-vcard-first"
                  value={value.vcard.firstName}
                  onChange={(event) =>
                    updateVCard({ firstName: event.target.value })
                  }
                  autoComplete="given-name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="qr-content-vcard-last">
                  Last name
                </label>
                <input
                  id="qr-content-vcard-last"
                  value={value.vcard.lastName}
                  onChange={(event) =>
                    updateVCard({ lastName: event.target.value })
                  }
                  autoComplete="family-name"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="qr-content-vcard-org">
                  Company
                </label>
                <input
                  id="qr-content-vcard-org"
                  value={value.vcard.organization}
                  onChange={(event) =>
                    updateVCard({ organization: event.target.value })
                  }
                  autoComplete="organization"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="qr-content-vcard-title">
                  Job title
                </label>
                <input
                  id="qr-content-vcard-title"
                  value={value.vcard.title}
                  onChange={(event) =>
                    updateVCard({ title: event.target.value })
                  }
                  autoComplete="organization-title"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="qr-content-vcard-phone">
                  Phone
                </label>
                <input
                  id="qr-content-vcard-phone"
                  value={value.vcard.phone}
                  onChange={(event) =>
                    updateVCard({ phone: event.target.value })
                  }
                  inputMode="tel"
                  autoComplete="tel"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="qr-content-vcard-email">
                  Email
                </label>
                <input
                  id="qr-content-vcard-email"
                  value={value.vcard.email}
                  onChange={(event) =>
                    updateVCard({ email: event.target.value })
                  }
                  inputMode="email"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="qr-content-vcard-web">
                Website
              </label>
              <input
                id="qr-content-vcard-web"
                value={value.vcard.website}
                onChange={(event) =>
                  updateVCard({ website: event.target.value })
                }
                inputMode="url"
                autoComplete="url"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="qr-content-vcard-address">
                Address
              </label>
              <input
                id="qr-content-vcard-address"
                value={value.vcard.address}
                onChange={(event) =>
                  updateVCard({ address: event.target.value })
                }
                autoComplete="street-address"
                className={inputClass}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Encoded directly in the image. No redirect and no scan tracking.
            </p>
          </>
        ) : null}
      </div>

      {contentError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {contentError}
        </p>
      ) : null}
    </div>
  );
}
