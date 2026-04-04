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

export default function HomeClient({ cities, packages }) {
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (!pickupDate || !pickupTime) return;

    if (activeTab === "RENTAL") {
      if (!fromCityId || !packageId) return;
      const params = new URLSearchParams({
        type: activeTab,
        fromCityId,
        packageId,
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
      {/* ── HERO SECTION ── */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#181611] via-[#2a2410] to-[#181611]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f2b90d' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-6">
          {/* Logo / Nav */}
          <nav className="flex items-center justify-between mb-12">
            <a href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <img src="/CHAMANCAB-LOGO.webp" alt="Chaman Cab" className="h-20 md:h-28 w-auto object-contain" />
            </a>
            <div className="hidden md:flex items-center gap-6 text-white/70 text-sm font-bold tracking-wide">
              <a href="/self-drive" className="hover:text-primary transition-colors flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">car_rental</span> Self Drive Cars</a>
              <a href="/hire-driver" className="hover:text-primary transition-colors flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">person_search</span> Hire Driver</a>
              <a href="/admin" className="hover:text-primary transition-colors flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">admin_panel_settings</span> Admin</a>
              <a href="tel:+919876543210" className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary px-5 py-2.5 rounded-full transition-colors ml-2">
                <span className="material-symbols-outlined text-lg">call</span>
                Call Now
              </a>
            </div>
          </nav>

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
            <div className="flex gap-2 mb-6 bg-black/20 rounded-xl p-1">
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setToLocation(null); setFromLocation(null); setFromCityId(""); setPackageId(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-[#181611] shadow-lg"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Rental uses City Dropdown, others use Live Map Location */}
                {activeTab === "RENTAL" ? (
                  <div>
                    <label className={labelClass}>
                      <span className="material-symbols-outlined text-xs mr-1 align-middle">location_on</span>
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
                ) : (
                  <>
                    <LocationAutocomplete 
                      label="Pickup Source" 
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
                      <span className="material-symbols-outlined text-xs mr-1 align-middle">schedule</span>
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
                    Pickup Date
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
      <Footer />
    </div>
  );
}
