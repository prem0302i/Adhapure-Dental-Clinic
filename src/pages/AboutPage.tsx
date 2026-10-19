import { Heart, Users, Sparkles, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Placeholder, PlaceholderNotice } from "@/components/ui/Placeholder";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { PageMeta } from "@/components/ui/PageMeta";
import { pageMeta } from "@/lib/clinic-config";
import { useAboutContent } from "@/lib/content";

const defaultIcons = [Heart, Users, Sparkles, ShieldCheck];

export default function AboutPage() {
  const meta = pageMeta["/about"];
  const { content } = useAboutContent();
  return (
    <>
      <PageMeta title={meta.title} description={meta.description} />

      {/* Hero */}
      <section className="bg-enamel section-gap">
        <div className="container-wide">
          <PlaceholderNotice message="This page is in development. Details below are placeholder content pending verification from the clinic." />
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <SectionHeading as="h1" title="About the clinic">
                A dental practice built around you — your comfort, your questions, and your care.
              </SectionHeading>
              <p className="mt-5 text-muted">
                [CLINIC NAME] was founded with a simple belief: that going to the dentist should be
                straightforward and comfortable. Our team is here to support your oral health at
                every stage of life.
              </p>
              <p className="mt-3 text-sm text-muted italic">
                Full clinic history and details will be added once supplied by the clinic.
              </p>
            </div>
            <div>
              <Placeholder label="[CLINIC PHOTO]">
                A photo of the clinic exterior or reception will appear here once supplied.
              </Placeholder>
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
                <div key={pillar.title || i} className="flex flex-col gap-3">
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
        <div className="container-wide grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Placeholder label="[CLINIC INTERIOR PHOTO]">
              A photo of the treatment room or waiting area will appear here once supplied.
            </Placeholder>
          </div>
          <div>
            <SectionHeading title="Our facilities">
              We have invested in a comfortable, modern environment so your visit is as stress-free
              as possible.
            </SectionHeading>
            <ul className="mt-6 divide-y divide-line border-y border-line text-sm text-muted">
              {content.facilities.map((item, i) => (
                <li key={i} className="flex items-start gap-3 py-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-deep" aria-hidden="true" />
                  <span>
                    {item}{" "}
                    {item.includes("confirmed") && (
                      <span className="rounded border border-dashed border-line bg-white px-1.5 py-0.5 text-xs text-muted">
                        placeholder
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted italic">
              No claims about specific equipment, certifications or awards are made until verified.
            </p>
          </div>
        </div>
      </section>

      {/* Qualifications / accreditation */}
      <section className="section-gap">
        <div className="container-wide">
          <SectionHeading title="Qualifications and registration">
            Our dentists are registered with the relevant regulatory bodies. Full qualification
            details will be published once verified.
          </SectionHeading>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Placeholder label="[REGULATORY BODY / REGISTRATION NUMBER]">
              Registration details will be confirmed and displayed here.
            </Placeholder>
            <Placeholder label="[PROFESSIONAL MEMBERSHIPS]">
              Professional body memberships will be listed here once verified.
            </Placeholder>
          </div>
          <p className="mt-6 max-w-2xl text-sm text-muted italic">
            No awards, rankings or outcome claims are made without verified evidence.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy section-gap">
        <div className="container-wide flex flex-col items-center gap-6 text-center">
          <h2 className="font-serif text-3xl text-white md:text-4xl">Ready to book a visit?</h2>
          <p className="max-w-xl text-white/75">
            Send us an enquiry and a member of our team will contact you to confirm availability.
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
