import { useState, useEffect } from "react";
import {
  Save,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Phone,
  MessageCircle,
  Mail,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  updateCachedClinicSettings,
  type ClinicSettingsData,
} from "@/lib/content";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState<ClinicSettingsData>({
    name: "",
    shortName: "",
    tagline: "",
    phoneDisplay: "",
    phoneHref: "",
    whatsappNumber: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    mapsLink: "",
    directionsLink: "",
    instagram: "",
    facebook: "",
  });
  const [recordId, setRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("clinic_settings")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setRecordId(data.id);
          setFormData({
            name: data.clinic_name || "",
            shortName: data.clinic_name || "",
            tagline: "Patient-focused dental care",
            phoneDisplay: data.phone_display || "",
            phoneHref: data.phone_href || "",
            whatsappNumber: data.whatsapp_number || "",
            email: data.email || "",
            addressLine1: data.address_line1 || "",
            addressLine2: data.address_line2 || "",
            mapsLink: data.maps_link || "",
            directionsLink: data.directions_link || "",
            instagram: data.instagram_link || "",
            facebook: data.facebook_link || "",
          });
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to load clinic settings.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  function handleChange(field: keyof ClinicSettingsData, val: string) {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setIsDirty(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        clinic_name: formData.name.trim(),
        phone_display: formData.phoneDisplay.trim(),
        phone_href: formData.phoneHref.trim() || (formData.phoneDisplay ? `tel:${formData.phoneDisplay.replace(/[^\d+]/g, "")}` : ""),
        whatsapp_number: formData.whatsappNumber.replace(/[^\d]/g, ""),
        email: formData.email.trim(),
        address_line1: formData.addressLine1.trim(),
        address_line2: formData.addressLine2.trim(),
        maps_link: formData.mapsLink.trim(),
        directions_link: formData.directionsLink.trim(),
        instagram_link: formData.instagram.trim(),
        facebook_link: formData.facebook.trim(),
        updated_at: new Date().toISOString(),
      };

      if (recordId) {
        const { error } = await supabase.from("clinic_settings").update(payload).eq("id", recordId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("clinic_settings").insert([payload]).select("id").single();
        if (error) throw error;
        if (data) setRecordId(data.id);
      }

      setSuccessMsg("Clinic settings updated successfully.");
      setIsDirty(false);
      updateCachedClinicSettings({
        name: payload.clinic_name,
        shortName: payload.clinic_name,
        tagline: formData.tagline || "Patient-focused dental care",
        phoneDisplay: payload.phone_display,
        phoneHref: payload.phone_href,
        whatsappNumber: payload.whatsapp_number,
        email: payload.email,
        addressLine1: payload.address_line1,
        addressLine2: payload.address_line2,
        mapsLink: payload.maps_link,
        directionsLink: payload.directions_link,
        instagram: payload.instagram_link,
        facebook: payload.facebook_link,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-navy">Manage Clinic Settings & Contact</h1>
          <p className="text-xs text-muted">
            Configure global contact information, WhatsApp numbers, addresses, and map coordinates.
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
          <p className="mt-2">Loading settings…</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Clinic Identity */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg text-navy border-b border-line pb-3">Clinic Identity</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-navy">Legal / Display Clinic Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Apex Dental Practice"
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy">Short / Brand Name</label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => handleChange("shortName", e.target.value)}
                  placeholder="e.g. Apex Dental"
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg text-navy border-b border-line pb-3">Contact Channels</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-navy">Phone Display Number</label>
                <div className="mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted" aria-hidden="true" />
                  <input
                    type="text"
                    value={formData.phoneDisplay}
                    onChange={(e) => handleChange("phoneDisplay", e.target.value)}
                    placeholder="e.g. +44 20 7946 0912"
                    className="w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy">WhatsApp Number</label>
                <div className="mt-1 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-muted" aria-hidden="true" />
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                    placeholder="e.g. 447700900123 (digits only, no +)"
                    className="w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                  />
                </div>
                <p className="mt-1 text-[0.7rem] text-muted">International format, digits only, no + symbol.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy">Enquiry Email</label>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted" aria-hidden="true" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="enquiries@clinic.example"
                    className="w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Physical Address & Maps */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg text-navy border-b border-line pb-3">Physical Address & Maps</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-navy">Address Line 1</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => handleChange("addressLine1", e.target.value)}
                  placeholder="e.g. 123 High Street"
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy">City, Postal Code</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => handleChange("addressLine2", e.target.value)}
                  placeholder="e.g. Cityville, AB12 3CD"
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="block text-xs font-semibold text-navy">Google Maps URL</label>
                <input
                  type="url"
                  value={formData.mapsLink}
                  onChange={(e) => handleChange("mapsLink", e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy">Directions URL</label>
                <input
                  type="url"
                  value={formData.directionsLink}
                  onChange={(e) => handleChange("directionsLink", e.target.value)}
                  placeholder="https://www.google.com/maps/dir/?api=1&destination=..."
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
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
                  <span>Saving Settings…</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
