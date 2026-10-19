import { useState, useEffect } from "react";
import {
  Save,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { notifyContentUpdated, type AboutContentData } from "@/lib/content";

export default function AdminAboutPage() {
  const [formData, setFormData] = useState<AboutContentData>({
    intro: "",
    philosophy: [],
    facilities: [],
    qualifications: [],
  });
  const [recordId, setRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function loadAbout() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("about_content")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setRecordId(data.id);
          setFormData({
            intro: data.intro || "",
            philosophy: Array.isArray(data.philosophy) ? data.philosophy : [],
            facilities: Array.isArray(data.facilities) ? data.facilities : [],
            qualifications: Array.isArray(data.qualifications) ? data.qualifications : [],
          });
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to load about content.");
      } finally {
        setLoading(false);
      }
    }
    loadAbout();
  }, []);

  function handleFieldChange<K extends keyof AboutContentData>(key: K, val: AboutContentData[K]) {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setIsDirty(true);
  }

  function handleAddFacility() {
    handleFieldChange("facilities", [...formData.facilities, "New facility detail — to be confirmed"]);
  }

  function handleRemoveFacility(index: number) {
    handleFieldChange(
      "facilities",
      formData.facilities.filter((_, i) => i !== index),
    );
  }

  function handleFacilityChange(index: number, val: string) {
    const next = [...formData.facilities];
    next[index] = val;
    handleFieldChange("facilities", next);
  }

  function handlePhilosophyChange(index: number, field: "title" | "body", val: string) {
    const next = [...formData.philosophy];
    next[index] = { ...next[index], [field]: val };
    handleFieldChange("philosophy", next);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        intro: formData.intro.trim(),
        philosophy: formData.philosophy,
        facilities: formData.facilities,
        qualifications: formData.qualifications,
        updated_at: new Date().toISOString(),
      };

      if (recordId) {
        const { error } = await supabase.from("about_content").update(payload).eq("id", recordId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("about_content").insert([payload]).select("id").single();
        if (error) throw error;
        if (data) setRecordId(data.id);
      }

      setSuccessMsg("About page content saved successfully.");
      setIsDirty(false);
      notifyContentUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save about content.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-navy">Manage About Page Content</h1>
          <p className="text-xs text-muted">
            Update clinic philosophy pillars, facilities list, and regulatory registration notes.
          </p>
        </div>

        {isDirty && (
          <span className="rounded-pill bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            Unsaved changes
          </span>
        )}
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-teal/30 bg-teal-tint/40 p-3 text-xs text-teal-deep">
          <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-muted">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-deep" aria-hidden="true" />
          <p className="mt-2">Loading about content…</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* Intro Section */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-line pb-3">
              <h2 className="font-serif text-lg text-navy">Clinic Introduction</h2>
              <p className="text-xs text-muted">
                Displayed prominently in the Hero section of the About page.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy">Intro Paragraph</label>
              <textarea
                rows={4}
                value={formData.intro}
                onChange={(e) => handleFieldChange("intro", e.target.value)}
                placeholder="[CLINIC NAME] was founded with a simple belief…"
                className="mt-1 w-full rounded-lg border border-line px-3.5 py-2.5 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
              />
            </div>
          </div>

          {/* Philosophy Pillars */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-line pb-3">
              <h2 className="font-serif text-lg text-navy">Philosophy of Care Pillars</h2>
              <p className="text-xs text-muted">
                Four guiding principles explaining your clinic's patient-first approach.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {formData.philosophy.map((pillar, i) => (
                <div key={i} className="rounded-xl border border-line bg-enamel/50 p-4 space-y-2">
                  <span className="text-[0.7rem] font-bold text-teal-deep uppercase tracking-wider">
                    Pillar {i + 1}
                  </span>
                  <div>
                    <label className="block text-[0.7rem] font-semibold text-navy">Title</label>
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => handlePhilosophyChange(i, "title", e.target.value)}
                      className="mt-0.5 w-full rounded border border-line bg-white px-2.5 py-1.5 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.7rem] font-semibold text-navy">Description</label>
                    <textarea
                      rows={2}
                      value={pillar.body}
                      onChange={(e) => handlePhilosophyChange(i, "body", e.target.value)}
                      className="mt-0.5 w-full rounded border border-line bg-white px-2.5 py-1.5 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Facilities List */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h2 className="font-serif text-lg text-navy">Our Facilities</h2>
                <p className="text-xs text-muted">
                  Bullet points detailing clinic amenities and equipment (no unverified claims).
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddFacility}
                className="inline-flex items-center gap-1.5 rounded-pill bg-teal-tint px-3 py-1.5 text-xs font-semibold text-teal-deep hover:bg-teal hover:text-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.facilities.map((fac, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fac}
                    onChange={(e) => handleFacilityChange(i, e.target.value)}
                    className="flex-1 rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFacility(i)}
                    className="rounded p-1.5 text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={`Remove facility item ${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Bar */}
          <div className="sticky bottom-4 z-20 rounded-2xl border border-line bg-white p-4 shadow-lg flex items-center justify-between">
            <p className="text-xs text-muted">
              {isDirty ? "You have unsaved changes." : "All changes saved."}
            </p>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-pill bg-teal-deep px-6 py-2.5 text-xs font-semibold text-white hover:bg-teal disabled:opacity-50 transition-colors min-h-[38px]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Saving Changes…</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  <span>Save About Content</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
