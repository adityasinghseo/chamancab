"use client";

import { useState, useTransition } from "react";
import { updateBookingStatus, updatePaymentStatus } from "@/app/actions/admin";

const STATUS_CONFIG = {
  PENDING:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900/50",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-900/50",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-900/50",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-900/50",
};

const TRIP_LABELS = { ONE_WAY: "One Way", ROUND_TRIP: "Round Trip", RENTAL: "Rental" };

export default function AdminBookingsClient({ initialBookings }) {
  const [filter, setFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isTransitioning, startTransition] = useTransition();

  const filteredBookings = filter === "ALL" 
     ? initialBookings 
     : initialBookings.filter(b => b.status === filter);

  const handleStatusChange = async (id, newStatus) => {
    startTransition(async () => {
      await updateBookingStatus(id, newStatus);
      window.location.reload();
    });
  };

  const handlePaymentStatusChange = async (id, newStatus) => {
    startTransition(async () => {
      await updatePaymentStatus(id, newStatus);
      window.location.reload();
    });
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const formatTime = (t) => t; // already HH:MM format

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Reservations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total {initialBookings.length} bookings received across all channels.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-fit border border-gray-200 dark:border-white/10">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
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
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">ID / Ref</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Trip / Route</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Vehicle</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
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
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">#{b.referenceId}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{formatDate(b.createdAt)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-[10px] uppercase">
                          {b.customerName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{b.customerName}</p>
                          <p className="text-[10px] text-gray-400">{b.customerPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <span className={`${
                            b.tripType === 'ONE_WAY' ? 'bg-primary/20 text-primary border-primary/20' : 
                            b.tripType === 'RENTAL' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                            'bg-green-500/10 text-green-500 border-green-500/20'
                          } text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border`}>
                            {TRIP_LABELS[b.tripType]}
                          </span>
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{b.pickupTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <p className="text-sm font-black text-gray-900 dark:text-white whitespace-nowrap">{b.fromCity?.name ?? '—'}</p>
                          {b.toCity && (
                            <>
                              <span className="material-symbols-outlined text-gray-300 dark:text-white/10 text-[14px]">arrow_right_alt</span>
                              <p className="text-sm font-black text-gray-900 dark:text-white whitespace-nowrap">{b.toCity.name}</p>
                            </>
                          )}
                          {b.package && (
                            <p className="text-[10px] text-gray-400 whitespace-nowrap">({b.package.name})</p>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400">{formatDate(b.pickupDate)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-gray-400">directions_car</span>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300">{b.car?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-gray-900 dark:text-white">₹{b.amount.toLocaleString("en-IN")}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${b.paymentStatus === 'PAID' ? 'text-green-500' : 'text-yellow-500'}`}>
                        {b.paymentStatus}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${STATUS_CONFIG[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                         <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-lg border border-gray-100 dark:border-white/10 text-gray-500 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <div className="relative group/actions">
                           <button className="p-1.5 rounded-lg border border-gray-100 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1a1a1a] shadow-xl rounded-xl border border-gray-100 dark:border-white/10 py-1 opacity-0 pointer-events-none group-hover/actions:opacity-100 group-hover/actions:pointer-events-auto transition-all z-20">
                            <button onClick={() => handleStatusChange(b.id, 'CONFIRMED')} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-green-500 hover:bg-gray-50 dark:hover:bg-white/5">Mark Confirmed</button>
                            <button onClick={() => handleStatusChange(b.id, 'COMPLETED')} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:bg-gray-50 dark:hover:bg-white/5">Mark Completed</button>
                            <button onClick={() => handleStatusChange(b.id, 'CANCELLED')} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-gray-50 dark:hover:bg-white/5">Cancel Trip</button>
                            <div className="border-t border-gray-100 dark:border-white/10 my-1"></div>
                            <button onClick={() => handlePaymentStatusChange(b.id, 'PAID')} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-500 hover:bg-gray-50 dark:hover:bg-white/5">Mark Paid</button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="px-2 py-1 bg-primary text-[#181611] rounded text-[10px] font-black uppercase tracking-widest">Ref: #{selectedBooking.referenceId}</span>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">Booking Overview</h2>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-0 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-white/10">
                {/* Section: Trip info */}
                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Trip Information</p>
                    <div className="space-y-4">
                       <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">local_taxi</span>
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
                            {selectedBooking.fromCity?.name} → {selectedBooking.toCity?.name || selectedBooking.package?.name || 'Local'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">schedule</span>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pickup Schedule</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{formatDate(selectedBooking.pickupDate)} @ {selectedBooking.pickupTime}</p>
                        </div>
                      </div>
                       <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">pin_drop</span>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Locations</p>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Hub: {selectedBooking.pickupLocation?.landmark || 'Hub'}</p>
                          <p className="text-xs text-gray-500 mt-1">Status: {selectedBooking.pickupLocation?.isOperational ? 'Operational' : 'Restricted'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Customer & Payment */}
                <div className="p-6 space-y-6">
                   <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Customer & Payment</p>
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
                          <p className="text-xs text-gray-500">{selectedBooking.customerEmail || 'No email provided'}</p>
                        </div>
                      </div>
                       <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">payments</span>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                          <p className="text-xl font-black text-primary">₹{selectedBooking.amount.toLocaleString("en-IN")}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Method: {selectedBooking.paymentMethod}</p>
                        </div>
                      </div>
                       {selectedBooking.specialRequests && (
                         <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-gray-400 text-[20px]">edit_note</span>
                          <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-xl flex-1">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 text-[8px]">Remarks / Requests</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 italic">"{selectedBooking.specialRequests}"</p>
                          </div>
                        </div>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] flex flex-wrap gap-2 justify-end">
               <button onClick={() => setSelectedBooking(null)} className="px-6 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Close</button>
               <button disabled={isTransitioning} onClick={() => handleStatusChange(selectedBooking.id, 'CANCELLED')} className="px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all">Cancel Trip</button>
               <button disabled={isTransitioning} onClick={() => handleStatusChange(selectedBooking.id, 'CONFIRMED')} className="px-6 py-2.5 bg-primary text-[#181611] font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all">Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
