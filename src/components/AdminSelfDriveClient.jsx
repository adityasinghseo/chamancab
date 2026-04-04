"use client";

import { useState, useTransition } from "react";
import {
  createSelfDriveCar,
  updateSelfDriveCar,
  toggleSelfDriveCarActive,
  deleteSelfDriveCar,
} from "@/app/actions/admin";

export default function AdminSelfDriveClient({ initialCars }) {
  const [cars, setCars] = useState(initialCars);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenModal = (car = null) => {
    setEditingCar(car);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCar(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    startTransition(async () => {
      if (editingCar) {
        await updateSelfDriveCar(editingCar.id, formData);
      } else {
        await createSelfDriveCar(formData);
      }
      window.location.reload();
    });
  };

  const handleToggleActive = async (id, currentStatus) => {
    startTransition(async () => {
      await toggleSelfDriveCarActive(id, !currentStatus);
      window.location.reload();
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this Self Drive Car?")) return;
    startTransition(async () => {
      await deleteSelfDriveCar(id);
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Self Drive Inventory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage cars and pricing strictly for self-drive bookings.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-[#181611] font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add Self Drive Car
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div key={car.id} className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md">
             {/* Header */}
             <div className="p-5 border-b border-gray-100 dark:border-white/10 flex justify-between items-start">
               <div>
                 <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tight">{car.name}</h3>
                 <p className="text-primary text-[10px] font-bold tracking-widest uppercase mt-0.5">{car.type} • {car.fuelType}</p>
               </div>
               <button
                  onClick={() => handleToggleActive(car.id, car.isActive)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${car.isActive ? 'bg-primary' : 'bg-gray-300 dark:bg-white/10'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${car.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
             </div>

             {/* Pricing Breakdown */}
             <div className="p-5 flex-1 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="grid grid-cols-2 gap-4 mb-4">
                   <div className="bg-white dark:bg-black/20 p-3 border border-gray-100 dark:border-white/10 rounded-xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">12 Hours Base</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white mt-1">₹{car.price12hr}</p>
                   </div>
                   <div className="bg-white dark:bg-black/20 p-3 border border-gray-100 dark:border-white/10 rounded-xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">24 Hours Base</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white mt-1">₹{car.price24hr}</p>
                   </div>
                </div>

                <div className="text-xs space-y-2 text-gray-500 dark:text-gray-400 font-medium">
                  <div className="flex justify-between items-center bg-gray-100 dark:bg-white/5 py-1.5 px-3 rounded-lg"><span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">speed</span>Extra KM</span> <strong className="text-gray-900 dark:text-white">₹{car.extraKmRate}/km</strong></div>
                  <div className="flex justify-between items-center bg-gray-100 dark:bg-white/5 py-1.5 px-3 rounded-lg"><span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">schedule</span>Extra Hour</span> <strong className="text-gray-900 dark:text-white">₹{car.extraHourRate}/hr</strong></div>
                  <div className="flex justify-between items-center bg-gray-100 dark:bg-white/5 py-1.5 px-3 rounded-lg"><span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">timer_off</span>&lt;12h Rate</span> <strong className="text-gray-900 dark:text-white">₹{car.under12HourRate}/hr</strong></div>
                  <div className="flex justify-between items-center bg-gray-100 dark:bg-white/5 py-1.5 px-3 rounded-lg"><span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">lock</span>Security Deposit</span> <strong className="text-gray-900 dark:text-white">₹{car.deposit}</strong></div>
                </div>
             </div>

             {/* Actions */}
             <div className="p-4 border-t border-gray-100 dark:border-white/10 flex gap-2">
                 <button onClick={() => handleOpenModal(car)} className="flex-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white py-2 rounded-xl text-xs font-bold transition-all items-center justify-center flex gap-1">
                    <span className="material-symbols-outlined text-[14px]">edit</span> Edit
                 </button>
                 <button onClick={() => handleDelete(car.id)} className="bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                 </button>
             </div>
          </div>
        ))}
        {cars.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-gray-200 dark:border-white/20 rounded-3xl">
             <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">directions_car</span>
             <p className="text-gray-500 font-bold">No Self Drive cars available!</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end md:justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl h-[90vh] md:h-auto overflow-hidden animate-in slide-in-from-bottom flex flex-col">
            
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between shrink-0">
               <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">{editingCar ? "Edit Self Drive Car" : "New Self Drive Car"}</h2>
               </div>
               <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 p-2 rounded-full transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form id="carForm" onSubmit={handleSubmit} className="p-6 space-y-6">
                 {/* BASIC DETAILS */}
                 <div className="space-y-4">
                   <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Base Specifications</h3>
                   <div>
                     <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Car Name <span className="text-red-500">*</span></label>
                     <input required name="name" defaultValue={editingCar?.name} placeholder="e.g. Maruti WagonR" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-gray-900 dark:text-white transition-all"/>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Type <span className="text-red-500">*</span></label>
                       <select required name="type" defaultValue={editingCar?.type || "Hatchback"} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none text-gray-900 dark:text-white">
                         <option>Hatchback</option><option>Sedan</option><option>SUV</option><option>MUV</option>
                       </select>
                     </div>
                     <div>
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Fuel <span className="text-red-500">*</span></label>
                       <select required name="fuelType" defaultValue={editingCar?.fuelType || "Petrol"} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none text-gray-900 dark:text-white">
                         <option>Petrol</option><option>CNG</option><option>Diesel</option><option>EV</option>
                       </select>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Transmission</label>
                       <select name="transmission" defaultValue={editingCar?.transmission || "Manual"} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none text-gray-900 dark:text-white">
                         <option>Manual</option><option>Automatic</option>
                       </select>
                     </div>
                     <div>
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Seats <span className="text-red-500">*</span></label>
                       <input required type="number" name="seats" min="2" defaultValue={editingCar?.seats || 5} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none text-gray-900 dark:text-white"/>
                     </div>
                   </div>
                 </div>

                 <hr className="border-gray-100 dark:border-white/10" />

                 {/* PRICING */}
                 <div className="space-y-4">
                   <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">payments</span> Pricing Setup</h3>
                   
                   <div className="grid grid-cols-2 gap-4 bg-primary/10 p-4 rounded-xl border border-primary/20">
                     <div>
                       <label className="text-xs font-bold text-primary ml-1 mb-1 block">12 Hours Base ₹ <span className="text-red-500">*</span></label>
                       <input required type="number" step="0.01" name="price12hr" defaultValue={editingCar?.price12hr} className="w-full bg-white dark:bg-black/20 border border-primary/30 rounded-xl px-4 py-3 text-sm outline-none font-bold placeholder-gray-400"/>
                     </div>
                     <div>
                       <label className="text-xs font-bold text-primary ml-1 mb-1 block">24 Hours Base ₹ <span className="text-red-500">*</span></label>
                       <input required type="number" step="0.01" name="price24hr" defaultValue={editingCar?.price24hr} className="w-full bg-white dark:bg-black/20 border border-primary/30 rounded-xl px-4 py-3 text-sm outline-none font-bold placeholder-gray-400"/>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Extra KM Rate (₹/km) <span className="text-red-500">*</span></label>
                       <input required type="number" step="0.01" name="extraKmRate" defaultValue={editingCar?.extraKmRate ?? 4} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-900 dark:text-white"/>
                     </div>
                     <div>
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Extra Hour Rate (₹/hr) <span className="text-red-500">*</span></label>
                       <input required type="number" step="0.01" name="extraHourRate" defaultValue={editingCar?.extraHourRate ?? 100} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-900 dark:text-white"/>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">&lt;12h Rate (₹/hr) <span className="text-red-500">*</span></label>
                       <input required type="number" step="0.01" name="under12HourRate" defaultValue={editingCar?.under12HourRate ?? 150} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-900 dark:text-white"/>
                     </div>
                     <div>
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1 block">Security Deposit (₹) <span className="text-red-500">*</span></label>
                       <input required type="number" step="0.01" name="deposit" defaultValue={editingCar?.deposit ?? 5000} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-900 dark:text-white"/>
                     </div>
                   </div>
                 </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-white/10 flex gap-3 shrink-0 bg-white dark:bg-surface-dark">
                <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold py-3.5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" form="carForm" disabled={isPending} className="flex-[2] bg-primary text-[#181611] font-black py-3.5 px-8 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
                  {isPending ? "Saving..." : editingCar ? "Update Vehicle" : "Add Vehicle"}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
