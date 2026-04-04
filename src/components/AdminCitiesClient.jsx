"use client";

import { useState, useTransition, useMemo } from "react";
import {
  createCity, updateCity, toggleCityActive, deleteCity,
  createLocation, updateLocation, deleteLocation,
} from "@/app/actions/admin";

export default function AdminCitiesClient({ initialCities }) {
  const [cities]          = useState(initialCities);
  const [selId, setSelId] = useState(initialCities[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const [cityModal, setCityModal] = useState({ open: false, city: null });
  const [hubModal,  setHubModal]  = useState({ open: false, hub: null, cityId: null });

  const filtered    = useMemo(() => cities.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), [cities, search]);
  const selectedCity = cities.find(c => c.id === selId) ?? null;
  const totalHubs   = cities.reduce((s, c) => s + (c.locations?.length || 0), 0);

  /* ── helpers ── */
  const reload = () => window.location.reload();

  const handleCitySubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    startTransition(async () => {
      cityModal.city ? await updateCity(cityModal.city.id, fd) : await createCity(fd);
      reload();
    });
  };

  const handleToggleCity = (id, cur) =>
    startTransition(async () => { await toggleCityActive(id, !cur); reload(); });

  const handleDeleteCity = (id, name) => {
    if (!confirm(`Delete "${name}" and all its hubs?\n\nRoute & rental pricing for this city will also be removed.`)) return;
    startTransition(async () => { await deleteCity(id); reload(); });
  };

  const handleHubSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    fd.append("cityId", hubModal.cityId);
    startTransition(async () => {
      hubModal.hub ? await updateLocation(hubModal.hub.id, fd) : await createLocation(fd);
      reload();
    });
  };

  const handleDeleteHub = (id, name) => {
    if (!confirm(`Delete hub "${name}"?`)) return;
    startTransition(async () => { await deleteLocation(id); reload(); });
  };

  /* ── field styles ── */
  const inputCls = "w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-gray-900 dark:text-white";
  const labelCls = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">City &amp; Hub Management</h1>
          <p className="text-sm text-gray-400">{cities.length} cities · {totalHubs} total hubs</p>
        </div>
        <button
          onClick={() => setCityModal({ open: true, city: null })}
          className="bg-primary text-[#181611] font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add_location</span>
          Add City
        </button>
      </div>

      {/* ── Two-Panel Layout ── */}
      <div className="flex gap-4" style={{ height: "calc(100vh - 215px)", minHeight: "520px" }}>

        {/* ── LEFT: City List ── */}
        <div className="w-64 flex-shrink-0 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl flex flex-col shadow-sm overflow-hidden">
          <div className="p-3 border-b border-gray-100 dark:border-white/10">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-gray-400 pointer-events-none">search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cities..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="px-3 py-1.5 flex items-center justify-between border-b border-gray-50 dark:border-white/5">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{filtered.length} cities</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(city => (
              <div
                key={city.id}
                onClick={() => setSelId(city.id)}
                className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-all border-l-[3px] ${
                  selId === city.id
                    ? "bg-primary/10 border-primary"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-black truncate leading-none ${selId === city.id ? "text-primary" : "text-gray-900 dark:text-white"}`}>
                    {city.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[9px] text-gray-400 font-semibold">{city.locations?.length || 0} hubs</span>
                    <span className={`text-[9px] font-black ${city.isOperational ? "text-green-500" : "text-red-400"}`}>
                      · {city.isOperational ? "Active" : "Paused"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); setCityModal({ open: true, city }); }}
                    className="p-1 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                    title="Edit city"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteCity(city.id, city.name); }}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    title="Delete city"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Hub Panel ── */}
        <div className="flex-1 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl flex flex-col shadow-sm overflow-hidden min-w-0">
          {selectedCity ? (
            <>
              {/* Hub panel header */}
              <div className="px-5 py-3.5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">location_city</span>
                  </div>
                  <div>
                    <h2 className="text-base font-black text-gray-900 dark:text-white leading-none">{selectedCity.name}</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                      {selectedCity.state} · {selectedCity.locations?.length || 0} / 15 hubs
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    selectedCity.isOperational
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {selectedCity.isOperational ? "Operational" : "Paused"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleCity(selectedCity.id, selectedCity.isOperational)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                  >
                    {selectedCity.isOperational ? "Pause" : "Activate"}
                  </button>
                  <button
                    onClick={() => setCityModal({ open: true, city: selectedCity })}
                    className="p-2 border border-gray-200 dark:border-white/10 rounded-xl text-gray-400 hover:text-blue-500 transition-all"
                    title="Edit city"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    onClick={() => setHubModal({ open: true, hub: null, cityId: selectedCity.id })}
                    className="bg-primary text-[#181611] font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
                    Add Hub
                  </button>
                </div>
              </div>

              {/* Hub grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {!selectedCity.locations?.length ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-gray-300 dark:text-white/20 text-3xl">add_location_alt</span>
                    </div>
                    <p className="text-sm font-bold text-gray-400">No hubs in {selectedCity.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Hub" to register pickup points</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {selectedCity.locations.map(hub => (
                      <div
                        key={hub.id}
                        className="group relative bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-3 hover:border-primary/40 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start gap-2 mb-3">
                          <span className={`material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0 ${hub.isOperational ? "text-primary" : "text-gray-300"}`}>
                            pin_drop
                          </span>
                          <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{hub.landmark}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                            hub.isOperational ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400"
                          }`}>
                            {hub.isOperational ? "Active" : "Off"}
                          </span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setHubModal({ open: true, hub, cityId: selectedCity.id })}
                              className="p-1 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                              title="Edit hub"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteHub(hub.id, hub.landmark)}
                              className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                              title="Delete hub"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-white/10">location_city</span>
                <p className="text-sm text-gray-400 mt-2">Select a city to manage its hubs</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── City Modal ── */}
      {cityModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {cityModal.city ? "Edit City" : "Add New City"}
              </h3>
              <button onClick={() => setCityModal({ open: false, city: null })} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleCitySubmit}>
              <div>
                <label className={labelCls}>City Name</label>
                <input name="name" defaultValue={cityModal.city?.name} required placeholder="e.g. Lucknow" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input name="state" defaultValue={cityModal.city?.state || "Uttar Pradesh"} required placeholder="e.g. Uttar Pradesh" className={inputCls} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <input type="checkbox" name="isOperational" value="true" id="city_op" defaultChecked={cityModal.city?.isOperational ?? true} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Mark as Operational</span>
              </label>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setCityModal({ open: false, city: null })} className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={isPending} className="flex-[2] bg-primary text-[#181611] font-black py-3 rounded-xl text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
                  {isPending ? "Saving..." : cityModal.city ? "Update City" : "Add City"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Hub Modal ── */}
      {hubModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">{hubModal.hub ? "Edit Hub" : "Add Hub"}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{cities.find(c => c.id === hubModal.cityId)?.name}</p>
              </div>
              <button onClick={() => setHubModal({ open: false, hub: null, cityId: null })} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleHubSubmit}>
              <div>
                <label className={labelCls}>Hub / Pickup Point Name</label>
                <input name="landmark" defaultValue={hubModal.hub?.landmark} required placeholder="e.g. Charbagh Railway Station" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Latitude <span className="font-normal normal-case">(optional)</span></label>
                  <input name="latitude" type="number" step="any" defaultValue={hubModal.hub?.latitude || ""} placeholder="26.8391" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Longitude <span className="font-normal normal-case">(optional)</span></label>
                  <input name="longitude" type="number" step="any" defaultValue={hubModal.hub?.longitude || ""} placeholder="80.9230" className={inputCls} />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <input type="checkbox" name="isOperational" value="true" id="hub_op" defaultChecked={hubModal.hub?.isOperational ?? true} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Hub is Operational</span>
              </label>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setHubModal({ open: false, hub: null, cityId: null })} className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={isPending} className="flex-[2] bg-primary text-[#181611] font-black py-3 rounded-xl text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
                  {isPending ? "Saving..." : hubModal.hub ? "Update Hub" : "Add Hub"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
