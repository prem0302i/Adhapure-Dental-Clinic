import type {
  Doctor,
  GalleryCase,
  HoursEntry,
  NavItem,
  Service,
  Testimonial,
} from "@/types";

/**
 * Single source of truth for all clinic details.
 * Every value below is a PLACEHOLDER until the client supplies verified info.
 * Rules: never fabricate names, addresses, phone numbers, credentials,
 * reviews, hours or patient results. Keep placeholders clearly marked.
 */

export const clinicConfig = {
  name: "[CLINIC NAME]",
  shortName: "[CLINIC NAME]",
  tagline: "Patient-focused dental care",
  address: {
    line1: "[CLINIC ADDRESS LINE 1]",
    line2: "[CITY, POSTAL CODE]",
    mapsLink: "", // Google Maps URL supplied by client
    directionsLink: "", // Google Maps directions URL supplied by client
  },
  contact: {
    phoneDisplay: "[PHONE NUMBER]",
    phoneHref: "", // tel: link, populated when number supplied
    // digits only, international format, no + ; read from VITE_WHATSAPP_NUMBER
    whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? "",
    email: "", // populated when email supplied
  },
  hours: [] as HoursEntry[],
  social: {
    instagram: "",
    facebook: "",
  },
  /** Link to the privacy policy page or document (placeholder until supplied). */
  privacyPolicyUrl: "/privacy", // will be a real URL or page when supplied
} as const;

/**
 * Build a WhatsApp click-to-chat URL.
 * Uses VITE_WHATSAPP_NUMBER when set; otherwise falls back to a
 * numberless wa.me link so the button still works during development.
 */
export function buildWhatsAppUrl(
  message: string =
    "Hello, I would like to enquire about an appointment at your dental clinic.",
  customNumber?: string,
): string {
  const number = customNumber?.trim() || clinicConfig.contact.whatsappNumber;
  const encoded = encodeURIComponent(message);
  return number ? `https://wa.me/${number}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

export const navItems: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Treatments", path: "/services" },
  { label: "Our doctors", path: "/doctors" },
  { label: "Smile gallery", path: "/gallery" },
  { label: "Enquire", path: "/appointment" },
  { label: "Contact", path: "/contact" },
];

/**
 * Confirmed services only. Empty until the client approves the list.
 * Sample placeholder categories are shown so the layout can be designed;
 * they are clearly marked and must be replaced before launch.
 */
export const services: Service[] = [
  { slug: "general", name: "General dentistry", summary: "Routine check-ups and care to keep teeth and gums healthy.", icon: "Stethoscope" },
  { slug: "cleaning", name: "Cleaning and prevention", summary: "Professional cleaning and guidance for long-term oral health.", icon: "Sparkles" },
  { slug: "root-canal", name: "Root canal treatment", summary: "Care to repair and save a damaged tooth.", icon: "ShieldCheck" },
  { slug: "fillings", name: "Fillings", summary: "Durable restorations for teeth affected by decay.", icon: "Hammer" },
  { slug: "whitening", name: "Teeth whitening", summary: "Professional whitening to brighten your smile.", icon: "Sun" },
  { slug: "braces", name: "Braces and aligners", summary: "Options to straighten and align teeth over time.", icon: "AlignHorizontalJustifyCenter" },
  { slug: "implants", name: "Dental implants", summary: "Replacement tooth roots for missing teeth.", icon: "Anchor" },
  { slug: "crowns", name: "Crowns and bridges", summary: "Restorations to rebuild or replace damaged teeth.", icon: "Crown" },
  { slug: "pediatric", name: "Pediatric dentistry", summary: "Gentle dental care tailored for children.", icon: "Baby" },
  { slug: "cosmetic", name: "Cosmetic dentistry", summary: "Treatments focused on the appearance of your smile.", icon: "Smile" },
];

export const placeholderDoctors: Doctor[] = [
  {
    slug: "doctor-1",
    name: "[DOCTOR NAME]",
    qualifications: "[QUALIFICATIONS]",
    specialisation: "[SPECIALISATION]",
    experienceYears: undefined,
    bio: "A short biography will appear here once verified details are supplied by the clinic.",
    placeholder: true,
  },
  {
    slug: "doctor-2",
    name: "[DOCTOR NAME]",
    qualifications: "[QUALIFICATIONS]",
    specialisation: "[SPECIALISATION]",
    experienceYears: undefined,
    bio: "A short biography will appear here once verified details are supplied by the clinic.",
    placeholder: true,
  },
];

/** No gallery cases until authorised photos with consent are supplied. */
export const galleryCases: GalleryCase[] = [];

/** No testimonials until genuine, permitted quotes are supplied. */
export const testimonials: Testimonial[] = [];

/** Available time-of-day preferences for appointment enquiries. */
export const preferredTimeOptions = [
  { value: "", label: "Select a time range" },
  { value: "morning", label: "Morning (8 am – 12 pm)" },
  { value: "afternoon", label: "Afternoon (12 pm – 5 pm)" },
  { value: "evening", label: "Evening (5 pm – 7 pm)" },
  { value: "any", label: "Any time" },
];

/** Page-level SEO metadata keyed by route path. */
export const pageMeta: Record<string, { title: string; description: string }> = {
  "/": {
    title: "[CLINIC NAME] — Gentle, trusted dental care",
    description:
      "Patient-focused dental care for you and your family. Request an appointment or chat on WhatsApp.",
  },
  "/about": {
    title: "About the clinic — [CLINIC NAME]",
    description:
      "Our approach to patient care, our facilities, and what you can expect when you visit us.",
  },
  "/services": {
    title: "Treatments we offer — [CLINIC NAME]",
    description:
      "Browse our range of dental treatments including check-ups, cleaning, root canal, whitening, implants and more.",
  },
  "/doctors": {
    title: "Our doctors — [CLINIC NAME]",
    description:
      "Meet the dentists who care for our patients. Qualifications, specialisations, and bios.",
  },
  "/gallery": {
    title: "Smile gallery — [CLINIC NAME]",
    description:
      "Before and after smile results shown with patient consent. Real cases, clearly labelled.",
  },
  "/appointment": {
    title: "Request an appointment — [CLINIC NAME]",
    description:
      "Send us an enquiry and a member of our team will contact you to confirm availability. This is an enquiry, not a confirmed booking.",
  },
  "/contact": {
    title: "Contact and location — [CLINIC NAME]",
    description:
      "Phone, address, opening hours, and directions to our clinic. Chat on WhatsApp for a quick reply.",
  },
  "/privacy": {
    title: "Privacy policy — [CLINIC NAME]",
    description:
      "How we collect, use and protect your personal information when you contact our dental clinic.",
  },
};
