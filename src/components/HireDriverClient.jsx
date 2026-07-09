"use client";

import { useState, useTransition } from "react";
import { submitDriverBooking } from "@/app/actions/hireDriver";

export default function HireDriverClient({ drivers }) {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [selectedDriverType, setSelectedDriverType] = useState(null);

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


  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    const phone = fd.get("customerPhone")?.trim();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)");
      return;
    }

    fd.append("driverId", selectedDriver.id);
    fd.append("driverType", selectedDriver.driverType || "manual");
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

  const filteredDrivers = drivers.filter(drv => (drv.driverType || "manual") === selectedDriverType);

  if (selectedDriverType === null) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-wide">Hire a Professional Driver</h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
            Choose your vehicle's transmission type to view available professional drivers and custom pricing packages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto px-4">
          <button
            onClick={() => setSelectedDriverType("manual")}
            className="bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/10 p-8 rounded-3xl text-left transition-all duration-300 group flex flex-col items-center md:items-start text-center md:text-left cursor-pointer"
          >
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl font-black">settings</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Manual Driver</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              Hire a driver for manual transmission vehicles. Select from flexible 8-hour (Half Time) or 12-hour (Full Time) options.
            </p>
            <span className="mt-auto text-primary font-black text-sm uppercase tracking-widest flex items-center gap-2">
              Select Manual <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
            </span>
          </button>

          <button
            onClick={() => setSelectedDriverType("automatic")}
            className="bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/10 p-8 rounded-3xl text-left transition-all duration-300 group flex flex-col items-center md:items-start text-center md:text-left cursor-pointer"
          >
            <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl font-black">bolt</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Automatic Driver</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              Hire a driver specialized in automatic transmission vehicles. Enjoy simplified flat rate automatic pricing.
            </p>
            <span className="mt-auto text-blue-400 font-black text-sm uppercase tracking-widest flex items-center gap-2">
              Select Automatic <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header and Filter Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">
              {selectedDriverType === "automatic" ? "bolt" : "settings"}
            </span>
            {selectedDriverType === "automatic" ? "Automatic Drivers" : "Manual Drivers"}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Showing available verified drivers for {selectedDriverType === "automatic" ? "automatic" : "manual"} cars.
          </p>
        </div>
        <button
          onClick={() => setSelectedDriverType(null)}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold transition-all"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Change Driver Type
        </button>
      </div>

      {/* Driver Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredDrivers.map((drv) => (
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

              <div className="space-y-3 mb-8 flex-1 mt-4">
                {drv.driverType !== "automatic" ? (
                  <>
                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Half Time Driver (8 Hours)</p>
                      <p className="text-xl font-black text-white">₹{drv.halfTimePrice} <span className="text-xs font-medium text-white/50">/ Trip</span></p>
                    </div>
                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Full Time Driver (12 Hours)</p>
                      <p className="text-xl font-black text-white">₹{drv.fullTimePrice} <span className="text-xs font-medium text-white/50">/ Trip</span></p>
                    </div>
                  </>
                ) : (
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Automatic Car Driver</p>
                    <p className="text-xl font-black text-white">₹{drv.automaticPrice} <span className="text-xs font-medium text-white/50">/ Trip</span></p>
                  </div>
                )}
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

        {filteredDrivers.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <span className="material-symbols-outlined text-6xl text-white/10 mb-4 block">person_off</span>
            <h3 className="text-2xl font-black text-white mb-2">No Drivers Available</h3>
            <p className="text-white/50">There are currently no drivers listed for transmission type: {selectedDriverType}.</p>
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
                  {/* Hidden inputs */}
                  <input type="hidden" name="driverType" value={selectedDriver.driverType || "manual"} />

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

                  {/* Package Selection */}
                  <div className="space-y-3 mb-6 mt-4">
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block">
                      Select Package <span className="text-red-500">*</span>
                    </label>
                    {selectedDriver.driverType !== "automatic" ? (
                      <>
                        <label className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <input type="radio" name="bookingType" value="Half Time Driver (8 Hours)" defaultChecked required className="accent-primary w-4 h-4" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">Half Time Driver</p>
                            <p className="text-xs text-white/50">8 Hours</p>
                          </div>
                          <p className="font-bold text-white">₹{selectedDriver.halfTimePrice}</p>
                        </label>
                        <label className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <input type="radio" name="bookingType" value="Full Time Driver (12 Hours)" className="accent-primary w-4 h-4" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">Full Time Driver</p>
                            <p className="text-xs text-white/50">12 Hours</p>
                          </div>
                          <p className="font-bold text-white">₹{selectedDriver.fullTimePrice}</p>
                        </label>
                      </>
                    ) : (
                      <label className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                        <input type="radio" name="bookingType" value="Automatic Car Driver" defaultChecked required className="accent-primary w-4 h-4" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Automatic Car Driver</p>
                          <p className="text-xs text-white/50">12 Hours</p>
                        </div>
                        <p className="font-bold text-white">₹{selectedDriver.automaticPrice}</p>
                      </label>
                    )}
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
