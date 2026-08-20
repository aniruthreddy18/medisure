import type { Metadata } from "next";
import { PolicyPlaceholder } from "@/components/layout/PolicyPlaceholder";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  robots: { index: false, follow: false },
};

export default function RefundPolicyPage() {
  return (
    <PolicyPlaceholder
      title="Refund & Cancellation Policy"
      needs={[
        "How far in advance an OP appointment can be cancelled for a full refund",
        "Whether the consultation fee is refunded, credited, or forfeited on a no-show",
        "Refund rules for unused home-physiotherapy package sessions, and what happens when a package expires",
        "What happens if the hospital cancels — doctor unavailable, emergency, physiotherapist ill",
        "Refund processing time and the method funds are returned by",
        "Who to contact about a refund",
        "REQUIRED BEFORE PAYMENTS GO LIVE — Razorpay checks for this page during merchant onboarding",
      ]}
    />
  );
}
