import Footer from "@/components/Footer";

export const metadata = {
  title: "Contact Us - Chaman Tour and Travels",
  description: "Get in touch with Chaman Tour and Travels. WhatsApp or call us at +91 6386499107.",
};

export default function ContactPage() {
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
        <div className="bg-gradient-to-br from-[#1e1a0e] to-[#181611] py-20 px-4 border-b border-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20 inline-block mb-6">Contact Us</span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Get In <span className="text-primary">Touch</span></h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">We're available 24/7. Reach us via WhatsApp, call, or visit our office.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <a href="https://wa.me/916386499107" target="_blank" rel="noopener noreferrer"
              className="group bg-[#25D366]/5 border border-[#25D366]/20 rounded-3xl p-8 hover:bg-[#25D366]/10 hover:border-[#25D366]/40 transition-all">
              <div className="bg-[#25D366]/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[#25D366] text-3xl">chat</span>
              </div>
              <h2 className="text-white text-2xl font-black mb-2">WhatsApp Us</h2>
              <p className="text-white/50 mb-4 text-sm">Fastest way to reach us. Send a message and we'll respond instantly.</p>
              <p className="text-[#25D366] font-black text-xl">+91 6386499107</p>
              <div className="mt-6 flex items-center gap-2 text-[#25D366] text-sm font-bold">
                Open WhatsApp <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </a>

            <a href="tel:+916386499107"
              className="group bg-primary/5 border border-primary/20 rounded-3xl p-8 hover:bg-primary/10 hover:border-primary/40 transition-all">
              <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl">call</span>
              </div>
              <h2 className="text-white text-2xl font-black mb-2">Call Us Directly</h2>
              <p className="text-white/50 mb-4 text-sm">Available round the clock for bookings, queries, and support.</p>
              <p className="text-primary font-black text-xl">+91 6386499107</p>
              <div className="mt-6 flex items-center gap-2 text-primary text-sm font-bold">
                Tap to Call <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <span className="material-symbols-outlined text-primary text-3xl mb-4 block">location_on</span>
              <h2 className="text-white text-xl font-black mb-4">Our Offices</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-primary text-xs font-black uppercase tracking-widest mb-1">Head Office</p>
                  <p className="text-white font-bold">Lucknow, Uttar Pradesh</p>
                </div>
                <div>
                  <p className="text-primary text-xs font-black uppercase tracking-widest mb-1">Branch Offices</p>
                  <p className="text-white/70 text-sm leading-relaxed">Jagdishpur (BHEL Amethi), Raebareli, Ayodhya, Barabanki, Sultanpur</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <span className="material-symbols-outlined text-primary text-3xl mb-4 block">receipt</span>
              <h2 className="text-white text-xl font-black mb-4">Business Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-primary text-xs font-black uppercase tracking-widest mb-1">GST Number</p>
                  <p className="text-white font-mono font-bold tracking-widest">09COVPK1632M1ZA</p>
                </div>
                <div>
                  <p className="text-primary text-xs font-black uppercase tracking-widest mb-1">Business Hours</p>
                  <p className="text-white/70 text-sm">24 Hours, 7 Days a Week</p>
                </div>
                <div>
                  <p className="text-primary text-xs font-black uppercase tracking-widest mb-1">Service Area</p>
                  <p className="text-white/70 text-sm">Pan India Outstation · UP Local</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
