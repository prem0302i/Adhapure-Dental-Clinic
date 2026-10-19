import { useState, useEffect } from "react";
import {
  Inbox,
  Search,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  Trash2,
  RefreshCw,
  X,
  MessageSquare,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAdminAuth } from "@/context/AdminAuthContext";

export type EnquiryStatus = "new" | "contacted" | "confirmed" | "cancelled";

export interface EnquiryRecord {
  id: string;
  patient_name: string;
  phone: string;
  email: string | null;
  preferred_date: string;
  preferred_time_range: string;
  treatment_id: string | null;
  treatment_name: string;
  message: string | null;
  consent_given: boolean;
  status: EnquiryStatus;
  confirmed_date: string | null;
  confirmed_time: string | null;
  staff_note: string | null;
  source: string | null;
  confirmed_by: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminEnquiriesPage() {
  const { user } = useAdminAuth();
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EnquiryStatus>("all");

  // Selected for detail modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);
  const [detailStatus, setDetailStatus] = useState<EnquiryStatus>("new");
  const [detailConfirmedDate, setDetailConfirmedDate] = useState("");
  const [detailConfirmedTime, setDetailConfirmedTime] = useState("");
  const [detailStaffNote, setDetailStaffNote] = useState("");
  const [savingDetail, setSavingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<EnquiryRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadEnquiries() {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMsg(`Failed to load enquiries: ${error.message}`);
      } else {
        setEnquiries((data as EnquiryRecord[]) || []);
        setErrorMsg("");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while loading enquiries.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadEnquiries();
  }, []);

  function handleOpenDetail(enquiry: EnquiryRecord) {
    setSelectedEnquiry(enquiry);
    setDetailStatus(enquiry.status);
    setDetailConfirmedDate(enquiry.confirmed_date || "");
    setDetailConfirmedTime(enquiry.confirmed_time || "");
    setDetailStaffNote(enquiry.staff_note || "");
    setDetailError("");
  }

  function handleCloseDetail() {
    setSelectedEnquiry(null);
    setDetailError("");
  }

  async function handleSaveDetail(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEnquiry || !supabase) return;

    setSavingDetail(true);
    setDetailError("");

    try {
      const updates = {
        status: detailStatus,
        confirmed_date: detailStatus === "confirmed" ? detailConfirmedDate || null : null,
        confirmed_time: detailStatus === "confirmed" ? detailConfirmedTime || null : null,
        staff_note: detailStaffNote.trim() || null,
        confirmed_by: detailStatus === "confirmed" ? user?.id || null : null,
      };

      const { data, error } = await supabase
        .from("enquiries")
        .update(updates)
        .eq("id", selectedEnquiry.id)
        .select()
        .single();

      if (error) {
        setDetailError(`Failed to update enquiry: ${error.message}`);
        setSavingDetail(false);
        return;
      }

      // Update in state
      setEnquiries((prev) =>
        prev.map((item) => (item.id === selectedEnquiry.id ? (data as EnquiryRecord) : item))
      );
      setSelectedEnquiry(data as EnquiryRecord);
      setSuccessMsg("Enquiry updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
      handleCloseDetail();
    } catch {
      setDetailError("An unexpected error occurred while saving.");
    } finally {
      setSavingDetail(false);
    }
  }

  async function handleDelete(enquiry: EnquiryRecord) {
    if (!supabase) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from("enquiries")
        .delete()
        .eq("id", enquiry.id);

      if (error) {
        setErrorMsg(`Failed to delete enquiry: ${error.message}`);
      } else {
        setEnquiries((prev) => prev.filter((item) => item.id !== enquiry.id));
        setSuccessMsg("Enquiry deleted.");
        setTimeout(() => setSuccessMsg(""), 3500);
        if (selectedEnquiry?.id === enquiry.id) {
          handleCloseDetail();
        }
      }
    } catch {
      setErrorMsg("An unexpected error occurred during deletion.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  // Filtered list
  const filtered = enquiries.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.patient_name.toLowerCase().includes(q);
      const matchPhone = item.phone.toLowerCase().includes(q);
      const matchEmail = (item.email || "").toLowerCase().includes(q);
      const matchTreatment = item.treatment_name.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchTreatment;
    }
    return true;
  });

  const countNew = enquiries.filter((e) => e.status === "new").length;
  const countContacted = enquiries.filter((e) => e.status === "contacted").length;
  const countConfirmed = enquiries.filter((e) => e.status === "confirmed").length;
  const countCancelled = enquiries.filter((e) => e.status === "cancelled").length;

  const statusColors: Record<EnquiryStatus, { bg: string; text: string; label: string }> = {
    new: { bg: "bg-amber-100", text: "text-amber-800", label: "New" },
    contacted: { bg: "bg-blue-100", text: "text-blue-800", label: "Contacted" },
    confirmed: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Confirmed" },
    cancelled: { bg: "bg-slate-100", text: "text-slate-700", label: "Cancelled" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy">Patient Enquiries</h1>
            {countNew > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white animate-pulse">
                {countNew} new
              </span>
            )}
          </div>
          <p className="text-sm text-muted mt-1">
            Review online appointment requests, manage status, and record staff confirmation.
          </p>
        </div>
        <button
          onClick={() => {
            setRefreshing(true);
            loadEnquiries();
          }}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-navy bg-white border border-line rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-line space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search by patient name, phone, email, or treatment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-deep"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === "all"
                  ? "bg-navy text-white border-navy"
                  : "bg-slate-50 text-slate-700 border-line hover:bg-slate-100"
              }`}
            >
              All ({enquiries.length})
            </button>
            <button
              onClick={() => setStatusFilter("new")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === "new"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
              }`}
            >
              New ({countNew})
            </button>
            <button
              onClick={() => setStatusFilter("contacted")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === "contacted"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
              }`}
            >
              Contacted ({countContacted})
            </button>
            <button
              onClick={() => setStatusFilter("confirmed")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === "confirmed"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              Confirmed ({countConfirmed})
            </button>
            <button
              onClick={() => setStatusFilter("cancelled")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === "cancelled"
                  ? "bg-slate-700 text-white border-slate-700"
                  : "bg-slate-100 text-slate-700 border-line hover:bg-slate-200"
              }`}
            >
              Cancelled ({countCancelled})
            </button>
          </div>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-xl border border-line shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-teal-deep" />
            Loading enquiries...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted space-y-2">
            <Inbox className="h-8 w-8 mx-auto text-slate-300" />
            <p className="font-medium text-navy">No enquiries found</p>
            <p className="text-xs">
              {enquiries.length === 0
                ? "When patients submit the appointment form on the website, their enquiries will appear here."
                : "No enquiries match your current search or status filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-line text-xs font-semibold text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Treatment</th>
                  <th className="py-3 px-4">Requested Date</th>
                  <th className="py-3 px-4">Received</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((item) => {
                  const badge = statusColors[item.status];
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetail(item)}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-navy">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted shrink-0" />
                          <span>{item.patient_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1 font-mono">
                            <Phone className="h-3 w-3 text-muted" />
                            {item.phone}
                          </div>
                          {item.email && (
                            <div className="flex items-center gap-1 text-muted">
                              <Mail className="h-3 w-3 text-muted" />
                              {item.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-medium">{item.treatment_name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted" />
                          <span>{item.preferred_date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted mt-0.5">
                          <Clock className="h-3 w-3 text-muted" />
                          <span>{item.preferred_time_range}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted text-xs whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(item)}
                            className="px-2.5 py-1 text-xs font-medium text-teal-deep bg-teal-50 hover:bg-teal-100 rounded transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="Delete enquiry"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* DETAIL MODAL */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-line my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-line pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-navy">{selectedEnquiry.patient_name}</h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      statusColors[selectedEnquiry.status].bg
                    } ${statusColors[selectedEnquiry.status].text}`}
                  >
                    {statusColors[selectedEnquiry.status].label}
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">
                  Enquiry ID: <span className="font-mono">{selectedEnquiry.id}</span> • Received:{" "}
                  {new Date(selectedEnquiry.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                {detailError}
              </div>
            )}

            {/* Patient Request Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-line mb-5 text-sm">
              <div>
                <span className="text-xs font-semibold text-muted uppercase">Phone</span>
                <div className="mt-0.5 flex items-center gap-2">
                  <a
                    href={`tel:${selectedEnquiry.phone}`}
                    className="text-teal-deep font-medium hover:underline flex items-center gap-1"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {selectedEnquiry.phone}
                  </a>
                  <a
                    href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium hover:bg-emerald-200 flex items-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" /> WhatsApp
                  </a>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted uppercase">Email</span>
                <p className="mt-0.5 text-navy">
                  {selectedEnquiry.email ? (
                    <a
                      href={`mailto:${selectedEnquiry.email}`}
                      className="text-teal-deep hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {selectedEnquiry.email}
                    </a>
                  ) : (
                    <span className="text-muted italic">Not provided</span>
                  )}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted uppercase">Requested Treatment</span>
                <p className="mt-0.5 font-medium text-navy">{selectedEnquiry.treatment_name}</p>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted uppercase">Requested Date & Time</span>
                <p className="mt-0.5 text-navy">
                  {selectedEnquiry.preferred_date} ({selectedEnquiry.preferred_time_range})
                </p>
              </div>

              {selectedEnquiry.message && (
                <div className="sm:col-span-2 pt-2 border-t border-line">
                  <span className="text-xs font-semibold text-muted uppercase">Patient Message</span>
                  <p className="mt-1 text-slate-700 bg-white p-3 rounded border border-line whitespace-pre-wrap">
                    {selectedEnquiry.message}
                  </p>
                </div>
              )}
            </div>

            {/* Staff Management Form */}
            <form onSubmit={handleSaveDetail} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">
                  Update Enquiry Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["new", "contacted", "confirmed", "cancelled"] as EnquiryStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setDetailStatus(st)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold capitalize transition-all ${
                          detailStatus === st
                            ? `${statusColors[st].bg} ${statusColors[st].text} border-current ring-2 ring-offset-1 ring-teal-deep`
                            : "bg-white border-line text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {statusColors[st].label}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Confirmation Details if status is confirmed */}
              {detailStatus === "confirmed" && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2 text-xs text-emerald-900 font-medium">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span>
                        Confirming records staff confirmation in the clinic system only.
                      </span>
                      <p className="text-emerald-800 text-xs font-normal mt-0.5">
                        No automatic email or message is sent to the patient. Please contact the
                        patient directly via telephone or WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-emerald-900 mb-1">
                        Confirmed Appointment Date
                      </label>
                      <input
                        type="date"
                        value={detailConfirmedDate}
                        onChange={(e) => setDetailConfirmedDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded text-sm text-navy focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-900 mb-1">
                        Confirmed Appointment Time
                      </label>
                      <input
                        type="time"
                        value={detailConfirmedTime}
                        onChange={(e) => setDetailConfirmedTime(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded text-sm text-navy focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Internal Staff Notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-navy">
                    Internal Staff Notes
                  </label>
                  <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                    ⚠️ Do not enter medical details
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Record administrative notes only (e.g. 'Contacted via phone, patient preferred morning slot'). Do not record medical histories, conditions or diagnoses."
                  value={detailStaffNote}
                  onChange={(e) => setDetailStaffNote(e.target.value)}
                  className="w-full p-3 border border-line rounded-lg text-sm text-navy placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal-deep"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  disabled={savingDetail}
                  className="px-4 py-2 border border-line text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={savingDetail}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-teal-deep text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {savingDetail && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-line animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-navy">Delete Enquiry</h3>
            </div>
            <p className="text-sm text-muted mb-6">
              Are you sure you want to delete the enquiry from{" "}
              <strong className="text-navy">{deleteTarget.patient_name}</strong>? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-line rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTarget)}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
