import { prisma } from "@/lib/prisma";
import SelfDriveClient from "@/components/SelfDriveClient";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Self Drive Car Rentals - Chaman Cab",
};

export default async function SelfDrivePage() {
  const cars = await prisma.selfDriveCar.findMany({
    where: { isActive: true },
    orderBy: { price12hr: "asc" }
  });

  return (
    <div className="min-h-screen bg-[#181611] font-display flex flex-col">
      <header className="bg-[#1e1a0e] border-b border-white/10 px-4 py-2 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <img src="/CHAMANCAB-LOGO.webp" alt="Chaman Cab" className="h-16 md:h-20 w-auto object-contain" />
          </a>
          <div className="hidden md:flex items-center gap-6 text-white/70 text-sm font-bold tracking-wide">
            <a href="/self-drive" className="text-primary flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">car_rental</span> Self Drive Cars</a>
            <a href="/hire-driver" className="hover:text-primary transition-colors flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">person_search</span> Hire Driver</a>
            <a href="/admin" className="hover:text-primary transition-colors flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">admin_panel_settings</span> Admin</a>
            <a href="tel:+916386499107" className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary px-5 py-2.5 rounded-full transition-colors ml-2">
              <span className="material-symbols-outlined text-lg">call</span>
              Call Now
            </a>
          </div>
          <a href="/" className="md:hidden text-white/50 hover:text-white transition-colors text-xs font-bold flex items-center gap-1 group bg-white/5 px-3 py-1.5 rounded-lg">
            <span className="material-symbols-outlined text-[14px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Home
          </a>
        </div>
      </header>

      <main className="flex-1">
        <SelfDriveClient cars={cars} />
      </main>

      <Footer />
    </div>
  );
}
