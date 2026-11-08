/**
 * Server-only feature flags.
 *
 * `ENABLE_PRO` intentionally has no NEXT_PUBLIC_ prefix so it is never
 * inlined into the client bundle. Pass values down as props if a client
 * component needs them.
 */
export const features = {
  pro: process.env.ENABLE_PRO === "true",
} as const;
