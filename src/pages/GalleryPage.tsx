import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageMeta } from "@/components/ui/PageMeta";
import { galleryCases, pageMeta } from "@/lib/clinic-config";
import type { GalleryCase } from "@/types";

/** Only display cases where the patient has given confirmed consent. */
const approvedCases = galleryCases.filter((c) => c.consentConfirmed);

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

interface LightboxProps {
  cases: GalleryCase[];
  startIndex: number;
  onClose: () => void;
}

function Lightbox({ cases, startIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const current = cases[index];
  const hasPrev = index > 0;
  const hasNext = index < cases.length - 1;

  const prev = useCallback(() => {
    if (hasPrev) setIndex((i) => i - 1);
  }, [hasPrev]);

  const next = useCallback(() => {
    if (hasNext) setIndex((i) => i + 1);
  }, [hasNext]);

  // Keyboard handling and focus trap
  useEffect(() => {
    closeButtonRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      // Focus trap: keep Tab within the dialog
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    // Prevent body scroll while lightbox is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4"
      aria-modal="true"
      role="dialog"
      aria-label={`Smile gallery case: ${current.caption}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-4xl"
      >
        {/* Close */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Before / After panels */}
        <div className="grid gap-2 sm:grid-cols-2">
          <figure className="overflow-hidden rounded-xl">
            <div className="relative aspect-[4/3] bg-navy-soft">
              {current.beforeSrc ? (
                <img
                  src={current.beforeSrc}
                  alt={`Before — ${current.caption}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/30">
                  <ImageOff className="h-12 w-12" aria-hidden="true" />
                </div>
              )}
              <span className="absolute bottom-3 left-3 rounded-pill bg-navy/80 px-3 py-1 text-sm font-medium text-white">
                Before
              </span>
            </div>
          </figure>

          <figure className="overflow-hidden rounded-xl">
            <div className="relative aspect-[4/3] bg-navy-soft">
              {current.afterSrc ? (
                <img
                  src={current.afterSrc}
                  alt={`After — ${current.caption}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/30">
                  <ImageOff className="h-12 w-12" aria-hidden="true" />
                </div>
              )}
              <span className="absolute bottom-3 left-3 rounded-pill bg-teal-deep/90 px-3 py-1 text-sm font-medium text-white">
                After
              </span>
            </div>
          </figure>
        </div>

        {/* Caption */}
        <p className="mt-4 text-center text-sm text-white/80">{current.caption}</p>
        <p className="mt-1 text-center text-xs text-white/50">
          Shown with patient consent.{" "}
          {cases.length > 1 && `Case ${index + 1} of ${cases.length}.`}
        </p>

        {/* Navigation arrows */}
        {cases.length > 1 && (
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={prev}
              disabled={!hasPrev}
              aria-label="Previous case"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!hasNext}
              aria-label="Next case"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery grid card
// ---------------------------------------------------------------------------

interface GalleryCardProps {
  item: GalleryCase;
  index: number;
  onOpen: (index: number) => void;
}

function GalleryCard({ item, index, onOpen }: GalleryCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={`View case: ${item.caption}`}
      className="group w-full overflow-hidden rounded-xl border border-line bg-white text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-deep"
    >
      <div className="grid grid-cols-2">
        {/* Before thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden bg-enamel">
          {item.beforeSrc ? (
            <img
              src={item.beforeSrc}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-line">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
            </div>
          )}
          <span className="absolute bottom-2 left-2 rounded-pill bg-navy/70 px-2 py-0.5 text-xs font-medium text-white">
            Before
          </span>
        </div>
        {/* After thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden bg-enamel">
          {item.afterSrc ? (
            <img
              src={item.afterSrc}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-line">
              <ImageOff className="h-8 w-8" aria-hidden="true" />
            </div>
          )}
          <span className="absolute bottom-2 left-2 rounded-pill bg-teal-deep/80 px-2 py-0.5 text-xs font-medium text-white">
            After
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm font-medium text-navy">{item.caption}</p>
        <p className="mt-0.5 text-xs text-muted">Shown with patient consent</p>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function GalleryPage() {
  const meta = pageMeta["/gallery"];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <PageMeta title={meta.title} description={meta.description} />

      {/* Page header */}
      <section className="bg-enamel section-gap">
        <div className="container-wide">
          <SectionHeading as="h1" title="Smile gallery">
            Before and after results shown with confirmed patient consent. We only publish cases
            where the patient has explicitly agreed.
          </SectionHeading>
          <p className="mt-4 max-w-2xl text-sm text-muted">
            Individual results vary. These cases are shared for illustrative purposes only and do
            not guarantee a specific outcome for any other patient.
          </p>
        </div>
      </section>

      {/* Gallery grid or empty state */}
      <section className="section-gap">
        <div className="container-wide">
          {approvedCases.length === 0 ? (
            /* Honest empty state — no fake cases */
            <div
              role="status"
              className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-line bg-enamel py-20 text-center"
            >
              <ImageOff className="h-12 w-12 text-line" aria-hidden="true" />
              <div>
                <p className="font-serif text-xl text-navy">Photos coming soon</p>
                <p className="mt-2 max-w-sm text-sm text-muted">
                  We will publish before and after results here once we have authorised photos with
                  confirmed patient consent. No stock photos or AI images are used.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {approvedCases.map((item, i) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  index={i}
                  onOpen={setLightboxIndex}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          cases={approvedCases}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
