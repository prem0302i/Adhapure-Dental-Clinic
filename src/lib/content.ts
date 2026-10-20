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
    "Our dental clinic was founded with a simple belief: that going to the dentist should be straightforward, gentle, and comfortable. Our team is dedicated to supporting your oral health at every stage of life.",
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
      body: "All instruments are sterilised to strict hospital-grade protocols. We follow current infection-control guidelines at every appointment.",
    },
  ],
  facilities: [
    "Modern, fully equipped treatment rooms",
    "Advanced digital imaging & diagnostics",
    "Comfortable, accessible waiting lounge",
    "Dedicated sterilization and consultation space",
  ],
  qualifications: [
    {
      label: "Certified Dental Practitioners",
      description: "All our clinicians hold recognized degrees and state dental council registrations.",
    },
    {
      label: "Ongoing Professional Development",
      description: "Our clinicians actively participate in continuous dental education and advanced clinical workshops.",
    },
  ],
};

const DEFAULT_HOURS: HoursEntry[] = [
  { day: "Monday – Friday", hours: "7:00 – 6:30" },
  { day: "Saturday", hours: "8:00 – 3:00" },
  { day: "Sunday", hours: "Closed" },
];

const DEFAULT_SETTINGS: ClinicSettingsData = {
  name: defaultClinicConfig.name || "Dental Clinic",
  shortName: defaultClinicConfig.shortName || "Dental Clinic",
  tagline: defaultClinicConfig.tagline || "Patient-focused dental care",
  phoneDisplay: defaultClinicConfig.contact.phoneDisplay || "",
  phoneHref: defaultClinicConfig.contact.phoneHref || "",
  whatsappNumber: defaultClinicConfig.contact.whatsappNumber || "",
  email: defaultClinicConfig.contact.email || "",
  addressLine1: defaultClinicConfig.address.line1 || "",
  addressLine2: defaultClinicConfig.address.line2 || "",
  mapsLink: defaultClinicConfig.address.mapsLink || "",
  directionsLink: defaultClinicConfig.address.directionsLink || "",
  instagram: defaultClinicConfig.social.instagram || "",
  facebook: defaultClinicConfig.social.facebook || "",
};

// ---------------------------------------------------------------------------
// LocalStorage Persistence & In-Memory Singletons (Prevents Flash on Refresh)
// ---------------------------------------------------------------------------

const CACHE_KEYS = {
  SETTINGS: "clinic_cache_settings",
  HOURS: "clinic_cache_hours",
  DOCTORS: "clinic_cache_doctors",
  TREATMENTS: "clinic_cache_treatments",
  ABOUT: "clinic_cache_about",
  GALLERY: "clinic_cache_gallery",
} as const;

function getLocalCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setLocalCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded or private browsing
  }
}

let memorySettings: ClinicSettingsData | null = null;
let memoryHours: HoursEntry[] | null = null;
let memoryDoctors: Doctor[] | null = null;
let memoryTreatments: Service[] | null = null;
let memoryAbout: AboutContentData | null = null;
let memoryGallery: GalleryCase[] | null = null;

let pendingSettingsPromise: Promise<ClinicSettingsData> | null = null;
let pendingHoursPromise: Promise<HoursEntry[]> | null = null;
let pendingDoctorsPromise: Promise<Doctor[]> | null = null;
let pendingTreatmentsPromise: Promise<Service[]> | null = null;
let pendingAboutPromise: Promise<AboutContentData> | null = null;
let pendingGalleryPromise: Promise<GalleryCase[]> | null = null;

// Synchronous initial getters for zero-delay useState initialization
export function getInitialClinicSettings(): ClinicSettingsData {
  if (memorySettings) return memorySettings;
  const cached = getLocalCache<ClinicSettingsData>(CACHE_KEYS.SETTINGS);
  if (cached) {
    memorySettings = cached;
    return cached;
  }
  return DEFAULT_SETTINGS;
}

export function getInitialOpeningHours(): HoursEntry[] {
  if (memoryHours) return memoryHours;
  const cached = getLocalCache<HoursEntry[]>(CACHE_KEYS.HOURS);
  if (cached && cached.length > 0) {
    memoryHours = cached;
    return cached;
  }
  return defaultClinicConfig.hours.length > 0 ? defaultClinicConfig.hours : DEFAULT_HOURS;
}

export function getInitialDoctors(): Doctor[] {
  if (memoryDoctors) return memoryDoctors;
  const cached = getLocalCache<Doctor[]>(CACHE_KEYS.DOCTORS);
  if (cached && cached.length > 0) {
    memoryDoctors = cached;
    return cached;
  }
  return defaultDoctors;
}

export function getInitialTreatments(): Service[] {
  if (memoryTreatments) return memoryTreatments;
  const cached = getLocalCache<Service[]>(CACHE_KEYS.TREATMENTS);
  if (cached && cached.length > 0) {
    memoryTreatments = cached;
    return cached;
  }
  return defaultServices;
}

export function getInitialAboutContent(): AboutContentData {
  if (memoryAbout) return memoryAbout;
  const cached = getLocalCache<AboutContentData>(CACHE_KEYS.ABOUT);
  if (cached) {
    memoryAbout = cached;
    return cached;
  }
  return DEFAULT_ABOUT_CONTENT;
}

export function getInitialGalleryCases(): GalleryCase[] {
  if (memoryGallery) return memoryGallery;
  const cached = getLocalCache<GalleryCase[]>(CACHE_KEYS.GALLERY);
  if (cached && cached.length > 0) {
    memoryGallery = cached;
    return cached;
  }
  return defaultGalleryCases;
}

// ---------------------------------------------------------------------------
// Event Dispatcher & Cache Update Helpers for Admin Updates
// ---------------------------------------------------------------------------

export const CONTENT_UPDATED_EVENT = "clinic:content-updated";

export function notifyContentUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONTENT_UPDATED_EVENT));
  }
}

export function updateCachedClinicSettings(data: ClinicSettingsData): void {
  memorySettings = data;
  setLocalCache(CACHE_KEYS.SETTINGS, data);
  notifyContentUpdated();
}

export function updateCachedOpeningHours(hours: HoursEntry[]): void {
  memoryHours = hours;
  setLocalCache(CACHE_KEYS.HOURS, hours);
  notifyContentUpdated();
}

export function updateCachedAboutContent(about: AboutContentData): void {
  memoryAbout = about;
  setLocalCache(CACHE_KEYS.ABOUT, about);
  notifyContentUpdated();
}

export function updateCachedDoctors(doctors: Doctor[]): void {
  memoryDoctors = doctors;
  setLocalCache(CACHE_KEYS.DOCTORS, doctors);
  notifyContentUpdated();
}

export function updateCachedTreatments(treatments: Service[]): void {
  memoryTreatments = treatments;
  setLocalCache(CACHE_KEYS.TREATMENTS, treatments);
  notifyContentUpdated();
}

export function invalidateDoctorsCache(): void {
  memoryDoctors = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CACHE_KEYS.DOCTORS);
  }
  notifyContentUpdated();
}

export function invalidateTreatmentsCache(): void {
  memoryTreatments = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CACHE_KEYS.TREATMENTS);
  }
  notifyContentUpdated();
}

export function invalidateGalleryCache(): void {
  memoryGallery = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CACHE_KEYS.GALLERY);
  }
  notifyContentUpdated();
}

// ---------------------------------------------------------------------------
// Direct Fetchers with In-Flight Deduplication & Background Cache Sync
// ---------------------------------------------------------------------------

export async function getDoctors(forceFresh = false): Promise<Doctor[]> {
  if (!isSupabaseConfigured || !supabase) return memoryDoctors || getInitialDoctors();
  if (pendingDoctorsPromise && !forceFresh) return pendingDoctorsPromise;

  pendingDoctorsPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (error || !data || data.length === 0) {
        return memoryDoctors || getInitialDoctors();
      }

      const fresh: Doctor[] = data
        .filter((d) => !d.name.includes("[") && !d.name.toLowerCase().includes("doctor name"))
        .map((d) => ({
          slug: d.id,
          name: d.name,
          qualifications: d.qualifications || "",
          specialisation: d.specialisation || "",
          experienceYears: d.experience ? parseInt(d.experience, 10) || undefined : undefined,
          bio: d.bio || "",
          photo: d.photo_url || undefined,
          placeholder: false,
        }));

      memoryDoctors = fresh;
      setLocalCache(CACHE_KEYS.DOCTORS, fresh);
      return fresh;
    } catch {
      return memoryDoctors || getInitialDoctors();
    } finally {
      pendingDoctorsPromise = null;
    }
  })();

  return pendingDoctorsPromise;
}

export async function getTreatments(forceFresh = false): Promise<Service[]> {
  if (!isSupabaseConfigured || !supabase) return memoryTreatments || getInitialTreatments();
  if (pendingTreatmentsPromise && !forceFresh) return pendingTreatmentsPromise;

  pendingTreatmentsPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from("treatments")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (error || !data || data.length === 0) {
        return memoryTreatments || getInitialTreatments();
      }

      const fresh: Service[] = data.map((t) => ({
        slug: t.slug,
        name: t.name,
        summary: t.summary || "",
        icon: t.icon || "Circle",
      }));

      memoryTreatments = fresh;
      setLocalCache(CACHE_KEYS.TREATMENTS, fresh);
      return fresh;
    } catch {
      return memoryTreatments || getInitialTreatments();
    } finally {
      pendingTreatmentsPromise = null;
    }
  })();

  return pendingTreatmentsPromise;
}

export async function getGalleryCases(forceFresh = false): Promise<GalleryCase[]> {
  if (!isSupabaseConfigured || !supabase) return memoryGallery || getInitialGalleryCases();
  if (pendingGalleryPromise && !forceFresh) return pendingGalleryPromise;

  pendingGalleryPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_cases")
        .select("*")
        .eq("is_published", true)
        .eq("consent_confirmed", true)
        .order("sort_order", { ascending: true });

      if (error || !data || data.length === 0) {
        return memoryGallery || getInitialGalleryCases();
      }

      const fresh: GalleryCase[] = data.map((c) => ({
        id: c.id,
        beforeSrc: c.before_url || undefined,
        afterSrc: c.after_url || undefined,
        caption: c.caption || c.title || "",
        consentConfirmed: c.consent_confirmed,
      }));

      memoryGallery = fresh;
      setLocalCache(CACHE_KEYS.GALLERY, fresh);
      return fresh;
    } catch {
      return memoryGallery || getInitialGalleryCases();
    } finally {
      pendingGalleryPromise = null;
    }
  })();

  return pendingGalleryPromise;
}

export async function getOpeningHours(forceFresh = false): Promise<HoursEntry[]> {
  if (!isSupabaseConfigured || !supabase) return memoryHours || getInitialOpeningHours();
  if (pendingHoursPromise && !forceFresh) return pendingHoursPromise;

  pendingHoursPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from("opening_hours")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error || !data || data.length === 0) {
        return memoryHours || getInitialOpeningHours();
      }

      const fresh = data.map((h) => {
        let timeText = "Closed";
        if (h.is_closed) {
          timeText = "Closed";
        } else if (h.open_time && h.close_time) {
          timeText = `${h.open_time} – ${h.close_time}`;
        } else if (h.note && !h.note.startsWith("[")) {
          timeText = h.note;
        }
        return {
          day: h.day,
          hours: timeText,
        };
      });

      memoryHours = fresh;
      setLocalCache(CACHE_KEYS.HOURS, fresh);
      return fresh;
    } catch {
      return memoryHours || getInitialOpeningHours();
    } finally {
      pendingHoursPromise = null;
    }
  })();

  return pendingHoursPromise;
}

export async function getClinicSettings(forceFresh = false): Promise<ClinicSettingsData> {
  const fallback = memorySettings || getInitialClinicSettings();
  if (!isSupabaseConfigured || !supabase) return fallback;
  if (pendingSettingsPromise && !forceFresh) return pendingSettingsPromise;

  pendingSettingsPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from("clinic_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error || !data) return fallback;

      const fresh: ClinicSettingsData = {
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

      memorySettings = fresh;
      setLocalCache(CACHE_KEYS.SETTINGS, fresh);
      return fresh;
    } catch {
      return fallback;
    } finally {
      pendingSettingsPromise = null;
    }
  })();

  return pendingSettingsPromise;
}

export async function getAboutContent(forceFresh = false): Promise<AboutContentData> {
  const fallback = memoryAbout || getInitialAboutContent();
  if (!isSupabaseConfigured || !supabase) return fallback;
  if (pendingAboutPromise && !forceFresh) return pendingAboutPromise;

  pendingAboutPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from("about_content")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error || !data) return fallback;

      const fresh: AboutContentData = {
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

      memoryAbout = fresh;
      setLocalCache(CACHE_KEYS.ABOUT, fresh);
      return fresh;
    } catch {
      return fallback;
    } finally {
      pendingAboutPromise = null;
    }
  })();

  return pendingAboutPromise;
}

// ---------------------------------------------------------------------------
// React Hooks with Synchronous Cache Init & Smooth Background Revalidation
// ---------------------------------------------------------------------------

export function useDoctors(): { doctors: Doctor[]; loading: boolean } {
  const [doctors, setDoctors] = useState<Doctor[]>(getInitialDoctors);
  const [loading, setLoading] = useState<boolean>(!memoryDoctors && isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    async function load(force = false) {
      const data = await getDoctors(force);
      if (mounted) {
        setDoctors(data);
        setLoading(false);
      }
    }
    load();

    const handleUpdate = () => load(true);
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  return { doctors, loading };
}

export function useTreatments(): { treatments: Service[]; loading: boolean } {
  const [treatments, setTreatments] = useState<Service[]>(getInitialTreatments);
  const [loading, setLoading] = useState<boolean>(!memoryTreatments && isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    async function load(force = false) {
      const data = await getTreatments(force);
      if (mounted) {
        setTreatments(data);
        setLoading(false);
      }
    }
    load();

    const handleUpdate = () => load(true);
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  return { treatments, loading };
}

export function useGalleryCases(): { cases: GalleryCase[]; loading: boolean } {
  const [cases, setCases] = useState<GalleryCase[]>(getInitialGalleryCases);
  const [loading, setLoading] = useState<boolean>(!memoryGallery && isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    async function load(force = false) {
      const data = await getGalleryCases(force);
      if (mounted) {
        setCases(data);
        setLoading(false);
      }
    }
    load();

    const handleUpdate = () => load(true);
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  return { cases, loading };
}

export function useOpeningHours(): { hours: HoursEntry[]; loading: boolean } {
  const [hours, setHours] = useState<HoursEntry[]>(getInitialOpeningHours);
  const [loading, setLoading] = useState<boolean>(!memoryHours && isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    async function load(force = false) {
      const data = await getOpeningHours(force);
      if (mounted) {
        setHours(data);
        setLoading(false);
      }
    }
    load();

    const handleUpdate = () => load(true);
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  return { hours, loading };
}

export function useClinicSettings(): { settings: ClinicSettingsData; loading: boolean } {
  const [settings, setSettings] = useState<ClinicSettingsData>(getInitialClinicSettings);
  const [loading, setLoading] = useState<boolean>(!memorySettings && isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    async function load(force = false) {
      const data = await getClinicSettings(force);
      if (mounted) {
        setSettings(data);
        setLoading(false);
      }
    }
    load();

    const handleUpdate = () => load(true);
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  return { settings, loading };
}

export function useAboutContent(): { content: AboutContentData; loading: boolean } {
  const [content, setContent] = useState<AboutContentData>(getInitialAboutContent);
  const [loading, setLoading] = useState<boolean>(!memoryAbout && isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    async function load(force = false) {
      const data = await getAboutContent(force);
      if (mounted) {
        setContent(data);
        setLoading(false);
      }
    }
    load();

    const handleUpdate = () => load(true);
    window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  return { content, loading };
}
