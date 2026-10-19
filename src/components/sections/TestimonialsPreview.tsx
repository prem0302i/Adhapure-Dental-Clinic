import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Placeholder } from "@/components/ui/Placeholder";
import { testimonials } from "@/lib/clinic-config";

export function TestimonialsPreview() {
  return (
    <section className="section-gap">
      <div className="container-wide">
        <SectionHeading title="What patients say" align="center">
          Genuine reviews from patients, shared with their permission.
        </SectionHeading>

        <div className="mt-10">
          {testimonials.length === 0 ? (
            <Placeholder label="[PATIENT REVIEWS COMING SOON]">
              Real patient testimonials will appear here once we have verified quotes and permission.
            </Placeholder>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2">
              {testimonials.map((t, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-line bg-white p-6"
                >
                  <Quote className="h-6 w-6 text-teal" aria-hidden="true" />
                  <p className="mt-3 text-muted">"{t.quote}"</p>
                  <p className="mt-4 text-sm font-medium text-navy">— {t.name}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
