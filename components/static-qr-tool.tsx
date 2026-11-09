"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { QrCode } from "@/components/qr-code";
import { QrDownloadButtons } from "@/components/qr-download-buttons";
import { QrStyleEditor } from "@/components/qr-style-editor";
import { DEFAULT_QR_STYLE, type QrStyle } from "@/lib/qr-style";
import {
  buildStaticPayload,
  type StaticQrKind,
  type VCardInput,
  type WifiEncryption,
  type WifiInput,
} from "@/lib/qr-payload";

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500";
const labelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-200";

const TABS: { id: StaticQrKind; label: string }[] = [
  { id: "link", label: "Link" },
  { id: "text", label: "Text" },
  { id: "wifi", label: "Wi-Fi" },
  { id: "vcard", label: "vCard" },
];

const ENCRYPTION_LABELS: Record<WifiEncryption, string> = {
  WPA: "WPA / WPA2 / WPA3",
  WEP: "WEP",
  nopass: "Open network",
};

export function StaticQrTool() {
  const [kind, setKind] = useState<StaticQrKind>("link");
  const [link, setLink] = useState("");
  const [text, setText] = useState("");
  const [wifi, setWifi] = useState<WifiInput>({
    ssid: "",
    password: "",
    encryption: "WPA",
    hidden: false,
  });
  const [vcard, setVcard] = useState<VCardInput>({
    firstName: "",
    lastName: "",
    organization: "",
    title: "",
    phone: "",
    email: "",
    website: "",
    address: "",
  });
  const [style, setStyle] = useState<QrStyle>(DEFAULT_QR_STYLE);

  const result = useMemo(
    () => buildStaticPayload(kind, { link, text, wifi, vcard }),
    [kind, link, text, wifi, vcard]
  );

  const downloadName =
    kind === "wifi"
      ? `wifi-${wifi.ssid || "network"}`
      : kind === "vcard"
        ? `vcard-${vcard.firstName}-${vcard.lastName}`.replace(/^-+|-+$/g, "") ||
          "contact"
        : `qr-${kind}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div
            role="tablist"
            aria-label="QR content type"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {TABS.map((tab) => {
              const active = kind === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setKind(tab.id)}
                  className={
                    active
                      ? "rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm"
                      : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 space-y-5">
            {kind === "link" ? (
              <div>
                <label className={labelClass} htmlFor="static-link">
                  Link
                </label>
                <input
                  id="static-link"
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  inputMode="url"
                  autoComplete="url"
                  placeholder="example.com/menu or https://…"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  If you leave out the scheme, we add{" "}
                  <code className="font-mono">https://</code> for you.
                </p>
              </div>
            ) : null}

            {kind === "text" ? (
              <div>
                <label className={labelClass} htmlFor="static-text">
                  Text
                </label>
                <textarea
                  id="static-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  rows={5}
                  placeholder="Any text, a coupon code, a note, an address…"
                  className={inputClass}
                />
              </div>
            ) : null}

            {kind === "wifi" ? (
              <>
                <div>
                  <label className={labelClass} htmlFor="wifi-ssid">
                    Network name (SSID)
                  </label>
                  <input
                    id="wifi-ssid"
                    value={wifi.ssid}
                    onChange={(event) =>
                      setWifi({ ...wifi, ssid: event.target.value })
                    }
                    autoComplete="off"
                    placeholder="Cafe-Guest"
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="wifi-encryption">
                      Security
                    </label>
                    <select
                      id="wifi-encryption"
                      value={wifi.encryption}
                      onChange={(event) =>
                        setWifi({
                          ...wifi,
                          encryption: event.target.value as WifiEncryption,
                        })
                      }
                      className={inputClass}
                    >
                      {(Object.keys(ENCRYPTION_LABELS) as WifiEncryption[]).map(
                        (value) => (
                          <option key={value} value={value}>
                            {ENCRYPTION_LABELS[value]}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="wifi-password">
                      Password
                    </label>
                    <input
                      id="wifi-password"
                      value={wifi.password}
                      onChange={(event) =>
                        setWifi({ ...wifi, password: event.target.value })
                      }
                      autoComplete="new-password"
                      placeholder={
                        wifi.encryption === "nopass" ? "Not required" : "••••••••"
                      }
                      disabled={wifi.encryption === "nopass"}
                      className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={wifi.hidden}
                    onChange={(event) =>
                      setWifi({ ...wifi, hidden: event.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
                  />
                  Hidden network
                </label>
              </>
            ) : null}

            {kind === "vcard" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="vcard-first">
                      First name
                    </label>
                    <input
                      id="vcard-first"
                      value={vcard.firstName}
                      onChange={(event) =>
                        setVcard({ ...vcard, firstName: event.target.value })
                      }
                      autoComplete="given-name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="vcard-last">
                      Last name
                    </label>
                    <input
                      id="vcard-last"
                      value={vcard.lastName}
                      onChange={(event) =>
                        setVcard({ ...vcard, lastName: event.target.value })
                      }
                      autoComplete="family-name"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="vcard-org">
                      Company
                    </label>
                    <input
                      id="vcard-org"
                      value={vcard.organization}
                      onChange={(event) =>
                        setVcard({ ...vcard, organization: event.target.value })
                      }
                      autoComplete="organization"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="vcard-title">
                      Job title
                    </label>
                    <input
                      id="vcard-title"
                      value={vcard.title}
                      onChange={(event) =>
                        setVcard({ ...vcard, title: event.target.value })
                      }
                      autoComplete="organization-title"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="vcard-phone">
                      Phone
                    </label>
                    <input
                      id="vcard-phone"
                      value={vcard.phone}
                      onChange={(event) =>
                        setVcard({ ...vcard, phone: event.target.value })
                      }
                      inputMode="tel"
                      autoComplete="tel"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="vcard-email">
                      Email
                    </label>
                    <input
                      id="vcard-email"
                      value={vcard.email}
                      onChange={(event) =>
                        setVcard({ ...vcard, email: event.target.value })
                      }
                      inputMode="email"
                      autoComplete="email"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="vcard-website">
                    Website
                  </label>
                  <input
                    id="vcard-website"
                    value={vcard.website}
                    onChange={(event) =>
                      setVcard({ ...vcard, website: event.target.value })
                    }
                    inputMode="url"
                    autoComplete="url"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="vcard-address">
                    Address
                  </label>
                  <input
                    id="vcard-address"
                    value={vcard.address}
                    onChange={(event) =>
                      setVcard({ ...vcard, address: event.target.value })
                    }
                    autoComplete="street-address"
                    className={inputClass}
                  />
                </div>
              </>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <QrStyleEditor value={style} onChange={setStyle} />
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto w-full max-w-[280px] rounded-xl bg-white p-3 ring-1 ring-slate-200 dark:ring-slate-700">
            {result.data ? (
              <QrCode
                data={result.data}
                style={style}
                size={256}
                className="mx-auto"
                label="Static QR code preview"
              />
            ) : (
              <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 p-4 text-center dark:border-slate-700">
                <svg
                  viewBox="0 0 24 24"
                  className="h-10 w-10 text-slate-300 dark:text-slate-600"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3 3h7v7H3V3Zm2 2v3h3V5H5Zm9-2h7v7h-7V3Zm2 2v3h3V5h-3ZM3 14h7v7H3v-7Zm2 2v3h3v-3H5Zm9 3h2v2h-2v-2Zm3-3h4v4h-2v-2h-2v-2Zm-3-3h4v2h-4v-2Z" />
                </svg>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your QR code will appear here.
                </p>
              </div>
            )}
          </div>

          <p
            aria-live="polite"
            className={
              result.data
                ? "mt-3 text-center text-xs text-slate-500 dark:text-slate-400"
                : "mt-3 text-center text-xs text-amber-600 dark:text-amber-400"
            }
          >
            {result.data
              ? `Scan with your phone before printing · ${result.bytes} bytes`
              : result.error}
          </p>

          <QrDownloadButtons
            data={result.data}
            style={style}
            name={downloadName}
            className="mt-4"
          />

          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            No account required. Generated in your browser. Nothing is stored.
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 dark:border-indigo-900 dark:bg-indigo-950/40">
          <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
            Need to change it later?
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-indigo-800 dark:text-indigo-200">
            A static QR code is frozen the moment you print it. A dynamic QR code
            points at a short link you can edit forever — no reprints.
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex text-xs font-semibold text-indigo-700 hover:underline dark:text-indigo-300"
          >
            Create a dynamic QR code →
          </Link>
        </div>
      </aside>
    </div>
  );
}
