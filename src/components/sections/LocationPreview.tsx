import { MapPin, Navigation, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useClinicSettings, useOpeningHours } from "@/lib/content";

export function LocationPreview() {
  const { settings } = useClinicSettings();
  const { hours } = useOpeningHours();

  const addressQuery = [
    settings.name,
    settings.addressLine1,
    settings.addressLine2,
  ]
    .filter(Boolean)
    .filter((s) => !s.startsWith("["))
    .join(", ");

  const hasAddress = Boolean(addressQuery);
  const mapsUrl =
    settings.mapsLink?.trim() ||
    (hasAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`
      : "");
  const directionsUrl =
    settings.directionsLink?.trim() ||
    (hasAddress
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressQuery)}`
      : mapsUrl);

  const hasMaps = Boolean(mapsUrl || hasAddress);

  return (
    <section className="section-gap">
      <div className="container-wide grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <SectionHeading title="Where to find us">
            {settings.addressLine1 ? `${settings.addressLine1}, ${settings.addressLine2}` : "Visit our clinic"}
          </SectionHeading>

          {hours.length > 0 && (
            <div className="mt-4 flex items-start gap-3 text-sm text-muted">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal-deep" aria-hidden="true" />
              <div className="space-y-1">
                {hours.map((h) => (
                  <p key={h.day}>
                    <span className="font-medium text-navy">{h.day}:</span> {h.hours}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button to="/contact" variant="secondary">
              Contact and directions
            </Button>
            {directionsUrl && (
              <a
                href={directionsUrl}
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
          {hasMaps ? (
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              <iframe
                title="Clinic Location Map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  addressQuery || "Dental Clinic"
                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="p-3 bg-white border-t border-line flex items-center justify-between text-xs">
                <span className="text-muted font-medium truncate max-w-[220px]">
                  {settings.addressLine1}, {settings.addressLine2}
                </span>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-deep font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-line bg-enamel p-6 text-center">
              <MapPin className="h-8 w-8 text-teal-deep" aria-hidden="true" />
              <p className="mt-2 font-medium text-navy">{settings.name}</p>
              <p className="text-sm text-muted">{settings.addressLine1}, {settings.addressLine2}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
