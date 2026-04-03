import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STATUS_CONFIG = {
  CONFIRMED: { label: "Confirmed",  bg: "bg-green-500/20", text: "text-green-400",  icon: "check_circle",  border: "border-green-500/30" },
  PENDING:   { label: "Pending",    bg: "bg-yellow-500/20",text: "text-yellow-400", icon: "pending",        border: "border-yellow-500/30" },
  CANCELLED: { label: "Cancelled",  bg: "bg-red-500/20",   text: "text-red-400",    icon: "cancel",         border: "border-red-500/30" },
  COMPLETED: { label: "Completed",  bg: "bg-blue-500/20",  text: "text-blue-400",   icon: "task_alt",       border: "border-blue-500/30" },
};

const PAYMENT_LABELS = {
  PAY_ON_PICKUP: "Pay on Pickup (Cash/UPI to driver)",
  RAZORPAY:      "Online Payment (Razorpay)",
};

const TRIP_LABELS = { ONE_WAY: "One Way", ROUND_TRIP: "Round Trip", RENTAL: "Local Rental" };

export default async function ConfirmationPage({ searchParams }) {
  const p = await searchParams;
  const { ref } = p;

  const booking = ref
    ? await prisma.booking.findUnique({
        where: { referenceId: ref },
        include: {
          car:           true,
          fromCity:      true,
          toCity:        true,
          pickupLocation: true,
          dropLocation:   true,
          package:        true,
          payment:        true,
        },
      })
    : null;

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#181611] flex items-center justify-center font-display px-4">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-white/20 block mb-4">search_off</span>
          <p className="text-white text-xl font-bold">Booking not found</p>
          <p className="text-white/50 text-sm mt-1">Check your reference number and try again</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 bg-primary text-[#181611] font-bold px-6 py-3 rounded-xl">
            <span className="material-symbols-outlined">home</span>
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;

  function formatDate(d) {
    return new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
  function formatTime(t) {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr < 12 ? "AM" : "PM"}`;
  }

  return (
    <div className="min-h-screen bg-[#181611] font-display">
      {/* Header */}
      <header className="bg-[#1e1a0e] border-b border-white/10 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="bg-primary rounded-lg p-1.5">
            <span className="material-symbols-outlined text-[#181611] text-xl">local_taxi</span>
          </div>
          <span className="text-white font-bold">Chaman Cab</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Success Banner */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${status.bg} border-2 ${status.border} mb-4`}>
            <span className={`material-symbols-outlined text-4xl ${status.text}`}>{status.icon}</span>
          </div>
          <h1 className="text-white text-3xl font-black mb-1">Booking {status.label}!</h1>
          <p className="text-white/50 text-sm">
            {booking.status === "CONFIRMED"
              ? "Your cab has been booked. The driver will contact you before pickup."
              : "Your booking has been received."}
          </p>
        </div>

        {/* Reference Card */}
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 mb-6 text-center">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Booking Reference</p>
          <p className="text-primary font-black text-3xl tracking-wider">#{booking.referenceId}</p>
          <p className="text-white/40 text-xs mt-1">Save this reference number for tracking your booking</p>
        </div>

        {/* Main Details Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-4">
          {/* Car Row */}
          <div className="p-5 flex items-center gap-4 border-b border-white/10">
            <div className="bg-primary/10 rounded-xl p-3">
              <span className="material-symbols-outlined text-primary text-3xl">directions_car</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-lg">{booking.car?.name}</p>
              <div className="flex items-center gap-2 text-xs mt-0.5">
                <span className="text-white/50">{booking.car?.type}</span>
                <span className="text-white/20">·</span>
                <span className={booking.car?.fuelType === "CNG" ? "text-green-400" : "text-blue-400"}>
                  {booking.car?.fuelType}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-white/50">{booking.car?.seats} Seats</span>
              </div>
            </div>
            <div className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-xs font-bold ${status.border} border`}>
              {status.label}
            </div>
          </div>

          {/* Trip Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="p-5 space-y-4">
              <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Trip Details</h3>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary/70 text-lg mt-0.5">label</span>
                <div>
                  <p className="text-white/40 text-xs">Trip Type</p>
                  <p className="text-white text-sm font-semibold">{TRIP_LABELS[booking.tripType]}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary/70 text-lg mt-0.5">location_on</span>
                <div>
                  <p className="text-white/40 text-xs">Route</p>
                  <p className="text-white text-sm font-semibold">
                    {booking.fromCity?.name ?? "—"}
                    {booking.toCity && ` → ${booking.toCity.name}`}
                    {booking.package && ` · ${booking.package.name}`}
                  </p>
                  {booking.pickupLocation && (
                    <p className="text-white/50 text-xs mt-0.5">Pickup: {booking.pickupLocation.landmark}</p>
                  )}
                  {booking.dropLocation && (
                    <p className="text-white/50 text-xs">Drop: {booking.dropLocation.landmark}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary/70 text-lg mt-0.5">calendar_today</span>
                <div>
                  <p className="text-white/40 text-xs">Pickup Date & Time</p>
                  <p className="text-white text-sm font-semibold">{formatDate(booking.pickupDate)}</p>
                  <p className="text-white/60 text-xs">{formatTime(booking.pickupTime)}</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Passenger & Payment</h3>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary/70 text-lg mt-0.5">person</span>
                <div>
                  <p className="text-white/40 text-xs">Passenger Name</p>
                  <p className="text-white text-sm font-semibold">{booking.customerName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary/70 text-lg mt-0.5">call</span>
                <div>
                  <p className="text-white/40 text-xs">Mobile Number</p>
                  <p className="text-white text-sm font-semibold">{booking.customerPhone}</p>
                </div>
              </div>

              {booking.customerEmail && (
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary/70 text-lg mt-0.5">mail</span>
                  <div>
                    <p className="text-white/40 text-xs">Email</p>
                    <p className="text-white text-sm font-semibold">{booking.customerEmail}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary/70 text-lg mt-0.5">payments</span>
                <div>
                  <p className="text-white/40 text-xs">Payment</p>
                  <p className="text-white text-sm font-semibold">₹{booking.amount.toLocaleString("en-IN")}</p>
                  <p className="text-white/50 text-xs">{PAYMENT_LABELS[booking.paymentMethod]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="px-5 pb-5 pt-0 border-t border-white/10">
              <div className="flex items-start gap-3 mt-4">
                <span className="material-symbols-outlined text-primary/70 text-lg mt-0.5">note</span>
                <div>
                  <p className="text-white/40 text-xs">Special Requests</p>
                  <p className="text-white/80 text-sm">{booking.specialRequests}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Important Note */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-yellow-400 text-xl">info</span>
            <div>
              <p className="text-yellow-300 text-sm font-bold mb-1">What Happens Next?</p>
              <ul className="text-yellow-300/70 text-xs space-y-1.5">
                <li>• Our team will call you within 1-2 hours to confirm the booking</li>
                {booking.paymentMethod === "PAY_ON_PICKUP" && (
                  <li>• Pay ₹{booking.amount.toLocaleString("en-IN")} directly to the driver (Cash or UPI)</li>
                )}
                <li>• Driver details will be shared 1 hour before your scheduled pickup</li>
                <li>• For any queries, call us at <strong className="text-yellow-300">+91 XXXXX XXXXX</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/5 font-bold py-3.5 rounded-xl transition-all text-sm"
          >
            <span className="material-symbols-outlined text-lg">home</span>
            Back to Home
          </Link>
          <a
            href="javascript:window.print()"
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 rounded-xl transition-all text-sm"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            Print / Download
          </a>
          <a
            href={`https://wa.me/?text=My%20Chaman%20Cab%20booking%20ref%3A%20%23${booking.referenceId}%20from%20${booking.fromCity?.name ?? ''}%20to%20${booking.toCity?.name ?? ''}%20on%20${new Date(booking.pickupDate).toLocaleDateString('en-IN')}`}
            target="_blank"
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl transition-all text-sm"
          >
            <span className="material-symbols-outlined text-lg">share</span>
            Share on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
