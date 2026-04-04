"use client";

import { useState, useTransition, useEffect } from "react";
import { getUserSession, sendLoginOtp, verifyLoginOtp } from "@/app/actions/auth";
import { submitDriverBooking } from "@/app/actions/hireDriver";

export default function HireDriverClient({ drivers }) {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [session, setSession] = useState(null);
  const [isPending, startTransition] = useTransition();

  // Booking Form State
  const [startDate, setStartDate] = useState("");
  
  // OTP Auth Wall State
  const [authStep, setAuthStep] = useState(0); 
  const [otpSentMsg, setOtpSentMsg] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    getUserSession().then(setSession);
  }, []);

  const handleBookClick = (driver) => {
    setSelectedDriver(driver);
    setBookingSuccess(null);
    setAuthStep(0);
  };

  const handleCloseModal = () => {
    setSelectedDriver(null);
  };

  const handleInitiateBooking = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    
    if (session) {
      startTransition(async () => {
        fd.append("driverId", selectedDriver.id);
        const res = await submitDriverBooking(fd);
        if (res.error) alert(res.error);
        else setBookingSuccess(res.referenceId);
      });
      return;
    }

    const phone = fd.get("customerPhone");
    startTransition(async () => {
      const resp = await sendLoginOtp(phone);
      if (resp.error) {
        alert(resp.error);
      } else {
        setOtpSentMsg(resp.message || "OTP sent successfully");
        setAuthStep(1);
      }
    });

    window.__pendingDriverBookingData = fd;
  };

  const verifyOtpAndBook = async () => {
    const code = otpCode.join("");
    if (code.length < 4) return;

    startTransition(async () => {
      const fd = window.__pendingDriverBookingData;
      const phone = fd.get("customerPhone");
      const resp = await verifyLoginOtp(phone, code);
      if (resp.error) {
        alert(resp.error);
      } else {
        setSession(resp.user);
        fd.append("driverId", selectedDriver.id);
        const bRes = await submitDriverBooking(fd);
        if (bRes.error) alert(bRes.error);
        else setBookingSuccess(bRes.referenceId);
      }
    });
  };

  const parseHours = (str) => {
     const match = str.match(/\d+/);
     return match ? parseInt(match[0]) : 8;
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
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> Standard Duty ({drv.dutyHours})</p>
                <div className="flex items-end gap-2">
                   <p className="text-3xl font-black text-white leading-none">₹{drv.costPerHour * parseHours(drv.dutyHours)}</p>
                   <p className="text-sm font-medium text-white/50 mb-1">/ Trip</p>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl">
                  <span className="text-sm text-white/70 font-medium">Extra Hours</span>
                  <span className="font-bold text-white">₹{drv.costPerHour}/hr</span>
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

      {/* Booking Form Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[#1e1a0e] w-full max-w-xl h-full md:h-[90vh] md:max-h-[850px] shadow-2xl flex flex-col md:rounded-3xl border border-white/10 overflow-hidden relative">
              <button 
                onClick={handleCloseModal} 
                className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-20"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="p-6 md:p-8 border-b border-white/10 bg-black/20 shrink-0">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4 border border-blue-500/20">Driver Reservation</span>
                <h2 className="text-3xl font-black text-white leading-tight">Hire {selectedDriver.name}</h2>
                <p className="text-white/50 mt-2 text-sm max-w-md">Complete details to secure this driver for a {selectedDriver.dutyHours} shift.</p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                {bookingSuccess ? (
                  <div className="text-center py-12">
                     <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-5xl">check_circle</span>
                     </div>
                     <h3 className="text-2xl font-black text-white mb-2">Driver Confirmed!</h3>
                     <p className="text-white/70 mb-6">Your driver assignment request has been placed successfully.</p>
                     <div className="bg-white/5 border border-white/10 p-4 rounded-2xl italic text-lg font-bold text-primary mb-8 inline-block px-8">
                       ID: {bookingSuccess}
                     </div>
                     <br/>
                     <button onClick={handleCloseModal} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl transition-colors">Done</button>
                  </div>
                ) : authStep === 1 ? (
                  <div className="animate-in slide-in-from-right relative">
                    <button type="button" onClick={() => setAuthStep(0)} className="text-white/50 hover:text-white flex items-center gap-1 text-sm font-bold mb-6 transition-colors">
                      <span className="material-symbols-outlined text-lg">arrow_back</span> Back
                    </button>
                    <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                      <span className="material-symbols-outlined text-3xl">sms</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Verify Mobile</h3>
                    <p className="text-white/50 font-medium mb-8 text-[15px]">{otpSentMsg}</p>

                    <div className="flex gap-4 justify-center mb-10">
                      {otpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`drv-otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newOtp = [...otpCode];
                            newOtp[idx] = val;
                            setOtpCode(newOtp);
                            if (val && idx < 3) document.getElementById(`drv-otp-${idx + 1}`).focus();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !otpCode[idx] && idx > 0) {
                              document.getElementById(`drv-otp-${idx - 1}`).focus();
                            }
                          }}
                          className="w-14 h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-black text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-white/20"
                          placeholder="•"
                        />
                      ))}
                    </div>
                    <button
                      onClick={verifyOtpAndBook}
                      disabled={isPending || otpCode.join("").length < 4}
                      className="w-full bg-primary hover:bg-[#e6a320] text-[#181611] font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] disabled:opacity-50 disabled:shadow-none uppercase tracking-widest text-sm"
                    >
                      {isPending ? "Verifying..." : "Verify & Complete Booking"}
                    </button>
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
                         <input required name="customerName" defaultValue={session?.name || ""} placeholder="John Doe" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors placeholder-white/20 font-medium"/>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div>
                           <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block">Mobile Number <span className="text-red-500">*</span></label>
                           <input required name="customerPhone" type="tel" minLength={10} maxLength={10} defaultValue={session?.phone || ""} readOnly={!!session} placeholder="9876543210" className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary outline-none font-medium placeholder-white/20 ${session ? 'opacity-50 focus:border-white/10' : ''}`}/>
                         </div>
                         <div>
                           <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block">Email ID</label>
                           <input name="customerEmail" type="email" defaultValue={session?.email || ""} placeholder="john@example.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary outline-none font-medium placeholder-white/20"/>
                         </div>
                       </div>
                     </div>

                     <hr className="border-white/10 my-8"/>

                     <div className="space-y-5">
                       <div>
                         <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">pin_drop</span> Report Location <span className="text-red-500">*</span></label>
                         <input required name="pickupLocation" placeholder="Enter landmark or address for driver to arrive" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary outline-none font-medium placeholder-white/20"/>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">calendar_month</span> Report Date <span className="text-red-500">*</span></label>
                           <input required type="date" name="startDate" min={new Date().toISOString().split("T")[0]} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none form-input invert-0 dark:invert-[1]" />
                         </div>
                         <div>
                           <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">schedule</span> Report Time <span className="text-red-500">*</span></label>
                           <input required type="time" name="startTime" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none form-input invert-0 dark:invert-[1]" />
                         </div>
                       </div>
                     </div>

                     <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mt-8 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                           <span className="material-symbols-outlined text-6xl">receipt_long</span>
                        </div>
                        <p className="text-xs text-white/60 mb-2">Pricing based on the selected {selectedDriver.dutyHours} shift block.</p>
                        <p className="text-lg font-black text-white mb-1"><span className="text-blue-400 font-bold">Total Tariff:</span> ₹{selectedDriver.costPerHour * parseHours(selectedDriver.dutyHours)} <span className="text-sm font-medium text-white/50">(Min Base)</span></p>
                     </div>

                     <button 
                       type="submit"
                       disabled={isPending}
                       className="w-full bg-primary hover:bg-[#e6a320] text-[#181611] font-black py-4 rounded-xl transition-all shadow-lg hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest flex items-center justify-center gap-2"
                     >
                       {isPending ? "Processing..." : (
                          <>Continue to Auth <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
                       )}
                     </button>
                  </form>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
