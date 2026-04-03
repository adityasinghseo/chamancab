"use client";

import { useState, useTransition } from "react";
import { createCity, updateCity, toggleCityActive, createLocation, updateLocation } from "@/app/actions/admin";

export default function AdminCitiesClient({ initialCities, stats }) {
  const [cities, setCities] = useState(initialCities);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  
  const [editingCity, setEditingCity] = useState(null);
  const [editingHub, setEditingHub] = useState(null);
  const [targetCityId, setTargetCityId] = useState("");
  
  const [isTransitioning, startTransition] = useTransition();

  const handleOpenCityModal = (city = null) => {
    setEditingCity(city);
    setIsModalOpen(true);
  };

  const handleOpenHubModal = (cityId, hub = null) => {
    setTargetCityId(cityId);
    setEditingHub(hub);
    setIsHubModalOpen(true);
  };

  const handleCitySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    startTransition(async () => {
      if (editingCity) {
        await updateCity(editingCity.id, formData);
      } else {
        await createCity(formData);
      }
      window.location.reload();
    });
  };

  const handleHubSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("cityId", targetCityId);
    
    startTransition(async () => {
      if (editingHub) {
        await updateLocation(editingHub.id, formData);
      } else {
        await createLocation(formData);
      }
      window.location.reload();
    });
  };

  const handleToggleActive = async (id, status) => {
    startTransition(async () => {
      await toggleCityActive(id, !status);
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">City & Hub Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total {stats.totalCities} cities and {stats.totalHubs} operational pickup points.</p>
        </div>
        <button
          onClick={() => handleOpenCityModal()}
          className="bg-primary text-[#181611] font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all font-display"
        >
          <span className="material-symbols-outlined">add_location</span>
          Add New City
        </button>
      </div>

      {/* Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Total Hubs (Locations)</p>
             <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalHubs}</h3>
          </div>
          <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Operational Cities</p>
             <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.activeCities}</h3>
          </div>
          <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Fleet Coverage</p>
             <h3 className="text-2xl font-black text-gray-900 dark:text-white">Active</h3>
          </div>
       </div>

      {/* Cities List */}
      <div className="space-y-4">
         {cities.map((city) => (
           <div key={city.id} className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden transition-all hover:border-primary/30">
              <div className="p-6 flex flex-wrap items-center justify-between gap-6 border-b border-gray-50 dark:border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                       <span className="material-symbols-outlined text-[24px]">location_city</span>
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">{city.name}</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{city.state} · Hubs: {city.locations?.length || 0}</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleActive(city.id, city.isOperational)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                         city.isOperational ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400 border-transparent'
                      }`}
                    >
                       {city.isOperational ? 'Operational' : 'Paused'}
                    </button>
                    <button onClick={() => handleOpenCityModal(city)} className="p-2 border border-gray-100 dark:border-white/10 rounded-xl hover:text-primary transition-all">
                       <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                       onClick={() => handleOpenHubModal(city.id)}
                       className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                       Add Hub
                    </button>
                 </div>
              </div>

              {/* Hubs / Locations under this city */}
              <div className="bg-gray-50/50 dark:bg-white/[0.01] p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {city.locations?.length === 0 ? (
                   <p className="col-span-full text-center text-xs text-gray-400 font-bold py-4 italic">No operational hubs registered in {city.name}. Drivers cannot be assigned here.</p>
                 ) : (
                   city.locations.map((hub) => (
                     <div key={hub.id} className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 p-4 rounded-xl flex items-start justify-between group shadow-sm">
                        <div className="flex items-start gap-3">
                           <span className={`material-symbols-outlined text-[18px] mt-0.5 ${hub.isOperational ? 'text-blue-500' : 'text-gray-400'}`}>pin_drop</span>
                           <div>
                              <p className="text-sm font-black text-gray-900 dark:text-white">{hub.landmark}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Lat: {hub.latitude.toFixed(4)} · Lng: {hub.longitude.toFixed(4)}</p>
                              <span className={`inline-block mt-2 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${hub.isOperational ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                 {hub.isOperational ? 'Operational' : 'Inactive'}
                              </span>
                           </div>
                        </div>
                        <button onClick={() => handleOpenHubModal(city.id, hub)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-primary">
                           <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                     </div>
                   ))
                 )}
              </div>
           </div>
         ))}
      </div>

      {/* City Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark w-full max-w-[440px] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 px-6 py-5">
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                {editingCity ? "Update City" : "Register City"}
              </h3>
              <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white" onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-6 space-y-5" onSubmit={handleCitySubmit}>
               <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">City Name</label>
                    <input defaultValue={editingCity?.name} name="name" required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all" placeholder="e.g. Pune" type="text" />
                  </div>
                   <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">State / Region</label>
                    <input defaultValue={editingCity?.state} name="state" required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all" placeholder="e.g. Maharashtra" type="text" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                     <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Operational</span>
                     <input type="checkbox" name="isOperational" value="true" defaultChecked={editingCity?.isOperational ?? true} className="w-5 h-5 accent-primary bg-gray-100 dark:bg-white/5 border-transparent outline-none rounded" />
                  </div>
               </div>
               <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-500 font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl">Cancel</button>
                  <button type="submit" disabled={isTransitioning} className="flex-2 px-10 bg-primary text-[#181611] font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all">
                     {isTransitioning ? 'Saving...' : editingCity ? 'Update' : 'Register'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Hub Modal */}
      {isHubModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
           <div className="bg-white dark:bg-surface-dark w-full max-w-[480px] rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
             <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 px-6 py-5">
               <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                     {editingHub ? "Update Hub" : "New Station Hub"}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Configure station pickup instructions</p>
               </div>
               <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white" onClick={() => setIsHubModalOpen(false)}>
                 <span className="material-symbols-outlined">close</span>
               </button>
             </div>
             <form className="p-6 space-y-5" onSubmit={handleHubSubmit}>
                <div className="space-y-4">
                   <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Specific Location Name</label>
                     <input defaultValue={editingHub?.landmark} name="landmark" required className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all" placeholder="e.g. Airport Terminal 2 Gate 4" type="text" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Latitude</label>
                        <input defaultValue={editingHub?.latitude} name="latitude" required step="any" type="number" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none" placeholder="0.000" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Longitude</label>
                        <input defaultValue={editingHub?.longitude} name="longitude" required step="any" type="number" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none" placeholder="0.000" />
                      </div>
                   </div>
                   <div className="flex items-center justify-between border-t border-gray-50 dark:border-white/5 pt-4">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Station Operational</span>
                      <input type="checkbox" name="isOperational" value="true" defaultChecked={editingHub?.isOperational ?? true} className="w-5 h-5 accent-primary" />
                   </div>
                </div>
                <div className="pt-4 flex gap-3">
                   <button type="button" onClick={() => setIsHubModalOpen(false)} className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-500 font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl">Cancel</button>
                   <button type="submit" disabled={isTransitioning} className="flex-2 bg-primary text-[#181611] font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all">
                      {isTransitioning ? 'Sending...' : editingHub ? 'Update Hub' : 'Register Hub'}
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}
