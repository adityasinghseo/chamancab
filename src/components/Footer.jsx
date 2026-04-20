export default function Footer() {
  return (
    <footer className="bg-[#12100c] pt-16 pb-8 border-t border-white/10 relative overflow-hidden font-display">
      {/* Decorative background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <a href="/" className="inline-block mb-6 hover:opacity-90 transition-opacity">
              <img src="/CHAMANCAB-LOGO.webp" alt="Chaman Tour and Travels" className="h-20 w-auto object-contain" />
            </a>
            <p className="text-white/60 text-sm leading-relaxed pr-4 mb-6">
              <strong className="text-white">Chaman Tour and Travels</strong> offers reliable taxi services in BHEL Jagdishpur and surrounding areas. We are committed to providing safe, comfortable, and timely travel solutions for all your needs.
            </p>
            <div className="inline-block bg-white/5 border border-white/10 rounded-lg px-4 py-2">
              <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">GST Number</p>
              <p className="text-white font-mono text-sm tracking-widest">09COVPK1632M1ZA</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 lg:col-start-6">
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-4">
              <li><a href="/about" className="text-white/60 hover:text-primary transition-colors text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">arrow_right</span> About Us</a></li>
              <li><a href="/contact" className="text-white/60 hover:text-primary transition-colors text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">arrow_right</span> Contact Us</a></li>
              <li><a href="/self-drive" className="text-white/60 hover:text-primary transition-colors text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">arrow_right</span> Self Drive Cars</a></li>
              <li><a href="/hire-driver" className="text-white/60 hover:text-primary transition-colors text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">arrow_right</span> Hire Driver</a></li>
              <li><a href="/terms" className="text-white/60 hover:text-primary transition-colors text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">arrow_right</span> Terms &amp; Conditions</a></li>
              <li><a href="/privacy" className="text-white/60 hover:text-primary transition-colors text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">arrow_right</span> Privacy Policy</a></li>
              <li><a href="/refund" className="text-white/60 hover:text-primary transition-colors text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">arrow_right</span> Refund Policy</a></li>
            </ul>
          </div>

          {/* Contact & Address */}
          <div className="lg:col-span-4">
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Contact Support</h3>
            <div className="space-y-5">
              <a href="https://wa.me/916386499107" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                <div className="bg-[#25D366]/10 p-3 rounded-xl border border-[#25D366]/20 group-hover:bg-[#25D366]/20 transition-colors">
                  <span className="material-symbols-outlined text-[#25D366]">chat</span>
                </div>
                <div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">WhatsApp Bookings</p>
                  <p className="text-white font-medium group-hover:text-[#25D366] transition-colors">+91 6386499107</p>
                </div>
              </a>

              <a href="tel:+916386499107" className="flex items-start gap-4 group">
                <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary">call</span>
                </div>
                <div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Call Support</p>
                  <p className="text-white font-medium group-hover:text-primary transition-colors">+91 6386499107</p>
                </div>
              </a>

              <div className="flex flex-col gap-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 mt-1">
                    <span className="material-symbols-outlined text-white/70">location_on</span>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Our Office</p>
                    <p className="text-sm text-white/80 leading-relaxed">
                      Road No 1, NH731, Bhel Road, Jagdishpur, Kamrauli, Uttar Pradesh 227817
                    </p>
                  </div>
                </div>
                <div className="w-full h-36 rounded-xl overflow-hidden border border-white/10 mt-1">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3575.2444652436444!2d81.54588167605963!3d26.49395797689913!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399a4b4e46480a4d%3A0x5eb6733390d1a1d7!2sChaman%20tour%20and%20travels!5e0!3m2!1sen!2sin!4v1713171300000!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs font-medium">
            © {new Date().getFullYear()} Chaman Tour and Travels. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/about" className="text-white/40 hover:text-white transition-colors text-xs font-medium">About Us</a>
            <a href="/contact" className="text-white/40 hover:text-white transition-colors text-xs font-medium">Contact</a>
            <a href="/privacy" className="text-white/40 hover:text-white transition-colors text-xs font-medium">Privacy Policy</a>
            <a href="/terms" className="text-white/40 hover:text-white transition-colors text-xs font-medium">Terms</a>
            <a href="/refund" className="text-white/40 hover:text-white transition-colors text-xs font-medium">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
