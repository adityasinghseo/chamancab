"use client";

import { useState, useTransition } from "react";
import { setCityDistance, autoFillMissingDistances } from "@/app/actions/admin";

export default function AdminDistancesClient({ cities, initialDistances }) {
  const [isPending, startTransition] = useTransition();

  const handleUpdateDistance = async (fromId, toId, distanceStr) => {
    const km = parseFloat(distanceStr);
    if (!distanceStr || isNaN(km)) return;

    startTransition(async () => {
      await setCityDistance(fromId, toId, km);
      window.location.reload();
    });
  };

  const handleAutoFill = () => {
    if (confirm("This will automatically calculate distance for all missing blocks based on GPS Hub coordinates. Continue?")) {
      startTransition(async () => {
        const added = await autoFillMissingDistances();
        alert(`Successfully auto-filled ${added} missing routes!`);
        window.location.reload();
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Route Distances</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Set distance (in KM) between cities to dynamically auto-calculate one-way pricing.</p>
        </div>
        <button 
           onClick={handleAutoFill}
           disabled={isPending}
           className="bg-primary text-[#181611] font-black px-5 py-2.5 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          {isPending ? "Generating..." : "Auto-Fill Missing"}
        </button>
      </div>

      <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 z-10">
              <tr>
                <th className="px-5 py-4 text-xs font-black text-gray-400 uppercase tracking-widest min-w-[150px]">From \ To</th>
                {cities.map((colCity) => (
                  <th key={colCity.id} className="px-3 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center min-w-[100px]">
                    {colCity.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {cities.map((rowCity) => (
                <tr key={rowCity.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-sm font-black text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-surface-dark border-r border-gray-50 dark:border-white/5 z-10 w-40">
                    {rowCity.name}
                  </td>
                  {cities.map((colCity) => {
                    const isSame = rowCity.id === colCity.id;
                    const existing = initialDistances.find(
                      d => (d.fromCityId === rowCity.id && d.toCityId === colCity.id) || 
                           (d.fromCityId === colCity.id && d.toCityId === rowCity.id) // Symmetric
                    );

                    return (
                      <td key={colCity.id} className="px-3 py-2 text-center border-r border-gray-50 dark:border-white/5 min-w-[100px]">
                        {isSame ? (
                          <div className="bg-gray-100 dark:bg-white/5 text-gray-400 text-xs py-2 rounded-lg">—</div>
                        ) : (
                          <input
                            type="number"
                            placeholder="KM"
                            defaultValue={existing?.distanceKm ?? ""}
                            onBlur={(e) => handleUpdateDistance(rowCity.id, colCity.id, e.target.value)}
                            disabled={isPending}
                            className={`w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-center py-2 text-sm font-black outline-none focus:border-primary disabled:opacity-50 ${
                              !existing ? "border-yellow-500/30" : ""
                            }`}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
