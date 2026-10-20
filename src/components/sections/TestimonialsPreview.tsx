import { Quote, ThumbsUp } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/clinic-config";

export function TestimonialsPreview() {
  return (
    <section className="section-gap">
      <div className="container-wide">
        <SectionHeading title="What patients say" align="center">
          Genuine experiences and feedback from our valued patients.
        </SectionHeading>

        <div className="mt-10">
          {testimonials.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-line bg-enamel p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-tint text-teal-deep">
                <ThumbsUp className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-navy">Dedicated to patient satisfaction</h3>
              <p className="mt-2 text-sm text-muted">
                We take immense pride in delivering gentle, patient-centered care. Verified patient reviews will be published here with consent.
              </p>
            </div>
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
