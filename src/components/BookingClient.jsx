"use client";

import { useState, useTransition } from "react";
import Script from "next/script";
import { createBooking } from "@/app/actions/booking";
import { sendLoginOtp, verifyLoginOtp } from "@/app/actions/auth";

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

export default function BookingClient({ tripData, initialUser }) {
  const { car, fromCity, toCity, pickupLoc, dropLoc, rentalPkg,
          carId, price, type, fromCityId, toCityId, pickupLocId, dropLocId,
          packageId, pickupDate, pickupTime, fromName, toName } = tripData;

  const [paymentMethod, setPaymentMethod] = useState("PAY_ON_PICKUP");
  const [isPending, startTransition] = useTransition();
  const [isPaying, setIsPaying] = useState(false);
  const [errors, setErrors] = useState({});

  // Auth State
  const [user, setUser] = useState(initialUser);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginStep, setLoginStep] = useState(1);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const inputClass =
    "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm";
  const labelClass = "block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5";

  async function handleSendOtp() {
    setLoginError("");
    if (!loginPhone || loginPhone.length < 10) return setLoginError("Please enter a valid 10-digit number.");
    setLoginLoading(true);
    const res = await sendLoginOtp(loginPhone);
    if (res.error) setLoginError(res.error);
    else setLoginStep(2);
    setLoginLoading(false);
  }

  async function handleVerifyOtp() {
    setLoginError("");
    if (!loginOtp || loginOtp.length < 4) return setLoginError("Please enter the code sent to your phone.");
    setLoginLoading(true);
    const res = await verifyLoginOtp(loginPhone, loginOtp);
    if (res.error) setLoginError(res.error);
    else setUser(res.user);
    setLoginLoading(false);
  }

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

  // Price breakdown
  const basePrice    = tripData.breakdown?.baseFare || price || 0;
  const driverFee    = 0;   
  const totalAmount  = (tripData.breakdown?.totalPayable || basePrice);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const errs = validate(fd);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    
    // Inject secure user ID into formData for backend tracking
    if (user?.id) fd.append("userId", user.id);

    if (paymentMethod === "PAY_ON_PICKUP") {
      startTransition(() => { createBooking(fd); });
    } else if (paymentMethod === "RAZORPAY") {
      handleRazorpayPayment(fd);
    }
  }

  async function handleRazorpayPayment(fd) {
    setIsPaying(true);
    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsPaying(false);
      return;
    }

    try {
      // 1. Create order on our backend
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount })
      });
      const order = await orderRes.json();

      if (!order || !order.id) throw new Error("Order creation failed");

      // 2. Open Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Chaman Cab",
        description: "Cab Booking Transfer",
        order_id: order.id,
        prefill: {
           name: fd.get("customerName"),
           email: fd.get("customerEmail") || "",
           contact: fd.get("customerPhone"),
        },
        theme: { color: "#D2A645" }, 
        handler: async function (response) {
            // 3. Verify Payment
            const verifyRes = await fetch("/api/razorpay/verify", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
               })
            });
            const data = await verifyRes.json();
            if (data.success) {
               fd.append("razorpayPaymentId", response.razorpay_payment_id);
               startTransition(() => { createBooking(fd); });
            } else {
               alert("Payment verification failed! Please contact support.");
               setIsPaying(false);
            }
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
        setIsPaying(false);
      });

      paymentObject.open();
    } catch (e) {
      console.error(e);
      alert("Something went wrong initializing the payment.");
      setIsPaying(false);
    }
  }

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

          {/* ── LEFT: Booking Form / Auth Wall ── */}
          <div className="lg:col-span-2">
            {!user ? (
              // OTP AUTH WALL (User Option 2)
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-4">
                <div className="text-center max-w-sm mx-auto my-8">
                  <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-primary text-3xl">
                      {loginStep === 1 ? "phone_iphone" : "lock_open"}
                    </span>
                  </div>
                  <h2 className="text-white font-black text-2xl mb-2">
                    {loginStep === 1 ? "Login to Continue" : "Verify OTP"}
                  </h2>
                  <p className="text-white/60 text-sm mb-8">
                    {loginStep === 1 
                      ? "Please verify your mobile number to confirm your booking and sync your trips."
                      : `A secure 4-digit code was sent to +91 ${loginPhone}`
                    }
                  </p>

                  {loginError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-6 text-left">
                      <span className="material-symbols-outlined text-[16px] inline-block align-text-bottom mr-1">error</span>
                      {loginError}
                    </div>
                  )}

                  {loginStep === 1 ? (
                    <div className="space-y-4">
                      <div className="relative text-left">
                        <label className={labelClass}>Mobile Number <span className="text-primary">*</span></label>
                        <span className="absolute left-4 top-[38px] text-white/50 text-sm">+91</span>
                        <input
                          type="tel"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                          placeholder="98765 43210"
                          className={`${inputClass} pl-12 text-center text-lg tracking-wider font-semibold`}
                          autoFocus
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loginLoading || loginPhone.length < 10}
                        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-[#181611] font-black py-4 rounded-xl transition-all"
                      >
                        {loginLoading ? "Sending Code..." : "Send Secure Code"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative text-left">
                        <label className={labelClass}>Enter 4-Digit Code <span className="text-primary">*</span></label>
                        <input
                          type="number"
                          value={loginOtp}
                          onChange={(e) => setLoginOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                          placeholder="• • • •"
                          className={`${inputClass} text-center text-2xl tracking-[1em] font-black py-4`}
                          autoFocus
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={loginLoading || loginOtp.length < 4}
                        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-[#181611] font-black py-4 rounded-xl transition-all"
                      >
                        {loginLoading ? "Verifying..." : "Secure Login"}
                      </button>
                      <button 
                        onClick={() => { setLoginStep(1); setLoginOtp(""); }}
                        className="text-white/40 hover:text-white text-xs underline mt-4 inline-block transition-colors"
                      >
                        Change Phone Number
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // LOGGED IN CHECKOUT FORM
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
                <input type="hidden" name="paymentMethod" value={paymentMethod} />

                {/* Section 1: Passenger Details (Prefilled securely) */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 relative overflow-hidden">
                  
                  {/* Verified User Badge Header */}
                  <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-bl-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified_user</span>
                    Verified Profile
                  </div>

                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10 mt-2">
                    <div className="bg-primary/20 rounded-xl p-2">
                      <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div>
                      <h2 className="text-white font-black text-lg">Passenger Details</h2>
                      <p className="text-white/50 text-xs">Verify your booking contact details</p>
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
                        defaultValue={user.name || ""}
                        placeholder="e.g. Rahul Kumar"
                        className={`${inputClass} ${errors.customerName ? "border-red-500/70" : ""}`}
                        required
                      />
                      {errors.customerName && <p className="text-red-400 text-xs mt-1">{errors.customerName}</p>}
                    </div>

                    {/* Phone (READ ONLY from verified login) */}
                    <div>
                      <label className={labelClass}>
                        Mobile <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-sm">+91</span>
                        <input
                          type="tel"
                          name="customerPhone"
                          defaultValue={user.phone}
                          className={`${inputClass} pl-12 bg-black/20 text-white/60 cursor-not-allowed`}
                          readOnly
                        />
                      </div>
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
                disabled={isPending || isPaying}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-[#181611] font-black text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[.98]"
              >
                {(isPending || isPaying) ? (
                  <>
                    <span className="w-5 h-5 border-2 border-[#181611]/30 border-t-[#181611] rounded-full animate-spin" />
                    {isPaying ? "Processing Payment..." : "Confirming Booking..."}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    Confirm Booking — ₹{totalAmount.toLocaleString("en-IN")}
                  </>
                )}
              </button>
            </form>
            )}
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
                </div>
              </div>

               {/* Price Breakdown */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4">Price Breakdown</h3>
                <div className="space-y-3 text-sm">
                  
                  {type !== "RENTAL" && (
                     <div className="flex justify-between text-white/50 text-xs pb-2 border-b border-white/5">
                       <span>Distance Calculation</span>
                       <span>
                         {tripData.breakdown?.chargeDistance || 0} KM 
                         {tripData.breakdown?.chargeDistance === 250 && " (Min. limit)"} 
                         × ₹{tripData.breakdown?.baseFare / (tripData.breakdown?.chargeDistance || 1) || 0}
                       </span>
                     </div>
                  )}

                  <div className="flex justify-between text-white/80">
                    <span>Base Fare</span>
                    <span className="font-semibold">₹{(tripData.breakdown?.baseFare || basePrice).toLocaleString("en-IN")}</span>
                  </div>

                  {tripData.breakdown?.nightCharge > 0 && (
                    <div className="flex justify-between text-amber-400 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">nightlight</span>
                        Night Allowance (10PM - 6AM)
                      </span>
                      <span className="font-semibold">+ ₹{tripData.breakdown.nightCharge}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-white/70">
                    <span>GST (5%)</span>
                    <span>+ ₹{(tripData.breakdown?.gstAmount || 0).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between text-green-400 text-xs pt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Fuel & Driver
                    </span>
                    <span>Included</span>
                  </div>
                  
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-white font-bold">Total Payable</span>
                    <span className="text-primary font-black text-2xl">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2 text-[11px] text-white/40 leading-relaxed">
                      <span className="material-symbols-outlined text-primary/50 text-[14px]">info</span>
                      <p>Terms: Rate does not include Toll Tax, Parking & Interstate charges (paid as actuals). Minimum 250 KM charged for outstation. Time & distance calculated garage to garage.</p>
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
