"use client";

import { useState, useTransition } from "react";
import { createBooking } from "@/app/actions/booking";

const TRIP_LABELS = { ONE_WAY: "One Way", ROUND_TRIP: "Round Trip", RENTAL: "Local Rental" };
const CAR_TYPE_ICONS = { Hatchback: "directions_car", Sedan: "directions_car", SUV: "airport_shuttle", MUV: "airport_shuttle" };

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}
function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr < 12 ? "AM" : "PM"}`;
}

export default function BookingClient({ tripData }) {
  const { car, fromCity, toCity, pickupLoc, dropLoc, rentalPkg,
          carId, price, type, fromCityId, toCityId, pickupLocId, dropLocId,
          packageId, pickupDate, pickupTime } = tripData;

  const [paymentMethod, setPaymentMethod] = useState("PAY_ON_PICKUP");
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState({});

  const inputClass =
    "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm";
  const labelClass = "block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5";

  function validate(fd) {
    const errs = {};
    if (!fd.get("customerName")?.trim()) errs.customerName = "Full name is required";
    const phone = fd.get("customerPhone")?.trim();
    if (!phone) errs.customerPhone = "Phone number is required";
    else if (!/^[\+]?[0-9]{10,13}$/.test(phone.replace(/\s/g, ""))) errs.customerPhone = "Enter a valid phone number";
    const email = fd.get("customerEmail")?.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.customerEmail = "Enter a valid email address";
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const errs = validate(fd);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    startTransition(() => { createBooking(fd); });
  }

  // Price breakdown
  const basePrice    = price;
  const driverFee    = 0;   // already included
  const totalAmount  = basePrice;

  return (
    <div className="min-h-screen bg-[#181611] font-display">
      {/* Header */}
      <header className="bg-[#1e1a0e] border-b border-white/10 px-4 py-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <a href="/search" className="p-2 text-white/60 hover:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </a>
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <span className="material-symbols-outlined text-[#181611] text-xl">local_taxi</span>
            </div>
            <span className="text-white font-bold">Chaman Cab</span>
          </div>
          {/* Step indicator */}
          <div className="ml-auto hidden sm:flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-primary font-bold">
              <span className="w-6 h-6 rounded-full bg-primary text-[#181611] flex items-center justify-center font-black text-xs">1</span>
              Select Car
            </span>
            <span className="text-white/20 mx-1">──</span>
            <span className="flex items-center gap-1.5 text-white font-bold">
              <span className="w-6 h-6 rounded-full bg-primary text-[#181611] flex items-center justify-center font-black text-xs">2</span>
              Book
            </span>
            <span className="text-white/20 mx-1">──</span>
            <span className="flex items-center gap-1.5 text-white/40">
              <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-xs">3</span>
              Confirm
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Booking Form ── */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Hidden fields */}
              <input type="hidden" name="carId"       value={carId} />
              <input type="hidden" name="tripType"    value={type} />
              <input type="hidden" name="fromCityId"  value={fromCityId ?? ""} />
              <input type="hidden" name="toCityId"    value={toCityId ?? ""} />
              <input type="hidden" name="pickupLocId" value={pickupLocId ?? ""} />
              <input type="hidden" name="dropLocId"   value={dropLocId ?? ""} />
              <input type="hidden" name="packageId"   value={packageId ?? ""} />
              <input type="hidden" name="pickupDate"  value={pickupDate} />
              <input type="hidden" name="pickupTime"  value={pickupTime} />
              <input type="hidden" name="amount"      value={totalAmount} />
              <input type="hidden" name="paymentMethod" value={paymentMethod} />

              {/* Section 1: Passenger Details */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                  <div className="bg-primary/20 rounded-xl p-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                  </div>
                  <div>
                    <h2 className="text-white font-black text-lg">Passenger Details</h2>
                    <p className="text-white/50 text-xs">Enter your contact information</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Full Name <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      placeholder="e.g. Rahul Kumar"
                      className={`${inputClass} ${errors.customerName ? "border-red-500/70" : ""}`}
                      required
                    />
                    {errors.customerName && <p className="text-red-400 text-xs mt-1">{errors.customerName}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={labelClass}>
                      Mobile Number <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-sm">+91</span>
                      <input
                        type="tel"
                        name="customerPhone"
                        placeholder="98765 43210"
                        className={`${inputClass} pl-12 ${errors.customerPhone ? "border-red-500/70" : ""}`}
                        required
                      />
                    </div>
                    {errors.customerPhone && <p className="text-red-400 text-xs mt-1">{errors.customerPhone}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className={labelClass}>
                      Email Address <span className="text-white/30">(optional)</span>
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      placeholder="you@example.com"
                      className={`${inputClass} ${errors.customerEmail ? "border-red-500/70" : ""}`}
                    />
                    {errors.customerEmail && <p className="text-red-400 text-xs mt-1">{errors.customerEmail}</p>}
                  </div>

                  {/* Special Requests */}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Special Requests <span className="text-white/30">(optional)</span>
                    </label>
                    <textarea
                      name="specialRequests"
                      rows={2}
                      placeholder="e.g. Need child seat, early morning pickup, etc."
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Payment Method */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                  <div className="bg-primary/20 rounded-xl p-2">
                    <span className="material-symbols-outlined text-primary">payments</span>
                  </div>
                  <div>
                    <h2 className="text-white font-black text-lg">Payment Method</h2>
                    <p className="text-white/50 text-xs">How would you like to pay?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pay on Pickup */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("PAY_ON_PICKUP")}
                    className={`relative border rounded-xl p-4 text-left transition-all ${
                      paymentMethod === "PAY_ON_PICKUP"
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-white/15 hover:border-white/30 bg-white/5"
                    }`}
                  >
                    {paymentMethod === "PAY_ON_PICKUP" && (
                      <span className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#181611] text-xs">check</span>
                      </span>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-green-500/20 rounded-lg p-2">
                        <span className="material-symbols-outlined text-green-400 text-xl">handshake</span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Pay on Pickup</p>
                        <p className="text-white/50 text-xs">Cash / UPI to driver</p>
                      </div>
                    </div>
                    <p className="text-white/40 text-xs">Pay when the driver arrives. No advance needed.</p>
                  </button>

                  {/* Razorpay */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("RAZORPAY")}
                    className={`relative border rounded-xl p-4 text-left transition-all ${
                      paymentMethod === "RAZORPAY"
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-white/15 hover:border-white/30 bg-white/5"
                    }`}
                  >
                    {paymentMethod === "RAZORPAY" && (
                      <span className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#181611] text-xs">check</span>
                      </span>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-500/20 rounded-lg p-2">
                        <span className="material-symbols-outlined text-blue-400 text-xl">credit_card</span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Pay Online</p>
                        <p className="text-white/50 text-xs">Card, UPI, Net Banking</p>
                      </div>
                    </div>
                    <p className="text-white/40 text-xs">Secure payment via Razorpay. Instant confirmation.</p>
                    <span className="inline-block mt-1.5 bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      Coming Soon
                    </span>
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 mb-5 px-1">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-0.5 w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <label htmlFor="terms" className="text-white/50 text-xs leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <span className="text-primary underline">Terms & Conditions</span> and{" "}
                  <span className="text-primary underline">Cancellation Policy</span>. I confirm that the
                  trip details above are correct.
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-[#181611] font-black text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[.98]"
              >
                {isPending ? (
                  <>
                    <span className="w-5 h-5 border-2 border-[#181611]/30 border-t-[#181611] rounded-full animate-spin" />
                    Confirming Booking...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    Confirm Booking — ₹{totalAmount.toLocaleString("en-IN")}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── RIGHT: Trip Summary ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Car Summary */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4">Your Selected Car</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 rounded-xl p-3 flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-3xl">
                      {CAR_TYPE_ICONS[car.type] ?? "directions_car"}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-black">{car.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-white/50 text-xs">{car.type}</span>
                      <span className="text-white/20">·</span>
                      <span className={`text-xs font-semibold ${car.fuelType === "CNG" ? "text-green-400" : "text-blue-400"}`}>
                        {car.fuelType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                  <div className="bg-white/5 rounded-lg py-2">
                    <span className="material-symbols-outlined text-primary text-base block mb-0.5">person</span>
                    <span className="text-white/70">{car.seats} Seats</span>
                  </div>
                  <div className="bg-white/5 rounded-lg py-2">
                    <span className="material-symbols-outlined text-primary text-base block mb-0.5">ac_unit</span>
                    <span className="text-white/70">AC</span>
                  </div>
                  <div className="bg-white/5 rounded-lg py-2">
                    <span className="material-symbols-outlined text-primary text-base block mb-0.5">luggage</span>
                    <span className="text-white/70">{car.luggageCapacity} Bags</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-white/60">
                    <span className="material-symbols-outlined text-primary/70 text-base">
                      {type === "ONE_WAY" ? "arrow_right_alt" : type === "ROUND_TRIP" ? "loop" : "schedule"}
                    </span>
                    <span className="font-semibold text-white/80">{TRIP_LABELS[type]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <span className="material-symbols-outlined text-primary/70 text-base">location_on</span>
                    <span>{fromCity?.name ?? "—"}</span>
                    {toCity && <><span>→</span><span>{toCity.name}</span></>}
                    {rentalPkg && <span className="text-primary/80">{rentalPkg.name}</span>}
                  </div>
                  {pickupLoc && (
                    <div className="flex items-start gap-2 text-white/60">
                      <span className="material-symbols-outlined text-primary/70 text-base mt-0.5">my_location</span>
                      <span>{pickupLoc.landmark}</span>
                    </div>
                  )}
                  {dropLoc && (
                    <div className="flex items-start gap-2 text-white/60">
                      <span className="material-symbols-outlined text-primary/70 text-base mt-0.5">location_off</span>
                      <span>{dropLoc.landmark}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-white/60">
                    <span className="material-symbols-outlined text-primary/70 text-base">calendar_today</span>
                    <span>{formatDate(pickupDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <span className="material-symbols-outlined text-primary/70 text-base">schedule</span>
                    <span>{formatTime(pickupTime)}</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4">Price Breakdown</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Base Fare</span>
                    <span>₹{basePrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-green-400 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Driver Allowance
                    </span>
                    <span>Included</span>
                  </div>
                  <div className="flex justify-between text-green-400 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Fuel Charges
                    </span>
                    <span>Included</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-white font-bold">Total Amount</span>
                    <span className="text-primary font-black text-2xl">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-white/30 text-[11px] leading-relaxed">
                    * Toll & parking charges extra as applicable. No hidden fees.
                  </p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="space-y-2.5 text-xs text-white/50">
                  {[
                    { icon: "verified_user", text: "100% Safe & Verified Drivers" },
                    { icon: "cancel",        text: "Free Cancellation (2hrs before)" },
                    { icon: "support_agent", text: "24/7 Customer Support" },
                    { icon: "receipt",       text: "No Hidden Charges" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary/70 text-base">{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
