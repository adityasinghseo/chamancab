"use client";

import { useState, useTransition } from "react";
import { createCar, updateCar, toggleCarActive, deleteCar } from "@/app/actions/admin";

export default function AdminCarsClient({ initialCars }) {
  const [cars, setCars] = useState(initialCars);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [isTransitioning, startTransition] = useTransition();

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
        await updateCar(editingCar.id, formData);
      } else {
        await createCar(formData);
      }
      // Refresh logic would ideally re-fetch or rely on revalidatePath, 
      // but for immediate UI we can reload the page or update state.
      window.location.reload(); 
    });
  };

  const handleToggleActive = async (id, currentStatus) => {
    startTransition(async () => {
      await toggleCarActive(id, !currentStatus);
      window.location.reload();
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this car? This will also delete all associated pricing matrix entries.")) return;
    startTransition(async () => {
      await deleteCar(id);
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Vehicle Fleet</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your cars, specs, and availability status.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-[#181611] font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add New Car
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500 group-hover:bg-blue-500/20">
              <span className="material-symbols-outlined">directions_car</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Fleet</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{cars.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-2.5 rounded-xl text-green-500 group-hover:bg-green-500/20">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Units</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{cars.filter(c => c.isActive).length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/10 p-2.5 rounded-xl text-yellow-500 group-hover:bg-yellow-500/20">
              <span className="material-symbols-outlined">local_gas_station</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">CNG/EV Units</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{cars.filter(c => c.fuelType === "CNG" || c.fuelType === "EV").length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Cars Table */}
      <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm transition-colors overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Vehicle</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Type</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Fuel</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Seats</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">AC</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">One Way</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Local Rental</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Round Trip</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${car.isActive ? 'bg-primary/10 text-primary' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>
                        <span className="material-symbols-outlined text-[20px]">
                          {car.type === 'Hatchback' ? 'directions_car' : car.type === 'Sedan' ? 'directions_car' : 'airport_shuttle'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{car.name}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{car.description || 'No description'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-white/10">
                      {car.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                      car.fuelType === 'CNG' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      car.fuelType === 'EV' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {car.fuelType}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center text-sm font-bold text-gray-600 dark:text-gray-400">
                    {car.seats}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {car.hasAC ? (
                      <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-gray-300 dark:text-white/10 text-sm">cancel</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center text-lg">{car.isOneWayAvailable ? "✅" : "❌"}</td>
                  <td className="px-6 py-5 text-center text-lg">{car.isLocalRentalAvailable ? "✅" : "❌"}</td>
                  <td className="px-6 py-5 text-center text-lg">{car.isRoundTripAvailable ? "✅" : "❌"}</td>
                  <td className="px-6 py-5 text-center">
                     <button
                        onClick={() => handleToggleActive(car.id, car.isActive)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                            car.isActive ? "bg-primary" : "bg-gray-300 dark:bg-white/10"
                        }`}
                      >
                        <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                car.isActive ? "translate-x-4" : "translate-x-0"
                            }`}
                        />
                      </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                       <button
                        onClick={() => handleOpenModal(car)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(car.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  {editingCar ? "Edit Vehicle" : "Add Vehicle"}
                </h2>
                <p className="text-xs text-gray-400">Fill in the vehicle specifications below</p>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Vehicle Name</label>
                  <input
                    name="name"
                    defaultValue={editingCar?.name}
                    required
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    placeholder="e.g. Maruti Suzuki Wagon R"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Type</label>
                  <select
                    name="type"
                    defaultValue={editingCar?.type || "Hatchback"}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                  >
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="MUV">MUV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Fuel Type</label>
                  <select
                    name="fuelType"
                    defaultValue={editingCar?.fuelType || "CNG"}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                  >
                    <option value="CNG">CNG</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="EV">EV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Seats</label>
                  <input
                    type="number"
                    name="seats"
                    defaultValue={editingCar?.seats || 4}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Luggage Bags</label>
                  <input
                    type="number"
                    name="luggageCapacity"
                    defaultValue={editingCar?.luggageCapacity || 2}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 py-2">
                   <input
                    type="checkbox"
                    name="hasAC"
                    value="true"
                    defaultChecked={editingCar?.hasAC ?? true}
                    className="w-5 h-5 accent-primary rounded"
                  />
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Air Conditioned</label>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-white/10">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Service Availability</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="isOneWayAvailable" value="true" defaultChecked={editingCar ? editingCar.isOneWayAvailable : true} className="w-5 h-5 accent-primary rounded" />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Available for One Way</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="isLocalRentalAvailable" value="true" defaultChecked={editingCar ? editingCar.isLocalRentalAvailable : true} className="w-5 h-5 accent-primary rounded" />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Available for Local Rental</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="isRoundTripAvailable" value="true" defaultChecked={editingCar ? editingCar.isRoundTripAvailable : true} className="w-5 h-5 accent-primary rounded" />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Available for Round Trip</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-white/10">
                <label className="block text-xs font-black text-primary uppercase tracking-widest mb-3">Dynamic Pricing Engine (One Way / Round Trip)</label>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">One Way (₹/KM)</label>
                    <input type="number" step="0.1" name="perKmRateOneWay" defaultValue={editingCar?.perKmRateOneWay || 20} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Round Trip (₹/KM)</label>
                    <input type="number" step="0.1" name="perKmRateRoundTrip" defaultValue={editingCar?.perKmRateRoundTrip || 10} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none" />
                  </div>
                </div>

                <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer mb-2">
                    <input type="checkbox" name="isShortTripRoundLogic" value="true" defaultChecked={editingCar ? editingCar.isShortTripRoundLogic : false} className="w-5 h-5 accent-primary rounded" />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Enable Short Trip Slab Logic</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Slab Threshold (KM)</label>
                      <input type="number" name="shortTripThreshold" defaultValue={editingCar?.shortTripThreshold || 30} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="e.g. 30" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Minimum Base Fare (₹)</label>
                      <input type="number" name="shortTripMinFare" defaultValue={editingCar?.shortTripMinFare || 500} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="e.g. 500" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 italic">If enabled, trips below the Threshold KM will be computed as "To & Fro" multiplied by the One Way rate, capped by the Minimum Base Fare above.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Description (Internal)</label>
                <textarea
                  name="description"
                  defaultValue={editingCar?.description}
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  placeholder="Internal notes about this car..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold py-3.5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransitioning}
                  className="flex-2 bg-primary text-[#181611] font-black py-3.5 px-8 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                >
                  {isTransitioning ? "Saving..." : editingCar ? "Update Vehicle" : "Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
