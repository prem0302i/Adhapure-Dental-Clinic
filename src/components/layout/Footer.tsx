import { Link } from "react-router-dom";
import { Phone, MapPin, Clock } from "lucide-react";
import { clinicConfig, navItems } from "@/lib/clinic-config";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container-wide py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-xl font-semibold">{clinicConfig.name}</p>
            <p className="mt-2 text-sm text-white/70">{clinicConfig.tagline}</p>
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
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                <span>{clinicConfig.contact.phoneDisplay}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                <span>
                  {clinicConfig.address.line1}
                  <br />
                  {clinicConfig.address.line2}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                <span>Opening hours to be confirmed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6 text-xs text-white/60">
          <p>
            © {new Date().getFullYear()} {clinicConfig.name}. All rights reserved.{" "}
            <Link to="/privacy" className="underline hover:text-white">
              Privacy policy
            </Link>{" "}
            (placeholder).
          </p>
          <p className="mt-1">
            This site is in development. Details shown are placeholders pending verification.
          </p>
        </div>
      </div>
    </footer>
  );
}
