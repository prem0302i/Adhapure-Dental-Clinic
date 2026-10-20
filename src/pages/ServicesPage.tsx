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
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { PageMeta } from "@/components/ui/PageMeta";
import { pageMeta } from "@/lib/clinic-config";
import { useTreatments } from "@/lib/content";

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
  const { treatments } = useTreatments();
  // Allow pre-selecting a service via ?service=slug (used by appointment links)
  const [searchParams] = useSearchParams();
  const highlighted = searchParams.get("service");

  return (
    <>
      <PageMeta title={meta.title} description={meta.description} />

      {/* Page header */}
      <section className="bg-enamel section-gap">
        <div className="container-wide">
          <SectionHeading as="h1" title="Treatments we offer">
            We provide a comprehensive range of dental care options for patients of all ages. Our team will
            explain which treatments are right for you at your appointment.
          </SectionHeading>
        </div>
      </section>

      {/* Services list */}
      <section className="section-gap">
        <div className="container-wide">
          <ul className="divide-y divide-line border-y border-line">
            {treatments.map((service) => {
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
                      <WhatsAppButton
                        message={waMessage}
                        label="WhatsApp"
                        variant="solid"
                      />
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
