import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaceholderNotice } from "@/components/ui/Placeholder";
import { PageMeta } from "@/components/ui/PageMeta";
import { clinicConfig, pageMeta } from "@/lib/clinic-config";

export default function PrivacyPage() {
  const meta = pageMeta["/privacy"];
  return (
    <>
      <PageMeta
        title={meta.title}
        description={meta.description}
      />

      <section className="section-gap">
        <div className="container-wide max-w-3xl">
          <PlaceholderNotice message="This privacy policy is a placeholder. It must be reviewed and approved by the clinic and/or a qualified legal professional before the site goes live." />

          <div className="mt-10">
            <SectionHeading as="h1" title="Privacy policy" />
          </div>

          <div className="mt-8 prose prose-navy max-w-none text-muted space-y-5 text-sm leading-relaxed">
            <p>
              <strong className="text-navy">Last updated:</strong>{" "}
              <span className="italic">[DATE TO BE ADDED]</span>
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">What we collect</h2>
            <p>
              When you submit an appointment enquiry, we collect your name, phone number, and
              optionally your email address. We do not collect medical history, diagnoses, identity
              documents, or payment information.
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">How we use it</h2>
            <p>
              We use your contact details solely to respond to your enquiry and to confirm an
              appointment time. We do not use your details for marketing without your explicit
              consent.
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">Who we share it with</h2>
            <p>
              We do not sell or share your personal data with third parties for marketing purposes.
              Details shared with third-party service providers (such as email delivery services)
              will be listed here once confirmed.{" "}
              <span className="italic text-muted">[TO BE COMPLETED]</span>
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">How long we keep it</h2>
            <p>
              <span className="italic">[Retention period to be confirmed by the clinic]</span>
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">Your rights</h2>
            <p>
              You have the right to access, correct or request deletion of your personal
              information. To make a request, contact us at{" "}
              <span className="italic">
                {clinicConfig.contact.email || "[EMAIL TO BE CONFIRMED]"}
              </span>
              .
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">Cookies</h2>
            <p>
              <span className="italic">[Cookie usage to be confirmed and documented]</span>
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">Contact</h2>
            <p>
              For privacy-related queries, contact us at{" "}
              <span className="italic">
                {clinicConfig.contact.email || "[EMAIL TO BE CONFIRMED]"}
              </span>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
