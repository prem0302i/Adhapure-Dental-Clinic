import { useEffect } from "react";

/**
 * Sets document.title and updates the meta description for the current page.
 * Also injects Open Graph tags.
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
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setOgMeta("og:title", title);
    setOgMeta("og:description", description);
    setOgMeta("og:type", "website");
  }, [title, description]);

  return null;
}
