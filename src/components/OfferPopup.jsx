"use client";
import { useState, useEffect, useTransition } from "react";
import { getActiveOffers, initiateOfferBooking, confirmOfferBooking } from "@/app/actions/offers";
import { verifyLoginOtp } from "@/app/actions/auth";

export default function OfferPopup() {
  const [offers, setOffers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [bookingOffer, setBookingOffer] = useState(null);
  const [authStep, setAuthStep] = useState(0); // 0=form, 1=otp, 2=success
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [otpMsg, setOtpMsg] = useState("");
  const [refId, setRefId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [pendingData, setPendingData] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    // Don't show again if dismissed this session
    if (sessionStorage.getItem("offerDismissed")) return;
    getActiveOffers().then(data => {
      if (data.length > 0) {
        setOffers(data);
        setTimeout(() => setVisible(true), 2000); // show after 2s
      }
    });
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("offerDismissed", "1");
  };

  const offer = offers[currentIdx];
  if (!visible || !offer) return null;

  const handleBooking = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    fd.append("offerId", offer.id);
    startTransition(async () => {
      const res = await initiateOfferBooking(fd);
      if (res.error) { alert(res.error); return; }
      setPendingData(fd);
      setOtpMsg(res.message || "OTP sent!");
      setAuthStep(1);
    });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processRazorpayPayment = async (fd) => {
    setIsPaying(true);
    const res = await loadRazorpay();
    if (!res) {
       alert("Razorpay SDK failed to load. Are you online?");
       setIsPaying(false);
       return;
    }

    try {
      const amount = offer.price;
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const order = await orderRes.json();
      if (!order || !order.id) throw new Error("Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Chaman Cab",
        description: `Offer: ${offer.fromCity} to ${offer.toCity}`,
        order_id: order.id,
        handler: function (response) {
           fd.append("razorpayPaymentId", response.razorpay_payment_id);
           startTransition(async () => {
             const serverRes = await confirmOfferBooking(fd);
             setIsPaying(false);
             if (serverRes.error) alert(serverRes.error);
             else {
               setRefId(serverRes.referenceId);
               setAuthStep(2);
             }
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
      alert("Payment initialization error.");
      setIsPaying(false);
    }
  };

  const handleVerify = () => {
    const code = otpCode.join("");
    if (code.length < 4) return;
    startTransition(async () => {
      const phone = pendingData.get("customerPhone");
      const otpRes = await verifyLoginOtp(phone, code);
      if (otpRes?.error) { alert(otpRes.error); return; }
      
      processRazorpayPayment(pendingData);
    });
  };

  const discount = Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100);

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={dismiss} />

      <div className="relative w-full md:max-w-md bg-[#1a1608] rounded-t-3xl md:rounded-3xl border border-primary/30 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-amber-600/20 px-5 py-4 border-b border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
            <span className="text-primary text-xs font-black uppercase tracking-widest">Special Offer</span>
            {offers.length > 1 && (
              <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                {currentIdx + 1}/{offers.length}
              </span>
            )}
          </div>
          <button onClick={dismiss} className="text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5">
          {bookingOffer ? (
            // ── BOOKING FORM ──
            <div>
              <button onClick={() => { setBookingOffer(null); setAuthStep(0); setOtpCode(["","","",""]); }}
                className="flex items-center gap-1 text-white/50 hover:text-white text-sm font-bold mb-4 transition-colors">
                <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Offer
              </button>

              {authStep === 2 ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-green-400 text-3xl">check_circle</span>
                  </div>
                  <h3 className="text-white font-black text-xl mb-2">Booking Confirmed!</h3>
                  <p className="text-white/50 text-sm mb-4">We'll contact you soon with trip details.</p>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl px-6 py-3 inline-block">
                    <p className="text-primary font-black tracking-widest text-lg">REF: {refId}</p>
                  </div>
                  <button onClick={dismiss} className="block w-full mt-5 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors">
                    Close
                  </button>
                </div>
              ) : authStep === 1 ? (
                <div>
                  <p className="text-white/50 text-sm mb-5">{otpMsg}</p>
                  <div className="flex gap-3 justify-center mb-6">
                    {otpCode.map((digit, idx) => (
                      <input key={idx} id={`pop-otp-${idx}`} type="text" maxLength={1} value={digit}
                        onChange={e => {
                          const val = e.target.value;
                          const n = [...otpCode]; n[idx] = val; setOtpCode(n);
                          if (val && idx < 3) document.getElementById(`pop-otp-${idx + 1}`)?.focus();
                        }}
                        onKeyDown={e => { if (e.key === "Backspace" && !otpCode[idx] && idx > 0) document.getElementById(`pop-otp-${idx - 1}`)?.focus(); }}
                        className="w-12 h-14 bg-white/5 border border-white/20 rounded-xl text-center text-xl font-black text-white focus:border-primary outline-none"
                        placeholder="•"
                      />
                    ))}
                  </div>
                  <button onClick={handleVerify} disabled={isPending || isPaying || otpCode.join("").length < 4}
                    className="w-full bg-primary text-[#181611] font-black py-3.5 rounded-xl disabled:opacity-50 transition-all">
                    {isPaying ? "Processing Payment..." : isPending ? "Verifying..." : "Verify & Pay"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-3">
                  <h3 className="text-white font-black text-lg mb-4">
                    Book: {offer.fromCity} → {offer.toCity}
                  </h3>
                  <input required name="customerName" placeholder="Your Full Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none placeholder-white/30" />
                  <input required name="customerPhone" type="tel" minLength={10} maxLength={10} placeholder="Mobile Number (for OTP)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none placeholder-white/30" />
                  <button type="submit" disabled={isPending} className="w-full bg-primary text-[#181611] font-black py-3.5 rounded-xl disabled:opacity-50">
                    {isPending ? "Sending OTP..." : "Send OTP & Book"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            // ── OFFER CARD ──
            <>
              {/* Route */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 flex-1 text-center">
                  <p className="text-primary text-xs font-black uppercase tracking-widest mb-1">From</p>
                  <p className="text-white font-black text-xl">{offer.fromCity}</p>
                </div>
                <span className="material-symbols-outlined text-primary text-2xl">arrow_forward</span>
                <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 flex-1 text-center">
                  <p className="text-primary text-xs font-black uppercase tracking-widest mb-1">To</p>
                  <p className="text-white font-black text-xl">{offer.toCity}</p>
                </div>
              </div>

              {/* Details row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <span className="material-symbols-outlined text-primary text-sm block mb-1">calendar_today</span>
                  <p className="text-white text-xs font-bold">{offer.date}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <span className="material-symbols-outlined text-primary text-sm block mb-1">schedule</span>
                  <p className="text-white text-xs font-bold">{offer.time}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                  <span className="material-symbols-outlined text-red-400 text-sm block mb-1">directions_car</span>
                  <p className="text-red-400 text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis">Only {offer.carsAvailable} Car{offer.carsAvailable !== 1 ? "s" : ""} Left</p>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 rounded-2xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-white/40 text-xs line-through">₹{offer.originalPrice}</p>
                  <p className="text-white font-black text-3xl">₹{offer.price}</p>
                  {offer.description && <p className="text-white/50 text-xs mt-1 italic">{offer.description}</p>}
                </div>
                <div className="bg-green-500 text-white font-black text-xl px-4 py-2 rounded-xl">
                  {discount}% OFF
                </div>
              </div>

              {/* Actions */}
              <button onClick={() => setBookingOffer(offer)}
                className="w-full bg-primary hover:bg-primary/90 text-[#181611] font-black py-4 rounded-xl text-base transition-all hover:scale-[1.02] active:scale-[.98] shadow-lg shadow-primary/30 mb-3">
                Book This Offer Now
              </button>

              {offers.length > 1 && (
                <div className="flex gap-2">
                  <button onClick={() => setCurrentIdx((currentIdx - 1 + offers.length) % offers.length)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 font-bold py-2.5 rounded-xl text-sm transition-colors">
                    ← Prev
                  </button>
                  <button onClick={() => setCurrentIdx((currentIdx + 1) % offers.length)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 font-bold py-2.5 rounded-xl text-sm transition-colors">
                    Next →
                  </button>
                </div>
              )}
              <button onClick={dismiss} className="w-full text-white/30 hover:text-white/60 text-xs font-medium py-2 transition-colors mt-1">
                Maybe later
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
