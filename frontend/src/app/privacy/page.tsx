import type { Metadata } from "next";
import { PolicyPlaceholder } from "@/components/layout/PolicyPlaceholder";

export const metadata: Metadata = {
  title: "Privacy Policy",
  // Not indexable until it contains the hospital's real policy.
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <PolicyPlaceholder
      title="Privacy Policy"
      needs={[
        "What personal and health data is collected at booking, and why",
        "How long booking records and second-opinion requests are retained",
        "Who inside the hospital can access patient data, and which processors are used (SMS gateway, email provider, payment gateway, hosting)",
        "How a patient can request access to, correction of, or deletion of their data",
        "Consent for SMS, call, email and WhatsApp communication",
        "Grievance officer name and contact, as required by the DPDP Act",
      ]}
    />
  );
}
