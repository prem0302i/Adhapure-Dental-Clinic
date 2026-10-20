import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageMeta } from "@/components/ui/PageMeta";
import { pageMeta } from "@/lib/clinic-config";
import { useClinicSettings } from "@/lib/content";

export default function PrivacyPage() {
  const meta = pageMeta["/privacy"];
  const { settings } = useClinicSettings();
  const contactEmail = settings.email || "info@clinic.com";

  return (
    <>
      <PageMeta
        title={meta.title}
        description={meta.description}
      />

      <section className="section-gap">
        <div className="container-wide max-w-3xl">
          <SectionHeading as="h1" title="Privacy policy" />

          <div className="mt-8 prose prose-navy max-w-none text-muted space-y-6 text-sm leading-relaxed">
            <p>
              <strong className="text-navy">Last updated:</strong>{" "}
              <span>{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">What we collect</h2>
            <p>
              When you submit an appointment enquiry through our website, we collect your name, phone number, preferred visit timing, and
              optionally your email address. We do not collect medical history, clinical records, or payment details through this online enquiry form.
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">How we use your information</h2>
            <p>
              We use the details you provide exclusively to respond to your enquiry, clarify availability, and schedule your dental appointment with {settings.name}. We will never sell, rent, or trade your contact information for marketing.
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">Data sharing and third parties</h2>
            <p>
              Personal data submitted via our website is accessed only by authorized clinic administration and healthcare personnel. It is not shared with any unaffiliated third parties except where required by law.
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">Data retention</h2>
            <p>
              Enquiry messages and contact records are retained in our secure appointment management system for as long as necessary to coordinate your patient care, after which they are securely archived or deleted in accordance with healthcare records regulations.
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">Your rights</h2>
            <p>
              You have the right to request access to the personal data we hold about you, or to request corrections or deletion. To submit a request, please reach out directly to our privacy officer at{" "}
              <a href={`mailto:${contactEmail}`} className="text-teal-deep font-medium underline">
                {contactEmail}
              </a>
              .
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">Cookies and analytics</h2>
            <p>
              Our website uses only essential session cookies to ensure standard site performance, secure navigation, and reliable form submission. We do not track you across unrelated third-party websites.
            </p>

            <h2 className="font-serif text-xl text-navy mt-8">Contact us</h2>
            <p>
              If you have any questions regarding this Privacy Policy or how your information is handled, please contact us at{" "}
              <a href={`mailto:${contactEmail}`} className="text-teal-deep font-medium underline">
                {contactEmail}
              </a>{" "}
              {settings.phoneDisplay && (
                <>
                  or call us at{" "}
                  <span className="text-navy font-medium">{settings.phoneDisplay}</span>
                </>
              )}
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
