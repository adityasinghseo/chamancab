"use client";

import { useTransition } from "react";
import { createLocation } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export default function AdminLocationsNewClient({ cities }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    startTransition(async () => {
      await createLocation(formData);
      router.push("/admin/cities");
    });
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 ml-1">
          <a className="hover:text-primary transition-colors" href="/admin/cities">Locations Management</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-gray-900 dark:text-white">Register Hub</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
          Operational Station Hub
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Add precise pick-up coordinates to your network of hubs.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-white/[0.02]">
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              Hub Information
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Hub markers appear in searches for both pickup and drop-off.
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">City Hub Select</label>
                <select 
                  name="cityId"
                  required
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all appearance-none" 
                  defaultValue=""
                >
                  <option value="" disabled>Select an operational city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name} ({city.state})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Initial Status</label>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-xl">
                   <input type="checkbox" name="isOperational" value="true" defaultChecked className="w-5 h-5 accent-primary" />
                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Active Station</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Landmark / Station Name</label>
                <input name="landmark" required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all" placeholder="e.g. Airport Terminal 2 Arrivals, Exit Gate 4" type="text" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Geographic Precision</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px]">explore</span>
                  <input name="latitude" step="any" type="number" required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-primary outline-none transition-all" placeholder="Latitude (e.g. 19.0760)" />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[18px]">explore</span>
                  <input name="longitude" step="any" type="number" required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-primary outline-none transition-all" placeholder="Longitude (e.g. 72.8777)" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/30 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3 px-8">
            <button 
              onClick={() => router.push("/admin/cities")}
              className="px-6 py-3.5 text-[10px] font-black text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest" 
              type="button"
            >
              Cancel
            </button>
            <button 
              disabled={isPending}
              className="px-10 py-3.5 bg-primary text-[#181611] text-[10px] font-black rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all uppercase tracking-widest flex items-center gap-2" 
              type="submit"
            >
              {isPending ? 'Registering...' : 'Register Hub'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
