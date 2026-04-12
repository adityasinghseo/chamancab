"use client";

import { useState, useTransition } from "react";
import { updateBookingPayment } from "@/app/actions/booking";

const PAYMENT_STATUS_LABELS = {
  PENDING:      { label: "Pending",        color: "text-yellow-400" },
  PARTIAL_PAID: { label: "Partially Paid", color: "text-blue-400"   },
  PAID_FULL:    { label: "Fully Paid",     color: "text-green-400"  },
  PAID_OFFLINE: { label: "Paid (Offline)", color: "text-green-400"  },
};

const loadRazorpay = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function PayRemainingClient({ booking }) {
  const [isPaying, setIsPaying] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const alreadyPaid = booking.paymentStatus === "PAID_FULL" || booking.paymentStatus === "PAID_OFFLINE";

  async function handlePayRemaining() {
    if (alreadyPaid || booking.remaining <= 0) return;
    setIsPaying(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      setIsPaying(false);
      return;
    }

    const orderRes = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: booking.remaining }),
    });
    const order = await orderRes.json();
    if (!order?.id) {
      alert("Failed to create payment order. Please try again.");
      setIsPaying(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Chaman Cab",
      description: `Remaining payment for Booking ${booking.referenceId}`,
      order_id: order.id,
      prefill: { name: booking.customerName, contact: booking.customerPhone },
      theme: { color: "#D2A645" },
      handler: async function (response) {
        const verifyRes = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          }),
        });
        const data = await verifyRes.json();
        if (data.success) {
          // Update booking in DB
          const fd = new FormData();
          fd.append("bookingId", booking.id);
          fd.append("additionalPaid", booking.remaining);
          fd.append("razorpayPaymentId", response.razorpay_payment_id);
          startTransition(() => {
            updateBookingPayment(fd).then(() => setDone(true));
          });
        } else {
          alert("Payment verification failed. Please contact support.");
          setIsPaying(false);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (resp) => {
      alert("Payment Failed: " + resp.error.description);
      setIsPaying(false);
    });
    rzp.open();
  }

  const statusInfo = PAYMENT_STATUS_LABELS[booking.paymentStatus] || PAYMENT_STATUS_LABELS.PENDING;

  return (
    <div className="min-h-screen bg-[#181611] font-display flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <a href="/">
            <img src="/CHAMANCAB-LOGO.webp" alt="Chaman Cab" className="h-16 w-auto" />
          </a>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
          <h1 className="text-white font-black text-2xl mb-1 text-center">Complete Payment</h1>
          <p className="text-white/40 text-sm text-center mb-6">Booking #{booking.referenceId}</p>

          {done ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-6xl text-green-400 block mb-4">check_circle</span>
              <p className="text-white font-black text-xl mb-2">Payment Successful!</p>
              <p className="text-white/50 text-sm">Your booking is now fully paid.</p>
              <a href="/" className="mt-6 inline-block bg-primary text-[#181611] font-bold px-6 py-3 rounded-xl text-sm">
                Back to Home
              </a>
            </div>
          ) : (
            <>
              {/* Booking Info */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Customer</span>
                  <span className="text-white font-semibold">{booking.customerName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Car</span>
                  <span className="text-white font-semibold">{booking.carName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Trip Type</span>
                  <span className="text-white font-semibold capitalize">{booking.tripType?.replace("_", " ")}</span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Total Fare</span>
                  <span className="text-white font-bold">₹{booking.totalFare?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Already Paid</span>
                  <span className="text-green-400 font-bold">₹{booking.paidAmount?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Payment Status</span>
                  <span className={`font-bold ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>
              </div>

              {/* Remaining Amount */}
              {alreadyPaid || booking.remaining <= 0 ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                  <span className="material-symbols-outlined text-green-400 text-3xl block mb-2">verified</span>
                  <p className="text-green-400 font-bold">This booking is fully paid!</p>
                  <p className="text-white/40 text-xs mt-1">No payment is required.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center">
                    <p className="text-white/60 text-xs mb-1">Remaining Amount Due</p>
                    <p className="text-primary font-black text-3xl">₹{booking.remaining?.toLocaleString("en-IN")}</p>
                  </div>
                  <button
                    onClick={handlePayRemaining}
                    disabled={isPaying || isPending}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-[#181611] font-black text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {isPaying || isPending ? (
                      <>
                        <span className="w-5 h-5 border-2 border-[#181611]/30 border-t-[#181611] rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">credit_card</span>
                        Pay ₹{booking.remaining?.toLocaleString("en-IN")} Now
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
