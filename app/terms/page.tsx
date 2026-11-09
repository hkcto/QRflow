import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/legal-shell";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The rules for using QRflow, a dynamic QR code service currently in free beta.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      intro={`These terms govern your use of ${SITE_NAME}. By signing in or using the service, you agree to them. ${SITE_NAME} is currently a free beta, so features and limits may change.`}
    >
      <LegalSection heading="1. The service">
        <p>
          {SITE_NAME} creates dynamic QR codes. Each code points at a short link
          that we control; the short link redirects to a destination URL you can
          change later. The QR image encodes the short link, not the destination.
        </p>
        <p>
          The service is provided free of charge during the beta. Paid plans are
          not available yet, and no payment information is collected.
        </p>
      </LegalSection>

      <LegalSection heading="2. Accounts">
        <ul className="list-disc space-y-2 pl-5">
          <li>You sign in with Google. You must have the right to use that account.</li>
          <li>
            You are responsible for activity that happens under your account and
            for keeping access to your Google account secure.
          </li>
          <li>
            You must be at least 16 years old, or the age of majority in your
            jurisdiction, to use the service.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Acceptable use">
        <p>You agree not to use {SITE_NAME} to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>link to illegal content, malware, phishing, or fraud;</li>
          <li>impersonate another person, brand, or organisation;</li>
          <li>send unsolicited bulk messages or evade spam filters;</li>
          <li>infringe intellectual property or privacy rights;</li>
          <li>
            probe, overload, scrape, or attempt to bypass the security of the
            service;
          </li>
          <li>resell the service without our written permission.</li>
        </ul>
        <p>
          We may disable or delete any QR code, or suspend an account, that we
          reasonably believe violates these rules or creates risk for other people.
          Where practical, we will tell you why.
        </p>
      </LegalSection>

      <LegalSection heading="4. Your content">
        <p>
          You keep ownership of the names, destinations and other content you add.
          You grant us a limited licence to store, process and serve that content
          solely to operate the service — for example, to redirect a scan and to
          render your dashboard.
        </p>
        <p>
          You are responsible for the destinations you link to and for having the
          right to use them.
        </p>
      </LegalSection>

      <LegalSection heading="5. Printed codes and changing destinations">
        <p>
          A dynamic QR image encodes a short link on our domain. If you change the
          destination, printed codes keep working. If you delete a code, pause it,
          change the app domain, or stop using the service, previously printed
          codes may stop working. Test before you print at scale.
        </p>
        <p>
          Static QR codes generated on this site encode their content directly and
          cannot be edited after download. You are responsible for that content,
          and we cannot remotely disable or change a static code once it has been
          printed or shared.
        </p>
      </LegalSection>

      <LegalSection heading="6. Availability and changes">
        <p>
          The beta is provided on a best-effort basis. We do not guarantee uptime,
          response times, or that any feature will remain available. We may modify,
          limit or discontinue the service, and we may impose reasonable usage
          limits to protect it.
        </p>
      </LegalSection>

      <LegalSection heading="7. No warranty">
        <p>
          The service is provided &quot;as is&quot; and &quot;as available&quot;,
          without warranties of any kind, whether express or implied, including
          merchantability, fitness for a particular purpose, and non-infringement.
          We do not warrant that redirects will always be available or error-free.
        </p>
      </LegalSection>

      <LegalSection heading="8. Limitation of liability">
        <p>
          To the maximum extent permitted by law, {SITE_NAME} and its operator are
          not liable for indirect, incidental, special or consequential damages, or
          for lost profits, revenue, data, or goodwill, arising from your use of the
          service. Because the service is free, our total aggregate liability is
          limited to the greater of the amount you paid us in the past twelve months
          or HKD 100.
        </p>
      </LegalSection>

      <LegalSection heading="9. Termination">
        <p>
          You can stop using the service at any time and delete your QR codes from
          the dashboard. We may suspend or terminate access if these terms are
          breached, if required by law, or if continuing would create risk for the
          service or other users.
        </p>
      </LegalSection>

      <LegalSection heading="10. Third-party services">
        <p>
          Sign-in is provided by Google, and the service runs on Supabase and
          Vercel. Your use of those services may also be subject to their own terms.
          We are not responsible for third-party services we do not control.
        </p>
      </LegalSection>

      <LegalSection heading="11. Governing law">
        <p>
          These terms are governed by the laws of the Hong Kong Special
          Administrative Region. Any dispute will be subject to the exclusive
          jurisdiction of the courts of Hong Kong.
        </p>
      </LegalSection>

      <LegalSection heading="12. Contact">
        <p>
          Questions about these terms? Email{" "}
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
