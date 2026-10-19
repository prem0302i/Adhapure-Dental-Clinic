import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function AdminLoginPage() {
  const { user, isAdmin, loading: authLoading, signIn, sessionExpired } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/admin";

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate, from]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    const { error, isNotAdmin } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      if (isNotAdmin) {
        setErrorMessage(
          "Access denied: Your login is valid in Supabase, but this email is not registered in the 'admins' table. Only authorized administrators can access this portal.",
        );
      } else {
        setErrorMessage(error.message || "Invalid email or password.");
      }
    } else {
      navigate(from, { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-enamel px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-teal-deep transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Return to public website</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-tint text-teal-deep mb-5">
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>

          <h1 className="font-serif text-2xl text-navy">Admin Portal Login</h1>
          <p className="mt-1 text-xs text-muted">
            Manage treatments, doctors, gallery cases, and clinic content.
          </p>

          {!isSupabaseConfigured && (
            <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
              <span className="font-semibold">Setup notice:</span> Supabase environment variables
              are not configured. Add <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and{" "}
              <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to your .env file to enable authentication.
            </div>
          )}

          {sessionExpired && (
            <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
              Your previous session expired due to inactivity. Please sign in again.
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-medium text-navy">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@clinic.example"
                className="mt-1 w-full rounded-lg border border-line bg-white px-3.5 py-2 text-sm text-navy placeholder:text-muted focus:border-teal-deep focus:outline-none focus:ring-2 focus:ring-teal-deep"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-medium text-navy">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1 w-full rounded-lg border border-line bg-white px-3.5 py-2 text-sm text-navy placeholder:text-muted focus:border-teal-deep focus:outline-none focus:ring-2 focus:ring-teal-deep"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !isSupabaseConfigured}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-pill bg-teal-deep px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal disabled:opacity-50 min-h-tap"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Signing in…</span>
                </>
              ) : (
                "Sign In to Admin Portal"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[0.75rem] text-muted">
            Public sign-up is closed. Only allow-listed administrator accounts have access.
          </p>
        </div>
      </div>
    </div>
  );
}
