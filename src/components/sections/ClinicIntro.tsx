import { ShieldCheck, Sparkles, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ClinicIntro() {
  return (
    <section className="bg-enamel section-gap">
      <div className="container-wide grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <SectionHeading title="A calm, modern setting for your care">
            We focus on clear explanations and unhurried appointments, so you always know what to
            expect and why.
          </SectionHeading>
          <ul className="mt-6 space-y-3 text-muted">
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-deep" aria-hidden="true" />
              Patient-focused, judgement-free care
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-deep" aria-hidden="true" />
              Clear treatment explanations
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-deep" aria-hidden="true" />
              Flexible enquiry and WhatsApp contact
            </li>
          </ul>
          <div className="mt-8">
            <Button to="/about" variant="secondary">
              Learn about the clinic
            </Button>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-line bg-white p-6 shadow-sm">
            <div className="rounded-xl bg-teal-tint/50 p-5">
              <ShieldCheck className="h-8 w-8 text-teal-deep" aria-hidden="true" />
              <h3 className="mt-3 font-serif text-base font-semibold text-navy">Strict hygiene</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Hospital-standard infection control and instrument sterilisation.
              </p>
            </div>
            <div className="rounded-xl bg-enamel p-5">
              <Sparkles className="h-8 w-8 text-teal-deep" aria-hidden="true" />
              <h3 className="mt-3 font-serif text-base font-semibold text-navy">Modern care</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Precision diagnostics with gentle, minimally invasive techniques.
              </p>
            </div>
            <div className="rounded-xl bg-enamel p-5">
              <Clock className="h-8 w-8 text-teal-deep" aria-hidden="true" />
              <h3 className="mt-3 font-serif text-base font-semibold text-navy">Unhurried visits</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Ample time allocated to answer every question and explain options.
              </p>
            </div>
            <div className="rounded-xl bg-teal-tint/50 p-5">
              <Heart className="h-8 w-8 text-teal-deep" aria-hidden="true" />
              <h3 className="mt-3 font-serif text-base font-semibold text-navy">Family friendly</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Comfortable environment tailored for nervous patients and children.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
