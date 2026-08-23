import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PasswordForm } from "@/components/admin/PasswordForm";

export const dynamic = "force-dynamic";

export default function ChangePasswordPage() {
  return (
    <Container className="max-w-md py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All doctors
      </Link>

      <h1 className="mt-5 font-display text-2xl font-bold text-ink-900">Change password</h1>
      <p className="mt-1.5 text-sm text-ink-600">
        You will stay signed in on this device. Anyone signed in elsewhere keeps
        their session until it expires.
      </p>

      <PasswordForm />
    </Container>
  );
}
