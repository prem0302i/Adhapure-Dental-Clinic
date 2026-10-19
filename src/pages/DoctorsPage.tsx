import { UserRound } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { PlaceholderNotice } from "@/components/ui/Placeholder";
import { PageMeta } from "@/components/ui/PageMeta";
import { pageMeta } from "@/lib/clinic-config";
import { useDoctors } from "@/lib/content";
import type { Doctor } from "@/types";

interface DoctorCardProps {
  doctor: Doctor;
}

function DoctorCard({ doctor }: DoctorCardProps) {
  const waMessage = doctor.placeholder
    ? "Hello, I would like to enquire about an appointment at your dental clinic."
    : `Hello, I would like to enquire about an appointment with ${doctor.name}.`;

  return (
    <article
      aria-labelledby={`doctor-${doctor.slug}-name`}
      className="flex flex-col rounded-xl border border-line bg-white p-6 shadow-sm"
    >
      {/* Photo / Avatar */}
      <div className="flex items-start gap-5">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-teal-tint text-teal-deep"
          aria-hidden="true"
        >
          {doctor.photo ? (
            <img
              src={doctor.photo}
              alt={`Photo of ${doctor.name}`}
              loading="lazy"
              decoding="async"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <UserRound className="h-10 w-10" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2
            id={`doctor-${doctor.slug}-name`}
            className="font-serif text-xl text-navy"
          >
            {doctor.name}
          </h2>
          {doctor.qualifications && (
            <p className="mt-0.5 text-sm text-muted">{doctor.qualifications}</p>
          )}
          {doctor.specialisation && (
            <p className="text-sm font-medium text-teal-deep">{doctor.specialisation}</p>
          )}
          {doctor.experienceYears !== undefined && (
            <p className="mt-1 text-sm text-muted">
              {doctor.experienceYears} years of experience
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      <p className="mt-5 flex-1 text-sm text-muted leading-relaxed">{doctor.bio}</p>

      {/* Placeholder notice on placeholder cards */}
      {doctor.placeholder && (
        <p className="mt-3 rounded-md border border-dashed border-line bg-enamel px-3 py-2 text-xs text-muted">
          This is a placeholder profile. Real name, qualifications and photo will be shown once
          verified details are supplied by the clinic.
        </p>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          to={`/appointment?treatment=general`}
          variant="primary"
          size="md"
        >
          Request an appointment
        </Button>
        <WhatsAppButton
          message={waMessage}
          label="Chat on WhatsApp"
        />
      </div>
    </article>
  );
}

export default function DoctorsPage() {
  const meta = pageMeta["/doctors"];
  const { doctors } = useDoctors();
  return (
    <>
      <PageMeta title={meta.title} description={meta.description} />

      {/* Page header */}
      <section className="bg-enamel section-gap">
        <div className="container-wide">
          <PlaceholderNotice message="Doctor profiles below are placeholders. Names, qualifications, specialisations and photos will be shown once verified details are supplied by the clinic." />
          <div className="mt-10">
            <SectionHeading as="h1" title="Meet our doctors">
              Our team of qualified dentists is here to provide gentle, professional care for you
              and your family.
            </SectionHeading>
          </div>
        </div>
      </section>

      {/* Doctor cards */}
      <section className="section-gap">
        <div className="container-wide">
          <div className="grid gap-8 md:grid-cols-2">
            {doctors.map((doc) => (
              <DoctorCard key={doc.slug} doctor={doc} />
            ))}
          </div>

          <p className="mt-10 max-w-2xl text-sm text-muted italic">
            All qualifications and professional registrations will be verified before being published.
            No credentials are displayed until confirmed.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy section-gap">
        <div className="container-wide flex flex-col items-center gap-6 text-center">
          <h2 className="font-serif text-3xl text-white md:text-4xl">Book a consultation</h2>
          <p className="max-w-xl text-white/75">
            Our team will confirm which doctor is available and best suited to your needs.
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
