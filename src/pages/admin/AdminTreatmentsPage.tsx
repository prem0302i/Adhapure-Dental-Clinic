import { useState, useEffect } from "react";
import {
  Stethoscope,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Hammer,
  Sun,
  AlignHorizontalJustifyCenter,
  Anchor,
  Crown,
  Baby,
  Smile,
  Circle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { notifyContentUpdated } from "@/lib/content";

const iconMap: Record<string, LucideIcon> = {
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Hammer,
  Sun,
  AlignHorizontalJustifyCenter,
  Anchor,
  Crown,
  Baby,
  Smile,
};

const AVAILABLE_ICONS = Object.keys(iconMap);

interface TreatmentRecord {
  id: string;
  slug: string;
  name: string;
  summary: string;
  details: string;
  icon: string;
  sort_order: number;
  is_published: boolean;
}

const EMPTY_TREATMENT: Omit<TreatmentRecord, "id"> = {
  slug: "",
  name: "",
  summary: "",
  details: "",
  icon: "Stethoscope",
  sort_order: 0,
  is_published: true,
};

export default function AdminTreatmentsPage() {
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<TreatmentRecord, "id">>(EMPTY_TREATMENT);
  const [deleteTarget, setDeleteTarget] = useState<TreatmentRecord | null>(null);

  async function loadTreatments() {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("treatments")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setTreatments(data || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load treatments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTreatments();
  }, []);

  function handleOpenCreate() {
    setCurrentId(null);
    setFormData({ ...EMPTY_TREATMENT, sort_order: treatments.length + 1 });
    setErrorMsg("");
    setSuccessMsg("");
    setIsEditing(true);
  }

  function handleOpenEdit(item: TreatmentRecord) {
    setCurrentId(item.id);
    setFormData({
      slug: item.slug,
      name: item.name,
      summary: item.summary || "",
      details: item.details || "",
      icon: item.icon || "Stethoscope",
      sort_order: item.sort_order,
      is_published: item.is_published,
    });
    setErrorMsg("");
    setSuccessMsg("");
    setIsEditing(true);
  }

  function handleNameChange(newName: string) {
    const slug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: currentId ? prev.slug : slug,
    }));
  }

  async function handleTogglePublish(item: TreatmentRecord) {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("treatments")
        .update({ is_published: !item.is_published, updated_at: new Date().toISOString() })
        .eq("id", item.id);

      if (error) throw error;
      setTreatments((list) =>
        list.map((t) => (t.id === item.id ? { ...t, is_published: !t.is_published } : t)),
      );
      notifyContentUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update publish state.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    if (!formData.name.trim() || !formData.slug.trim()) {
      setErrorMsg("Treatment name and unique URL slug are required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        summary: formData.summary.trim(),
        details: formData.details.trim(),
        icon: formData.icon,
        sort_order: Number(formData.sort_order) || 0,
        is_published: formData.is_published,
        updated_at: new Date().toISOString(),
      };

      if (currentId) {
        const { error } = await supabase.from("treatments").update(payload).eq("id", currentId);
        if (error) throw error;
        setSuccessMsg("Treatment updated successfully.");
      } else {
        const { error } = await supabase.from("treatments").insert([payload]);
        if (error) throw error;
        setSuccessMsg("Treatment created successfully.");
      }

      setIsEditing(false);
      await loadTreatments();
      notifyContentUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save treatment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!supabase || !deleteTarget) return;
    try {
      const { error } = await supabase.from("treatments").delete().eq("id", deleteTarget.id);
      if (error) throw error;

      setTreatments((list) => list.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSuccessMsg("Treatment deleted successfully.");
      notifyContentUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete treatment.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-navy">Manage Treatments & Services</h1>
          <p className="text-xs text-muted">
            Configure the services offered by the clinic. No promised medical outcomes or pricing.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-pill bg-teal-deep px-4 py-2 text-xs font-semibold text-white hover:bg-teal transition-colors min-h-[38px] self-start"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add New Treatment</span>
        </button>
      </div>

      {/* Alerts */}
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

      {/* Table / List */}
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-muted">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-deep" aria-hidden="true" />
            <p className="mt-2">Loading treatments…</p>
          </div>
        ) : treatments.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted">
            <Stethoscope className="mx-auto h-8 w-8 text-line" aria-hidden="true" />
            <p className="mt-2 font-medium text-navy">No treatments in the database.</p>
            <p className="mt-1">
              The public site will display default placeholder treatments until you add services or run the seed script.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-enamel font-semibold text-navy">
                <tr>
                  <th className="px-4 py-3">Icon</th>
                  <th className="px-4 py-3">Name & Summary</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {treatments.map((t) => {
                  const Icon = iconMap[t.icon] ?? Circle;
                  return (
                    <tr key={t.id} className="hover:bg-enamel/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-tint text-teal-deep">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-navy">{t.name}</p>
                        <p className="text-muted line-clamp-1">{t.summary || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        <code className="bg-enamel px-1.5 py-0.5 rounded text-[0.7rem]">{t.slug}</code>
                      </td>
                      <td className="px-4 py-3 text-muted">{t.sort_order}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(t)}
                          className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[0.7rem] font-medium transition-colors ${
                            t.is_published
                              ? "bg-teal-tint text-teal-deep hover:bg-teal-tint/80"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                          title="Click to toggle published status"
                        >
                          {t.is_published ? (
                            <>
                              <Eye className="h-3 w-3" aria-hidden="true" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" aria-hidden="true" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(t)}
                            className="rounded p-1 text-muted hover:text-teal-deep hover:bg-teal-tint transition-colors"
                            aria-label={`Edit ${t.name}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(t)}
                            className="rounded p-1 text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Delete ${t.name}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Modal Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl text-navy">
              {currentId ? "Edit Treatment" : "Add New Treatment"}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Configure the treatment name and brief summary for the public treatments page.
            </p>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy">
                  Treatment Name <span className="text-teal-deep">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Dental Implants"
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy">
                    URL Slug <span className="text-teal-deep">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. dental-implants"
                    className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep bg-white"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy">Summary</label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="A one-sentence summary for the treatments list…"
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy">Display Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })}
                    className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    id="treatment-published"
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="h-4 w-4 rounded border-line text-teal-deep focus:ring-teal-deep"
                  />
                  <label htmlFor="treatment-published" className="text-xs font-medium text-navy">
                    Published (visible publicly)
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-pill border border-line px-4 py-2 text-xs font-medium text-navy hover:bg-enamel min-h-[38px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-pill bg-teal-deep px-5 py-2 text-xs font-semibold text-white hover:bg-teal disabled:opacity-50 min-h-[38px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    "Save Treatment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-xl">
            <h3 className="font-serif text-lg text-navy">Delete Treatment?</h3>
            <p className="mt-2 text-xs text-muted">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-pill border border-line px-4 py-2 text-xs font-medium text-navy hover:bg-enamel min-h-[38px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-pill bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 min-h-[38px]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
