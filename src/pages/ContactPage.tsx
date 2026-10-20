import { Phone, Mail, MapPin, Clock, Navigation, ExternalLink, MessageCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { PageMeta } from "@/components/ui/PageMeta";
import { pageMeta } from "@/lib/clinic-config";
import { useOpeningHours, useClinicSettings } from "@/lib/content";

interface ContactRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function ContactRow({ icon, label, children }: ContactRowProps) {
  return (
    <div className="flex items-start gap-4 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-tint text-teal-deep">
        {icon}
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <div className="mt-0.5 text-navy">{children}</div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const meta = pageMeta["/contact"];
  const { hours } = useOpeningHours();
  const { settings } = useClinicSettings();

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

  const hasMapsLink = Boolean(mapsUrl || hasAddress);
  const hasPhone = Boolean(settings.phoneHref);

  return (
    <>
      <PageMeta title={meta.title} description={meta.description} />

      {/* Page header */}
      <section className="bg-enamel section-gap">
        <div className="container-wide">
          <SectionHeading as="h1" title="Contact and location">
            We are here to help. Reach us by phone, WhatsApp, or email, and find directions below.
          </SectionHeading>
        </div>
      </section>

      {/* Contact details + map */}
      <section className="section-gap">
        <div className="container-wide grid gap-12 md:grid-cols-2 md:items-start">

          {/* Contact details */}
          <div>
            <h2 className="font-serif text-2xl text-navy">Get in touch</h2>

            <div className="mt-6 divide-y divide-line border-y border-line">
              {/* Phone */}
              {settings.phoneDisplay && (
                <ContactRow icon={<Phone className="h-5 w-5" aria-hidden="true" />} label="Phone">
                  {hasPhone ? (
                    <a
                      href={settings.phoneHref}
                      className="font-medium hover:text-teal-deep"
                    >
                      {settings.phoneDisplay}
                    </a>
                  ) : (
                    <span>{settings.phoneDisplay}</span>
                  )}
                </ContactRow>
              )}

              {/* WhatsApp */}
              <ContactRow
                icon={<MessageCircle className="h-5 w-5" aria-hidden="true" />}
                label="WhatsApp"
              >
                <WhatsAppButton label="Chat on WhatsApp" variant="inline" />
              </ContactRow>

              {/* Email */}
              {settings.email && (
                <ContactRow icon={<Mail className="h-5 w-5" aria-hidden="true" />} label="Email">
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-teal-deep"
                  >
                    {settings.email}
                  </a>
                </ContactRow>
              )}

              {/* Address */}
              <ContactRow icon={<MapPin className="h-5 w-5" aria-hidden="true" />} label="Address">
                <address className="not-italic text-navy">
                  {settings.addressLine1}
                  {settings.addressLine2 && (
                    <>
                      <br />
                      {settings.addressLine2}
                    </>
                  )}
                </address>
              </ContactRow>

              {/* Hours */}
              {hours.length > 0 && (
                <ContactRow icon={<Clock className="h-5 w-5" aria-hidden="true" />} label="Opening hours">
                  <ul className="space-y-1 text-sm">
                    {hours.map(({ day, hours: h }) => (
                      <li key={day} className="flex gap-4">
                        <span className="w-36 shrink-0 text-muted">{day}</span>
                        <span className="font-medium text-navy">{h}</span>
                      </li>
                    ))}
                  </ul>
                </ContactRow>
              )}
            </div>

            {/* Directions button */}
            <div className="mt-6 flex flex-wrap gap-3">
              {directionsUrl ? (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-pill bg-teal-deep px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal min-h-tap"
                >
                  <Navigation className="h-4 w-4" aria-hidden="true" />
                  Get directions
                </a>
              ) : mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-pill bg-teal-deep px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal min-h-tap"
                >
                  <Navigation className="h-4 w-4" aria-hidden="true" />
                  Open in Maps
                </a>
              ) : null}

              <Button to="/appointment" variant="secondary" size="md">
                Request an appointment
              </Button>
            </div>
          </div>

          {/* Map embed or fallback */}
          <div className="flex flex-col gap-4">
            {hasMapsLink ? (
              <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
                <iframe
                  title="Clinic Location Map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    addressQuery || "Dental Clinic"
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-72 border-0"
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
                      <span>Open in Google Maps</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-line bg-enamel p-6 text-center">
                <MapPin className="h-8 w-8 text-teal-deep" aria-hidden="true" />
                <p className="mt-2 font-medium text-navy">{settings.name}</p>
                <p className="text-sm text-muted">{settings.addressLine1}, {settings.addressLine2}</p>
              </div>
            )}

            <div className="rounded-lg border border-line bg-enamel p-4 text-sm text-muted">
              <p>
                <strong className="text-navy">Parking and access:</strong>{" "}
                <span>Convenient on-site patient parking and step-free entrance.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry form link */}
      <section className="bg-enamel section-gap">
        <div className="container-wide flex flex-col items-center gap-5 text-center">
          <h2 className="font-serif text-2xl text-navy md:text-3xl">Prefer to send a message?</h2>
          <p className="max-w-md text-muted">
            Use our enquiry form to request an appointment or ask a question. We will get back to
            you within one business day.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button to="/appointment" size="lg">
              Go to enquiry form
            </Button>
            <WhatsAppButton label="Chat on WhatsApp" />
          </div>
          {settings.email && (
            <p className="text-xs text-muted">
              Or send us an email directly at{" "}
              <a
                href={`mailto:${settings.email}`}
                className="underline hover:text-teal-deep font-medium"
              >
                {settings.email}
              </a>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
