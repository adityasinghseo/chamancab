"use client";
import { useState, useTransition } from "react";
import { createOffer, toggleOffer, deleteOffer, updateOfferBookingStatus } from "@/app/actions/offers";

export default function AdminOffersClient({ offers, bookings }) {
  const [tab, setTab] = useState("offers");
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-yellow-400 outline-none";

  const handleCreate = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    startTransition(async () => {
      const res = await createOffer(fd);
      if (res.error) { setMsg("Error: " + res.error); }
      else { setMsg("Offer created!"); setShowForm(false); e.target.reset(); }
      setTimeout(() => setMsg(""), 3000);
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Special Offers</h1>
          <p className="text-gray-400 text-sm mt-1">Manage return trip deals and special discounts</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-yellow-400 text-gray-900 font-black px-5 py-3 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg">
          <span className="material-symbols-outlined text-[20px]">{showForm ? "close" : "add"}</span>
          {showForm ? "Cancel" : "Add Offer"}
        </button>
      </div>

      {msg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-bold">{msg}</div>}

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="font-black text-gray-800 mb-5 text-lg">New Offer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">From City *</label>
              <input required name="fromCity" placeholder="e.g. Lucknow" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">To City *</label>
              <input required name="toCity" placeholder="e.g. Jagdishpur" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Date *</label>
              <input required name="date" placeholder="e.g. 5 April 2026" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Departure Time *</label>
              <input required name="time" placeholder="e.g. 3:30 PM" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Original Price (₹) *</label>
              <input required name="originalPrice" type="number" placeholder="900" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Offer Price (₹) *</label>
              <input required name="price" type="number" placeholder="499" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Seats Available *</label>
              <input required name="seatsAvailable" type="number" defaultValue="1" min="1" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Offer Valid Until *</label>
              <input required name="validUntil" type="datetime-local" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Description (Optional)</label>
              <input name="description" placeholder="e.g. Return trip – limited seats" className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={isPending}
            className="mt-5 bg-gray-900 text-white font-black px-8 py-3 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50">
            {isPending ? "Creating..." : "Create Offer"}
          </button>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["offers", "bookings"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl font-black text-sm capitalize transition-colors ${tab === t ? "bg-yellow-400 text-gray-900" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            {t === "offers" ? `Offers (${offers.length})` : `Bookings (${bookings.length})`}
          </button>
        ))}
      </div>

      {/* Offers List */}
      {tab === "offers" && (
        <div className="space-y-4">
          {offers.length === 0 && <div className="text-center py-16 text-gray-400 font-medium">No offers yet. Create your first one!</div>}
          {offers.map(offer => {
            const expired = new Date(offer.validUntil) < new Date();
            return (
              <div key={offer.id} className={`bg-white border rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 ${expired ? "border-red-100 opacity-60" : "border-gray-200"}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-gray-900 text-lg">{offer.fromCity} → {offer.toCity}</span>
                    {expired && <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-0.5 rounded-full">EXPIRED</span>}
                    {!expired && offer.isActive && <span className="bg-green-100 text-green-600 text-xs font-black px-2 py-0.5 rounded-full">ACTIVE</span>}
                    {!offer.isActive && !expired && <span className="bg-gray-100 text-gray-500 text-xs font-black px-2 py-0.5 rounded-full">PAUSED</span>}
                  </div>
                  <p className="text-gray-500 text-sm">{offer.date} · {offer.time} · <b>{offer.seatsAvailable} seats</b></p>
                  {offer.description && <p className="text-gray-400 text-xs mt-1 italic">{offer.description}</p>}
                  <p className="text-sm mt-2"><span className="line-through text-gray-300">₹{offer.originalPrice}</span> <span className="text-yellow-600 font-black text-lg ml-2">₹{offer.price}</span></p>
                  <p className="text-xs text-gray-400 mt-1">Valid until: {new Date(offer.validUntil).toLocaleString("en-IN")} · {offer._count.bookings} booking(s)</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startTransition(() => toggleOffer(offer.id, !offer.isActive))}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${offer.isActive ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                    {offer.isActive ? "Pause" : "Activate"}
                  </button>
                  <button onClick={() => { if(confirm("Delete this offer?")) startTransition(() => deleteOffer(offer.id)); }}
                    className="px-4 py-2 rounded-xl font-bold text-sm bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bookings List */}
      {tab === "bookings" && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {bookings.length === 0 && <div className="text-center py-16 text-gray-400">No offer bookings yet.</div>}
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Customer", "Route", "Date/Time", "Seats", "Status", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-800">{b.customerName}</p>
                    <p className="text-gray-400 text-xs">{b.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-700">{b.offer.fromCity} → {b.offer.toCity}</td>
                  <td className="px-4 py-3 text-gray-500">{b.offer.date} {b.offer.time}</td>
                  <td className="px-4 py-3 font-bold text-center">{b.seatsBooked}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-black ${b.status === "CONFIRMED" ? "bg-green-100 text-green-700" : b.status === "CANCELLED" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={b.status} onChange={e => startTransition(() => updateOfferBookingStatus(b.id, e.target.value))}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer">
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
