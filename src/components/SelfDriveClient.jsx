"use client";

import { useState, useTransition } from "react";
import { submitSelfDriveBooking } from "@/app/actions/selfDrive";

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

  const handleBookClick = (car) => {
    setSelectedCar(car);
    setBookingSuccess(null);
    setPhoneVal("");
  };

  const handleCloseModal = () => {
    setSelectedCar(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    const phone = fd.get("customerPhone")?.trim();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)");
      return;
    }

    const pickupDate = fd.get("pickupDate");
    const pickupTime = fd.get("pickupTime");
    const returnDate = fd.get("returnDate");
    const returnTime = fd.get("returnTime");

    const pickupFull = new Date(`${pickupDate}T${pickupTime}`);
    const returnFull = new Date(`${returnDate}T${returnTime}`);

    if (returnFull <= pickupFull) {
      alert("Return time must be after pickup time.");
      return;
    }

    fd.append("carId", selectedCar.id);
    setIsSubmitting(true);

    startTransition(async () => {
      try {
        const res = await submitSelfDriveBooking(fd);
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
                  <span className="text-sm text-white/70 font-medium whitespace-pre-wrap">12h Included: 100km{"\n"}24h Included: 200km</span>
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

      {/* Booking Enquiry Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e1a0e] w-full max-w-xl h-full md:h-auto md:max-h-[90vh] shadow-2xl flex flex-col md:rounded-3xl border border-white/10 overflow-hidden relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-20"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="p-6 md:p-8 border-b border-white/10 bg-black/20 shrink-0">
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4 border border-primary/20">
                Self Drive Enquiry
              </span>
              <h2 className="text-3xl font-black text-white leading-tight">Book {selectedCar.name}</h2>
              <p className="text-white/50 mt-2 text-sm max-w-md">
                Fill in your details and submit. Our team will contact you to confirm availability and pricing.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {bookingSuccess ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-5xl">check_circle</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Enquiry Submitted!</h3>
                  <p className="text-white/70 mb-2">Your self-drive booking enquiry has been received.</p>
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

                  {/* Branch / Pickup */}
                  <div>
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                      Branch Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      readOnly
                      name="pickupLocation"
                      value="BHEL Jagdispur"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white/50 cursor-not-allowed outline-none font-medium"
                    />
                  </div>

                  {/* Booking Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        Booking Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="date"
                        name="pickupDate"
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none invert-0 dark:invert-[1]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        Pickup Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="time"
                        name="pickupTime"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none invert-0 dark:invert-[1]"
                      />
                    </div>
                  </div>

                  {/* Return Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        Return Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="date"
                        name="returnDate"
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none invert-0 dark:invert-[1]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        Return Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="time"
                        name="returnTime"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none invert-0 dark:invert-[1]"
                      />
                    </div>
                  </div>

                  {/* Pricing info */}
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <span className="material-symbols-outlined text-6xl">receipt_long</span>
                    </div>
                    <p className="text-xs text-white/60 mb-2">Final pricing is calculated based on duration (12hr/24hr slices).</p>
                    <p className="text-lg font-black text-white mb-1">
                      <span className="text-primary font-bold">Base Tariff:</span> ₹{selectedCar.price12hr}{" "}
                      <span className="text-sm font-medium text-white/50">(Min 12 Hours)</span>
                    </p>
                    <p className="text-xs text-yellow-400/70 mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">info</span>
                      Pay directly at branch. No online payment needed.
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
