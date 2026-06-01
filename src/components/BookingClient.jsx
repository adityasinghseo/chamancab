"use client";

import { useState, useTransition } from "react";
import { createBooking } from "@/app/actions/booking";

const TRIP_LABELS = { ONE_WAY: "One Way", ROUND_TRIP: "Round Trip", RENTAL: "Local Rental" };
const CAR_TYPE_ICONS = { Hatchback: "directions_car", Sedan: "directions_car", SUV: "airport_shuttle", MUV: "airport_shuttle" };

function getCarImage(carName) {
  if (!carName) return null;
  const name = carName.toLowerCase();
  if (name.includes("wagon")) return "/cars/wagnor.webp";
  if (name.includes("dzire cng")) return "/cars/dzirecng.webp";
  if (name.includes("dzire")) return "/cars/dzirepetrol.webp";
  if (name.includes("aura") || name.includes("xcent")) return "/cars/aura.webp";
  if (name.includes("ertiga")) return "/cars/ertiga.webp";
  if (name.includes("innova")) return "/cars/innovacrysta.webp";
  if (name.includes("bolero")) return "/cars/bolero.webp";
  if (name.includes("scorpio")) return "/cars/scorpio.png";
  return null;
}
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

export default function BookingClient({ tripData, initialUser }) {
  const {
    car, fromCity, toCity, pickupLoc, dropLoc, rentalPkg,
    carId, price, type, fromCityId, toCityId, pickupLocId, dropLocId,
    packageId, pickupDate, pickupTime,
    returnDate: initReturnDate, returnTime: initReturnTime,
    fromName, toName,
  } = tripData;

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [wantsGst, setWantsGst] = useState(false);
  const [returnDate, setReturnDate] = useState(initReturnDate || "");
  const [returnTime, setReturnTime] = useState(initReturnTime || "");

  // Strip country code helper
  const cleanPhone = (raw = "") => {
    let v = raw.replace(/\D/g, "");
    if (v.startsWith("91") && v.length > 10) v = v.slice(2);
    return v.slice(0, 10);
  };
  const [phoneVal, setPhoneVal] = useState(() => cleanPhone(initialUser?.phone || ""));

  const inputClass =
    "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm";
  const labelClass = "block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5";

  // Price calculations (for display only)
  const basePrice = tripData.breakdown?.baseFare || price || 0;
  const originalBaseTotal = Number(price || basePrice);
  let dynamicGst = 0;
  let totalAmount = originalBaseTotal;
  if (wantsGst) {
    dynamicGst = Math.round(totalAmount * 0.05);
    totalAmount += dynamicGst;
  }
  totalAmount = Math.round(totalAmount);

  function validate(fd) {
    const errs = {};
    if (!fd.get("customerName")?.trim()) errs.customerName = "Full name is required";
    const phone = fd.get("customerPhone")?.trim();
    if (!phone) errs.customerPhone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) errs.customerPhone = "Enter a valid 10-digit Indian mobile number";

    if (type === "ROUND_TRIP") {
      const rd = fd.get("returnDate");
      const rt = fd.get("returnTime");
      if (!rd) errs.returnDate = "Return date is required";
      if (!rt) errs.returnTime = "Return time is required";
      if (rd && pickupDate && new Date(rd) < new Date(pickupDate)) {
        errs.returnDate = "Return date must be same or after pickup date";
      }
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const errs = validate(fd);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsSubmitting(true);

    // Always enquiry — no online payment
    fd.append("paymentMethod", "PAY_ON_PICKUP");
    fd.append("paidAmount", "0");
    fd.append("price", originalBaseTotal);
    fd.append("finalPrice", totalAmount);

    startTransition(async () => {
      try {
        const res = await createBooking(fd);
        if (res?.error) {
          alert("Booking failed: " + res.error);
          setIsSubmitting(false);
        } else if (res?.success) {
          window.location.href = `/confirmation?ref=${res.referenceId}&phone=${encodeURIComponent(res.phone)}`;
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
        setIsSubmitting(false);
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#181611] font-display">
      {/* Header */}
      <header className="bg-[#1e1a0e] border-b border-white/10 px-4 py-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <a href="/search" className="p-2 text-white/60 hover:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </a>
          <a href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/CHAMANCAB-LOGO.webp" alt="Chaman Cab" className="h-14 md:h-20 w-auto object-contain -ml-2" />
          </a>
          {/* Step indicator */}
          <div className="ml-auto hidden sm:flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-primary font-bold">
              <span className="w-6 h-6 rounded-full bg-primary text-[#181611] flex items-center justify-center font-black text-xs">1</span>
              Select Car
            </span>
            <span className="text-white/20 mx-1">──</span>
            <span className="flex items-center gap-1.5 text-white font-bold">
              <span className="w-6 h-6 rounded-full bg-primary text-[#181611] flex items-center justify-center font-black text-xs">2</span>
              Details
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
              <input type="hidden" name="fromName"    value={fromName || ""} />
              <input type="hidden" name="toName"      value={toName || ""} />
              <input type="hidden" name="amount"      value={totalAmount} />

              {/* Section 1: Passenger Details */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10 mt-2">
                  <div className="bg-primary/20 rounded-xl p-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                  </div>
                  <div>
                    <h2 className="text-white font-black text-lg">Passenger Details</h2>
                    <p className="text-white/50 text-xs">Enter your contact details to submit the enquiry</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className={labelClass}>
                      Full Name <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      autoComplete="name"
                      defaultValue={initialUser?.name || ""}
                      placeholder="e.g. Rahul Kumar"
                      className={`${inputClass} ${errors.customerName ? "border-red-500/70" : ""}`}
                      required
                    />
                    {errors.customerName && <p className="text-red-400 text-xs mt-1">{errors.customerName}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={labelClass}>
                      Mobile <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-sm">+91</span>
                      <input
                        type="tel"
                        name="customerPhone"
                        autoComplete="tel-national"
                        maxLength={10}
                        placeholder="9876543210"
                        value={phoneVal}
                        className={`${inputClass} pl-12 text-white ${errors.customerPhone ? "border-red-500/70" : ""}`}
                        required
                        onChange={(e) => setPhoneVal(cleanPhone(e.target.value))}
                      />
                    </div>
                    {errors.customerPhone && <p className="text-red-400 text-xs mt-1">{errors.customerPhone}</p>}
                  </div>

                  {/* Email (optional) */}
                  <div>
                    <label className={labelClass}>Email <span className="text-white/30">(Optional)</span></label>
                    <input
                      type="email"
                      name="customerEmail"
                      autoComplete="email"
                      defaultValue={initialUser?.email || ""}
                      placeholder="your@email.com"
                      className={inputClass}
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className={labelClass}>Special Requests <span className="text-white/30">(Optional)</span></label>
                    <textarea
                      name="specialRequests"
                      rows={2}
                      placeholder="Any specific requirements or notes for the driver..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {/* Return Fields for Round Trip */}
                  {type === "ROUND_TRIP" && (
                    <div className="mt-2 pt-4 border-t border-white/10">
                      <p className="text-white font-bold text-sm mb-3">Return Schedule</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Return Date <span className="text-primary">*</span></label>
                          <input
                            type="date"
                            name="returnDate"
                            value={returnDate}
                            onChange={e => setReturnDate(e.target.value)}
                            min={pickupDate}
                            className={`${inputClass} invert-0 dark:invert-[1] ${errors.returnDate ? "border-red-500/70" : ""}`}
                            required
                          />
                          {errors.returnDate && <p className="text-red-400 text-xs mt-1">{errors.returnDate}</p>}
                        </div>
                        <div>
                          <label className={labelClass}>Return Time <span className="text-primary">*</span></label>
                          <input
                            type="time"
                            name="returnTime"
                            value={returnTime}
                            onChange={e => setReturnTime(e.target.value)}
                            className={`${inputClass} invert-0 dark:invert-[1] ${errors.returnTime ? "border-red-500/70" : ""}`}
                            required
                          />
                          {errors.returnTime && <p className="text-red-400 text-xs mt-1">{errors.returnTime}</p>}
                        </div>
                      </div>
                      <p className="text-white/40 text-[10px] mt-2 italic">Note: Driver will return after drop based on your selected return schedule.</p>
                    </div>
                  )}

                  {/* GST Bill Optional */}
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-black/20 border border-white/5 rounded-xl transition-colors hover:bg-black/30">
                      <input
                        type="checkbox"
                        checked={wantsGst}
                        onChange={(e) => setWantsGst(e.target.checked)}
                        className="w-5 h-5 accent-primary rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">Need a GST Bill?</p>
                        <p className="text-white/50 text-xs mt-0.5">Check this box to add 5% GST to your total estimate.</p>
                      </div>
                    </label>
                  </div>
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
                disabled={isPending || isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-[#181611] font-black text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[.98]"
              >
                {(isPending || isSubmitting) ? (
                  <>
                    <span className="w-5 h-5 border-2 border-[#181611]/30 border-t-[#181611] rounded-full animate-spin" />
                    Submitting Enquiry...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Submit Booking Enquiry
                  </>
                )}
              </button>

              <p className="text-center text-white/30 text-xs mt-3">
                No payment required · Our team will call to confirm your booking
              </p>
            </form>
          </div>

          {/* ── RIGHT: Trip Summary ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Car Summary */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4">Your Selected Car</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 rounded-xl p-3 flex-shrink-0 w-24 h-16 flex items-center justify-center">
                    {getCarImage(car.name) ? (
                      <img src={getCarImage(car.name)} alt={car.name} className="w-full h-full object-contain drop-shadow-md" />
                    ) : (
                      <span className="material-symbols-outlined text-primary text-3xl">
                        {CAR_TYPE_ICONS[car.type] ?? "directions_car"}
                      </span>
                    )}
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
                  <div className="flex gap-2 text-white/60">
                    <span className="material-symbols-outlined text-primary/70 text-base mt-0.5 flex-shrink-0">location_on</span>
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <span className="break-words leading-snug">{tripData.fromName || fromCity?.name || "—"}</span>
                      {(tripData.toName || toCity) && (
                        <div className="flex gap-2 items-start opacity-70">
                          <span className="material-symbols-outlined text-sm mt-0.5 flex-shrink-0">south_east</span>
                          <span className="break-words leading-snug">{tripData.toName || toCity?.name}</span>
                        </div>
                      )}
                      {rentalPkg && <span className="text-primary/80 font-semibold">{rentalPkg.name}</span>}
                    </div>
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
                    <span suppressHydrationWarning>{formatDate(pickupDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <span className="material-symbols-outlined text-primary/70 text-base">schedule</span>
                    <span>{formatTime(pickupTime)}</span>
                  </div>
                  {type === "ROUND_TRIP" && returnDate && (
                    <div className="flex gap-2 text-white/60 pt-2 mt-2 border-t border-white/5">
                      <span className="font-semibold text-primary/70 tracking-wide">Return:</span>
                      <span suppressHydrationWarning>{formatDate(returnDate)}, {formatTime(returnTime)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4">Fare Estimate</h3>
                <div className="space-y-3 text-sm">

                  {type !== "RENTAL" && (
                    <div className="flex justify-between text-white/50 text-xs pb-2 border-b border-white/5">
                      <span>Distance Calculation</span>
                      <span>
                        {tripData.breakdown?.chargeDistance || 0} KM
                        {tripData.breakdown?.chargeDistance === 200 && " (Min. limit)"}
                        {" "}× ₹{tripData.breakdown?.baseFare / (tripData.breakdown?.chargeDistance || 1) || 0}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-white/80">
                    <span>Base Fare</span>
                    <span className="font-semibold">₹{Math.round(originalBaseTotal).toLocaleString("en-IN")}</span>
                  </div>

                  {tripData.breakdown?.nightCharge > 0 && (
                    <div className="flex justify-between text-amber-400 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">nightlight</span>
                        Night Allowance (9PM - 6AM)
                      </span>
                      <span className="font-semibold">+ ₹{tripData.breakdown.nightCharge}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-white/70">
                    <span>GST (5%)</span>
                    <span>{dynamicGst > 0 ? `+ ₹${dynamicGst.toLocaleString("en-IN")}` : "Not applied"}</span>
                  </div>

                  <div className="flex justify-between text-green-400/80 text-xs pt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Fuel & Driver
                    </span>
                    <span>Included</span>
                  </div>

                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-white font-bold">Estimated Fare</span>
                    <span className="text-primary font-black text-2xl">
                      ₹{Math.round(totalAmount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {type === "RENTAL" && rentalPkg && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mt-4">
                      <p className="text-blue-400/80 text-[11px] leading-relaxed">
                        <span className="font-semibold text-xs">Additional Charges:</span> Your selected package includes {rentalPkg.hours} hours and {rentalPkg.kilometers} km. Once either the included {rentalPkg.hours} hours or {rentalPkg.kilometers} km limit is exceeded, additional charges will apply at ₹100 per extra hour and ₹10 per extra kilometer thereafter.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-3 text-[11px] text-white/50 leading-relaxed font-medium">
                    <span className="material-symbols-outlined text-primary/70 text-[18px]">info</span>
                    <div className="space-y-1.5 flex-1">
                      {type === "ONE_WAY" ? (
                        <>
                          <p>• If the customer does not arrive within 10 minutes after the vehicle reaches the pickup location, waiting charges will apply at ₹2 per minute.</p>
                          <p>• Airport parking other parking and Driver night charge Rs. 200/- Will be applicable from 9:00 PM to 6:00 AM</p>
                        </>
                      ) : (
                        <p>Airport parking other parking and Driver night charge Rs. 200/- Will be applicable from 9:00 PM to 6:00 AM</p>
                      )}
                    </div>
                  </div>
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
