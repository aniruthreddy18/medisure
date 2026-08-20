import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "book" | "outline" | "ghost" | "emergency";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  // Teal — general navigation and secondary actions
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 shadow-sm",
  // Coral — reserved for booking. Only one "book" button should compete
  // for attention in any single viewport.
  book: "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm",
  outline:
    "border border-brand-700 text-brand-800 bg-white hover:bg-brand-50 active:bg-brand-100",
  ghost: "text-brand-800 hover:bg-brand-50 active:bg-brand-100",
  emergency:
    "bg-emergency text-white hover:brightness-95 active:brightness-90 shadow-sm",
};

const sizes: Record<Size, string> = {
  // min-h keeps every target >= 44px for touch (WCAG 2.5.5)
  sm: "min-h-11 px-4 text-sm gap-1.5",
  md: "min-h-12 px-5 text-[0.95rem] gap-2",
  lg: "min-h-14 px-7 text-base gap-2.5",
};

const base =
  "inline-flex items-center justify-center rounded-xl font-semibold " +
  "transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none " +
  "whitespace-nowrap";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & { href: string } & React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
