"use client";

import { useState, useTransition } from "react";
import { updateBookingStatus, updatePaymentStatus, createOfflineBooking } from "@/app/actions/admin";
import { updateBookingPayment } from "@/app/actions/booking";

// ─── Status configs ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900/50",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-900/50",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-900/50",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-900/50",
};

const PAY_STATUS_CONFIG = {
  PENDING:      { label: "Pending",        color: "text-yellow-500" },
  PARTIAL_PAID: { label: "Partial Paid",   color: "text-blue-400"  },
  PAID_FULL:    { label: "Paid (Full)",    color: "text-green-500" },
  PAID_OFFLINE: { label: "Paid (Offline)", color: "text-green-500" },
  PAID:         { label: "Paid",           color: "text-green-500" }, // legacy
  FAILED:       { label: "Failed",         color: "text-red-500"   },
};

const TRIP_LABELS = { ONE_WAY: "One Way", ROUND_TRIP: "Round Trip", RENTAL: "Rental" };

export default function AdminBookingsClient({ initialBookings, cars = [], cities = [], packages = [], drivers = [], selfDriveCars = [] }) {
  const [filter, setFilter]               = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentModal, setPaymentModal]   = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isTransitioning, startTransition] = useTransition();

  // Payment update state
  const [manualPayStatus, setManualPayStatus] = useState("PAID_OFFLINE");
  const [manualAmount, setManualAmount]   = useState("");
  const [paySuccess, setPaySuccess]       = useState(false);

  // Offline booking creation
  const [createPending, startCreate] = useTransition();
  const [createDone, setCreateDone] = useState(false);
  const [offlineTripType, setOfflineTripType] = useState("ONE_WAY");

  async function handleCreateOfflineBooking(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    startCreate(async () => {
      await createOfflineBooking(fd);
      setCreateDone(true);
      setTimeout(() => { setCreateDone(false); setShowCreateModal(false); window.location.reload(); }, 1200);
    });
  }

  const filteredBookings = filter === "ALL"
    ? initialBookings
    : initialBookings.filter(b => b.status === filter);

  const handleStatusChange = async (id, newStatus, isSelfDrive, isDriverOnly) => {
    startTransition(async () => {
      await updateBookingStatus(id, newStatus, isSelfDrive, isDriverOnly);
      window.location.reload();
    });
  };

  const handlePaymentStatusChange = async (id, newStatus, isSelfDrive, isDriverOnly) => {
    startTransition(async () => {
      await updatePaymentStatus(id, newStatus, isSelfDrive, isDriverOnly);
      window.location.reload();
    });
  };

  // Admin manual payment update
  async function handleManualPaymentUpdate() {
    if (!paymentModal) return;
    const fd = new FormData();
    fd.append("bookingId", paymentModal.id);
    fd.append("additionalPaid", parseFloat(manualAmount) || 0);
    fd.append("paymentStatus", manualPayStatus);
    await updateBookingPayment(fd);
    setPaySuccess(true);
    setTimeout(() => { setPaySuccess(false); setPaymentModal(null); window.location.reload(); }, 1500);
  }

  // WhatsApp link builder
  function openWhatsApp(booking) {
    const remaining = Math.max(0, (booking.totalFare || booking.amount) - (booking.paidAmount || 0));
    const payLink   = `https://chamancab.com/pay/${booking.id}`;
    const msg = `Hello ${booking.customerName},\n\nYour Chaman Cab booking is confirmed! 🚗\n\nBooking ID: ${booking.referenceId}\nRemaining Amount: ₹${remaining.toLocaleString("en-IN")}\n\nPlease complete your payment here:\n${payLink}\n\nThank you for choosing Chaman Cab! 🙏`;
    const phone = (booking.customerPhone || "").replace(/\D/g, "");
    const waPhone = phone.startsWith("91") ? phone : `91${phone}`;
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const truncRoute = (str, len = 25) => str && str.length > len ? str.slice(0, len) + "…" : (str || "—");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Reservations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total {initialBookings.length} bookings received across all channels.</p>
        </div>
        <button
          onClick={() => { setShowCreateModal(true); setCreateDone(false); }}
          className="flex items-center gap-2 bg-primary text-[#181611] font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Offline Booking
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-fit border border-gray-200 dark:border-white/10 overflow-x-auto custom-scrollbar">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === s
                ? "bg-white dark:bg-surface-dark text-[#181611] dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-white/10"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {s === "ALL" ? "All Trips" : s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm transition-colors overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1060px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                <th className="px-5 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">ID / Ref</th>
                <th className="px-5 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-5 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Trip / Route</th>
                <th className="px-5 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Car / Driver</th>
                <th className="px-5 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                <th className="px-5 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-5 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-400 text-sm font-bold italic">
                    No bookings found matching filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const totalFare   = b.totalFare || b.amount || 0;
                  const paidAmount  = b.paidAmount || 0;
                  const remaining   = Math.max(0, totalFare - paidAmount);
                  const payStatus   = PAY_STATUS_CONFIG[b.paymentStatus] || PAY_STATUS_CONFIG.PENDING;
                  const hasRemaining = !b.isSelfDrive && !b.isDriverOnly && remaining > 0;

                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                      {/* Ref */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">#{b.referenceId}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{formatDate(b.createdAt)}</p>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-[10px] uppercase shrink-0">
                            {b.customerName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white">{b.customerName}</p>
                            <p className="text-[10px] text-gray-400">{b.customerPhone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Trip */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                              b.tripType === 'ONE_WAY'    ? 'bg-primary/20 text-primary border-primary/20' :
                              b.tripType === 'RENTAL'     ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              b.tripType === 'SELF_DRIVE' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                              b.tripType === 'DRIVER'     ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                              'bg-green-500/10 text-green-500 border-green-500/20'
                            }`}>
                              {b.tripType === 'SELF_DRIVE' ? "Self Drive" : b.tripType === 'DRIVER' ? "Driver Hire" : TRIP_LABELS[b.tripType] || b.tripType}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 max-w-[320px]">
                            {(b.isSelfDrive || b.isDriverOnly) ? (
                              <p className="text-sm font-black text-gray-900 dark:text-white truncate" title={b.pickupLocationText}>
                                {truncRoute(b.pickupLocationText)}
                              </p>
                            ) : (
                              <>
                                <p
                                  className="text-sm font-black text-gray-900 dark:text-white whitespace-nowrap"
                                  title={b.fromCity ? undefined : b.pickupAddress}
                                >
                                  {b.fromCity?.name || truncRoute(b.pickupAddress)}
                                </p>
                                {(b.toCity || b.dropAddress) && (
                                  <>
                                    <span className="material-symbols-outlined text-gray-300 dark:text-white/10 text-[14px] shrink-0">arrow_right_alt</span>
                                    <p
                                      className="text-sm font-black text-gray-900 dark:text-white whitespace-nowrap"
                                      title={b.toCity ? undefined : b.dropAddress}
                                    >
                                      {b.toCity?.name || truncRoute(b.dropAddress)}
                                    </p>
                                  </>
                                )}
                                {b.package && <p className="text-[10px] text-gray-400 whitespace-nowrap">({b.package.name})</p>}
                              </>
                            )}
                          </div>
                          <div className="mt-1 flex flex-col gap-0.5 whitespace-nowrap">
                            <p className="text-[10px] text-gray-400">Pickup: {formatDate(b.pickupDate)}, {b.pickupTime}</p>
                            {b.tripType === "ROUND_TRIP" && b.returnDate && (
                              <p className="text-[10px] text-gray-400">Return: {formatDate(b.returnDate)}, {b.returnTime}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Car */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-gray-400">
                              {b.isSelfDrive ? 'key' : b.isDriverOnly ? 'person' : 'directions_car'}
                            </span>
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                              {b.isDriverOnly ? b.driver?.name : b.car?.name}
                            </p>
                          </div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest ml-6">
                            {b.isDriverOnly ? "Professional Driver" : b.car?.type}
                          </p>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="px-5 py-4 min-w-[130px]">
                        <p className="text-sm font-black text-gray-900 dark:text-white">₹{totalFare.toLocaleString("en-IN")}</p>
                        {!b.isSelfDrive && !b.isDriverOnly && (
                          <>
                            {paidAmount > 0 && (
                              <p className="text-[9px] text-green-500 font-bold">Paid: ₹{paidAmount.toLocaleString("en-IN")}</p>
                            )}
                            {remaining > 0 && (
                              <p className="text-[9px] text-yellow-500 font-bold">Due: ₹{remaining.toLocaleString("en-IN")}</p>
                            )}
                          </>
                        )}
                        <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${payStatus.color}`}>
                          {payStatus.label}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING}`}>
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* View detail */}
                          <button
                            onClick={() => setSelectedBooking(b)}
                            title="View Details"
                            className="p-1.5 rounded-lg border border-gray-100 dark:border-white/10 text-gray-500 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>

                          {/* WhatsApp payment link — only for bookings with remaining balance */}
                          {hasRemaining && (
                            <button
                              onClick={() => openWhatsApp(b)}
                              title="Send Payment Link via WhatsApp"
                              className="p-1.5 rounded-lg border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                            </button>
                          )}

                          {/* Manual payment update — only for non-self-drive standard bookings */}
                          {!b.isSelfDrive && !b.isDriverOnly && (
                            <button
                              onClick={() => { setPaymentModal(b); setManualAmount(""); setManualPayStatus("PAID_OFFLINE"); setPaySuccess(false); }}
                              title="Update Payment"
                              className="p-1.5 rounded-lg border border-gray-100 dark:border-white/10 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">payments</span>
                            </button>
                          )}

                          {/* Status dropdown */}
                          <div className="relative group/actions">
                            <button className="p-1.5 rounded-lg border border-gray-100 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                              <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#1a1a1a] shadow-xl rounded-xl border border-gray-100 dark:border-white/10 py-1 opacity-0 pointer-events-none group-hover/actions:opacity-100 group-hover/actions:pointer-events-auto transition-all z-20">
                              <button onClick={() => handleStatusChange(b.id, 'CONFIRMED', b.isSelfDrive, b.isDriverOnly)} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-green-500 hover:bg-gray-50 dark:hover:bg-white/5">✓ Mark Confirmed</button>
                              <button onClick={() => handleStatusChange(b.id, 'COMPLETED', b.isSelfDrive, b.isDriverOnly)} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:bg-gray-50 dark:hover:bg-white/5">✓ Mark Completed</button>
                              <button onClick={() => handleStatusChange(b.id, 'CANCELLED', b.isSelfDrive, b.isDriverOnly)} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-gray-50 dark:hover:bg-white/5">✗ Cancel Trip</button>
                              <div className="border-t border-gray-100 dark:border-white/10 my-1" />
                              <button onClick={() => handlePaymentStatusChange(b.id, 'PAID_FULL', b.isSelfDrive, b.isDriverOnly)} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-500 hover:bg-gray-50 dark:hover:bg-white/5">₹ Mark Paid (Full)</button>
                              <button onClick={() => handlePaymentStatusChange(b.id, 'PAID_OFFLINE', b.isSelfDrive, b.isDriverOnly)} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-500 hover:bg-gray-50 dark:hover:bg-white/5">₹ Mark Paid (Cash)</button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create Offline Booking Modal ──────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-black/20 shrink-0">
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Offline / Walk-in</p>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">New Booking</h2>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {createDone ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-green-400 block mb-3">check_circle</span>
                <p className="text-gray-900 dark:text-white font-black text-lg">Booking Created!</p>
                <p className="text-gray-400 text-sm mt-1">Refreshing list...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateOfflineBooking} className="overflow-y-auto p-6 space-y-5">
                {/* Customer Info */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-white/10 pb-2">Customer Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Full Name *</label>
                      <input name="customerName" required placeholder="e.g. Rahul Sharma" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone *</label>
                      <input name="customerPhone" required placeholder="10-digit mobile" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email (optional)</label>
                      <input name="customerEmail" type="email" placeholder="customer@email.com" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-white/10 pb-2">Trip Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Booking Type *</label>
                      <select name="tripType" value={offlineTripType} onChange={e => setOfflineTripType(e.target.value)} required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none">
                        <option value="ONE_WAY">One Way</option>
                        <option value="ROUND_TRIP">Round Trip</option>
                        <option value="RENTAL">Local Rental</option>
                        <option value="SELF_DRIVE">Self Drive</option>
                        <option value="DRIVER">Hire Driver</option>
                      </select>
                    </div>

                    {/* Shared Date & Time for all types */}
                    <div className="col-span-2 sm:col-span-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Date *</label>
                        <input name="pickupDate" type="date" required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Time *</label>
                        <input name="pickupTime" type="time" required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>

                    {/* 🚗 ONE WAY / 🔁 ROUND TRIP */}
                    {(offlineTripType === "ONE_WAY" || offlineTripType === "ROUND_TRIP") && (
                      <>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">From City (Manual) *</label>
                          <input name="fromCityText" required placeholder="e.g. Lucknow" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">To City (Manual) *</label>
                          <input name="toCityText" required placeholder="e.g. Ayodhya" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Vehicle *</label>
                          <select name="carId" required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none">
                            <option value="">Select standard car...</option>
                            {cars.map(c => (
                              <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Exact Pickup Location</label>
                          <input name="pickupAddress" placeholder="e.g. Charbagh Station Gate 2" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                        </div>
                        {offlineTripType === "ROUND_TRIP" && (
                          <div className="col-span-2 grid grid-cols-2 gap-2 mt-2 border-t border-gray-100 dark:border-white/10 pt-4">
                            <div>
                               <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Return Date</label>
                               <input name="returnDate" type="date" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Return Time</label>
                               <input name="returnTime" type="time" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* 🏙 LOCAL RENTAL */}
                    {offlineTripType === "RENTAL" && (
                      <>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">City *</label>
                          <input name="fromCityText" required placeholder="e.g. Lucknow" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Package *</label>
                          <select name="packageId" required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none">
                            <option value="">Select package...</option>
                            {packages.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.hours}h / {p.kilometers}km)</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Vehicle *</label>
                          <select name="carId" required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none">
                            <option value="">Select standard car...</option>
                            {cars.map(c => (
                              <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Pickup Location</label>
                          <input name="pickupAddress" placeholder="e.g. Hotel Taj" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                        </div>
                      </>
                    )}

                    {/* 🚘 SELF DRIVE */}
                    {offlineTripType === "SELF_DRIVE" && (
                      <>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Branch / Pickup</label>
                          <input name="pickupAddress" defaultValue="Chaman Cab Branch" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Self Drive Car *</label>
                          <select name="selfDriveCarId" required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none shadow-sm shadow-purple-500/10 border-purple-200">
                            <option value="">Select Self Drive vehicle...</option>
                            {selfDriveCars.map(sc => (
                              <option key={sc.id} value={sc.id}>{sc.name} ({sc.transmission})</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-2 mt-2 border-t border-gray-100 dark:border-white/10 pt-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Return Date *</label>
                            <input name="returnDate" type="date" required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Return Time *</label>
                            <input name="returnTime" type="time" required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                          </div>
                        </div>
                        <div className="col-span-2">
                           <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Deposit Amount (₹) *</label>
                           <input name="deposit" type="number" required defaultValue="5000" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                        </div>
                      </>
                    )}

                    {/* 👨‍✈️ HIRE DRIVER */}
                    {offlineTripType === "DRIVER" && (
                      <>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Driver *</label>
                          <select name="driverId" required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none shadow-sm shadow-indigo-500/10 border-indigo-200">
                            <option value="">Select professional driver...</option>
                            {drivers.map(d => (
                              <option key={d.id} value={d.id}>{d.name} ({d.dutyHours} - ₹{d.costPerHour}/hr)</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Total Hours Needed *</label>
                          <input name="totalHours" type="number" step="0.5" required placeholder="e.g. 8" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                        </div>
                        <div className="col-span-2">
                           <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Meet Location *</label>
                           <input name="pickupAddress" required placeholder="e.g. Home Address" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-white/10 pb-2">Payment Info</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        {offlineTripType === "SELF_DRIVE" ? "Estimated Rent (₹) *" : "Total Fare (₹) *"}
                      </label>
                      <input name="totalFare" type="number" required placeholder="e.g. 1800" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                    </div>
                    {offlineTripType !== "SELF_DRIVE" && (
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Amount Collected (₹)</label>
                        <input name="paidAmount" type="number" placeholder="0" defaultValue="0" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                      </div>
                    )}
                    {offlineTripType !== "SELF_DRIVE" && (
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Payment Status</label>
                        <select name="paymentStatus" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none">
                          <option value="PENDING">Pending</option>
                          <option value="PAID_OFFLINE">Paid (Cash / Offline)</option>
                          <option value="PAID_FULL">Paid (Full)</option>
                          <option value="PARTIAL_PAID">Partial Paid</option>
                        </select>
                      </div>
                    )}
                    {offlineTripType !== "SELF_DRIVE" && (
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Payment Method</label>
                        <select name="paymentMethod" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none">
                          <option value="OFFLINE">Offline / Cash</option>
                          <option value="UPI">UPI</option>
                          <option value="RAZORPAY">Online (Razorpay)</option>
                          <option value="PAY_ON_PICKUP">Pay on Pickup</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Special Requests / Notes</label>
                  <textarea name="specialRequests" rows={2} placeholder="Any instructions or customer requests..." className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Admin Notes (Internal Only)</label>
                  <textarea name="adminNotes" rows={2} placeholder="Internal notes visible only to admin..." className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-primary" />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2 pb-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-black text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all">Cancel</button>
                  <button type="submit" disabled={createPending} className="flex-1 py-3 rounded-xl bg-primary text-[#181611] font-black text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {createPending ? (
                      <><span className="w-4 h-4 border-2 border-[#181611]/30 border-t-[#181611] rounded-full animate-spin" /> Creating...</>
                    ) : (
                      <><span className="material-symbols-outlined text-sm">check_circle</span> Confirm Booking</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Manual Payment Update Modal ────────────────────────────────────── */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-black/20">
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Payment Control</p>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">#{paymentModal.referenceId}</h2>
              </div>
              <button onClick={() => setPaymentModal(null)} className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {paySuccess ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-5xl text-green-400 block mb-3">check_circle</span>
                <p className="text-gray-900 dark:text-white font-black text-lg">Payment Updated!</p>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Current balances */}
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Fare</span>
                    <span className="font-black text-gray-900 dark:text-white">₹{(paymentModal.totalFare || paymentModal.amount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Already Paid</span>
                    <span className="font-bold text-green-500">₹{(paymentModal.paidAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-white/10 pt-2">
                    <span className="text-gray-500">Remaining</span>
                    <span className="font-black text-yellow-500">
                      ₹{Math.max(0, (paymentModal.totalFare || paymentModal.amount || 0) - (paymentModal.paidAmount || 0)).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Set payment status */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Set Payment Status</label>
                  <select
                    value={manualPayStatus}
                    onChange={e => setManualPayStatus(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                  >
                    <option value="PAID_OFFLINE">Paid (Offline / Cash)</option>
                    <option value="PAID_FULL">Paid (Full Online)</option>
                    <option value="PARTIAL_PAID">Partial Paid</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>

                {/* Amount collected */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Amount Collected Now (₹)</label>
                  <input
                    type="number"
                    value={manualAmount}
                    onChange={e => setManualAmount(e.target.value)}
                    placeholder="e.g. 1300"
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">This amount will be added to any previously paid amount.</p>
                </div>

                {/* WhatsApp link shortcut */}
                <button
                  type="button"
                  onClick={() => openWhatsApp(paymentModal)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-black hover:bg-green-500/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  Send Payment Link on WhatsApp
                </button>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setPaymentModal(null)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-black text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all">Cancel</button>
                  <button onClick={handleManualPaymentUpdate} disabled={isTransitioning} className="flex-1 py-3 rounded-xl bg-primary text-[#181611] font-black text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-60">
                    Save Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Booking Detail Modal ───────────────────────────────────────────── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-black/20">
              <div>
                <span className="px-2 py-1 bg-primary text-[#181611] rounded text-[10px] font-black uppercase tracking-widest">Ref: #{selectedBooking.referenceId}</span>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">Booking Overview <span className="text-sm text-gray-400 font-bold ml-2">({selectedBooking.isSelfDrive ? "Self Drive" : selectedBooking.isDriverOnly ? "Hire Driver" : "Standard Cab"})</span></h2>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/10 p-2 rounded-xl transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-0 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-white/10">
                {/* Trip Info */}
                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-white/10 pb-2">Trip Information</p>
                    <div className="space-y-4">
                      {selectedBooking.isSelfDrive ? (
                        <>
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-purple-400 text-[20px]">car_rental</span>
                            <div>
                              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Vehicle</p>
                              <p className="text-sm font-black text-gray-900 dark:text-white">{selectedBooking.car?.name}</p>
                              <p className="text-xs font-bold text-purple-500">Deposit: ₹{selectedBooking.deposit}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-gray-400 text-[20px]">my_location</span>
                            <div>
                              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pickup Address</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedBooking.pickupLocationText}</p>
                            </div>
                          </div>
                        </>
                      ) : selectedBooking.isDriverOnly ? (
                        <>
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-indigo-400 text-[20px]">person</span>
                            <div>
                              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Assigned Driver</p>
                              <p className="text-sm font-black text-gray-900 dark:text-white">{selectedBooking.driver?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-gray-400 text-[20px]">my_location</span>
                            <div>
                              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Report Address</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedBooking.pickupLocationText}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary text-[20px]">local_taxi</span>
                            <div>
                              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Type</p>
                              <p className="text-sm font-black text-gray-900 dark:text-white">{TRIP_LABELS[selectedBooking.tripType]} ({selectedBooking.tripType})</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-gray-400 text-[20px]">route</span>
                            <div>
                              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Route</p>
                              <p className="text-sm font-black text-gray-900 dark:text-white">
                                {selectedBooking.fromCity?.name || selectedBooking.pickupAddress || '—'} → {selectedBooking.toCity?.name || selectedBooking.dropAddress || selectedBooking.package?.name || 'Local'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-gray-400 text-[20px]">schedule</span>
                            <div>
                              {selectedBooking.tripType === "ROUND_TRIP" ? (
                                <>
                                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pickup Schedule</p>
                                  <p className="text-sm font-black text-gray-900 dark:text-white mb-2">{formatDate(selectedBooking.pickupDate)} @ {selectedBooking.pickupTime}</p>
                                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Return Schedule</p>
                                  <p className="text-sm font-black text-gray-900 dark:text-white">{selectedBooking.returnDate ? formatDate(selectedBooking.returnDate) : "—"} @ {selectedBooking.returnTime || "—"}</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pickup Schedule</p>
                                  <p className="text-sm font-black text-gray-900 dark:text-white">{formatDate(selectedBooking.pickupDate)} @ {selectedBooking.pickupTime}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer & Payment */}
                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-white/10 pb-2">Customer & Payment</p>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">person</span>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Passenger Name</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{selectedBooking.customerName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">call</span>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Contact</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{selectedBooking.customerPhone}</p>
                          <p className="text-xs text-gray-500">{selectedBooking.customerEmail || 'No email'}</p>
                        </div>
                      </div>

                      {/* Payment Summary card */}
                      {!selectedBooking.isSelfDrive && !selectedBooking.isDriverOnly && (
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-gray-400 text-[20px]">payments</span>
                          <div className="bg-gray-100 dark:bg-white/5 rounded-xl p-3 border border-gray-200 dark:border-white/10 w-full space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Summary</p>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Total Fare</span>
                              <span className="font-black text-primary text-lg">₹{(selectedBooking.totalFare || selectedBooking.amount || 0).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-xs border-t border-gray-200 dark:border-white/10 pt-2">
                              <span className="text-gray-500">Paid</span>
                              <span className="font-bold text-green-500">₹{(selectedBooking.paidAmount || 0).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Remaining</span>
                              <span className="font-bold text-yellow-500">
                                ₹{Math.max(0, (selectedBooking.totalFare || selectedBooking.amount || 0) - (selectedBooking.paidAmount || 0)).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-gray-200 dark:border-white/10 pt-2">
                              <span className="text-gray-500">Method</span>
                              <span className="text-gray-900 dark:text-white font-bold">{selectedBooking.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Status</span>
                              <span className={`font-black uppercase ${(PAY_STATUS_CONFIG[selectedBooking.paymentStatus] || PAY_STATUS_CONFIG.PENDING).color}`}>
                                {(PAY_STATUS_CONFIG[selectedBooking.paymentStatus] || PAY_STATUS_CONFIG.PENDING).label}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBooking.specialRequests && !selectedBooking.isSelfDrive && !selectedBooking.isDriverOnly && (
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-gray-400 text-[20px]">edit_note</span>
                          <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-xl flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Special Requests</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 italic">"{selectedBooking.specialRequests}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] flex flex-wrap gap-3 justify-end rounded-b-3xl">
              <button onClick={() => setSelectedBooking(null)} className="px-5 py-2.5 bg-white dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all">Close</button>

              {/* WhatsApp shortcut in modal */}
              {!selectedBooking.isSelfDrive && !selectedBooking.isDriverOnly && Math.max(0, (selectedBooking.totalFare || selectedBooking.amount || 0) - (selectedBooking.paidAmount || 0)) > 0 && (
                <button
                  onClick={() => openWhatsApp(selectedBooking)}
                  className="px-5 py-2.5 bg-green-500/10 border border-green-500/20 text-green-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-green-500/20 transition-all flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  Send Pay Link
                </button>
              )}

              <button disabled={isTransitioning} onClick={() => handleStatusChange(selectedBooking.id, 'CANCELLED', selectedBooking.isSelfDrive, selectedBooking.isDriverOnly)} className="px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all">Cancel Trip</button>
              <button disabled={isTransitioning} onClick={() => handleStatusChange(selectedBooking.id, 'CONFIRMED', selectedBooking.isSelfDrive, selectedBooking.isDriverOnly)} className="px-5 py-2.5 bg-primary text-[#181611] font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all">Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
