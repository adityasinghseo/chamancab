"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const tabConfig = [
  { id: "ONE_WAY",    label: "One Way",   icon: "arrow_right_alt" },
  { id: "RENTAL",     label: "Local Rental", icon: "schedule" },
  { id: "ROUND_TRIP", label: "Round Trip",   icon: "loop" },
];

import LocationAutocomplete from "./LocationAutocomplete";
import Footer from "./Footer";
import Header from "./Header";

export default function HomeClient({ cities, packages, reviewsData }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ONE_WAY");

  // Form state
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  
  // Rental specific
  const [fromCityId, setFromCityId] = useState("");
  const [packageId, setPackageId] = useState("");
  
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!pickupDate || !pickupTime) return;

    if (activeTab === "RENTAL") {
      if (!fromCityId || !packageId || !fromLocation) {
        alert("Please select City, Package, and Pickup Location.");
        return;
      }
      const params = new URLSearchParams({
        type: activeTab,
        fromCityId,
        packageId,
        fromName: fromLocation.name,
        fromLat: fromLocation.lat,
        fromLng: fromLocation.lng,
        pickupDate,
        pickupTime,
      });
      router.push(`/search?${params.toString()}`);
    } else {
      // ONE_WAY and ROUND_TRIP uses dynamic map locations
      if (!fromLocation || !toLocation) {
        alert("Please select valid Pickup and Drop locations from the suggestions dropdown!");
        return;
      }
      if (activeTab === "ROUND_TRIP") {
        if (!returnDate || !returnTime) {
          alert("Please select Return Date and Time for Round Trip.");
          return;
        }
        if (new Date(returnDate) < new Date(pickupDate)) {
          alert("Return Date must be same or after Pickup Date.");
          return;
        }
      }
      const params = new URLSearchParams({
        type: activeTab,
        fromName: fromLocation.name,
        fromLat: fromLocation.lat,
        fromLng: fromLocation.lng,
        toName: toLocation.name,
        toLat: toLocation.lat,
        toLng: toLocation.lng,
        pickupDate,
        pickupTime,
        ...(activeTab === "ROUND_TRIP" && { returnDate, returnTime }),
      });
      router.push(`/search?${params.toString()}`);
    }
  };

  const inputClass =
    "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all text-sm";
  const labelClass = "block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5";
  const selectClass = inputClass + " appearance-none cursor-pointer";

  return (
    <div className="min-h-screen bg-[#181611] font-display">
      <Header activePage="" />
      {/* ── HERO SECTION ── */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#181611] via-[#2a2410] to-[#181611]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f2b90d' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-6">

          {/* Hero text */}
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Book Your Cab
              <span className="text-primary block">Anytime, Anywhere</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Reliable outstation, rental & round trip cab services across Uttar Pradesh and India
            </p>
          </div>

          {/* ── BOOKING FORM CARD ── */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-1.5 mb-6 bg-black/20 rounded-xl p-1">
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setToLocation(null); setFromLocation(null); setFromCityId(""); setPackageId(""); }}
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-1 sm:px-3 rounded-lg font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-[#181611] shadow-lg"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] sm:text-lg leading-none">{tab.icon}</span>
                  <span className="text-[11px] sm:text-sm leading-tight text-center">{tab.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Rental uses City Dropdown, others use Live Map Location */}
                {activeTab === "RENTAL" ? (
                  <>
                    <div>
                      <label className={labelClass}>
                        <span className="material-symbols-outlined text-xs mr-1 align-middle">location_city</span>
                        Select City
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={fromCityId}
                          onChange={(e) => setFromCityId(e.target.value)}
                          className={selectClass}
                        >
                          <option value="">Choose city...</option>
                          {cities.map((c) => (
                            <option key={c.id} value={c.id} className="bg-[#2a2410] text-white">{c.name}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none text-lg">expand_more</span>
                      </div>
                    </div>
                    
                    <LocationAutocomplete 
                      label="Pickup Location" 
                      placeholder="Enter pickup address, landmark..." 
                      icon="my_location" 
                      onSelect={(loc) => setFromLocation(loc)} 
                    />
                  </>
                ) : (
                  <>
                    <LocationAutocomplete 
                      label="Pickup Location" 
                      placeholder="Enter pickup address, landmark or city..." 
                      icon="my_location" 
                      onSelect={(loc) => setFromLocation(loc)} 
                    />
                    <LocationAutocomplete 
                      label={activeTab === "ROUND_TRIP" ? "Destinations" : "Drop Location"} 
                      placeholder="Enter destination address or city..." 
                      icon="flag" 
                      onSelect={(loc) => setToLocation(loc)} 
                    />
                  </>
                )}

                {/* Round Trip — return location same so just show a note */}
                {activeTab === "ROUND_TRIP" && (
                  <div className="md:col-span-2 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                    <span className="material-symbols-outlined text-primary text-lg">loop</span>
                    <p className="text-primary text-xs font-medium">Driver will return back to your starting point.</p>
                  </div>
                )}

                {/* Package (Rental) */}
                {activeTab === "RENTAL" && (
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <span className="material-symbols-outlined text-xs mr-1 align-middle">style</span>
                      Select Package
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {packages.map((pkg) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setPackageId(pkg.id)}
                          className={`border rounded-xl p-3 text-center transition-all ${
                            packageId === pkg.id
                              ? "border-primary bg-primary/20 text-primary"
                              : "border-white/20 text-white/70 hover:border-white/40 hover:bg-white/10"
                          }`}
                        >
                          <p className="font-bold text-sm">{pkg.name}</p>
                          <p className="text-xs opacity-70 mt-0.5">{pkg.hours}hrs · {pkg.kilometers}km</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className={labelClass}>
                    <span className="material-symbols-outlined text-xs mr-1 align-middle">calendar_today</span>
                    Booking Date
                  </label>
                  <input
                    required
                    type="date"
                    value={pickupDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className={inputClass}
                    suppressHydrationWarning
                  />
                </div>

                {/* Time */}
                <div>
                  <label className={labelClass}>
                    <span className="material-symbols-outlined text-xs mr-1 align-middle">schedule</span>
                    Pickup Time
                  </label>
                  <input
                    required
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
                
                {/* Return Fields for Round Trip */}
                {activeTab === "ROUND_TRIP" && (
                  <div className="md:col-span-2 mt-2">
                    <div className="pt-4 border-t border-white/10 mb-4">
                       <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider">Return Details</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>
                          <span className="material-symbols-outlined text-xs mr-1 align-middle">calendar_month</span>
                          Return Date
                        </label>
                        <input
                          required
                          type="date"
                          value={returnDate}
                          min={pickupDate || new Date().toISOString().split("T")[0]}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className={inputClass}
                          suppressHydrationWarning
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          <span className="material-symbols-outlined text-xs mr-1 align-middle">history</span>
                          Return Time
                        </label>
                        <input
                          required
                          type="time"
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-6 w-full bg-primary hover:bg-primary/90 text-[#181611] font-black text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[.98]"
              >
                <span className="material-symbols-outlined">search</span>
                Search Available Cabs
              </button>
            </form>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/50 text-xs font-medium">
            {["✓ No Hidden Charges", "✓ Verified Drivers", "✓ 24/7 Support", "✓ AC Cabs"].map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHY CHOOSE US ── */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-center text-white text-2xl font-black mb-8">Why Choose Chaman Cab?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "verified_user", title: "Safe & Reliable", desc: "All drivers verified and background checked" },
            { icon: "currency_rupee", title: "Transparent Pricing", desc: "No hidden charges, price shown upfront" },
            { icon: "support_agent", title: "24/7 Support",     desc: "Reach us anytime via call or WhatsApp" },
            { icon: "local_taxi",    title: "8 Car Types",      desc: "From hatchbacks to premium Innova Crysta" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center hover:border-primary/30 transition-colors">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
              </div>
              <h4 className="text-white font-bold text-sm">{title}</h4>
              <p className="text-white/50 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── GOOGLE REVIEWS ── */}
      {reviewsData && reviewsData.reviews && reviewsData.reviews.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-16 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
            <div className="text-center md:text-left">
               <h3 className="text-white text-3xl font-black">What Our Customers Say</h3>
               <p className="text-white/60 text-sm mt-2 font-medium">Real reviews from Google Maps</p>
            </div>
            <a 
              href="https://maps.app.goo.gl/yThghqHGNrWEvANQ6"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-4 hover:border-primary/30 transition-colors group cursor-pointer"
            >
               <span className="text-white font-black text-3xl group-hover:text-primary transition-colors">{reviewsData.rating}</span>
               <div className="flex flex-col">
                 <div className="flex text-primary text-[14px]">
                   {Array(Math.round(reviewsData.rating)).fill(0).map((_, i) => <span key={i} className="material-symbols-outlined">star</span>)}
                 </div>
                 <span className="text-white/50 text-xs mt-0.5 font-medium">{reviewsData.user_ratings_total} Google Reviews</span>
               </div>
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviewsData.reviews.slice(0, 3).map((review, idx) => (
               <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-5">
                       <img src={review.profile_photo_url} alt={review.author_name} className="w-12 h-12 rounded-full" />
                       <div>
                         <p className="text-white font-bold text-sm">{review.author_name}</p>
                         <p className="text-white/40 text-xs font-medium mt-0.5">{review.relative_time_description}</p>
                       </div>
                    </div>
                    <div className="flex text-primary text-[15px] mb-3">
                       {Array(review.rating).fill(0).map((_, i) => <span key={i} className="material-symbols-outlined">star</span>)}
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed line-clamp-4 font-medium italic">"{review.text}"</p>
                  </div>
               </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
