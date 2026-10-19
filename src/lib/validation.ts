/**
 * Shared validation for the appointment enquiry form.
 * This same logic must be applied on the server when a server handler is added.
 * No medical, diagnosis, or identity data is collected here.
 */

export interface EnquiryInput {
  name: string;
  phone: string;
  email?: string;
  preferredDate: string;
  preferredTime: string;
  treatment: string;
  message?: string;
  consent: boolean;
  /** Honeypot — must be empty. Never shown to users. */
  honeypot?: string;
}

export interface ValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  preferredDate?: string;
  preferredTime?: string;
  treatment?: string;
  message?: string;
  consent?: string;
}

const PHONE_RE = /^[+\d][\d\s\-().]{6,19}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates enquiry form data. Returns an object of field-level error messages.
 * An empty object means the input is valid.
 */
export function validateEnquiry(input: EnquiryInput): ValidationErrors {
  const errors: ValidationErrors = {};

  const name = input.name.trim();
  if (!name) {
    errors.name = "Please enter your name.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > 100) {
    errors.name = "Name must be 100 characters or fewer.";
  }

  const phone = input.phone.trim();
  if (!phone) {
    errors.phone = "Please enter your phone number.";
  } else if (!PHONE_RE.test(phone)) {
    errors.phone = "Please enter a valid phone number (digits, spaces, dashes and + allowed).";
  }

  if (input.email) {
    const email = input.email.trim();
    if (email && !EMAIL_RE.test(email)) {
      errors.email = "Please enter a valid email address.";
    } else if (email.length > 254) {
      errors.email = "Email address is too long.";
    }
  }

  if (!input.preferredDate) {
    errors.preferredDate = "Please choose a preferred date.";
  } else {
    const parts = input.preferredDate.split("-").map(Number);
    const chosen =
      parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])
        ? new Date(parts[0], parts[1] - 1, parts[2])
        : new Date(NaN);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(chosen.getTime())) {
      errors.preferredDate = "Please enter a valid date.";
    } else if (chosen < today) {
      errors.preferredDate = "Please choose a date in the future.";
    }
  }

  if (!input.preferredTime) {
    errors.preferredTime = "Please choose a preferred time.";
  }

  const treatment = input.treatment.trim();
  if (!treatment) {
    errors.treatment = "Please select a treatment of interest.";
  }

  if (input.message && input.message.trim().length > 500) {
    errors.message = "Message must be 500 characters or fewer.";
  }

  if (!input.consent) {
    errors.consent = "Please confirm that you agree to us using your details to respond to your enquiry.";
  }

  return errors;
}

/** Returns true when the honeypot field is non-empty (i.e. a bot filled it). */
export function isSpam(input: EnquiryInput): boolean {
  return Boolean(input.honeypot && input.honeypot.trim().length > 0);
}

/** Returns true when validateEnquiry() produced no errors. */
export function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
