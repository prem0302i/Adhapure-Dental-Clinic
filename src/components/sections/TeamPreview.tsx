import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useDoctors } from "@/lib/content";

export function TeamPreview() {
  const { doctors } = useDoctors();
  const displayDoctors = doctors.slice(0, 2);

  return (
    <section className="section-gap">
      <div className="container-wide">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading title="Meet the team">
            Meet our dedicated dentists committed to providing gentle, high-quality dental care.
          </SectionHeading>
          <Button to="/doctors" variant="ghost">
            See all doctors
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {displayDoctors.map((doc) => (
            <div key={doc.slug} className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-tint text-teal-deep">
                  {doc.photo ? (
                    <img
                      src={doc.photo}
                      alt={doc.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <UserRound className="h-8 w-8" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <p className="font-serif text-lg text-navy">{doc.name}</p>
                  <p className="text-sm font-medium text-teal-deep">{doc.specialisation}</p>
                  {doc.qualifications && (
                    <p className="text-xs text-muted">{doc.qualifications}</p>
                  )}
                </div>
              </div>
              {doc.bio && <p className="mt-4 text-sm text-muted">{doc.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
