import type { Metadata } from "next";
import { PolicyPlaceholder } from "@/components/layout/PolicyPlaceholder";

export const metadata: Metadata = {
  title: "Terms of Use",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <PolicyPlaceholder
      title="Terms of Use"
      needs={[
        "That website content is general information and not medical advice",
        "Conditions of using the online booking service, and the hospital's right to reschedule",
        "Patient responsibilities: accurate details, arriving on time, bringing records",
        "Limitation of liability and governing law / jurisdiction",
        "Intellectual property in site content and patient photographs",
      ]}
    />
  );
}
