import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { clinicConfig, navItems } from "@/lib/clinic-config";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-wide flex h-16 items-center justify-between md:h-20">
        <Link
          to="/"
          className="font-serif text-lg font-semibold text-navy md:text-xl"
          aria-label={`${clinicConfig.name} home`}
        >
          {clinicConfig.shortName}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `rounded-pill px-3 py-2 text-[0.95rem] font-medium transition-colors ${
                  isActive ? "text-teal-deep" : "text-navy hover:text-teal-deep"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button to="/appointment" size="md">
            Request an appointment
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-pill text-navy hover:text-teal-deep lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 top-16 z-30 bg-navy/20"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="mobile-menu"
            aria-label="Mobile"
            className="absolute left-0 right-0 z-40 border-b border-line bg-white px-5 py-4 shadow-lg"
          >
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `block rounded-pill px-4 py-3 text-base font-medium transition-colors min-h-tap ${
                        isActive ? "bg-teal-tint text-teal-deep" : "text-navy hover:text-teal-deep"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button to="/appointment" size="lg" className="w-full">
                Request an appointment
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
