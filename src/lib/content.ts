import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  clinicConfig as defaultClinicConfig,
  services as defaultServices,
  placeholderDoctors as defaultDoctors,
  galleryCases as defaultGalleryCases,
} from "@/lib/clinic-config";
import type { Doctor, Service, GalleryCase, HoursEntry } from "@/types";

export interface AboutContentData {
  intro: string;
  philosophy: Array<{ title: string; body: string; icon?: string }>;
  facilities: string[];
  qualifications: Array<{ label: string; description: string }>;
}

export interface ClinicSettingsData {
  name: string;
  shortName: string;
  tagline: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsappNumber: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  mapsLink: string;
  directionsLink: string;
  instagram: string;
  facebook: string;
}

const DEFAULT_ABOUT_CONTENT: AboutContentData = {
  intro:
    "[CLINIC NAME] was founded with a simple belief: that going to the dentist should be straightforward and comfortable. Our team is here to support your oral health at every stage of life.",
  philosophy: [
    {
      title: "Patient first",
      body: "We take time to listen and explain every step of your care in plain language. No rushed appointments, no surprise recommendations.",
    },
    {
      title: "Family-friendly",
      body: "We welcome patients of all ages and aim to create a calm, welcoming environment — especially for those who feel anxious about dental visits.",
    },
    {
      title: "Preventive focus",
      body: "We believe good oral health starts with education and regular maintenance. We guide every patient on at-home care between visits.",
    },
    {
      title: "Safe and hygienic",
      body: "All instruments are sterilised to strict protocols. We follow current infection-control guidelines at every appointment.",
    },
  ],
  facilities: [
    "Modern treatment rooms — details to be confirmed",
    "Digital X-rays — details to be confirmed",
    "Accessible waiting area — details to be confirmed",
    "Private consultation space — details to be confirmed",
  ],
  qualifications: [
    {
      label: "[REGULATORY BODY / REGISTRATION NUMBER]",
      description: "Registration details will be confirmed and displayed here.",
    },
    {
      label: "[PROFESSIONAL MEMBERSHIPS]",
      description: "Professional body memberships will be listed here once verified.",
    },
  ],
};

const DEFAULT_HOURS: HoursEntry[] = [
  { day: "Monday – Friday", hours: "[TO BE CONFIRMED]" },
  { day: "Saturday", hours: "[TO BE CONFIRMED]" },
  { day: "Sunday", hours: "[TO BE CONFIRMED]" },
];

export const CONTENT_UPDATED_EVENT = "clinic:content-updated";

export function notifyContentUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONTENT_UPDATED_EVENT));
  }
}

// ---------------------------------------------------------------------------
// Direct Fetchers with safe fallback to clinic-config.ts
// ---------------------------------------------------------------------------

export async function getDoctors(): Promise<Doctor[]> {
  if (!isSupabaseConfigured || !supabase) return defaultDoctors;
  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return defaultDoctors;
    }

    return data.map((d) => ({
      slug: d.id,
      name: d.name,
      qualifications: d.qualifications || "",
      specialisation: d.specialisation || "",
      experienceYears: d.experience ? parseInt(d.experience, 10) || undefined : undefined,
      bio: d.bio || "",
      photo: d.photo_url || undefined,
      placeholder: d.name.includes("["),
    }));
  } catch {
    return defaultDoctors;
  }
}

export async function getTreatments(): Promise<Service[]> {
  if (!isSupabaseConfigured || !supabase) return defaultServices;
  try {
    const { data, error } = await supabase
      .from("treatments")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return defaultServices;
    }

    return data.map((t) => ({
      slug: t.slug,
      name: t.name,
      summary: t.summary || "",
      icon: t.icon || "Circle",
    }));
  } catch {
    return defaultServices;
  }
}

export async function getGalleryCases(): Promise<GalleryCase[]> {
  if (!isSupabaseConfigured || !supabase) return defaultGalleryCases;
  try {
    // Database RLS guarantees only is_published = true AND consent_confirmed = true
    const { data, error } = await supabase
      .from("gallery_cases")
      .select("*")
      .eq("is_published", true)
      .eq("consent_confirmed", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return defaultGalleryCases;
    }

    return data.map((c) => ({
      id: c.id,
      beforeSrc: c.before_url || undefined,
      afterSrc: c.after_url || undefined,
      caption: c.caption || c.title || "",
      consentConfirmed: c.consent_confirmed,
    }));
  } catch {
    return defaultGalleryCases;
  }
}

export async function getOpeningHours(): Promise<HoursEntry[]> {
  if (!isSupabaseConfigured || !supabase) {
    return defaultClinicConfig.hours.length > 0
      ? defaultClinicConfig.hours
      : DEFAULT_HOURS;
  }
  try {
    const { data, error } = await supabase
      .from("opening_hours")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return defaultClinicConfig.hours.length > 0
        ? defaultClinicConfig.hours
        : DEFAULT_HOURS;
    }

    return data.map((h) => ({
      day: h.day,
      hours: h.is_closed
        ? "Closed"
        : h.open_time && h.close_time
        ? `${h.open_time} – ${h.close_time}`
        : h.note || "[TO BE CONFIRMED]",
    }));
  } catch {
    return defaultClinicConfig.hours.length > 0
      ? defaultClinicConfig.hours
      : DEFAULT_HOURS;
  }
}

export async function getClinicSettings(): Promise<ClinicSettingsData> {
  const fallback: ClinicSettingsData = {
    name: defaultClinicConfig.name,
    shortName: defaultClinicConfig.shortName,
    tagline: defaultClinicConfig.tagline,
    phoneDisplay: defaultClinicConfig.contact.phoneDisplay,
    phoneHref: defaultClinicConfig.contact.phoneHref,
    whatsappNumber: defaultClinicConfig.contact.whatsappNumber,
    email: defaultClinicConfig.contact.email,
    addressLine1: defaultClinicConfig.address.line1,
    addressLine2: defaultClinicConfig.address.line2,
    mapsLink: defaultClinicConfig.address.mapsLink,
    directionsLink: defaultClinicConfig.address.directionsLink,
    instagram: defaultClinicConfig.social.instagram,
    facebook: defaultClinicConfig.social.facebook,
  };

  if (!isSupabaseConfigured || !supabase) return fallback;
  try {
    const { data, error } = await supabase
      .from("clinic_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) return fallback;

    return {
      name: data.clinic_name || fallback.name,
      shortName: data.clinic_name || fallback.shortName,
      tagline: fallback.tagline,
      phoneDisplay: data.phone_display || fallback.phoneDisplay,
      phoneHref: data.phone_href || fallback.phoneHref,
      whatsappNumber: data.whatsapp_number || fallback.whatsappNumber,
      email: data.email || fallback.email,
      addressLine1: data.address_line1 || fallback.addressLine1,
      addressLine2: data.address_line2 || fallback.addressLine2,
      mapsLink: data.maps_link || fallback.mapsLink,
      directionsLink: data.directions_link || fallback.directionsLink,
      instagram: data.instagram_link || fallback.instagram,
      facebook: data.facebook_link || fallback.facebook,
    };
  } catch {
    return fallback;
  }
}

export async function getAboutContent(): Promise<AboutContentData> {
  if (!isSupabaseConfigured || !supabase) return DEFAULT_ABOUT_CONTENT;
  try {
    const { data, error } = await supabase
      .from("about_content")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) return DEFAULT_ABOUT_CONTENT;

    return {
      intro: data.intro || DEFAULT_ABOUT_CONTENT.intro,
      philosophy: Array.isArray(data.philosophy) && data.philosophy.length > 0
        ? data.philosophy
        : DEFAULT_ABOUT_CONTENT.philosophy,
      facilities: Array.isArray(data.facilities) && data.facilities.length > 0
        ? data.facilities
        : DEFAULT_ABOUT_CONTENT.facilities,
      qualifications: Array.isArray(data.qualifications) && data.qualifications.length > 0
        ? data.qualifications
        : DEFAULT_ABOUT_CONTENT.qualifications,
    };
  } catch {
    return DEFAULT_ABOUT_CONTENT;
  }
}

// ---------------------------------------------------------------------------
// React Hooks with Automatic Revalidation & Fallback
// ---------------------------------------------------------------------------

export function useDoctors(): { doctors: Doctor[]; loading: boolean } {
  const [doctors, setDoctors] = useState<Doctor[]>(defaultDoctors);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await getDoctors();
      if (mounted) {
        setDoctors(data);
        setLoading(false);
      }
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  return { doctors, loading };
}

export function useTreatments(): { treatments: Service[]; loading: boolean } {
  const [treatments, setTreatments] = useState<Service[]>(defaultServices);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await getTreatments();
      if (mounted) {
        setTreatments(data);
        setLoading(false);
      }
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  return { treatments, loading };
}

export function useGalleryCases(): { cases: GalleryCase[]; loading: boolean } {
  const [cases, setCases] = useState<GalleryCase[]>(defaultGalleryCases);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await getGalleryCases();
      if (mounted) {
        setCases(data);
        setLoading(false);
      }
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  return { cases, loading };
}

export function useOpeningHours(): { hours: HoursEntry[]; loading: boolean } {
  const [hours, setHours] = useState<HoursEntry[]>(
    defaultClinicConfig.hours.length > 0 ? defaultClinicConfig.hours : DEFAULT_HOURS,
  );
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await getOpeningHours();
      if (mounted) {
        setHours(data);
        setLoading(false);
      }
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  return { hours, loading };
}

export function useClinicSettings(): { settings: ClinicSettingsData; loading: boolean } {
  const [settings, setSettings] = useState<ClinicSettingsData>({
    name: defaultClinicConfig.name,
    shortName: defaultClinicConfig.shortName,
    tagline: defaultClinicConfig.tagline,
    phoneDisplay: defaultClinicConfig.contact.phoneDisplay,
    phoneHref: defaultClinicConfig.contact.phoneHref,
    whatsappNumber: defaultClinicConfig.contact.whatsappNumber,
    email: defaultClinicConfig.contact.email,
    addressLine1: defaultClinicConfig.address.line1,
    addressLine2: defaultClinicConfig.address.line2,
    mapsLink: defaultClinicConfig.address.mapsLink,
    directionsLink: defaultClinicConfig.address.directionsLink,
    instagram: defaultClinicConfig.social.instagram,
    facebook: defaultClinicConfig.social.facebook,
  });
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await getClinicSettings();
      if (mounted) {
        setSettings(data);
        setLoading(false);
      }
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  return { settings, loading };
}

export function useAboutContent(): { content: AboutContentData; loading: boolean } {
  const [content, setContent] = useState<AboutContentData>(DEFAULT_ABOUT_CONTENT);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await getAboutContent();
      if (mounted) {
        setContent(data);
        setLoading(false);
      }
    }
    load();

    const handleUpdate = () => load();
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  return { content, loading };
}
