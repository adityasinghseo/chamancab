"use client";

import { useState, useTransition } from "react";
import { updateRentalPricing, upsertRentalPricing } from "@/app/actions/admin";

export default function AdminPricingClient({ cars, cities, initialRentalPricings, packages }) {
  const [isTransitioning, startTransition] = useTransition();

  // Selected Local Rental state
  const [rentalCityId, setRentalCityId] = useState(cities[0]?.id || "");
  const [selectedPkgId, setSelectedPkgId] = useState(packages[0]?.id || "");

  // Filters
  const currentRentalPricings = initialRentalPricings.filter(
    (lp) => lp.cityId === rentalCityId && lp.packageId === selectedPkgId
  );

  const handleUpdatePrice = async (carId, pricingId, newPrice) => {
    if (!newPrice || isNaN(newPrice)) return;
    
    startTransition(async () => {
      if (pricingId) {
        await updateRentalPricing(pricingId, newPrice);
      } else {
        await upsertRentalPricing(rentalCityId, selectedPkgId, carId, newPrice);
      }
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Local Rental Pricing</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage base rental prices for every Custom City & Package combination.</p>
      </div>

      {/* Selector Panels */}
      <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
             <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Rental City</label>
                <select 
                  value={rentalCityId} 
                  onChange={(e) => setRentalCityId(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                >
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Rental Package</label>
                <select 
                  value={selectedPkgId} 
                  onChange={(e) => setSelectedPkgId(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                >
                  {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
             </div>
          </div>
      </div>

      {/* Pricing Matrix Table */}
      <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Base Vehicle</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Specifications</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Package Price (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {cars.map((car) => {
                const pricing = currentRentalPricings.find(p => p.carId === car.id);

                return (
                  <tr key={car.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[20px]">
                              {car.type === 'Hatchback' ? 'directions_car' : car.type === 'Sedan' ? 'directions_car' : 'airport_shuttle'}
                            </span>
                         </div>
                         <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">{car.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{car.type} · {car.fuelType}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">person</span>{car.seats} Seats</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">ac_unit</span>{car.hasAC ? 'AC' : 'Non-AC'}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">luggage</span>{car.luggageCapacity} Bags</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-3">
                         {!pricing && <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest italic animate-pulse">Set Price</span>}
                         <div className="relative flex items-center max-w-[140px]">
                            <span className="absolute left-3 text-xs font-bold text-gray-400">₹</span>
                            <input
                              type="number"
                              placeholder="0.00"
                              defaultValue={pricing?.price}
                              onBlur={(e) => handleUpdatePrice(car.id, pricing?.id, e.target.value)}
                              className={`w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-6 pr-4 py-2.5 text-right font-black text-gray-900 dark:text-white text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all ${!pricing ? 'border-yellow-500/50' : ''}`}
                            />
                         </div>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
        </table>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-3">
         <span className="material-symbols-outlined text-blue-500 mt-1">info</span>
         <div>
           <p className="text-sm font-black text-blue-500 dark:text-blue-400">Auto-save enabled</p>
           <p className="text-xs text-gray-500 dark:text-gray-400">Changing a value in the input field and clicking outside will automatically save the new price for that specific local rental route and vehicle.</p>
         </div>
      </div>
    </div>
  );
}
