import { UserRound } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { PageMeta } from "@/components/ui/PageMeta";
import { pageMeta } from "@/lib/clinic-config";
import { useDoctors } from "@/lib/content";
import type { Doctor } from "@/types";

interface DoctorCardProps {
  doctor: Doctor;
}

function DoctorCard({ doctor }: DoctorCardProps) {
  const waMessage = `Hello, I would like to enquire about an appointment with ${doctor.name}.`;

  return (
    <article
      aria-labelledby={`doctor-${doctor.slug}-name`}
      className="flex flex-col rounded-xl border border-line bg-white p-6 shadow-sm"
    >
      {/* Photo / Avatar */}
      <div className="flex items-start gap-5">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-tint text-teal-deep"
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
      {doctor.bio && (
        <p className="mt-5 flex-1 text-sm text-muted leading-relaxed">{doctor.bio}</p>
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
  const { doctors, loading } = useDoctors();

  return (
    <>
      <PageMeta title={meta.title} description={meta.description} />

      {/* Page header */}
      <section className="bg-enamel section-gap">
        <div className="container-wide">
          <SectionHeading as="h1" title="Meet our doctors">
            Our team of qualified dentists is dedicated to providing gentle, professional dental care for you and your family.
          </SectionHeading>
        </div>
      </section>

      {/* Doctor cards */}
      <section className="section-gap">
        <div className="container-wide">
          {doctors.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {doctors.map((doc) => (
                <DoctorCard key={doc.slug} doctor={doc} />
              ))}
            </div>
          ) : !loading ? (
            <div className="rounded-xl border border-line bg-enamel p-10 text-center text-muted">
              <p className="font-serif text-lg text-navy">Clinicians list</p>
              <p className="mt-2 text-sm">Please enquire with our reception team to learn more about our practicing dentists.</p>
            </div>
          ) : null}
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
