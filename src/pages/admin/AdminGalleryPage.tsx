import { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  ImageOff,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { uploadImage } from "@/lib/storage";
import { notifyContentUpdated } from "@/lib/content";

interface GalleryRecord {
  id: string;
  title: string;
  before_url: string;
  after_url: string;
  caption: string;
  consent_confirmed: boolean;
  sort_order: number;
  is_published: boolean;
}

const EMPTY_CASE: Omit<GalleryRecord, "id"> = {
  title: "",
  before_url: "",
  after_url: "",
  caption: "",
  consent_confirmed: false,
  sort_order: 0,
  is_published: true,
};

export default function AdminGalleryPage() {
  const [cases, setCases] = useState<GalleryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<GalleryRecord, "id">>(EMPTY_CASE);

  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<GalleryRecord | null>(null);

  async function loadCases() {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("gallery_cases")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setCases(data || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load gallery cases.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCases();
  }, []);

  function handleOpenCreate() {
    setCurrentId(null);
    setFormData({ ...EMPTY_CASE, sort_order: cases.length + 1 });
    setBeforeFile(null);
    setAfterFile(null);
    setErrorMsg("");
    setSuccessMsg("");
    setIsEditing(true);
  }

  function handleOpenEdit(item: GalleryRecord) {
    setCurrentId(item.id);
    setFormData({
      title: item.title || "",
      before_url: item.before_url || "",
      after_url: item.after_url || "",
      caption: item.caption || "",
      consent_confirmed: item.consent_confirmed,
      sort_order: item.sort_order,
      is_published: item.is_published,
    });
    setBeforeFile(null);
    setAfterFile(null);
    setErrorMsg("");
    setSuccessMsg("");
    setIsEditing(true);
  }

  async function handleToggleConsent(item: GalleryRecord) {
    if (!supabase) return;
    try {
      const nextConsent = !item.consent_confirmed;
      const { error } = await supabase
        .from("gallery_cases")
        .update({ consent_confirmed: nextConsent, updated_at: new Date().toISOString() })
        .eq("id", item.id);

      if (error) throw error;
      setCases((list) =>
        list.map((c) => (c.id === item.id ? { ...c, consent_confirmed: nextConsent } : c)),
      );
      notifyContentUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update consent state.");
    }
  }

  async function handleTogglePublish(item: GalleryRecord) {
    if (!supabase) return;
    try {
      const nextPublish = !item.is_published;
      const { error } = await supabase
        .from("gallery_cases")
        .update({ is_published: nextPublish, updated_at: new Date().toISOString() })
        .eq("id", item.id);

      if (error) throw error;
      setCases((list) =>
        list.map((c) => (c.id === item.id ? { ...c, is_published: nextPublish } : c)),
      );
      notifyContentUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update publish state.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    if (!formData.caption.trim()) {
      setErrorMsg("A descriptive caption is required for every smile gallery case.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      let finalBeforeUrl = formData.before_url;
      let finalAfterUrl = formData.after_url;

      if (beforeFile || afterFile) {
        setUploadingImages(true);

        if (beforeFile) {
          const res = await uploadImage({
            bucket: "gallery-cases",
            file: beforeFile,
            altOrCaption: `Before — ${formData.caption}`,
          });
          if (res.error) throw new Error(res.error);
          if (res.publicUrl) finalBeforeUrl = res.publicUrl;
        }

        if (afterFile) {
          const res = await uploadImage({
            bucket: "gallery-cases",
            file: afterFile,
            altOrCaption: `After — ${formData.caption}`,
          });
          if (res.error) throw new Error(res.error);
          if (res.publicUrl) finalAfterUrl = res.publicUrl;
        }

        setUploadingImages(false);
      }

      const payload = {
        title: formData.title.trim() || formData.caption.trim(),
        before_url: finalBeforeUrl,
        after_url: finalAfterUrl,
        caption: formData.caption.trim(),
        consent_confirmed: formData.consent_confirmed,
        sort_order: Number(formData.sort_order) || 0,
        is_published: formData.is_published,
        updated_at: new Date().toISOString(),
      };

      if (currentId) {
        const { error } = await supabase.from("gallery_cases").update(payload).eq("id", currentId);
        if (error) throw error;
        setSuccessMsg("Gallery case updated successfully.");
      } else {
        const { error } = await supabase.from("gallery_cases").insert([payload]);
        if (error) throw error;
        setSuccessMsg("New gallery case created successfully.");
      }

      setIsEditing(false);
      await loadCases();
      notifyContentUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save gallery case.");
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  }

  async function handleConfirmDelete() {
    if (!supabase || !deleteTarget) return;
    try {
      const { error } = await supabase.from("gallery_cases").delete().eq("id", deleteTarget.id);
      if (error) throw error;

      setCases((list) => list.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSuccessMsg("Gallery case deleted successfully.");
      notifyContentUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete case.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-navy">Manage Smile Gallery</h1>
          <p className="text-xs text-muted">
            Upload and manage Before & After cases. Mandatory patient consent is enforced at the database level.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-pill bg-teal-deep px-4 py-2 text-xs font-semibold text-white hover:bg-teal transition-colors min-h-[38px] self-start"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Gallery Case</span>
        </button>
      </div>

      {/* Mandatory Consent Warning Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
        <div>
          <p className="font-bold text-sm">Ethical & Legal Consent Requirement</p>
          <p className="mt-1 leading-relaxed">
            Only upload photos with the patient's verified written consent. Never use stock photos or AI-generated images.
            A case will <strong>ONLY appear on the public website</strong> when both <strong>Published</strong> and{" "}
            <strong>Consent Confirmed</strong> are enabled. This condition is strictly enforced by PostgreSQL Row Level Security.
          </p>
        </div>
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
            <p className="mt-2">Loading gallery cases…</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted">
            <Sparkles className="mx-auto h-8 w-8 text-line" aria-hidden="true" />
            <p className="mt-2 font-medium text-navy">No gallery cases in the database.</p>
            <p className="mt-1">
              The public site displays the honest "Photos coming soon" message until verified consented cases are added.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-enamel font-semibold text-navy">
                <tr>
                  <th className="px-4 py-3">Before & After</th>
                  <th className="px-4 py-3">Caption</th>
                  <th className="px-4 py-3">Consent Confirmed</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {cases.map((c) => {
                  const isVisiblePublicly = c.is_published && c.consent_confirmed;
                  return (
                    <tr key={c.id} className="hover:bg-enamel/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-10 w-12 overflow-hidden rounded bg-enamel border border-line flex items-center justify-center">
                            {c.before_url ? (
                              <img src={c.before_url} alt="Before" className="h-full w-full object-cover" />
                            ) : (
                              <ImageOff className="h-4 w-4 text-line" aria-hidden="true" />
                            )}
                          </div>
                          <div className="h-10 w-12 overflow-hidden rounded bg-enamel border border-line flex items-center justify-center">
                            {c.after_url ? (
                              <img src={c.after_url} alt="After" className="h-full w-full object-cover" />
                            ) : (
                              <ImageOff className="h-4 w-4 text-line" aria-hidden="true" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-navy">
                        <p>{c.caption}</p>
                        {!isVisiblePublicly && (
                          <p className="mt-0.5 text-[0.7rem] text-amber-700 italic">
                            {!c.consent_confirmed
                              ? "Hidden: Consent not confirmed"
                              : "Hidden: Set to draft"}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleConsent(c)}
                          className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[0.7rem] font-medium transition-colors ${
                            c.consent_confirmed
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                          title="Click to toggle consent confirmation"
                        >
                          {c.consent_confirmed ? (
                            <>
                              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                              <span>Consent Confirmed</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                              <span>Consent Missing</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(c)}
                          className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[0.7rem] font-medium transition-colors ${
                            c.is_published
                              ? "bg-teal-tint text-teal-deep hover:bg-teal-tint/80"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                          title="Click to toggle published status"
                        >
                          {c.is_published ? (
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
                      <td className="px-4 py-3 text-muted">{c.sort_order}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="rounded p-1 text-muted hover:text-teal-deep hover:bg-teal-tint transition-colors"
                            aria-label={`Edit ${c.caption}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(c)}
                            className="rounded p-1 text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Delete ${c.caption}`}
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
              {currentId ? "Edit Gallery Case" : "Add New Gallery Case"}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Add Before & After photo records with patient consent.
            </p>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy">
                  Case Caption <span className="text-teal-deep">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="e.g. Porcelain veneers to restore chipped incisors"
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                />
              </div>

              {/* Photos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy">Before Photo</label>
                  {formData.before_url && (
                    <img src={formData.before_url} alt="Before Preview" className="mt-1 h-20 w-full object-cover rounded border border-line" />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setBeforeFile(e.target.files[0]);
                      }
                    }}
                    className="mt-1 text-xs text-muted file:mr-2 file:rounded-pill file:border-0 file:bg-teal-tint file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-teal-deep"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">After Photo</label>
                  {formData.after_url && (
                    <img src={formData.after_url} alt="After Preview" className="mt-1 h-20 w-full object-cover rounded border border-line" />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAfterFile(e.target.files[0]);
                      }
                    }}
                    className="mt-1 text-xs text-muted file:mr-2 file:rounded-pill file:border-0 file:bg-teal-tint file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-teal-deep"
                  />
                </div>
              </div>

              {/* Consent Confirmed Checkbox with Warning */}
              <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5">
                <div className="flex items-start gap-2.5">
                  <input
                    id="case-consent"
                    type="checkbox"
                    checked={formData.consent_confirmed}
                    onChange={(e) => setFormData({ ...formData, consent_confirmed: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-line text-teal-deep focus:ring-teal-deep"
                  />
                  <div>
                    <label htmlFor="case-consent" className="text-xs font-bold text-amber-950">
                      Verified Patient Consent Confirmed
                    </label>
                    <p className="mt-0.5 text-[0.7rem] text-amber-800 leading-normal">
                      I certify that the clinic has received explicit written consent from the patient to display these Before and After photos publicly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })}
                    className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    id="case-published"
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="h-4 w-4 rounded border-line text-teal-deep focus:ring-teal-deep"
                  />
                  <label htmlFor="case-published" className="text-xs font-medium text-navy">
                    Published
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
                  disabled={saving || uploadingImages}
                  className="inline-flex items-center gap-2 rounded-pill bg-teal-deep px-5 py-2 text-xs font-semibold text-white hover:bg-teal disabled:opacity-50 min-h-[38px]"
                >
                  {saving || uploadingImages ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      <span>{uploadingImages ? "Uploading Photos…" : "Saving…"}</span>
                    </>
                  ) : (
                    "Save Case"
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
            <h3 className="font-serif text-lg text-navy">Delete Gallery Case?</h3>
            <p className="mt-2 text-xs text-muted">
              Are you sure you want to delete this case? This action cannot be undone.
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
