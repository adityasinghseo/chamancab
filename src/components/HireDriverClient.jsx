"use client";

import { useState, useTransition, useEffect } from "react";
import { getUserSession, sendLoginOtp, verifyLoginOtp } from "@/app/actions/auth";
import { submitDriverBooking } from "@/app/actions/hireDriver";
import { validateCoupon } from "@/app/actions/coupon";

const NIGHT_CHARGE = 200;

function isNightTime(timeStr) {
  if (!timeStr) return false;
  const [hours] = timeStr.split(":").map(Number);
  const totalMins = hours * 60 + parseInt(timeStr.split(":")[1] || 0);
  return totalMins >= 21 * 60 || totalMins < 6 * 60;
}

export default function HireDriverClient({ drivers }) {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [session, setSession] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [isPaying, setIsPaying] = useState(false);

  const cleanPhone = (raw = "") => {
    let v = raw.replace(/\D/g, "");
    if (v.startsWith("91") && v.length > 10) v = v.slice(2);
    return v.slice(0, 10);
  };

  const [bookingType, setBookingType] = useState(""); // "half_day" | "full_day"
  const [startTime, setStartTime] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [phoneVal, setPhoneVal] = useState(() => cleanPhone(session?.phone || ""));

  // OTP State
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    getUserSession().then((s) => {
      setSession(s);
      if (s?.phone) setPhoneVal(cleanPhone(s.phone));
    });
  }, []);

  // Reset booking state when driver changes
  const handleBookClick = (driver) => {
    setSelectedDriver(driver);
    setBookingSuccess(null);
    setBookingType("");
    setStartTime("");
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const handleCloseModal = () => setSelectedDriver(null);

  // Computed pricing
  const basePrice = selectedDriver
    ? bookingType === "half_day" ? selectedDriver.halfDayPrice
    : bookingType === "full_day" ? selectedDriver.fullDayPrice
    : 0
    : 0;
  const nightApplied = isNightTime(startTime);
  const nightAmount = nightApplied ? (selectedDriver?.nightCharge ?? NIGHT_CHARGE) : 0;
  const subtotal = basePrice + nightAmount;
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercent) / 100) : 0;
  const total = subtotal - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    const res = await validateCoupon(couponInput);
    setCouponLoading(false);
    if (res.error) {
      setCouponError(res.error);
    } else {
      setAppliedCoupon({ code: couponInput.trim().toUpperCase(), discountPercent: res.discountPercent });
      setCouponError("");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const handleInitiateBooking = async (e) => {
    e.preventDefault();
    if (!bookingType) {
      alert("Please select Half Day or Full Day booking type.");
      return;
    }
    const fd = new FormData(e.target);
    const phone = fd.get("customerPhone")?.trim();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    const enteredPhone = phone.replace(/\D/g, "");
    const sessionPhone = session?.phone?.replace(/\D/g, "");
    const phoneMatchesSession = session && sessionPhone && (
      sessionPhone === enteredPhone ||
      sessionPhone === `91${enteredPhone}` ||
      `91${sessionPhone}` === enteredPhone
    );

    if (phoneMatchesSession) {
      processDriverBooking(fd);
      return;
    }

    setPendingFormData(fd);
    const res = await sendLoginOtp(phone);
    if (res?.error) { alert(res.error); return; }
    setOtpCode(["", "", "", ""]);
    setShowOtp(true);
  };

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const processDriverBooking = async (fd) => {
    fd.append("driverId", selectedDriver.id);
    fd.append("bookingType", bookingType);
    if (session?.id && !fd.has("userId")) fd.append("userId", session.id);
    if (appliedCoupon) {
      fd.append("couponCode", appliedCoupon.code);
      fd.append("discountPercent", appliedCoupon.discountPercent);
      fd.append("discountAmount", discountAmount);
    }

    setIsPaying(true);
    const res = await loadRazorpay();
    if (!res) { alert("Razorpay SDK failed to load."); setIsPaying(false); return; }

    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(total) })
      });
      const order = await orderRes.json();
      if (!order || !order.id) throw new Error("Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Chaman Cab",
        description: `Hire Driver: ${selectedDriver.name}`,
        order_id: order.id,
        handler: function (response) {
          fd.append("razorpayPaymentId", response.razorpay_payment_id);
          startTransition(async () => {
            const serverRes = await submitDriverBooking(fd);
            setIsPaying(false);
            if (serverRes.error) alert(serverRes.error);
            else setBookingSuccess(serverRes.referenceId);
          });
        },
        modal: { ondismiss: () => setIsPaying(false) },
        prefill: { name: fd.get("customerName"), contact: fd.get("customerPhone") },
        theme: { color: "#fbb03b" },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      alert("Payment initialization error.");
      setIsPaying(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpCode.join("");
    if (code.length !== 4) return alert("Please enter the 4-digit OTP");
    setVerifyingOtp(true);
    const phone = pendingFormData.get("customerPhone");
    const res = await verifyLoginOtp(phone, code);
    setVerifyingOtp(false);
    if (res?.error) return alert(res.error);
    pendingFormData.append("userId", res.user.id);
    setSession(res.user);
    setShowOtp(false);
    processDriverBooking(pendingFormData);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Driver Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {drivers.map((drv) => (
          <div key={drv.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col hover:bg-white/8 transition-colors">
            <div className="p-6 md:p-8 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white">{drv.name}</h2>
                  <p className="text-primary text-[11px] font-bold uppercase tracking-widest mt-1">Verified Partner</p>
                </div>
                <div className="bg-blue-500/20 p-2.5 rounded-xl border border-blue-500/20">
                  <span className="material-symbols-outlined text-blue-400">badge</span>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Half Day</p>
                  <p className="text-2xl font-black text-white">₹{drv.halfDayPrice}</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
                  <p className="text-primary/70 text-[10px] font-bold uppercase tracking-widest mb-1">Full Day</p>
                  <p className="text-2xl font-black text-primary">₹{drv.fullDayPrice}</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-start gap-2 text-xs text-white/50 bg-white/5 rounded-xl px-3 py-2.5">
                  <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">nights_stay</span>
                  <span>Night charge ₹{drv.nightCharge} applicable (9 PM – 6 AM)</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-white/50 bg-white/5 rounded-xl px-3 py-2.5">
                  <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">restaurant</span>
                  <span>Driver food and stay arranged by customer</span>
                </div>
              </div>

              <button
                onClick={() => handleBookClick(drv)}
                className="w-full bg-white hover:bg-gray-100 text-[#181611] font-black text-lg py-4 rounded-2xl transition-all shadow-lg hover:scale-[1.02] mt-auto uppercase tracking-wide"
              >
                Hire Driver
              </button>
            </div>
          </div>
        ))}
        {drivers.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-white/10 mb-4 block">person_off</span>
            <h3 className="text-2xl font-black text-white mb-2">No Drivers Available</h3>
            <p className="text-white/50">There are currently no drivers listed.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e1a0e] w-full max-w-xl h-full md:h-[90vh] md:max-h-[900px] shadow-2xl flex flex-col md:rounded-3xl border border-white/10 overflow-hidden relative">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-20">
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-white/10 bg-black/20 shrink-0">
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-3 border border-blue-500/20">Driver Reservation</span>
              <h2 className="text-2xl font-black text-white">Hire {selectedDriver.name}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {bookingSuccess ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-5xl">check_circle</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Driver Confirmed!</h3>
                  <p className="text-white/70 mb-6">Your driver booking has been placed successfully.</p>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl italic text-lg font-bold text-primary mb-8 inline-block px-8">
                    ID: {bookingSuccess}
                  </div>
                  <br />
                  <button onClick={handleCloseModal} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl transition-colors">Done</button>
                </div>
              ) : (
                <form onSubmit={handleInitiateBooking} className="space-y-6">
                  {/* Auth Info */}
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-0.5">account_circle</span>
                    <div>
                      <p className="text-sm font-bold text-white">Guest Checkout</p>
                      {session
                        ? <p className="text-xs text-primary/80 mt-1">Logged in as <b>{session.phone}</b>. OTP bypass engaged.</p>
                        : <p className="text-xs text-white/50 mt-1">We will verify your mobile number with a quick OTP.</p>
                      }
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2 block">Your Full Name <span className="text-red-500">*</span></label>
                      <input autoComplete="name" required name="customerName" defaultValue={session?.name || ""} placeholder="John Doe" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder-white/20 font-medium" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2 block">Mobile Number <span className="text-red-500">*</span></label>
                      <input autoComplete="tel-national" required name="customerPhone" type="tel" maxLength={10} value={phoneVal} placeholder="9876543210"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary outline-none font-medium placeholder-white/20"
                        onChange={(e) => setPhoneVal(cleanPhone(e.target.value))} />
                    </div>
                  </div>

                  <hr className="border-white/10" />

                  {/* Pickup + Date/Time */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2 block">Pickup Location <span className="text-red-500">*</span></label>
                      <input required name="pickupLocation" placeholder="Enter landmark or address" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary outline-none font-medium placeholder-white/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2 block">Date <span className="text-red-500">*</span></label>
                        <input required type="date" name="startDate" min={new Date().toISOString().split("T")[0]} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2 block">Time <span className="text-red-500">*</span></label>
                        <input required type="time" name="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none" />
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/10" />

                  {/* Booking Type Selection */}
                  <div>
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3 block">Select Booking Type <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "half_day", label: "Half Day", price: selectedDriver.halfDayPrice, icon: "wb_sunny" },
                        { value: "full_day", label: "Full Day", price: selectedDriver.fullDayPrice, icon: "calendar_today" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setBookingType(opt.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                            bookingType === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 text-white/60 hover:border-white/30 hover:bg-white/5"
                          }`}
                        >
                          <span className={`material-symbols-outlined text-2xl ${bookingType === opt.value ? "text-primary" : "text-white/40"}`}>{opt.icon}</span>
                          <span className="font-black text-sm">{opt.label}</span>
                          <span className={`text-xl font-black ${bookingType === opt.value ? "text-primary" : "text-white"}`}>₹{opt.price}</span>
                        </button>
                      ))}
                    </div>
                    {/* Night charge info */}
                    <div className={`mt-3 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium transition-all ${nightApplied ? "bg-blue-500/10 border border-blue-500/20 text-blue-300" : "bg-white/5 border border-white/5 text-white/40"}`}>
                      <span className="material-symbols-outlined text-[16px]">nights_stay</span>
                      {nightApplied
                        ? `Night charge ₹${selectedDriver.nightCharge} will be added (booking time is between 9 PM – 6 AM)`
                        : "Night charge ₹" + selectedDriver.nightCharge + " applicable if booked between 9 PM – 6 AM"}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  {bookingType && (
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Price Breakdown</p>
                      <div className="space-y-2.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Base Price ({bookingType === "half_day" ? "Half Day" : "Full Day"})</span>
                          <span className="font-bold text-white">₹{basePrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Night Charge</span>
                          <span className={`font-bold ${nightApplied ? "text-blue-400" : "text-white/30"}`}>
                            {nightApplied ? `+ ₹${nightAmount}` : "Not Applicable"}
                          </span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-sm">
                            <span className="text-green-400">Coupon ({appliedCoupon.code})</span>
                            <span className="font-bold text-green-400">- ₹{discountAmount}</span>
                          </div>
                        )}
                        <div className="pt-3 border-t border-white/10 flex justify-between">
                          <span className="font-black text-white">Total Payable</span>
                          <span className="font-black text-primary text-xl">₹{total}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coupon */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h3 className="text-white font-black text-sm mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">loyalty</span>
                      Apply Coupon Code
                    </h3>
                    {!appliedCoupon ? (
                      <div>
                        <div className="flex gap-2">
                          <input type="text" placeholder="ENTER CODE" value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white uppercase focus:border-primary outline-none text-sm placeholder-white/30 tracking-wider" />
                          <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()}
                            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-[#181611] px-5 font-black rounded-xl text-sm">
                            {couponLoading ? "..." : "APPLY"}
                          </button>
                        </div>
                        {couponError && <p className="text-red-400 text-xs mt-2 font-medium">{couponError}</p>}
                      </div>
                    ) : (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-green-400 font-bold text-sm flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>Coupon Applied!
                          </p>
                          <p className="text-white/60 text-xs mt-0.5">Code <strong className="text-white">{appliedCoupon.code}</strong> — {appliedCoupon.discountPercent}% OFF</p>
                        </div>
                        <button type="button" onClick={removeCoupon} className="text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg">
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={isPending || isPaying || !bookingType}
                    className="w-full bg-primary hover:bg-[#e6a320] text-[#181611] font-black py-4 rounded-xl transition-all shadow-lg hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest flex items-center justify-center gap-2">
                    {isPending || isPaying ? "Processing Payment..." : (
                      <>Pay ₹{bookingType ? total : "—"} & Confirm Booking <span className="material-symbols-outlined text-[18px]">check_circle</span></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOtp && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1a0e] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative">
            <button type="button" onClick={() => setShowOtp(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <span className="material-symbols-outlined text-3xl">sms</span>
              </div>
              <h3 className="text-white font-black text-xl mb-1">Verify Mobile</h3>
              <p className="text-white/50 text-sm">Enter the 4-digit code sent to +91 {pendingFormData?.get("customerPhone")}</p>
            </div>
            <div className="flex justify-between gap-3 mb-6">
              {[0, 1, 2, 3].map((idx) => (
                <input key={idx} id={`hire-otp-input-${idx}`} type="text" maxLength={1} value={otpCode[idx]}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/, "");
                    const newOtp = [...otpCode]; newOtp[idx] = val; setOtpCode(newOtp);
                    if (val && idx < 3) document.getElementById(`hire-otp-input-${idx + 1}`).focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otpCode[idx] && idx > 0) document.getElementById(`hire-otp-input-${idx - 1}`).focus();
                    if (e.key === "Enter" && idx === 3 && otpCode[3]) handleVerifyOtp();
                  }}
                  className="w-14 h-14 bg-white/5 border border-white/15 rounded-xl text-center text-white text-2xl font-black focus:border-primary outline-none" />
              ))}
            </div>
            <button type="button" onClick={handleVerifyOtp} disabled={verifyingOtp}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-[#181611] font-black py-4 rounded-xl transition-all">
              {verifyingOtp ? "Verifying..." : "Verify & Book Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
