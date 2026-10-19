import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Placeholder } from "@/components/ui/Placeholder";

export function GalleryPreview() {
  return (
    <section className="bg-enamel section-gap">
      <div className="container-wide">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading title="Smile gallery">
            Before and after results will be shown here, with patient consent.
          </SectionHeading>
          <Button to="/gallery" variant="ghost">
            View smile gallery
          </Button>
        </div>

        <div className="mt-8">
          <Placeholder label="[BEFORE & AFTER PHOTOS COMING SOON]">
            Authorised before-and-after photos with patient consent will appear here. We do not use
            stock or AI images as patient results.
          </Placeholder>
        </div>
      </div>
    </section>
  );
}
