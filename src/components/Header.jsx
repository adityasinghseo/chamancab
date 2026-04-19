"use client";
import { useState, useEffect } from "react";
import { getTopActiveCoupon } from "@/app/actions/coupon";

export default function Header({ activePage = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [topCoupon, setTopCoupon] = useState(null);

  useEffect(() => {
    getTopActiveCoupon().then(setTopCoupon);
  }, []);

  const navLinks = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/self-drive", label: "Self Drive Cars", icon: "car_rental" },
    { href: "/hire-driver", label: "Hire Driver", icon: "person_search" },
    { href: "/contact", label: "Contact Us", icon: "phone" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full flex flex-col shadow-2xl">
      {topCoupon && (
        <div className="bg-primary text-[#181611] text-xs md:text-sm font-black py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2 w-full">
          <span className="material-symbols-outlined text-[16px]">local_offer</span>
          <span>Use code <span className="bg-[#181611] text-primary px-1.5 py-0.5 rounded uppercase tracking-widest">{topCoupon.code}</span> &amp; get {topCoupon.discountPercent}% OFF on your booking!</span>
        </div>
      )}
      <header className="bg-[#1e1a0e] border-b border-white/10 px-4 py-2 w-full relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <img src="/CHAMANCAB-LOGO.webp" alt="Chaman Cab" className="h-16 md:h-20 w-auto object-contain" />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-white/70 text-sm font-bold tracking-wide">
            {navLinks.map(({ href, label, icon }) => (
              <a 
                key={href} 
                href={href} 
                className={`hover:text-primary transition-colors flex items-center gap-1.5 ${
                  activePage === href.replace("/", "") || (href === "/" && activePage === "") ? "text-primary" : ""
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span> {label}
              </a>
            ))}
            <a href="tel:+916386499107" className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary px-5 py-2.5 rounded-full transition-colors ml-2">
              <span className="material-symbols-outlined text-lg">call</span>
              Call Now
            </a>
          </div>

          {/* Mobile: Call + Hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <a href="tel:+916386499107"
              className="flex items-center gap-1.5 bg-primary/20 text-primary px-3 py-2 rounded-full text-xs font-black">
              <span className="material-symbols-outlined text-[16px]">call</span>
              Call
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
              aria-label="Toggle Menu"
            >
              <span className="material-symbols-outlined text-white text-[22px]">
                {menuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute top-[80px] left-0 right-0 bg-[#1e1a0e] border-b border-white/10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <nav className="flex flex-col px-4 py-4 gap-1">
              {navLinks.map(({ href, label, icon }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-colors ${
                    activePage === href.replace("/", "") || (href === "/" && activePage === "")
                      ? "bg-primary/20 text-primary"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  {label}
                </a>
              ))}
              <div className="mt-2 pt-4 border-t border-white/10">
                <a
                  href="https://wa.me/916386499107"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  WhatsApp Us
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
