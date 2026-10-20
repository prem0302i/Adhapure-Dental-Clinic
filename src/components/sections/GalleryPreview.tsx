import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useGalleryCases } from "@/lib/content";

export function GalleryPreview() {
  const { cases } = useGalleryCases();
  const approvedCases = cases.filter((c) => c.consentConfirmed && c.beforeSrc && c.afterSrc).slice(0, 3);

  return (
    <section className="bg-enamel section-gap">
      <div className="container-wide">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading title="Smile gallery">
            Real patient smile transformations, published with explicit consent.
          </SectionHeading>
          <Button to="/gallery" variant="ghost">
            View smile gallery
          </Button>
        </div>

        <div className="mt-8">
          {approvedCases.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {approvedCases.map((c) => (
                <Link
                  key={c.id}
                  to="/gallery"
                  className="group block overflow-hidden rounded-xl border border-line bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="grid grid-cols-2 gap-1 bg-navy-soft p-1">
                    <img src={c.beforeSrc} alt="Before" className="aspect-square w-full object-cover rounded-l" />
                    <img src={c.afterSrc} alt="After" className="aspect-square w-full object-cover rounded-r" />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="font-medium text-navy text-sm">{c.caption || "Smile Case"}</span>
                    <ArrowRight className="h-4 w-4 text-teal-deep opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white p-10 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-tint text-teal-deep">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-navy">Transforming smiles every day</h3>
              <p className="mt-2 max-w-md text-sm text-muted">
                We only showcase verified before-and-after cases with written patient consent. Explore our treatment options or ask about cosmetic smile improvements during your consultation.
              </p>
              <div className="mt-6">
                <Button to="/services" variant="secondary" size="md">
                  Explore treatments
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
