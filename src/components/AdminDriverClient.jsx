"use client";

import { useState, useTransition } from "react";
import { createDriver, updateDriver, toggleDriverActive, deleteDriver } from "@/app/actions/driver";

export default function AdminDriverClient({ initialDrivers }) {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenModal = (driver = null) => {
    setEditingDriver(driver);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingDriver(null);
    setModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    startTransition(async () => {
      if (editingDriver) {
        await updateDriver(editingDriver.id, formData);
      } else {
        await createDriver(formData);
      }
      window.location.reload();
    });
  };

  const handleToggle = async (id, isActive) => {
    startTransition(async () => {
      await toggleDriverActive(id, !isActive);
      window.location.reload();
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;
    startTransition(async () => {
      await deleteDriver(id);
      window.location.reload();
    });
  };

  return (
    <div>
      {/* Header Action */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-[#e6a320] text-[#181611] font-black px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Add New Driver
        </button>
      </div>

      {/* Driver Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {drivers.map((drv) => (
          <div key={drv.id} className={`bg-white dark:bg-surface-dark border p-6 justify-between flex flex-col rounded-2xl shadow-sm transition-all ${drv.isActive ? 'border-gray-100 dark:border-white/10' : 'border-red-100 dark:border-red-900/30 opacity-70'}`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center font-black text-lg">
                    {drv.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{drv.name}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${drv.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                      {drv.isActive ? 'Available' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                    Half Day Price
                  </span>
                  <span className="text-lg font-black text-primary">₹{drv.halfDayPrice}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100 dark:border-white/5">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    Full Day Price
                  </span>
                  <span className="text-lg font-black text-primary">₹{drv.fullDayPrice}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100 dark:border-white/5">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">nights_stay</span>
                    Night Charge
                  </span>
                  <span className="font-bold text-blue-500 dark:text-blue-400">₹{drv.nightCharge}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
               <button
                  onClick={() => handleToggle(drv.id, drv.isActive)}
                  disabled={isPending}
                  className="flex-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white px-3 py-2 rounded-lg transition-colors"
                >
                  {drv.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleOpenModal(drv)}
                  className="p-2 text-gray-400 hover:text-blue-500 bg-gray-50 hover:bg-blue-50 dark:bg-white/5 dark:hover:bg-blue-500/10 rounded-lg transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(drv.id)}
                  disabled={isPending}
                  className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
            </div>
          </div>
        ))}
      </div>

      {drivers.length === 0 && (
         <div className="text-center py-20 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-3xl">
           <span className="material-symbols-outlined text-gray-300 dark:text-white/10 text-6xl mb-4">person_search</span>
           <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Drivers Registered</h3>
           <p className="text-gray-500 max-w-md mx-auto text-sm">Add your driver inventory with half day and full day pricing.</p>
           <button onClick={() => handleOpenModal()} className="mt-6 text-primary font-bold hover:underline">Add First Driver &rarr;</button>
         </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {editingDriver ? "Update Driver" : "Add New Driver"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Driver Name</label>
                  <input required name="name" defaultValue={editingDriver?.name || ""} placeholder="e.g. Ramesh Kumar" className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Half Day Price (₹)</label>
                    <input required min="0" step="1" type="number" name="halfDayPrice" defaultValue={editingDriver?.halfDayPrice ?? 500} placeholder="e.g. 500" className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Full Day Price (₹)</label>
                    <input required min="0" step="1" type="number" name="fullDayPrice" defaultValue={editingDriver?.fullDayPrice ?? 700} placeholder="e.g. 700" className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                 </div>
               </div>

               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Night Charge (₹) — 9 PM to 6 AM</label>
                  <input required min="0" step="1" type="number" name="nightCharge" defaultValue={editingDriver?.nightCharge ?? 200} placeholder="200" className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
               </div>

               <div className="pt-4 mt-6 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
                 <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white">Cancel</button>
                 <button type="submit" disabled={isPending} className="bg-primary hover:bg-[#e6a320] text-[#181611] font-black px-6 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 text-sm uppercase tracking-widest">
                   {isPending ? "Saving..." : "Save Driver"}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
