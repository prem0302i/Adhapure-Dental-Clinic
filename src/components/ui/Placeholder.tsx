import type { ReactNode } from "react";

interface PlaceholderProps {
  label: string;
  children?: ReactNode;
  variant?: "box" | "inline";
  className?: string;
}

/**
 * A clearly-labelled placeholder. Used for any content that is waiting on
 * verified client information or approved assets. Never presented as real.
 */
export function Placeholder({ label, children, variant = "box", className = "" }: PlaceholderProps) {
  if (variant === "inline") {
    return (
      <span
        className={`inline-block rounded border border-dashed border-line bg-enamel px-2 py-0.5 text-sm text-muted ${className}`}
      >
        {label}
      </span>
    );
  }

  return (
    <div
      role="note"
      className={`rounded-lg border border-dashed border-line bg-enamel p-6 text-center ${className}`}
    >
      <p className="font-serif text-lg text-navy">{label}</p>
      {children && <p className="mt-2 text-sm text-muted">{children}</p>}
    </div>
  );
}

interface PlaceholderNoticeProps {
  message: string;
}

/** Site-wide banner style notice shown on pages still using placeholder content. */
export function PlaceholderNotice({ message }: PlaceholderNoticeProps) {
  return (
    <div
      role="status"
      className="rounded-lg border border-line bg-teal-tint px-4 py-3 text-sm text-teal-deep"
    >
      {message}
    </div>
  );
}
