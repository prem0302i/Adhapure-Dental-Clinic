import { Link } from "react-router-dom";
import { Phone, MapPin, Clock } from "lucide-react";
import { navItems } from "@/lib/clinic-config";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useClinicSettings, useOpeningHours } from "@/lib/content";

export function Footer() {
  const { settings } = useClinicSettings();
  const { hours } = useOpeningHours();

  return (
    <footer className="bg-navy text-white">
      <div className="container-wide py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-xl font-semibold">{settings.name}</p>
            <p className="mt-2 text-sm text-white/70">{settings.tagline}</p>
            <div className="mt-5">
              <WhatsAppButton label="Chat on WhatsApp" />
            </div>
          </div>

          <nav aria-label="Footer" className="text-sm">
            <h2 className="font-serif text-base font-semibold text-white">Pages</h2>
            <ul className="mt-3 space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-white/75 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/privacy"
                  className="text-white/75 transition-colors hover:text-white"
                >
                  Privacy policy
                </Link>
              </li>
            </ul>
          </nav>

          <div className="text-sm">
            <h2 className="font-serif text-base font-semibold text-white">Contact</h2>
            <ul className="mt-3 space-y-3 text-white/75">
              {settings.phoneDisplay && (
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  {settings.phoneHref ? (
                    <a href={settings.phoneHref} className="hover:text-white">
                      {settings.phoneDisplay}
                    </a>
                  ) : (
                    <span>{settings.phoneDisplay}</span>
                  )}
                </li>
              )}
              {settings.addressLine1 && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  <span>
                    {settings.addressLine1}
                    {settings.addressLine2 ? `, ${settings.addressLine2}` : ""}
                  </span>
                </li>
              )}
              {hours.length > 0 && (
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  <div className="space-y-0.5">
                    {hours.map((h) => (
                      <div key={h.day} className="text-xs">
                        <span className="font-medium text-white/90">{h.day}:</span> {h.hours}
                      </div>
                    ))}
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6 text-xs text-white/60">
          <p>
            © {new Date().getFullYear()} {settings.name}. All rights reserved.{" "}
            <Link to="/privacy" className="underline hover:text-white">
              Privacy policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
