import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Placeholder } from "@/components/ui/Placeholder";

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
          <Placeholder label="[CLINIC PHOTO]">
            A photo of the clinic will appear here once supplied.
          </Placeholder>
        </div>
      </div>
    </section>
  );
}
