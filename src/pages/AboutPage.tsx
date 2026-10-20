import { Heart, Users, Sparkles, ShieldCheck, CheckCircle2, Award } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { PageMeta } from "@/components/ui/PageMeta";
import { pageMeta } from "@/lib/clinic-config";
import { useAboutContent, useClinicSettings } from "@/lib/content";

const defaultIcons = [Heart, Users, Sparkles, ShieldCheck];

export default function AboutPage() {
  const meta = pageMeta["/about"];
  const { content } = useAboutContent();
  const { settings } = useClinicSettings();

  return (
    <>
      <PageMeta title={meta.title} description={meta.description} />

      {/* Hero */}
      <section className="bg-enamel section-gap">
        <div className="container-wide">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <SectionHeading as="h1" title="About the clinic">
                A dental practice built around you — your comfort, your questions, and your care.
              </SectionHeading>
              <p className="mt-5 text-muted leading-relaxed">
                {content.intro || `${settings.name} is dedicated to providing gentle, high-quality oral healthcare in a welcoming and comfortable setting.`}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button to="/appointment" size="md">
                  Request an appointment
                </Button>
                <WhatsAppButton label="Chat on WhatsApp" />
              </div>
            </div>

            <div>
              <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
                <h3 className="font-serif text-xl font-semibold text-navy">Our core clinical commitment</h3>
                <p className="mt-3 text-sm text-muted leading-relaxed">
                  Every patient deserves personalised attention, clear answers, and painless care. We use modern sterilization techniques and digital diagnostics to ensure safe and predictable outcomes.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-navy">
                    <CheckCircle2 className="h-5 w-5 text-teal-deep shrink-0" />
                    <span>Transparent diagnosis and treatment planning</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-navy">
                    <CheckCircle2 className="h-5 w-5 text-teal-deep shrink-0" />
                    <span>Hospital-standard hygiene & autoclaved equipment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-navy">
                    <CheckCircle2 className="h-5 w-5 text-teal-deep shrink-0" />
                    <span>Gentle, anxiety-free approach for all ages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy of care */}
      <section className="section-gap">
        <div className="container-wide">
          <SectionHeading title="Our philosophy of care" align="center" />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {content.philosophy.map((pillar, i) => {
              const Icon = defaultIcons[i % defaultIcons.length];
              return (
                <div key={pillar.title || i} className="flex flex-col gap-3 rounded-xl border border-line bg-white p-6 shadow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-tint text-teal-deep">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h2 className="font-serif text-lg text-navy">{pillar.title}</h2>
                  <p className="text-sm text-muted leading-relaxed">{pillar.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="bg-enamel section-gap">
        <div className="container-wide">
          <SectionHeading title="Our facilities" align="center">
            We have invested in a comfortable, modern environment so your visit is as stress-free as possible.
          </SectionHeading>

          <div className="mt-10 mx-auto max-w-3xl rounded-2xl border border-line bg-white p-8 shadow-sm">
            <ul className="divide-y divide-line text-sm text-muted">
              {content.facilities.map((item, i) => (
                <li key={i} className="flex items-start gap-3 py-4">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-deep" aria-hidden="true" />
                  <span className="font-medium text-navy text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Qualifications / accreditation */}
      {content.qualifications && content.qualifications.length > 0 && (
        <section className="section-gap">
          <div className="container-wide">
            <SectionHeading title="Qualifications and standards" align="center">
              Our clinicians are registered with relevant dental bodies and follow recognized standards.
            </SectionHeading>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
              {content.qualifications.map((q, i) => (
                <div key={i} className="rounded-xl border border-line bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-teal-deep shrink-0" />
                    <h3 className="font-serif text-lg font-semibold text-navy">{q.label}</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted leading-relaxed">{q.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-navy section-gap">
        <div className="container-wide flex flex-col items-center gap-6 text-center">
          <h2 className="font-serif text-3xl text-white md:text-4xl">Ready to book a visit?</h2>
          <p className="max-w-xl text-white/75">
            Send us an enquiry and our team will contact you to confirm availability.
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
