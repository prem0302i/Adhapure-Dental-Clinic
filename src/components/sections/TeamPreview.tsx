import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaceholderNotice } from "@/components/ui/Placeholder";
import { useDoctors } from "@/lib/content";

export function TeamPreview() {
  const { doctors } = useDoctors();
  const displayDoctors = doctors.slice(0, 2);
  return (
    <section className="section-gap">
      <div className="container-wide">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading title="Meet the team">
            Profiles of our dentists will appear here once verified details are supplied.
          </SectionHeading>
          <Button to="/doctors" variant="ghost">
            See all doctors
          </Button>
        </div>

        <PlaceholderNotice
          message="Doctor profiles shown are placeholders. Names, qualifications and bios will be added once verified."
        />

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {displayDoctors.map((doc) => (
            <div key={doc.slug} className="rounded-xl border border-line bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-tint text-teal-deep">
                  <UserRound className="h-8 w-8" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-serif text-lg text-navy">{doc.name}</p>
                  <p className="text-sm text-muted">{doc.specialisation}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted">{doc.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
