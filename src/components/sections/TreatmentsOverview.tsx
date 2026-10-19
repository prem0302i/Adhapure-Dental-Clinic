import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Hammer,
  Sun,
  AlignHorizontalJustifyCenter,
  Anchor,
  Crown,
  Baby,
  Smile,
  Circle,
} from "lucide-react";
import { useTreatments } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaceholderNotice } from "@/components/ui/Placeholder";

const iconMap: Record<string, LucideIcon> = {
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Hammer,
  Sun,
  AlignHorizontalJustifyCenter,
  Anchor,
  Crown,
  Baby,
  Smile,
};

export function TreatmentsOverview() {
  const { treatments } = useTreatments();
  return (
    <section className="section-gap">
      <div className="container-wide">
        <SectionHeading title="Treatments we offer">
          A range of dental care options. Final services will be confirmed by the clinic.
        </SectionHeading>

        <PlaceholderNotice message="The services below are example categories. They will be replaced with the clinic's confirmed treatment list." />

        <ul className="mt-8 divide-y divide-line border-y border-line">
          {treatments.map((service) => {
            const Icon = iconMap[service.icon] ?? Circle;
            return (
              <li key={service.slug} className="py-5">
                <Link to={`/services#${service.slug}`} className="group flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-tint text-teal-deep">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-serif text-lg text-navy">{service.name}</span>
                    <span className="mt-1 block text-sm text-muted">{service.summary}</span>
                  </span>
                  <ArrowRight
                    className="mt-1 h-5 w-5 text-muted transition-colors group-hover:text-teal-deep"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/services" variant="secondary">
            See all treatments
          </Button>
          <WhatsAppButton label="Ask about a treatment" />
        </div>
      </div>
    </section>
  );
}
