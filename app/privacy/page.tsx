import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/legal-shell";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What QRflow collects, how it is used, and how to delete your data.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      intro={`${SITE_NAME} is a small, deliberately minimal product. We collect the least amount of data needed to run dynamic QR codes, we do not run advertising trackers, and we never sell your information.`}
    >
      <LegalSection heading="1. Information we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-slate-900 dark:text-white">
              Account details from Google.
            </strong>{" "}
            When you sign in, Google shares your email address, display name and
            profile photo URL. We never receive or store your Google password.
          </li>
          <li>
            <strong className="font-semibold text-slate-900 dark:text-white">
              QR codes you create.
            </strong>{" "}
            The name, destination URL, generated short code, creation date, and
            scan counter are stored in our database.
          </li>
          <li>
            <strong className="font-semibold text-slate-900 dark:text-white">
              Session cookies.
            </strong>{" "}
            Supabase sets cookies that keep you signed in. They are required for
            the dashboard to work.
          </li>
          <li>
            <strong className="font-semibold text-slate-900 dark:text-white">
              Operational logs.
            </strong>{" "}
            Our hosting and database providers keep standard server logs (such as
            IP address, user agent and timestamps) for security and reliability,
            under their own retention policies.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="2. Information we do not collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>No passwords — sign-in happens entirely through Google.</li>
          <li>No payment or billing data — paid plans are not implemented.</li>
          <li>No advertising or third-party analytics trackers.</li>
          <li>
            No individual scan profiles. We do not store the IP address, device or
            location of people who scan your QR codes.
          </li>
          <li>
            No content from the free static QR generator. It runs entirely in
            your browser: links, text, Wi-Fi passwords and contact details you
            enter there are never sent to us or stored anywhere.
          </li>
          <li>
            Your theme preference is kept in your browser&apos;s local storage and
            is never sent to our servers.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. How QR scans work">
        <p>
          When someone scans a dynamic QR code, our redirect endpoint looks up the
          short code, increments a counter for that code, and forwards the visitor
          to the destination URL. We store only the aggregate number of scans. We
          do not build profiles of the people who scan.
        </p>
        <p>
          Static QR codes created with our free generator are different: the image
          is generated locally in your browser and encodes your content directly.
          No request reaches our servers, so there is nothing for us to count or
          store.
        </p>
      </LegalSection>

      <LegalSection heading="4. How we use your information">
        <ul className="list-disc space-y-2 pl-5">
          <li>To authenticate you and keep your QR codes private to your account.</li>
          <li>To display your dashboard, scan counts and QR images.</li>
          <li>To detect abuse, prevent fraud, and keep the service running.</li>
          <li>To respond to support and data requests you send us.</li>
        </ul>
        <p>We do not use your data for advertising and we do not sell it.</p>
      </LegalSection>

      <LegalSection heading="5. Third-party providers">
        <p>We rely on a small number of processors to operate the service:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-semibold text-slate-900 dark:text-white">
              Supabase
            </strong>{" "}
            — database and authentication.
          </li>
          <li>
            <strong className="font-semibold text-slate-900 dark:text-white">
              Vercel
            </strong>{" "}
            — application hosting.
          </li>
          <li>
            <strong className="font-semibold text-slate-900 dark:text-white">
              Google
            </strong>{" "}
            — sign-in with Google.
          </li>
        </ul>
        <p>
          These providers process data on our behalf under their own terms and
          privacy policies. We do not share your data with anyone else except where
          required by law.
        </p>
      </LegalSection>

      <LegalSection heading="6. Retention and deletion">
        <p>
          Your QR codes remain until you delete them from the dashboard or ask us to
          delete your account. Deleting a QR code removes it and its scan counter
          from the database immediately.
        </p>
        <p>
          To delete your account and all associated data, email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          from the address you signed in with. We aim to respond within 30 days.
        </p>
      </LegalSection>

      <LegalSection heading="7. Security">
        <p>
          Data is transmitted over HTTPS. Access to QR codes is enforced with
          row-level security in the database, so one account cannot read another
          account&apos;s codes. No online service can guarantee absolute security,
          but we keep the stack intentionally small to limit exposure.
        </p>
      </LegalSection>

      <LegalSection heading="8. Children">
        <p>
          The service is not directed at children and is not intended for use by
          anyone under 16. We do not knowingly collect data from children.
        </p>
      </LegalSection>

      <LegalSection heading="9. Your choices and rights">
        <p>
          You can view, edit and delete your QR codes at any time from the
          dashboard. For a copy of your data, correction of account details, or
          deletion of your account, contact us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="10. Changes to this policy">
        <p>
          If this policy changes materially, we will update the date at the top of
          this page. Continued use of the service after an update means you accept
          the revised policy.
        </p>
      </LegalSection>

      <LegalSection heading="11. Contact">
        <p>
          Questions about privacy? Email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
