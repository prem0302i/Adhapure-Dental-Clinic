import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  ExternalLink,
  Users,
  Stethoscope,
  Sparkles,
  FileText,
  Settings,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

const adminNavItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
  { label: "Doctors", path: "/admin/doctors", icon: Users, end: false },
  { label: "Treatments", path: "/admin/treatments", icon: Stethoscope, end: false },
  { label: "Smile Gallery", path: "/admin/gallery", icon: Sparkles, end: false },
  { label: "About", path: "/admin/about", icon: FileText, end: false },
  { label: "Settings", path: "/admin/settings", icon: Settings, end: false },
  { label: "Hours", path: "/admin/hours", icon: Clock, end: false },
];

export function AdminLayout() {
  const { user, isAdmin, loading, signOut, sessionExpired, resetSessionExpired } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Set robots to noindex in admin area
  useEffect(() => {
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    const previous = metaRobots.content;
    metaRobots.content = "noindex,nofollow";

    return () => {
      if (metaRobots) metaRobots.content = previous;
    };
  }, []);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login", { replace: true, state: { from: location } });
    }
  }, [user, isAdmin, loading, navigate, location]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-enamel">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-deep border-r-transparent" />
          <p className="mt-3 text-sm font-medium text-navy">Loading admin portal…</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-enamel text-navy flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-white shadow-sm">
        <div className="container-wide flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="font-serif text-lg font-bold text-navy hover:text-teal-deep">
              Clinic Admin
            </Link>
            <span className="rounded-pill bg-teal-tint px-2.5 py-0.5 text-xs font-semibold text-teal-deep">
              Protected
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-teal-deep"
              aria-label="View public site in a new tab"
            >
              <span>View public site</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>

            <span className="hidden text-xs text-muted md:inline" title={user.email}>
              {user.email}
            </span>

            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-white px-3 py-1.5 text-xs font-medium text-navy hover:bg-enamel hover:text-red-600 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-line bg-white">
          <nav className="container-wide flex overflow-x-auto py-1 scrollbar-none" aria-label="Admin Navigation">
            <div className="flex gap-1 py-1">
              {adminNavItems.map(({ label, path, icon: Icon, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap min-h-[38px] ${
                      isActive
                        ? "bg-teal-deep text-white"
                        : "text-muted hover:bg-enamel hover:text-navy"
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Inactivity Warning */}
      {sessionExpired && (
        <div className="border-b border-amber-300 bg-amber-50 p-3 text-center text-xs text-amber-800">
          <span className="font-semibold">Session expired:</span> You were logged out due to 15 minutes of inactivity. Please log in again.
          <button
            type="button"
            onClick={resetSessionExpired}
            className="ml-2 font-medium underline hover:text-amber-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 py-8">
        <div className="container-wide">
          <Outlet />
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-line bg-white py-4 text-center text-xs text-muted">
        Clinic Content Management Portal • Read-only fallbacks active when database is empty
      </footer>
    </div>
  );
}
