import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export function FinalCTA() {
  return (
    <section className="bg-navy section-gap text-white">
      <div className="container-wide text-center">
        <h2 className="text-3xl md:text-4xl text-white text-balance">
          Ready to book your visit?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/75">
          Send an enquiry and our team will contact you to confirm availability. This is an enquiry,
          not a confirmed appointment.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/appointment" size="lg" variant="whatsapp">
            Request an appointment
          </Button>
          <WhatsAppButton label="Chat on WhatsApp" />
        </div>
      </div>
    </section>
  );
}
