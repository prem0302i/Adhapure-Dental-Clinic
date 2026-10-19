export interface Service {
  slug: string;
  name: string;
  summary: string;
  icon: string;
}

export interface Doctor {
  slug: string;
  name: string;
  qualifications: string;
  specialisation: string;
  experienceYears?: number;
  bio: string;
  photo?: string;
  placeholder: boolean;
}

export interface GalleryCase {
  id: string;
  beforeSrc?: string;
  afterSrc?: string;
  caption: string;
  consentConfirmed: boolean;
}

export interface Testimonial {
  quote: string;
  name: string;
  consentConfirmed: boolean;
}

export interface NavItem {
  label: string;
  path: string;
}

export interface HoursEntry {
  day: string;
  hours: string;
}

export interface EnquiryInput {
  name: string;
  phone: string;
  email?: string;
  preferredDate: string;
  preferredTime: string;
  treatment: string;
  message?: string;
  consent: boolean;
}
