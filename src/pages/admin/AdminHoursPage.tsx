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
import { updateCachedOpeningHours } from "@/lib/content";
import type { HoursEntry } from "@/types";

interface HourRow {
  id?: string;
  day: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  note: string;
  sort_order: number;
}

const DEFAULT_DAYS: HourRow[] = [
  { day: "Monday – Friday", open_time: "", close_time: "", is_closed: false, note: "[TO BE CONFIRMED]", sort_order: 1 },
  { day: "Saturday", open_time: "", close_time: "", is_closed: false, note: "[TO BE CONFIRMED]", sort_order: 2 },
  { day: "Sunday", open_time: "", close_time: "", is_closed: true, note: "Closed", sort_order: 3 },
];

export default function AdminHoursPage() {
  const [hoursList, setHoursList] = useState<HourRow[]>(DEFAULT_DAYS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    async function loadHours() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("opening_hours")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setHoursList(data);
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to load opening hours.");
      } finally {
        setLoading(false);
      }
    }
    loadHours();
  }, []);

  function handleRowChange(index: number, field: keyof HourRow, value: string | boolean | number) {
    const next = [...hoursList];
    next[index] = { ...next[index], [field]: value };
    setHoursList(next);
    setIsDirty(true);
  }

  function handleAddDay() {
    setHoursList((prev) => [
      ...prev,
      {
        day: "Custom Day",
        open_time: "",
        close_time: "",
        is_closed: false,
        note: "[TO BE CONFIRMED]",
        sort_order: prev.length + 1,
      },
    ]);
    setIsDirty(true);
  }

  function handleRemoveDay(index: number) {
    setHoursList((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Upsert opening hours
      for (let i = 0; i < hoursList.length; i++) {
        const row = hoursList[i];
        const payload = {
          day: row.day.trim(),
          open_time: row.open_time.trim(),
          close_time: row.close_time.trim(),
          is_closed: row.is_closed,
          note: row.note.trim(),
          sort_order: i + 1,
          updated_at: new Date().toISOString(),
        };

        if (row.id) {
          const { error } = await supabase.from("opening_hours").update(payload).eq("id", row.id);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.from("opening_hours").insert([payload]).select("id").single();
          if (error) throw error;
          if (data) row.id = data.id;
        }
      }

      setSuccessMsg("Opening hours schedule saved successfully.");
      setIsDirty(false);
      const updatedHours: HoursEntry[] = hoursList.map((h) => ({
        day: h.day.trim(),
        hours: h.is_closed
          ? "Closed"
          : h.open_time && h.close_time
          ? `${h.open_time.trim()} – ${h.close_time.trim()}`
          : h.note.trim() || "Closed",
      }));
      updateCachedOpeningHours(updatedHours);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save hours.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-navy">Manage Opening Hours</h1>
          <p className="text-xs text-muted">
            Configure clinic opening and closing hours for each day of the week.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddDay}
          className="inline-flex items-center gap-1.5 rounded-pill bg-teal-tint px-4 py-2 text-xs font-semibold text-teal-deep hover:bg-teal hover:text-white transition-colors min-h-[38px] self-start"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Custom Row</span>
        </button>
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
          <p className="mt-2">Loading hours…</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-4">
            <div className="space-y-3">
              {hoursList.map((row, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-xl border border-line bg-enamel/30 p-4 sm:flex-row sm:items-center"
                >
                  <div className="w-full sm:w-48">
                    <label className="block text-[0.7rem] font-semibold text-navy">Day / Period</label>
                    <input
                      type="text"
                      value={row.day}
                      onChange={(e) => handleRowChange(index, "day", e.target.value)}
                      placeholder="e.g. Monday – Friday"
                      className="mt-0.5 w-full rounded border border-line bg-white px-2.5 py-1.5 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id={`closed-${index}`}
                      type="checkbox"
                      checked={row.is_closed}
                      onChange={(e) => handleRowChange(index, "is_closed", e.target.checked)}
                      className="h-4 w-4 rounded border-line text-teal-deep focus:ring-teal-deep"
                    />
                    <label htmlFor={`closed-${index}`} className="text-xs font-medium text-navy whitespace-nowrap">
                      Closed all day
                    </label>
                  </div>

                  {!row.is_closed ? (
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1">
                        <label className="block text-[0.7rem] font-semibold text-navy">Open Time</label>
                        <input
                          type="text"
                          value={row.open_time}
                          onChange={(e) => handleRowChange(index, "open_time", e.target.value)}
                          placeholder="8:30 am"
                          className="mt-0.5 w-full rounded border border-line bg-white px-2.5 py-1.5 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                        />
                      </div>
                      <span className="mt-4 text-xs text-muted">–</span>
                      <div className="flex-1">
                        <label className="block text-[0.7rem] font-semibold text-navy">Close Time</label>
                        <input
                          type="text"
                          value={row.close_time}
                          onChange={(e) => handleRowChange(index, "close_time", e.target.value)}
                          placeholder="6:00 pm"
                          className="mt-0.5 w-full rounded border border-line bg-white px-2.5 py-1.5 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <label className="block text-[0.7rem] font-semibold text-navy">Note</label>
                      <input
                        type="text"
                        value={row.note}
                        onChange={(e) => handleRowChange(index, "note", e.target.value)}
                        placeholder="Closed"
                        className="mt-0.5 w-full rounded border border-line bg-white px-2.5 py-1.5 text-xs text-navy focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveDay(index)}
                    className="self-end sm:self-center rounded p-1.5 text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={`Remove ${row.day}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
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
                  <span>Saving Schedule…</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  <span>Save Opening Hours</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
