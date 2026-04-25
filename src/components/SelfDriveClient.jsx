"use client";

import { useState, useTransition, useEffect } from "react";
import { getUserSession, sendLoginOtp, verifyLoginOtp } from "@/app/actions/auth";
import { submitSelfDriveBooking, estimateSelfDrivePrice } from "@/app/actions/selfDrive";
import { validateCoupon } from "@/app/actions/coupon";

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

export default function SelfDriveClient({ cars }) {
  const [selectedCar, setSelectedCar] = useState(null);
  const [session, setSession] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [isPaying, setIsPaying] = useState(false);

  // Strip country code helper
  const cleanPhone = (raw = "") => {
    let v = raw.replace(/\D/g, "");
    if (v.startsWith("91") && v.length > 10) v = v.slice(2);
    return v.slice(0, 10);
  };

  const [phoneVal, setPhoneVal] = useState(() => cleanPhone(session?.phone || ""));

  // OTP State
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  // Booking Form State
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");

  // Computed final booking state
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");

    const res = await validateCoupon(couponInput);
    setCouponLoading(false);

    if (res.error) {
      setCouponError(res.error);
    } else {
      setAppliedCoupon({ 
        code: couponInput.trim().toUpperCase(), 
        discountType: res.discountType,
        discountPercent: res.discountPercent,
        discountFlat: res.discountFlat 
      });
      setCouponError("");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  useEffect(() => {
    getUserSession().then((s) => {
      setSession(s);
      if (s?.phone) setPhoneVal(cleanPhone(s.phone));
    });
  }, []);

  const handleBookClick = (car) => {
    setSelectedCar(car);
    setBookingSuccess(null);
  };

  const handleCloseModal = () => {
    setSelectedCar(null);
  };

  const handleInitiateBooking = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    
    const phone = fd.get("customerPhone")?.trim();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)");
      return;
    }

    // Only skip OTP if session phone EXACTLY matches the entered phone
    const enteredPhone = phone.replace(/\D/g, "");
    const sessionPhone = session?.phone?.replace(/\D/g, "");
    const phoneMatchesSession = session && sessionPhone && (
      sessionPhone === enteredPhone ||
      sessionPhone === `91${enteredPhone}` ||
      `91${sessionPhone}` === enteredPhone
    );

    if (phoneMatchesSession) {
       processSelfDriveBooking(fd);
       return;
    }

    setPendingFormData(fd);
    
    const res = await sendLoginOtp(phone);
    if (res?.error) {
       alert(res.error);
       return;
    }

    setOtpCode(["", "", "", ""]);
    setShowOtp(true);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processSelfDriveBooking = async (fd) => {
    fd.append("carId", selectedCar.id);
    if (session?.id && !fd.has("userId")) fd.append("userId", session.id);

    if (appliedCoupon) {
      fd.append("couponCode", appliedCoupon.code);
      fd.append("discountPercent", appliedCoupon.discountPercent);
    }

    setIsPaying(true);

    const pickupDateStr = fd.get("pickupDate");
    const pickupTimeStr = fd.get("pickupTime");
    const returnDateStr = fd.get("returnDate");
    const returnTimeStr = fd.get("returnTime");

    const pickupFull = new Date(`${pickupDateStr}T${pickupTimeStr}`);
    const returnFull = new Date(`${returnDateStr}T${returnTimeStr}`);

    if (returnFull <= pickupFull) {
       alert("Return time must be after pickup time.");
       setIsPaying(false);
       return;
    }

    try {
      // 1. Get accurate server-side estimate
      const est = await estimateSelfDrivePrice(selectedCar.id, pickupFull, returnFull);
      if (est.error) {
         alert(est.error);
         setIsPaying(false);
         return;
      }

      // 2. Load SDK
      const res = await loadRazorpay();
      if (!res) {
         alert("Razorpay SDK failed to load. Are you online?");
         setIsPaying(false);
         return;
      }

      // 3. Create payment order
      let discountAmount = 0;
      if (appliedCoupon) {
        if (appliedCoupon.discountType === "FLAT") {
          discountAmount = appliedCoupon.discountFlat;
        } else {
          discountAmount = (est.charge * appliedCoupon.discountPercent) / 100;
        }
      }
      fd.append("discountAmount", discountAmount);

      const finalAmountToPay = est.charge - discountAmount + est.deposit;

      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmountToPay }) // Base + Deposit
      });
      const order = await orderRes.json();
      if (!order || !order.id) throw new Error("Order creation failed");

      // 4. Fire Razorpay Pop-Up
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Chaman Cab",
        description: `Self Drive: ${selectedCar.name}`,
        order_id: order.id,
        handler: function (response) {
           fd.append("razorpayPaymentId", response.razorpay_payment_id);
           startTransition(async () => {
             const serverRes = await submitSelfDriveBooking(fd);
             setIsPaying(false);
             if (serverRes.error) alert(serverRes.error);
             else setBookingSuccess(serverRes.referenceId);
           });
        },
        modal: { ondismiss: () => setIsPaying(false) },
        prefill: {
          name: fd.get("customerName"),
          contact: fd.get("customerPhone"),
        },
        theme: { color: "#fbb03b" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert("An error occurred during secure checkout.");
      setIsPaying(false);
    }
  };

  const handleVerifyOtp = async () => {
     const code = otpCode.join("");
     if(code.length !== 4) return alert("Please enter the 4-digit OTP");

     setVerifyingOtp(true);
     const phone = pendingFormData.get("customerPhone");
     const res = await verifyLoginOtp(phone, code);
     setVerifyingOtp(false);

     if (res?.error) {
        return alert(res.error);
     }

     pendingFormData.append("userId", res.user.id);
     setSession(res.user);
     setShowOtp(false);
     processSelfDriveBooking(pendingFormData);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-20">
        {cars.map((car) => (
          <div key={car.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col hover:bg-white/10 transition-colors">
            <div className="p-6 md:p-8 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white">{car.name}</h2>
                  <p className="text-primary text-[11px] font-bold uppercase tracking-widest mt-1">{car.type} · {car.transmission} · {car.fuelType}</p>
                </div>
                <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0">
                  {getCarImage(car.name) ? (
                    <img src={getCarImage(car.name)} alt={car.name} className="w-full h-full object-contain drop-shadow-md" />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-3xl sm:text-4xl">directions_car</span>
                  )}
                </div>
              </div>

              <div className="bg-black/40 rounded-2xl p-5 mb-6 border border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1.5">12 Hours Base</p>
                    <p className="text-xl font-black text-white">₹{car.price12hr}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1.5">24 Hours Base</p>
                    <p className="text-xl font-black text-white">₹{car.price24hr}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                <div className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-xl">
                  <span className="text-sm text-white/70 font-medium">Extra KM Charge</span>
                  <span className="font-bold text-white">₹{car.extraKmRate}/km</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-xl">
                  <span className="text-sm text-white/70 font-medium">Extra Hour Charge</span>
                  <span className="font-bold text-white">₹{car.extraHourRate}/hr</span>
                </div>
                <div className="flex justify-between items-center px-4 py-1.5 rounded-xl">
                  <span className="text-sm text-white/70 font-medium whitespace-pre-wrap">12h Included: 100km\n24h Included: 200km</span>
                </div>
              </div>

              <button 
                onClick={() => handleBookClick(car)}
                className="w-full bg-primary hover:bg-[#e6a320] text-[#181611] font-black text-lg py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] mt-auto uppercase tracking-wide"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
        {cars.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-white/10 mb-4 block">car_rental</span>
            <h3 className="text-2xl font-black text-white mb-2">No Cars Available</h3>
            <p className="text-white/50">There are currently no self-drive cars added to the inventory.</p>
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[#1e1a0e] w-full max-w-xl h-full md:h-[90vh] md:max-h-[850px] shadow-2xl flex flex-col md:rounded-3xl border border-white/10 overflow-hidden relative">
              <button 
                onClick={handleCloseModal} 
                className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-20"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="p-6 md:p-8 border-b border-white/10 bg-black/20 shrink-0">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4 border border-primary/20">Self Drive Reservation</span>
                <h2 className="text-3xl font-black text-white leading-tight">Book {selectedCar.name}</h2>
                <p className="text-white/50 mt-2 text-sm max-w-md">Complete your details to secure this vehicle. A refundable deposit of ₹{selectedCar.deposit} will be required.</p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                {bookingSuccess ? (
                  <div className="text-center py-12">
                     <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-5xl">check_circle</span>
                     </div>
                     <h3 className="text-2xl font-black text-white mb-2">Booking Confirmed!</h3>
                     <p className="text-white/70 mb-6">Your self-drive booking has been placed successfully.</p>
                     <div className="bg-white/5 border border-white/10 p-4 rounded-2xl italic text-lg font-bold text-primary mb-8 inline-block px-8">
                       ID: {bookingSuccess}
                     </div>
                     <br/>
                     <button onClick={handleCloseModal} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl transition-colors">Done</button>
                  </div>

                ) : (
                  <form onSubmit={handleInitiateBooking} className="space-y-6">
                     <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-start gap-4">
                        <span className="material-symbols-outlined text-primary mt-0.5">account_circle</span>
                        <div>
                          <p className="text-sm font-bold text-white">Guest Checkout</p>
                          {session ? (
                            <p className="text-xs text-primary/80 mt-1">Logged in as <b>{session.phone}</b>. OTP bypass engaged.</p>
                          ) : (
                            <p className="text-xs text-white/50 mt-1">We will verify your mobile number with a quick OTP before confirming.</p>
                          )}
                        </div>
                     </div>

                     <div className="space-y-5">
                       <div>
                         <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block">Your Full Name <span className="text-red-500">*</span></label>
                         <input autoComplete="name" required name="customerName" defaultValue={session?.name || ""} placeholder="John Doe" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors placeholder-white/20 font-medium"/>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                         <div>
                           <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block">Mobile Number <span className="text-red-500">*</span></label>
                           <input
                             autoComplete="tel-national"
                             required
                             name="customerPhone"
                             type="tel"
                             maxLength={10}
                             value={phoneVal}
                             placeholder="9876543210"
                             className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary outline-none font-medium placeholder-white/20`}
                             onChange={(e) => setPhoneVal(cleanPhone(e.target.value))}
                           />
                         </div>
                       </div>
                     </div>

                     <hr className="border-white/10 my-8"/>

                     <div className="space-y-5">
                       <div>
                         <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">pin_drop</span> Branch Name <span className="text-red-500">*</span></label>
                         <input required readOnly name="pickupLocation" value="BHEL Jagdispur" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white/50 cursor-not-allowed outline-none font-medium placeholder-white/20"/>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">calendar_month</span> Booking Date <span className="text-red-500">*</span></label>
                           <input required type="date" name="pickupDate" min={new Date().toISOString().split("T")[0]} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none form-input invert-0 dark:invert-[1]" />
                         </div>
                         <div>
                           <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">schedule</span> Pickup Time <span className="text-red-500">*</span></label>
                           <input required type="time" name="pickupTime" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none form-input invert-0 dark:invert-[1]" />
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">calendar_month</span> Return Date <span className="text-red-500">*</span></label>
                           <input required type="date" name="returnDate" min={pickupDate || new Date().toISOString().split("T")[0]} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none form-input invert-0 dark:invert-[1]" />
                         </div>
                         <div>
                           <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">schedule</span> Return Time <span className="text-red-500">*</span></label>
                           <input required type="time" name="returnTime" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none form-input invert-0 dark:invert-[1]" />
                         </div>
                       </div>
                     </div>

                     <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mt-8 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                           <span className="material-symbols-outlined text-6xl">receipt_long</span>
                        </div>
                        <p className="text-xs text-white/60 mb-2">Final pricing will be calculated based on the block rules (12hr/24hr slices). Minimum billing applies.</p>
                        <p className="text-lg font-black text-white mb-1"><span className="text-primary font-bold">Base Tariff:</span> ₹{selectedCar.price12hr} <span className="text-sm font-medium text-white/50">(Min 12 Hours)</span></p>
                        <p className="text-sm font-bold text-white"><span className="text-red-400 font-bold">Mandatory Deposit:</span> ₹{selectedCar.deposit} <span className="font-normal text-white/50 font-medium">(Refundable)</span></p>
                     </div>

                     {/* Coupon */}
                     <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                        <h3 className="text-white font-black text-sm mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xl">loyalty</span>
                          Apply Coupon Code
                        </h3>
                        
                        {!appliedCoupon ? (
                          <div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="ENTER CODE"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white uppercase focus:border-primary outline-none text-sm placeholder-white/30 tracking-wider"
                              />
                              <button
                                type="button"
                                onClick={handleApplyCoupon}
                                disabled={couponLoading || !couponInput.trim()}
                                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-[#181611] px-5 font-black rounded-xl transition-all text-sm"
                              >
                                {couponLoading ? "..." : "APPLY"}
                              </button>
                            </div>
                            {couponError && <p className="text-red-400 text-xs mt-2 font-medium">{couponError}</p>}
                          </div>
                        ) : (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center justify-between">
                            <div>
                              <p className="text-green-400 font-bold text-sm flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                Coupon Applied!
                              </p>
                              <p className="text-white/60 text-xs mt-0.5">Code <strong className="text-white">{appliedCoupon.code}</strong> applies {appliedCoupon.discountType === "FLAT" ? `₹${appliedCoupon.discountFlat}` : `${appliedCoupon.discountPercent}%`} OFF to the base rate.</p>
                            </div>
                            <button
                              type="button"
                              onClick={removeCoupon}
                              className="text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors"
                              title="Remove Coupon"
                            >
                              <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                          </div>
                        )}
                     </div>

                     <button 
                       type="submit"
                       disabled={isPending || isPaying}
                       className="w-full bg-primary hover:bg-[#e6a320] text-[#181611] font-black py-4 rounded-xl transition-all shadow-lg hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest flex items-center justify-center gap-2"
                     >
                       {isPending || isPaying ? "Processing Payment..." : (
                          <>Pay & Complete Booking <span className="material-symbols-outlined text-[18px]">check_circle</span></>
                       )}
                     </button>
                  </form>
                )}
              </div>
           </div>
        </div>
      )}

      {/* OTP Verification Modal */}
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
                <input
                  key={idx}
                  id={`self-otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={otpCode[idx]}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/, '');
                    const newOtp = [...otpCode];
                    newOtp[idx] = val;
                    setOtpCode(newOtp);
                    if (val && idx < 3) {
                      document.getElementById(`self-otp-input-${idx + 1}`).focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otpCode[idx] && idx > 0) {
                      document.getElementById(`self-otp-input-${idx - 1}`).focus();
                    } else if (e.key === "Enter") {
                      if (idx === 3 && otpCode[3]) handleVerifyOtp();
                    }
                  }}
                  className="w-14 h-14 bg-white/5 border border-white/15 rounded-xl text-center text-white text-2xl font-black focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              ))}
            </div>

            <button
               type="button"
               onClick={handleVerifyOtp}
               disabled={verifyingOtp}
               className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-[#181611] font-black py-4 rounded-xl transition-all"
            >
               {verifyingOtp ? "Verifying..." : "Verify & Book Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
