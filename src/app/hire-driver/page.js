import { prisma } from "@/lib/prisma";
import HireDriverClient from "@/components/HireDriverClient";

export const metadata = {
  title: "Hire a Professional Driver - Chaman Cab",
};

export default async function HireDriverPage() {
  const drivers = await prisma.driver.findMany({
    where: { isActive: true },
    orderBy: { costPerHour: "asc" }
  });

  return (
    <div className="min-h-screen bg-[#181611] font-display">
      <header className="bg-[#1e1a0e] border-b border-white/10 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 md:gap-3">
            <div className="bg-primary rounded-xl p-1.5 md:p-2 border border-primary/20">
              <span className="material-symbols-outlined text-[#181611] text-lg md:text-xl relative z-10">person_search</span>
            </div>
            <div>
              <h1 className="text-white text-base md:text-xl font-black tracking-tight leading-none">Chaman Drivers</h1>
              <p className="text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1">Professional & Verified</p>
            </div>
          </a>
          <a href="/" className="text-white/50 hover:text-white transition-colors text-xs font-bold flex items-center gap-1 group bg-white/5 px-3 py-1.5 rounded-lg">
             <span className="material-symbols-outlined text-[14px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
             Back Home
          </a>
        </div>
      </header>

      <HireDriverClient drivers={drivers} />
    </div>
  );
}
