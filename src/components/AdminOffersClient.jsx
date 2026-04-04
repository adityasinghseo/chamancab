"use client";
import { useState, useTransition } from "react";
import { createOffer, toggleOffer, deleteOffer, updateOfferBookingStatus } from "@/app/actions/offers";

export default function AdminOffersClient({ offers, bookings }) {
  const [tab, setTab] = useState("offers");
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  // Style helpers — clearly visible in both light and dark admin themes
  const labelClass = "text-xs font-black uppercase tracking-widest mb-1.5 block text-yellow-500";
  const inputClass =
    "w-full bg-[#0f0f0f] border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:border-yellow-400 outline-none placeholder-gray-500 [color-scheme:dark]";

  const handleCreate = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    startTransition(async () => {
      const res = await createOffer(fd);
      if (res.error) { setMsg("❌ Error: " + res.error); }
      else { setMsg("✅ Offer created!"); setShowForm(false); e.target.reset(); }
      setTimeout(() => setMsg(""), 4000);
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">🏷️ Special Offers</h1>
          <p className="text-gray-400 text-sm mt-1">Manage return trip deals and special discounts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-yellow-400 text-gray-900 font-black px-5 py-3 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg"
        >
          <span className="material-symbols-outlined text-[20px]">{showForm ? "close" : "add"}</span>
          {showForm ? "Cancel" : "Add Offer"}
        </button>
      </div>

      {/* Toast Message */}
      {msg && (
        <div className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl text-yellow-300 text-sm font-bold">
          {msg}
        </div>
      )}

      {/* ── CREATE FORM ── */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 mb-8"
        >
          <h2 className="font-black text-white mb-6 text-lg border-b border-gray-700 pb-4">
            New Offer Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className={labelClass}>From City *</label>
              <input required name="fromCity" placeholder="e.g. Lucknow" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>To City *</label>
              <input required name="toCity" placeholder="e.g. Jagdishpur" className={inputClass} />
            </div>

            {/* Date picker */}
            <div>
              <label className={labelClass}>Departure Date *</label>
              <input required name="date" type="date" className={inputClass} />
            </div>

            {/* Time picker */}
            <div>
              <label className={labelClass}>Departure Time *</label>
              <input required name="time" type="time" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Original Price (₹) *</label>
              <input required name="originalPrice" type="number" placeholder="900" min="0" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Offer Price (₹) *</label>
              <input required name="price" type="number" placeholder="499" min="0" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Seats Available *</label>
              <input required name="seatsAvailable" type="number" defaultValue="1" min="1" className={inputClass} />
            </div>

            {/* Offer validity datetime */}
            <div>
              <label className={labelClass}>Offer Valid Until *</label>
              <input required name="validUntil" type="datetime-local" className={inputClass} />
              <p className="text-gray-500 text-xs mt-1">Offer auto-disappears after this date &amp; time</p>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Description (Optional)</label>
              <input name="description" placeholder="e.g. Return trip – limited seats available" className={inputClass} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-6 bg-yellow-400 text-gray-900 font-black px-8 py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Offer"}
          </button>
        </form>
      )}

      {/* ── TABS ── */}
      <div className="flex gap-2 mb-6">
        {["offers", "bookings"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl font-black text-sm capitalize transition-colors ${
              tab === t ? "bg-yellow-400 text-gray-900" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t === "offers" ? `Offers (${offers.length})` : `Bookings (${bookings.length})`}
          </button>
        ))}
      </div>

      {/* ── OFFERS LIST ── */}
      {tab === "offers" && (
        <div className="space-y-4">
          {offers.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <span className="material-symbols-outlined text-5xl block mb-3">local_offer</span>
              No offers yet. Create your first one!
            </div>
          )}
          {offers.map(offer => {
            const expired = new Date(offer.validUntil) < new Date();
            const discount = Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100);
            return (
              <div
                key={offer.id}
                className={`bg-[#1a1a1a] border rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 ${
                  expired ? "border-red-900/40 opacity-60" : "border-gray-700"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-black text-white text-xl">
                      {offer.fromCity} → {offer.toCity}
                    </span>
                    {expired && (
                      <span className="bg-red-900/40 text-red-400 text-xs font-black px-2 py-0.5 rounded-full">EXPIRED</span>
                    )}
                    {!expired && offer.isActive && (
                      <span className="bg-green-900/40 text-green-400 text-xs font-black px-2 py-0.5 rounded-full">ACTIVE</span>
                    )}
                    {!expired && !offer.isActive && (
                      <span className="bg-gray-800 text-gray-400 text-xs font-black px-2 py-0.5 rounded-full">PAUSED</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    📅 {offer.date} &nbsp;·&nbsp; 🕐 {offer.time} &nbsp;·&nbsp; 💺 <b className="text-white">{offer.seatsAvailable} seats</b>
                  </p>
                  {offer.description && (
                    <p className="text-gray-500 text-xs mt-1 italic">{offer.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-gray-600 line-through text-sm">₹{offer.originalPrice}</span>
                    <span className="text-yellow-400 font-black text-2xl">₹{offer.price}</span>
                    <span className="bg-green-900/40 text-green-400 text-xs font-black px-2 py-1 rounded-lg">
                      {discount}% OFF
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Valid until: {new Date(offer.validUntil).toLocaleString("en-IN")} &nbsp;·&nbsp; {offer._count.bookings} booking(s)
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startTransition(() => toggleOffer(offer.id, !offer.isActive))}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors border ${
                      offer.isActive
                        ? "border-gray-700 bg-white/5 text-gray-300 hover:bg-white/10"
                        : "border-green-700 bg-green-900/20 text-green-400 hover:bg-green-900/40"
                    }`}
                  >
                    {offer.isActive ? "Pause" : "Activate"}
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this offer?")) startTransition(() => deleteOffer(offer.id)); }}
                    className="px-4 py-2 rounded-xl font-bold text-sm bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/40 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── BOOKINGS TABLE ── */}
      {tab === "bookings" && (
        <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl overflow-hidden">
          {bookings.length === 0 && (
            <div className="text-center py-16 text-gray-500">No offer bookings yet.</div>
          )}
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr>
                {["Customer", "Route", "Date / Time", "Seats", "Status", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-black text-yellow-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="font-bold text-white">{b.customerName}</p>
                    <p className="text-gray-500 text-xs">{b.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-300">{b.offer.fromCity} → {b.offer.toCity}</td>
                  <td className="px-4 py-3 text-gray-400">{b.offer.date} {b.offer.time}</td>
                  <td className="px-4 py-3 font-bold text-white text-center">{b.seatsBooked}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-black ${
                      b.status === "CONFIRMED" ? "bg-green-900/40 text-green-400"
                      : b.status === "CANCELLED" ? "bg-red-900/40 text-red-400"
                      : "bg-yellow-900/40 text-yellow-400"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      onChange={e => startTransition(() => updateOfferBookingStatus(b.id, e.target.value))}
                      className="text-xs bg-[#0f0f0f] border border-gray-700 text-white rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer [color-scheme:dark]"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirm</option>
                      <option value="CANCELLED">Cancel</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
