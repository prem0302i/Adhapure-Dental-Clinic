import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Placeholder } from "@/components/ui/Placeholder";
import { clinicConfig } from "@/lib/clinic-config";

export function LocationPreview() {
  const hasMaps = Boolean(clinicConfig.address.mapsLink);
  return (
    <section className="section-gap">
      <div className="container-wide grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <SectionHeading title="Where to find us">
            {clinicConfig.address.line1}, {clinicConfig.address.line2}
          </SectionHeading>
          <p className="mt-4 text-muted">
            Opening hours will be confirmed by the clinic and shown here.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button to="/contact" variant="secondary">
              Contact and directions
            </Button>
            {hasMaps && (
              <a
                href={clinicConfig.address.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-pill bg-teal-deep px-5 py-2.5 text-[0.95rem] font-medium text-white transition-colors hover:bg-teal min-h-tap"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Get directions
              </a>
            )}
          </div>
        </div>
        <div>
          <Placeholder label="[MAP PLACEHOLDER]">
            <span className="inline-flex items-center gap-1.5 text-muted">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Google Maps will be embedded here once the clinic's Maps link is supplied.
            </span>
          </Placeholder>
        </div>
      </div>
    </section>
  );
}
