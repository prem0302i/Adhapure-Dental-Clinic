import { useSearchParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
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
  MessageCircle,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { PlaceholderNotice } from "@/components/ui/Placeholder";
import { PageMeta } from "@/components/ui/PageMeta";
import { services, pageMeta, buildWhatsAppUrl } from "@/lib/clinic-config";

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

export default function ServicesPage() {
  const meta = pageMeta["/services"];
  // Allow pre-selecting a service via ?service=slug (used by appointment links)
  const [searchParams] = useSearchParams();
  const highlighted = searchParams.get("service");

  return (
    <>
      <PageMeta title={meta.title} description={meta.description} />

      {/* Page header */}
      <section className="bg-enamel section-gap">
        <div className="container-wide">
          <PlaceholderNotice message="The services listed below are example categories. They will be replaced with the clinic's confirmed treatment list before launch. No prices or outcomes are shown." />
          <div className="mt-10">
            <SectionHeading as="h1" title="Treatments we offer">
              We provide a range of dental care options for patients of all ages. Our team will
              explain which treatments are right for you at your appointment.
            </SectionHeading>
          </div>
        </div>
      </section>

      {/* Services list */}
      <section className="section-gap">
        <div className="container-wide">
          <ul className="divide-y divide-line border-y border-line">
            {services.map((service) => {
              const Icon = iconMap[service.icon] ?? Circle;
              const isHighlighted = highlighted === service.slug;
              const waMessage = `Hello, I would like to enquire about ${service.name} at your dental clinic.`;
              return (
                <li
                  key={service.slug}
                  id={service.slug}
                  className={`py-7 transition-colors ${isHighlighted ? "bg-teal-tint/40 -mx-4 px-4 rounded-lg" : ""}`}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    {/* Icon */}
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-tint text-teal-deep">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>

                    {/* Content */}
                    <div className="flex-1">
                      <h2 className="font-serif text-xl text-navy">{service.name}</h2>
                      <p className="mt-2 text-muted">{service.summary}</p>
                      <p className="mt-2 text-sm text-muted italic">
                        No specific outcomes, prices or waiting times are stated — speak with our
                        team for details relevant to your situation.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                      <Button
                        to={`/appointment?treatment=${encodeURIComponent(service.slug)}`}
                        variant="primary"
                        size="md"
                      >
                        Ask about this
                      </Button>
                      <a
                        href={buildWhatsAppUrl(waMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Chat on WhatsApp about ${service.name}`}
                        className="inline-flex items-center justify-center gap-2 rounded-pill bg-teal-tint px-5 py-2.5 text-[0.95rem] font-medium text-teal-deep transition-colors hover:bg-teal hover:text-white min-h-tap"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 max-w-2xl text-sm text-muted italic">
            This list is for general information only and is not a substitute for professional
            dental advice. Please contact us to discuss your individual needs.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy section-gap">
        <div className="container-wide flex flex-col items-center gap-6 text-center">
          <h2 className="font-serif text-3xl text-white md:text-4xl">
            Not sure which treatment you need?
          </h2>
          <p className="max-w-xl text-white/75">
            Send us an enquiry and a member of our team will guide you to the right option.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button to="/appointment" size="lg">
              Request an appointment
            </Button>
            <WhatsAppButton label="Chat on WhatsApp" />
          </div>
        </div>
      </section>
    </>
  );
}
