import Footer from "@/components/Footer";

export const metadata = {
  title: "About Us - Chaman Tour and Travels",
  description: "Learn about Chaman Tour and Travels - reliable taxi services in BHEL Jagdishpur and surrounding areas of Uttar Pradesh.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#181611] font-display flex flex-col">
      <header className="bg-[#1e1a0e] border-b border-white/10 px-4 py-2 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <img src="/CHAMANCAB-LOGO.webp" alt="Chaman Cab" className="h-16 md:h-20 w-auto object-contain" />
          </a>
          <div className="hidden md:flex items-center gap-6 text-white/70 text-sm font-bold tracking-wide">
            <a href="/self-drive" className="hover:text-primary transition-colors flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">car_rental</span> Self Drive Cars</a>
            <a href="/hire-driver" className="hover:text-primary transition-colors flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">person_search</span> Hire Driver</a>
            <a href="tel:+916386499107" className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary px-5 py-2.5 rounded-full transition-colors ml-2">
              <span className="material-symbols-outlined text-lg">call</span>Call Now
            </a>
          </div>
          <a href="/" className="md:hidden text-white/50 hover:text-white transition-colors text-xs font-bold flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span> Home
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1e1a0e] to-[#181611] py-20 px-4 border-b border-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20 inline-block mb-6">About Us</span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Chaman Tour <span className="text-primary">and Travels</span></h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">Your most trusted travel partner across Uttar Pradesh — committed to safe, comfortable, and timely journeys.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-16">
          {/* Mission */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl font-black text-white mb-4">Who We Are</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Chaman Tour and Travels is a professional cab and travel service provider based in BHEL Jagdishpur, Uttar Pradesh. We have been serving passengers across Lucknow, Amethi, Raebareli, Ayodhya, Barabanki, and Sultanpur with pride and dedication.
              </p>
              <p className="text-white/60 leading-relaxed">
                Our mission is simple: to offer every passenger a safe, comfortable, and affordable travel experience — whether it's a quick local trip, an outstation journey, or a self-drive adventure.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "verified", label: "GST Registered", value: "09COVPK1632M1ZA" },
                { icon: "location_on", label: "Head Office", value: "Lucknow, UP" },
                { icon: "support_agent", label: "Support", value: "24/7 Available" },
                { icon: "directions_car", label: "Fleet", value: "Multiple Car Types" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-primary/30 transition-colors">
                  <span className="material-symbols-outlined text-primary text-2xl mb-2 block">{icon}</span>
                  <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-1">{label}</p>
                  <p className="text-white font-bold text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="mb-20">
            <h2 className="text-3xl font-black text-white mb-8 text-center">Our Services</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: "arrow_right_alt", title: "One Way & Outstation", desc: "Direct rides to any city across India with professional drivers and transparent pricing." },
                { icon: "loop", title: "Round Trip", desc: "Plan your return journey seamlessly — driver waits and comes back with you." },
                { icon: "schedule", title: "Local Rental", desc: "Rent a cab in your city by the hour for errands, meetings, or a day out." },
                { icon: "car_rental", title: "Self Drive", desc: "Choose your car and drive on your own terms. Freedom to explore at your pace." },
                { icon: "person_search", title: "Hire a Driver", desc: "Need a driver for your own vehicle? Book a professional verified driver by shift." },
                { icon: "phone_in_talk", title: "WhatsApp Booking", desc: "Create a booking directly via WhatsApp at +91 6386499107 - quick and easy." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-primary/20 transition-colors">
                  <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                  </div>
                  <h3 className="text-white font-bold mb-2">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Branches */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-black text-white mb-2 text-center">Our Presence</h2>
            <p className="text-white/50 text-center mb-10">Serving you across Uttar Pradesh</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
                <p className="text-primary text-xs font-black uppercase tracking-widest mb-2">Head Office</p>
                <p className="text-white text-xl font-black">Lucknow, Uttar Pradesh</p>
              </div>
              {["Jagdishpur (BHEL Amethi)", "Raebareli", "Ayodhya", "Barabanki", "Sultanpur"].map(city => (
                <div key={city} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <p className="text-white font-bold">{city}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
