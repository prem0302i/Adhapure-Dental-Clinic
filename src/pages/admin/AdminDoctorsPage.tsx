import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  UserRound,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { uploadImage } from "@/lib/storage";
import { notifyContentUpdated } from "@/lib/content";

interface DoctorRecord {
  id: string;
  name: string;
  qualifications: string;
  specialisation: string;
  experience: string;
  bio: string;
  photo_url: string;
  sort_order: number;
  is_published: boolean;
}

const EMPTY_DOCTOR: Omit<DoctorRecord, "id"> = {
  name: "",
  qualifications: "",
  specialisation: "",
  experience: "",
  bio: "",
  photo_url: "",
  sort_order: 0,
  is_published: true,
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Edit / Create modal state
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<DoctorRecord, "id">>(EMPTY_DOCTOR);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DoctorRecord | null>(null);

  async function loadDoctors() {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setDoctors(data || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDoctors();
  }, []);

  function handleOpenCreate() {
    setCurrentId(null);
    setFormData({ ...EMPTY_DOCTOR, sort_order: doctors.length + 1 });
    setSelectedFile(null);
    setErrorMsg("");
    setSuccessMsg("");
    setIsEditing(true);
  }

  function handleOpenEdit(doc: DoctorRecord) {
    setCurrentId(doc.id);
    setFormData({
      name: doc.name,
      qualifications: doc.qualifications || "",
      specialisation: doc.specialisation || "",
      experience: doc.experience || "",
      bio: doc.bio || "",
      photo_url: doc.photo_url || "",
      sort_order: doc.sort_order,
      is_published: doc.is_published,
    });
    setSelectedFile(null);
    setErrorMsg("");
    setSuccessMsg("");
    setIsEditing(true);
  }

  async function handleTogglePublish(doc: DoctorRecord) {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("doctors")
        .update({ is_published: !doc.is_published, updated_at: new Date().toISOString() })
        .eq("id", doc.id);

      if (error) throw error;
      setDoctors((list) =>
        list.map((d) => (d.id === doc.id ? { ...d, is_published: !d.is_published } : d)),
      );
      notifyContentUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update publish state.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    if (!formData.name.trim()) {
      setErrorMsg("Doctor name is required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      let finalPhotoUrl = formData.photo_url;

      // Handle image upload if a file was selected
      if (selectedFile) {
        setUploadingImage(true);
        const uploadRes = await uploadImage({
          bucket: "doctor-photos",
          file: selectedFile,
          altOrCaption: `Photo of ${formData.name}`,
        });
        setUploadingImage(false);

        if (uploadRes.error) {
          throw new Error(uploadRes.error);
        }
        if (uploadRes.publicUrl) {
          finalPhotoUrl = uploadRes.publicUrl;
        }
      }

      const payload = {
        name: formData.name.trim(),
        qualifications: formData.qualifications.trim(),
        specialisation: formData.specialisation.trim(),
        experience: formData.experience.trim(),
        bio: formData.bio.trim(),
        photo_url: finalPhotoUrl,
        sort_order: Number(formData.sort_order) || 0,
        is_published: formData.is_published,
        updated_at: new Date().toISOString(),
      };

      if (currentId) {
        const { error } = await supabase.from("doctors").update(payload).eq("id", currentId);
        if (error) throw error;
        setSuccessMsg("Doctor profile updated successfully.");
      } else {
        const { error } = await supabase.from("doctors").insert([payload]);
        if (error) throw error;
        setSuccessMsg("New doctor profile created successfully.");
      }

      setIsEditing(false);
      await loadDoctors();
      notifyContentUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save doctor.");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  }

  async function handleConfirmDelete() {
    if (!supabase || !deleteTarget) return;
    try {
      const { error } = await supabase.from("doctors").delete().eq("id", deleteTarget.id);
      if (error) throw error;

      setDoctors((list) => list.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSuccessMsg("Doctor deleted successfully.");
      notifyContentUpdated();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete doctor.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-navy">Manage Doctors</h1>
          <p className="text-xs text-muted">
            Configure dentist profile cards, qualifications, credentials and photos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-pill bg-teal-deep px-4 py-2 text-xs font-semibold text-white hover:bg-teal transition-colors min-h-[38px] self-start"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add New Doctor</span>
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
            <p className="mt-2">Loading doctors…</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted">
            <Users className="mx-auto h-8 w-8 text-line" aria-hidden="true" />
            <p className="mt-2 font-medium text-navy">No doctors in the database.</p>
            <p className="mt-1">
              The public site will display default placeholders until you add doctors or run the seed script.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-enamel font-semibold text-navy">
                <tr>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Name & Specialisation</th>
                  <th className="px-4 py-3">Qualifications</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-enamel/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-teal-tint flex items-center justify-center text-teal-deep">
                        {doc.photo_url ? (
                          <img src={doc.photo_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <UserRound className="h-5 w-5" aria-hidden="true" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">{doc.name}</p>
                      <p className="text-muted">{doc.specialisation || "General"}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{doc.qualifications || "—"}</td>
                    <td className="px-4 py-3 text-muted">{doc.sort_order}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(doc)}
                        className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[0.7rem] font-medium transition-colors ${
                          doc.is_published
                            ? "bg-teal-tint text-teal-deep hover:bg-teal-tint/80"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                        title="Click to toggle published status"
                      >
                        {doc.is_published ? (
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
                          onClick={() => handleOpenEdit(doc)}
                          className="rounded p-1 text-muted hover:text-teal-deep hover:bg-teal-tint transition-colors"
                          aria-label={`Edit ${doc.name}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(doc)}
                          className="rounded p-1 text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label={`Delete ${doc.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              {currentId ? "Edit Doctor Profile" : "Add New Doctor"}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Remember: Never fabricate doctor credentials or awards. Placeholders are fine during development.
            </p>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy">
                  Doctor Full Name <span className="text-teal-deep">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Priya Sharma"
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy">Qualifications</label>
                  <input
                    type="text"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    placeholder="e.g. BDS, MDS (Periodontics)"
                    className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy">Specialisation</label>
                  <input
                    type="text"
                    value={formData.specialisation}
                    onChange={(e) => setFormData({ ...formData, specialisation: e.target.value })}
                    placeholder="e.g. Cosmetic Dentistry"
                    className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy">Experience (Years / Note)</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g. 10 or To be confirmed"
                    className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy">Display Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })}
                    className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy">Short Biography</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Summary of background, patient approach and focus areas…"
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                />
              </div>

              {/* Photo Upload or URL */}
              <div>
                <label className="block text-xs font-semibold text-navy">Doctor Portrait Photo</label>
                <div className="mt-1 flex items-center gap-3">
                  {formData.photo_url && (
                    <img
                      src={formData.photo_url}
                      alt="Preview"
                      className="h-12 w-12 rounded-full object-cover border border-line"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="text-xs text-muted file:mr-2 file:rounded-pill file:border-0 file:bg-teal-tint file:px-3 file:py-1 file:text-xs file:font-semibold file:text-teal-deep hover:file:bg-teal hover:file:text-white"
                  />
                </div>
                <p className="mt-1 text-[0.7rem] text-muted">
                  Max size: 5 MB. Formats: JPEG, PNG, WebP. An alt text label is automatically created.
                </p>
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="doctor-published"
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 rounded border-line text-teal-deep focus:ring-teal-deep"
                />
                <label htmlFor="doctor-published" className="text-xs font-medium text-navy">
                  Publish on website (publicly visible)
                </label>
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
                  disabled={saving || uploadingImage}
                  className="inline-flex items-center gap-2 rounded-pill bg-teal-deep px-5 py-2 text-xs font-semibold text-white hover:bg-teal disabled:opacity-50 min-h-[38px]"
                >
                  {saving || uploadingImage ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      <span>{uploadingImage ? "Uploading Photo…" : "Saving…"}</span>
                    </>
                  ) : (
                    "Save Doctor"
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
            <h3 className="font-serif text-lg text-navy">Delete Doctor Profile?</h3>
            <p className="mt-2 text-xs text-muted">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
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
