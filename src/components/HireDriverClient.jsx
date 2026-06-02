"use client";

import { useState, useTransition } from "react";
import { submitDriverBooking } from "@/app/actions/hireDriver";

export default function HireDriverClient({ drivers }) {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Strip country code helper
  const cleanPhone = (raw = "") => {
    let v = raw.replace(/\D/g, "");
    if (v.startsWith("91") && v.length > 10) v = v.slice(2);
    return v.slice(0, 10);
  };
  const [phoneVal, setPhoneVal] = useState("");

  const handleBookClick = (driver) => {
    setSelectedDriver(driver);
    setBookingSuccess(null);
    setPhoneVal("");
  };

  const handleCloseModal = () => {
    setSelectedDriver(null);
  };

  const parseHours = (str) => {
    const match = str?.match(/\d+/);
    return match ? parseInt(match[0]) : 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    const phone = fd.get("customerPhone")?.trim();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)");
      return;
    }

    fd.append("driverId", selectedDriver.id);
    setIsSubmitting(true);

    startTransition(async () => {
      try {
        const res = await submitDriverBooking(fd);
        setIsSubmitting(false);
        if (res?.error) alert(res.error);
        else setBookingSuccess(res.referenceId);
      } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
        setIsSubmitting(false);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Driver Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {drivers.map((drv) => (
          <div key={drv.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col hover:bg-white/10 transition-colors">
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

              <div className="bg-black/40 rounded-2xl p-5 mb-6 border border-white/5">
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  Standard Duty ({drv.dutyHours})
                </p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-black text-white leading-none">
                    ₹{drv.halfDayPrice || drv.costPerHour * parseHours(drv.dutyHours)}
                  </p>
                  <p className="text-sm font-medium text-white/50 mb-1">/ Trip</p>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl">
                  <span className="text-sm text-white/70 font-medium">Full Day</span>
                  <span className="font-bold text-white">₹{drv.fullDayPrice || "Contact us"}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl">
                  <span className="text-sm text-white/70 font-medium">Night Charges</span>
                  <span className="font-bold text-white">Applicable</span>
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
            <p className="text-white/50">There are currently no drivers listed in the inventory.</p>
          </div>
        )}
      </div>

      {/* Long Route Note */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mt-2 mb-8 mx-auto flex gap-3 items-start">
        <span className="material-symbols-outlined text-yellow-400 mt-0.5">info</span>
        <p className="text-yellow-400/90 text-sm leading-relaxed">
          <span className="font-bold">Note:</span> For long-route bookings, customer must provide food and accommodation for the driver. An additional charge of ₹3 per kilometer will apply, and the return travel ticket for the driver must also be arranged by the customer.
        </p>
      </div>

      {/* Booking Enquiry Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e1a0e] w-full max-w-xl h-full md:h-auto md:max-h-[90vh] shadow-2xl flex flex-col md:rounded-3xl border border-white/10 overflow-hidden relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-20"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="p-6 md:p-8 border-b border-white/10 bg-black/20 shrink-0">
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4 border border-blue-500/20">
                Driver Enquiry
              </span>
              <h2 className="text-3xl font-black text-white leading-tight">Hire {selectedDriver.name}</h2>
              <p className="text-white/50 mt-2 text-sm max-w-md">
                Fill in your details and submit. Our team will contact you to confirm the booking.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {bookingSuccess ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-5xl">check_circle</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Enquiry Submitted!</h3>
                  <p className="text-white/70 mb-2">Your driver enquiry has been received successfully.</p>
                  <p className="text-white/50 text-sm mb-6">Our team will call you shortly to confirm.</p>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl italic text-lg font-bold text-primary mb-8 inline-block px-8">
                    ID: {bookingSuccess}
                  </div>
                  <br />
                  <button
                    onClick={handleCloseModal}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      autoComplete="name"
                      required
                      name="customerName"
                      placeholder="John Doe"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors placeholder-white/20 font-medium"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      autoComplete="tel-national"
                      required
                      name="customerPhone"
                      type="tel"
                      maxLength={10}
                      value={phoneVal}
                      placeholder="9876543210"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary outline-none font-medium placeholder-white/20"
                      onChange={(e) => setPhoneVal(cleanPhone(e.target.value))}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block">
                      Email <span className="text-white/30">(Optional)</span>
                    </label>
                    <input
                      autoComplete="email"
                      name="customerEmail"
                      type="email"
                      placeholder="your@email.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary outline-none font-medium placeholder-white/20"
                    />
                  </div>

                  <hr className="border-white/10" />

                  {/* Pickup Location */}
                  <div>
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                      Pickup Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="pickupLocation"
                      placeholder="Enter landmark or address for driver to arrive"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary outline-none font-medium placeholder-white/20"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="date"
                        name="startDate"
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none invert-0 dark:invert-[1]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="time"
                        name="startTime"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none invert-0 dark:invert-[1]"
                      />
                    </div>
                  </div>

                  {/* Pricing info */}
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <span className="material-symbols-outlined text-6xl">receipt_long</span>
                    </div>
                    <p className="text-xs text-white/60 mb-1">Standard {selectedDriver.dutyHours} shift</p>
                    <p className="text-lg font-black text-white">
                      <span className="text-blue-400 font-bold">Estimated Fare:</span>{" "}
                      ₹{selectedDriver.halfDayPrice || selectedDriver.costPerHour * parseHours(selectedDriver.dutyHours)}{" "}
                      <span className="text-sm font-medium text-white/50">(Min Base)</span>
                    </p>
                    <p className="text-xs text-yellow-400/70 mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">info</span>
                      Pay directly to the driver. No online payment needed.
                    </p>
                  </div>

                  {/* Important Modal Note */}
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                    <p className="text-yellow-400/80 text-[11px] leading-relaxed">
                      <span className="font-semibold text-xs">Important:</span> Food and accommodation for the driver are to be provided by the customer for long-route trips. Additional charges of ₹3/km will apply for long-distance travel, and the driver's return ticket must be provided by the customer.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending || isSubmitting}
                    className="w-full bg-primary hover:bg-[#e6a320] text-[#181611] font-black py-4 rounded-xl transition-all shadow-lg hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {isPending || isSubmitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-[#181611]/30 border-t-[#181611] rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        Submit Enquiry
                      </>
                    )}
                  </button>

                  <p className="text-center text-white/30 text-xs">
                    No payment required · We will call you to confirm
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
