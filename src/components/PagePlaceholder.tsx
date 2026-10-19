import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Placeholder } from "@/components/ui/Placeholder";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

interface PagePlaceholderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

/** Temporary page used in Stage 1 so no link breaks. Replaced in Stage 2. */
export function PagePlaceholder({ title, description, children }: PagePlaceholderProps) {
  return (
    <div className="container-wide section-gap">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-teal-deep"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Link>
      <h1 className="mt-6 text-3xl md:text-4xl text-balance">{title}</h1>
      <p className="mt-4 max-w-2xl text-muted md:text-lg">{description}</p>

      <div className="mt-8">
        <Placeholder label="This page is being built in Stage 2">
          {children ?? "Content for this page will be developed in the next stage."}
        </Placeholder>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <WhatsAppButton label="Chat on WhatsApp" />
      </div>
    </div>
  );
}
