import { useEffect } from "react";
import { useClinicSettings } from "@/lib/content";

/**
 * Sets document.title and updates the meta description for the current page.
 * Also injects Open Graph tags.
 *
 * title: Page-specific part ONLY (e.g. "Treatments we offer").
 *        If it already contains " — " we treat the whole string as the final title
 *        and only substitute the clinic name token if present.
 * description: Full description text.
 *
 * This is a client-side solution appropriate for this Vite/React app.
 * A full SSR/SSG solution would be required for search-engine-visible OG tags.
 */
interface PageMetaProps {
  title: string;
  description: string;
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setOgMeta(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}


export function PageMeta({ title, description }: PageMetaProps) {
  const { settings } = useClinicSettings();
  // Always use the live clinic name from the database (with cache fallback)
  const clinicName = settings.name?.trim() || "Dental Clinic";

  // Build the final title:
  // If `title` already contains " — " assume it's a composite title and replace
  // the clinic-name segment dynamically. Otherwise append the clinic name.
  let resolvedTitle: string;
  if (title.includes(" — ")) {
    // Replace the part after " — " with the live clinic name
    const parts = title.split(" — ");
    // Replace any hardcoded clinic name in the last segment with the live one
    resolvedTitle = `${parts[0]} — ${clinicName}`;
  } else {
    // Plain page title – compose as "Page Title — Clinic Name"
    resolvedTitle = title ? `${title} — ${clinicName}` : clinicName;
  }

  // Replace any stale placeholder tokens in the description
  const resolvedDescription = description
    .replace(/Prem's Dental Clinic/g, clinicName)
    .replace(/\[CLINIC NAME\]/g, clinicName)
    .replace(/Dental Clinic/g, clinicName);

  useEffect(() => {
    document.title = resolvedTitle;
    setMeta("description", resolvedDescription);
    setOgMeta("og:title", resolvedTitle);
    setOgMeta("og:description", resolvedDescription);
    setOgMeta("og:type", "website");
  }, [resolvedTitle, resolvedDescription]);

  return null;
}
