import Link from "next/link";
import { CalendarPlus, HomeIcon, MessageSquareHeart, PhoneCall } from "lucide-react";
import { site } from "@medisure/backend/site";
import { Container } from "@/components/ui/Container";

/**
 * Four fixed entry points directly under the hero.
 *
 * Apollo and Yashoda both put action tiles in the fold rather than letting the
 * hero be purely decorative — a hospital visitor almost always arrives with
 * one of these four intents, and making them hunt for a menu loses the booking.
 */
const actions = [
  {
    href: "/book/op",
    icon: CalendarPlus,
    label: "Book OP Appointment",
    hint: "Consult a doctor at the hospital",
    accent: true,
  },
  {
    href: "/home-physiotherapy",
    icon: HomeIcon,
    label: "Home Physiotherapy",
    hint: "Our physiotherapist visits you",
  },
  {
    href: "/second-opinion",
    icon: MessageSquareHeart,
    label: "Free Second Opinion",
    hint: "Send reports, hear from a specialist",
  },
  {
    href: `tel:${site.phone.booking}`,
    icon: PhoneCall,
    label: "Talk to Us",
    hint: "Speak to our booking desk",
    external: true,
  },
];

export function ActionRail() {
  return (
    <div className="relative z-10 border-b border-border bg-white">
      <Container className="py-0">
        <ul className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {actions.map((action) => {
            const Icon = action.icon;
            const content = (
              <>
                <span
                  className={
                    action.accent
                      ? "grid size-11 shrink-0 place-items-center rounded-xl bg-accent-500 text-white"
                      : "grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"
                  }
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display font-semibold text-brand-900">
                    {action.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-500">{action.hint}</span>
                </span>
              </>
            );

            const className =
              "flex items-center gap-3.5 px-1 py-5 transition-colors hover:bg-brand-50/60 sm:px-5 lg:px-6";

            return (
              <li key={action.href} className="sm:border-b sm:border-border lg:border-b-0">
                {action.external ? (
                  <a href={action.href} className={className}>
                    {content}
                  </a>
                ) : (
                  <Link href={action.href} className={className}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </div>
  );
}
