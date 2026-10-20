import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Stethoscope,
  Sparkles,
  FileText,
  Settings,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getInitialClinicSettings } from "@/lib/content";

interface SectionSummary {
  doctorsCount: number;
  treatmentsCount: number;
  galleryCount: number;
  hoursCount: number;
  enquiriesCount: number;
  newEnquiriesCount: number;
  clinicName: string;
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<SectionSummary>({
    doctorsCount: 0,
    treatmentsCount: 0,
    galleryCount: 0,
    hoursCount: 0,
    enquiriesCount: 0,
    newEnquiriesCount: 0,
    clinicName: getInitialClinicSettings().name || "Dental Clinic",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }
      try {
        const [docsRes, treatRes, gallRes, hoursRes, settingsRes, enqRes, newEnqRes] = await Promise.all([
          supabase.from("doctors").select("id", { count: "exact", head: true }),
          supabase.from("treatments").select("id", { count: "exact", head: true }),
          supabase.from("gallery_cases").select("id", { count: "exact", head: true }),
          supabase.from("opening_hours").select("id", { count: "exact", head: true }),
          supabase.from("clinic_settings").select("clinic_name").limit(1).maybeSingle(),
          supabase.from("enquiries").select("id", { count: "exact", head: true }),
          supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
        ]);

        setSummary({
          doctorsCount: docsRes.count ?? 0,
          treatmentsCount: treatRes.count ?? 0,
          galleryCount: gallRes.count ?? 0,
          hoursCount: hoursRes.count ?? 0,
          enquiriesCount: enqRes.count ?? 0,
          newEnquiriesCount: newEnqRes.count ?? 0,
          clinicName: settingsRes.data?.clinic_name || getInitialClinicSettings().name || "Dental Clinic",
        });
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const sections = [
    {
      title: "Patient Enquiries",
      description: "Manage appointment requests, contact status, and staff confirmation.",
      countText: loading
        ? "…"
        : summary.newEnquiriesCount > 0
        ? `${summary.newEnquiriesCount} new pending`
        : `${summary.enquiriesCount} total`,
      icon: Inbox,
      path: "/admin/enquiries",
      color: summary.newEnquiriesCount > 0 ? "bg-amber-100 text-amber-800" : "bg-teal-tint text-teal-deep",
    },
    {
      title: "Our Doctors",
      description: "Manage dentist profiles, qualifications, specialisations, and photos.",
      countText: loading ? "…" : `${summary.doctorsCount} registered`,
      icon: Users,
      path: "/admin/doctors",
      color: "bg-teal-tint text-teal-deep",
    },
    {
      title: "Treatments & Services",
      description: "Manage dental care offerings, descriptions, and icon representations.",
      countText: loading ? "…" : `${summary.treatmentsCount} treatments`,
      icon: Stethoscope,
      path: "/admin/treatments",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Smile Gallery",
      description: "Upload verified Before & After results with mandatory patient consent.",
      countText: loading ? "…" : `${summary.galleryCount} cases`,
      icon: Sparkles,
      path: "/admin/gallery",
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "About Content",
      description: "Edit clinic philosophy pillars, facilities list, and accreditation details.",
      countText: "Editable section",
      icon: FileText,
      path: "/admin/about",
      color: "bg-purple-50 text-purple-700",
    },
    {
      title: "Clinic Settings",
      description: "Update clinic address, phone numbers, WhatsApp click-to-chat, and Maps.",
      countText: summary.clinicName,
      icon: Settings,
      path: "/admin/settings",
      color: "bg-slate-100 text-slate-800",
    },
    {
      title: "Opening Hours",
      description: "Configure schedule for weekdays, Saturday, Sunday, and holiday closures.",
      countText: loading ? "…" : `${summary.hoursCount} days configured`,
      icon: Clock,
      path: "/admin/hours",
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-tint text-teal-deep">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-deep">
                Administrator Portal
              </p>
            </div>
            <h1 className="mt-2 font-serif text-3xl text-navy">Content Overview</h1>
            <p className="mt-1 text-sm text-muted">
              Select any section below to update live content or add verified clinic assets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill border border-line bg-enamel px-4 py-2 text-xs font-medium text-navy hover:bg-white hover:text-teal-deep transition-colors min-h-[38px]"
            >
              <span>View live website</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {summary.newEnquiriesCount > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
            <Inbox className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 animate-bounce" aria-hidden="true" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="font-bold">{summary.newEnquiriesCount} new patient enquiry pending review.</span>{" "}
                Please contact the patient to confirm availability.
              </div>
              <Link
                to="/admin/enquiries"
                className="font-semibold text-amber-900 underline hover:text-amber-950 inline-flex items-center gap-1"
              >
                Open Inbox →
              </Link>
            </div>
          </div>
        )}

        {summary.galleryCount === 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <div>
              <span className="font-semibold">Notice for Smile Gallery:</span> The public site
              currently shows the honest "Photos coming soon" empty state. Once you obtain written
              patient consent, upload cases under <strong>Smile Gallery</strong> and check{" "}
              <em>Consent Confirmed</em> to display them.
            </div>
          </div>
        )}
      </div>

      {/* Grid of Sections */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ title, description, countText, icon: Icon, path, color }) => (
          <Link
            key={path}
            to={path}
            className="group flex flex-col justify-between rounded-xl border border-line bg-white p-6 shadow-sm transition-all hover:border-teal hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-xs font-medium text-muted">{countText}</span>
              </div>
              <h2 className="mt-4 font-serif text-lg font-semibold text-navy group-hover:text-teal-deep transition-colors">
                {title}
              </h2>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">{description}</p>
            </div>

            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-teal-deep">
              <span>Manage {title.toLowerCase()}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
