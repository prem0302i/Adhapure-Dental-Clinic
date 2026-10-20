import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { SmileCurve } from "@/components/ui/SmileCurve";
import { clinicConfig } from "@/lib/clinic-config";
import { useClinicSettings } from "@/lib/content";

export function Hero() {
  const { settings } = useClinicSettings();
  const clinicName =
    settings.name && !settings.name.startsWith("[")
      ? settings.name
      : clinicConfig.name;

  return (
    <section className="relative overflow-hidden bg-enamel">
      <div className="container-wide section-gap">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="animate-fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-[3.75rem] text-balance">
              Gentle, trusted dental care for you and your family
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              {clinicName} is here to help you feel confident about your smile. Book an
              enquiry and our team will get back to you to confirm a time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/appointment" size="lg">
                Request an appointment
              </Button>
              <WhatsAppButton label="Chat on WhatsApp" />
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="flex aspect-square w-full max-w-md items-end justify-center rounded-2xl border border-line bg-white p-10">
              <SmileCurve className="w-full text-teal-deep" />
            </div>
          </div>
        </div>

        <div className="mt-10 md:hidden">
          <SmileCurve className="w-full text-teal-deep" />
        </div>
      </div>
    </section>
  );
}
