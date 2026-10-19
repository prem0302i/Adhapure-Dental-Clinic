import { useState, useId, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { PageMeta } from "@/components/ui/PageMeta";
import { services, preferredTimeOptions, clinicConfig, pageMeta } from "@/lib/clinic-config";
import {
  validateEnquiry,
  isValid,
  isSpam,
  type EnquiryInput,
  type ValidationErrors,
} from "@/lib/validation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Rate limiting — very basic client-side guard (in-memory, resets on refresh)
// A real server-side limiter must be implemented when a server handler is added.
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 3;
const submissions: number[] = [];

function isRateLimited(): boolean {
  const now = Date.now();
  // Remove timestamps older than the window
  while (submissions.length > 0 && now - submissions[0] > RATE_LIMIT_WINDOW_MS) {
    submissions.shift();
  }
  return submissions.length >= RATE_LIMIT_MAX;
}

function recordSubmission() {
  submissions.push(Date.now());
}

// ---------------------------------------------------------------------------
// Form field component for consistent styling and accessibility
// ---------------------------------------------------------------------------

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ id, label, error, required, children }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-navy">
        {label}
        {required && (
          <span className="ml-1 text-teal-deep" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {/* Clone children with aria-describedby and aria-invalid when there is an error */}
      {children}
      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-sm text-red-600">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-line bg-white px-4 py-2.5 text-navy placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal-deep focus:border-teal-deep transition-colors";

const inputErrorClass =
  "border-red-400 focus:ring-red-400 focus:border-red-400";

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

type FormState = "idle" | "submitting" | "success" | "error";

const EMPTY: EnquiryInput = {
  name: "",
  phone: "",
  email: "",
  preferredDate: "",
  preferredTime: "",
  treatment: "",
  message: "",
  consent: false,
  honeypot: "",
};

export default function AppointmentPage() {
  const meta = pageMeta["/appointment"];
  const [searchParams] = useSearchParams();
  const preselectedTreatment = searchParams.get("treatment") ?? "";

  const [values, setValues] = useState<EnquiryInput>({
    ...EMPTY,
    treatment: preselectedTreatment,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formState, setFormState] = useState<FormState>("idle");
  const [serverError, setServerError] = useState("");

  // Stable IDs for form fields
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const firstErrorRef = useRef<HTMLDivElement>(null);

  const set = useCallback(
    (field: keyof EnquiryInput, value: string | boolean) => {
      setValues((v) => ({ ...v, [field]: value }));
      // Clear the error for the field being changed
      if (errors[field as keyof ValidationErrors]) {
        setErrors((e) => {
          const next = { ...e };
          delete next[field as keyof ValidationErrors];
          return next;
        });
      }
    },
    [errors],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot check
    if (isSpam(values)) {
      // Silently do nothing — bots expect a fast response; delay may deter them
      return;
    }

    // Rate limit
    if (isRateLimited()) {
      setServerError(
        "Too many submissions. Please wait a minute before trying again.",
      );
      setFormState("error");
      return;
    }

    // Client-side validation
    const errs = validateEnquiry(values);
    if (!isValid(errs)) {
      setErrors(errs);
      // Move focus to the first error summary
      setTimeout(() => firstErrorRef.current?.focus(), 50);
      return;
    }

    setFormState("submitting");
    setServerError("");
    recordSubmission();

    try {
      if (!isSupabaseConfigured || !supabase) {
        setFormState("error");
        setServerError(
          "We are currently unable to process online requests. Please contact us directly by phone or WhatsApp.",
        );
        return;
      }

      const { error: insertError } = await supabase.from("enquiries").insert({
        patient_name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email?.trim() || null,
        preferred_date: values.preferredDate,
        preferred_time_range: values.preferredTime,
        treatment_name: values.treatment,
        message: values.message?.trim() || null,
        consent_given: values.consent,
        status: "new",
        source: "website",
      });

      if (insertError) {
        setFormState("error");
        setServerError(
          "We could not save your request at this moment. Please call or WhatsApp us directly.",
        );
        return;
      }

      setFormState("success");
    } catch {
      setFormState("error");
      setServerError(
        "A network error occurred while submitting your enquiry. Please reach out by phone or WhatsApp.",
      );
    }
  }

  function handleReset() {
    setValues({ ...EMPTY, treatment: preselectedTreatment });
    setErrors({});
    setFormState("idle");
    setServerError("");
  }

  // -- Success screen --
  if (formState === "success") {
    return (
      <>
        <PageMeta title={meta.title} description={meta.description} />
        <section className="section-gap">
          <div className="container-wide max-w-xl text-center mx-auto">
            <CheckCircle className="mx-auto h-16 w-16 text-teal-deep" aria-hidden="true" />
            <h1 className="mt-6 font-serif text-3xl text-navy">Enquiry received</h1>
            <p className="mt-4 text-muted">
              Thank you — a member of our team will contact you to discuss availability and confirm
              an appointment time.{" "}
              <strong>This is an enquiry only, not a confirmed appointment.</strong>
            </p>
            <p className="mt-3 text-sm text-muted">
              If you need to reach us sooner, please call or chat on WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button to="/" variant="secondary">
                Back to home
              </Button>
              <WhatsAppButton label="Chat on WhatsApp" />
            </div>
          </div>
        </section>
      </>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <>
      <PageMeta title={meta.title} description={meta.description} />

      {/* Page header */}
      <section className="bg-enamel section-gap">
        <div className="container-wide">
          <SectionHeading as="h1" title="Request an appointment">
            Fill in the form below and a member of our team will contact you to confirm
            availability. This is an enquiry — not a confirmed booking.
          </SectionHeading>
          <p className="mt-4 max-w-2xl text-sm text-muted">
            We aim to respond within one business day. For urgent matters, please call us directly
            or use WhatsApp.
          </p>
          <div className="mt-5">
            <WhatsAppButton label="Or chat on WhatsApp" />
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section-gap">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl">

            {/* Error summary */}
            {hasErrors && (
              <div
                ref={firstErrorRef}
                tabIndex={-1}
                role="alert"
                aria-live="assertive"
                className="mb-8 rounded-lg border border-red-300 bg-red-50 p-4"
              >
                <p className="font-medium text-red-700">
                  Please fix the following before submitting:
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
                  {Object.values(errors).map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Server error / not-connected notice */}
            {formState === "error" && serverError && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4"
              >
                <p className="flex items-start gap-2 font-medium text-amber-800">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  {serverError}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <WhatsAppButton label="Chat on WhatsApp" />
                  {clinicConfig.contact.phoneHref && (
                    <a
                      href={clinicConfig.contact.phoneHref}
                      className="inline-flex items-center gap-2 rounded-pill bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-soft min-h-tap"
                    >
                      Call {clinicConfig.contact.phoneDisplay}
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-3 text-sm text-amber-700 underline hover:text-amber-900"
                >
                  Try again
                </button>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              aria-label="Appointment enquiry form"
              className="flex flex-col gap-6"
            >
              {/* Honeypot — hidden from real users, filled only by bots */}
              <div aria-hidden="true" className="hidden">
                <label htmlFor={id("honeypot")}>
                  Do not fill this in
                </label>
                <input
                  id={id("honeypot")}
                  name="honeypot"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.honeypot}
                  onChange={(e) => set("honeypot", e.target.value)}
                />
              </div>

              {/* Name */}
              <Field id={id("name")} label="Your name" required error={errors.name}>
                <input
                  id={id("name")}
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  aria-required="true"
                  aria-describedby={errors.name ? `${id("name")}-error` : undefined}
                  aria-invalid={Boolean(errors.name)}
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className={`${inputClass} ${errors.name ? inputErrorClass : ""}`}
                />
              </Field>

              {/* Phone */}
              <Field id={id("phone")} label="Phone number" required error={errors.phone}>
                <input
                  id={id("phone")}
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  required
                  aria-required="true"
                  aria-describedby={errors.phone ? `${id("phone")}-error` : undefined}
                  aria-invalid={Boolean(errors.phone)}
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className={`${inputClass} ${errors.phone ? inputErrorClass : ""}`}
                />
              </Field>

              {/* Email — optional */}
              <Field id={id("email")} label="Email address (optional)" error={errors.email}>
                <input
                  id={id("email")}
                  type="email"
                  name="email"
                  autoComplete="email"
                  aria-describedby={errors.email ? `${id("email")}-error` : undefined}
                  aria-invalid={Boolean(errors.email)}
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="e.g. priya@example.com"
                  className={`${inputClass} ${errors.email ? inputErrorClass : ""}`}
                />
              </Field>

              {/* Preferred date */}
              <Field
                id={id("preferredDate")}
                label="Preferred date"
                required
                error={errors.preferredDate}
              >
                <input
                  id={id("preferredDate")}
                  type="date"
                  name="preferredDate"
                  required
                  aria-required="true"
                  min={today}
                  aria-describedby={
                    errors.preferredDate ? `${id("preferredDate")}-error` : undefined
                  }
                  aria-invalid={Boolean(errors.preferredDate)}
                  value={values.preferredDate}
                  onChange={(e) => set("preferredDate", e.target.value)}
                  className={`${inputClass} ${errors.preferredDate ? inputErrorClass : ""}`}
                />
              </Field>

              {/* Preferred time */}
              <Field
                id={id("preferredTime")}
                label="Preferred time of day"
                required
                error={errors.preferredTime}
              >
                <select
                  id={id("preferredTime")}
                  name="preferredTime"
                  required
                  aria-required="true"
                  aria-describedby={
                    errors.preferredTime ? `${id("preferredTime")}-error` : undefined
                  }
                  aria-invalid={Boolean(errors.preferredTime)}
                  value={values.preferredTime}
                  onChange={(e) => set("preferredTime", e.target.value)}
                  className={`${inputClass} ${errors.preferredTime ? inputErrorClass : ""}`}
                >
                  {preferredTimeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Treatment */}
              <Field
                id={id("treatment")}
                label="Treatment of interest"
                required
                error={errors.treatment}
              >
                <select
                  id={id("treatment")}
                  name="treatment"
                  required
                  aria-required="true"
                  aria-describedby={
                    errors.treatment ? `${id("treatment")}-error` : undefined
                  }
                  aria-invalid={Boolean(errors.treatment)}
                  value={values.treatment}
                  onChange={(e) => set("treatment", e.target.value)}
                  className={`${inputClass} ${errors.treatment ? inputErrorClass : ""}`}
                >
                  <option value="" disabled>
                    Select a treatment
                  </option>
                  {services.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                  <option value="other">Something else / not sure</option>
                </select>
              </Field>

              {/* Message — optional */}
              <Field
                id={id("message")}
                label="Additional message (optional)"
                error={errors.message}
              >
                <textarea
                  id={id("message")}
                  name="message"
                  rows={4}
                  maxLength={500}
                  aria-describedby={errors.message ? `${id("message")}-error` : undefined}
                  aria-invalid={Boolean(errors.message)}
                  value={values.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Any additional context you'd like us to know (max 500 characters)"
                  className={`${inputClass} resize-y ${errors.message ? inputErrorClass : ""}`}
                />
                <p className="text-right text-xs text-muted">
                  {(values.message ?? "").length}/500
                </p>
              </Field>

              {/* Consent */}
              <div className="rounded-lg border border-line bg-enamel p-4">
                <div className="flex items-start gap-3">
                  <input
                    id={id("consent")}
                    type="checkbox"
                    name="consent"
                    required
                    aria-required="true"
                    aria-describedby={`${id("consent")}-desc ${errors.consent ? `${id("consent")}-error` : ""}`.trim()}
                    aria-invalid={Boolean(errors.consent)}
                    checked={values.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-teal-deep focus:ring-teal-deep"
                  />
                  <div>
                    <label htmlFor={id("consent")} className="text-sm font-medium text-navy">
                      I agree to the clinic using my contact details to respond to this enquiry.{" "}
                      <span className="ml-1 text-teal-deep" aria-hidden="true">*</span>
                    </label>
                    <p id={`${id("consent")}-desc`} className="mt-1 text-xs text-muted">
                      We collect your name, phone and email only to follow up on your enquiry. We
                      do not share your details with third parties for marketing. See our{" "}
                      <Link
                        to={clinicConfig.privacyPolicyUrl}
                        className="underline hover:text-teal-deep"
                      >
                        privacy policy
                      </Link>{" "}
                      (placeholder — to be reviewed by the clinic before launch).
                    </p>
                    {errors.consent && (
                      <p
                        id={`${id("consent")}-error`}
                        role="alert"
                        className="mt-1 flex items-start gap-1.5 text-sm text-red-600"
                      >
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        {errors.consent}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Required field note */}
              <p className="text-xs text-muted">
                Fields marked with <span className="text-teal-deep font-medium" aria-hidden="true">*</span> are required.
              </p>

              {/* Enquiry notice */}
              <div className="rounded-lg border border-line bg-enamel px-4 py-3 text-sm text-muted">
                <strong className="text-navy">Please note:</strong> Submitting this form sends an
                enquiry only. It is not a confirmed appointment. A member of our team will contact
                you to confirm availability and agree a time.
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={formState === "submitting"}
                className="self-start"
              >
                {formState === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  "Send enquiry"
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
