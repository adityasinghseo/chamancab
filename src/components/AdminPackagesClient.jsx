"use client";

import { useState, useTransition } from "react";
import {
  createPackage,
  updatePackage,
  togglePackageActive,
  deletePackage,
} from "@/app/actions/admin";

export default function AdminPackagesClient({ initialPackages }) {
  const [packages, setPackages] = useState(initialPackages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenModal = (pkg = null) => {
    setEditingPkg(pkg);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingPkg(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    startTransition(async () => {
      if (editingPkg) {
        await updatePackage(editingPkg.id, formData);
      } else {
        await createPackage(formData);
      }
      window.location.reload();
    });
  };

  const handleToggleActive = async (id, currentStatus) => {
    startTransition(async () => {
      await togglePackageActive(id, !currentStatus);
      window.location.reload();
    });
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Delete this package? This will also remove all linked rental pricing entries."
      )
    )
      return;
    startTransition(async () => {
      await deletePackage(id);
      window.location.reload();
    });
  };

  const activeCount = packages.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Rental Packages
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create and manage local rental packages (e.g., 4hr/40km).
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-[#181611] font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add Package
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-500">
              <span className="material-symbols-outlined">timer</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Total Packages
              </p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                {packages.length}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-2.5 rounded-xl text-green-500">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Active
              </p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                {activeCount}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 p-2.5 rounded-xl text-red-500">
              <span className="material-symbols-outlined">cancel</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Inactive
              </p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                {packages.length - activeCount}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Package Name
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                  Hours
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                  Kilometers
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                  Sort Order
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {packages.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-gray-400"
                  >
                    No packages yet. Click &ldquo;Add Package&rdquo; to create
                    one.
                  </td>
                </tr>
              )}
              {packages.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Name */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          pkg.isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-200 dark:bg-white/10 text-gray-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          timer
                        </span>
                      </div>
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {pkg.name}
                      </p>
                    </div>
                  </td>

                  {/* Hours */}
                  <td className="px-6 py-5 text-center">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded text-[11px] font-bold uppercase tracking-widest">
                      {pkg.hours} hr
                    </span>
                  </td>

                  {/* Kilometers */}
                  <td className="px-6 py-5 text-center">
                    <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[11px] font-bold uppercase tracking-widest">
                      {pkg.kilometers} km
                    </span>
                  </td>

                  {/* Sort Order */}
                  <td className="px-6 py-5 text-center text-sm font-bold text-gray-500 dark:text-gray-400">
                    {pkg.sortOrder}
                  </td>

                  {/* Toggle */}
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => handleToggleActive(pkg.id, pkg.isActive)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        pkg.isActive
                          ? "bg-primary"
                          : "bg-gray-300 dark:bg-white/10"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          pkg.isActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(pkg)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
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
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  {editingPkg ? "Edit Package" : "Add Package"}
                </h2>
                <p className="text-xs text-gray-400">
                  {editingPkg
                    ? "Update rental package details"
                    : "Define a new rental time/distance package"}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Package Name */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                  Package Name
                </label>
                <input
                  name="name"
                  defaultValue={editingPkg?.name}
                  required
                  placeholder="e.g. 4hr / 40km"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Hours */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Hours
                  </label>
                  <input
                    type="number"
                    name="hours"
                    min="1"
                    defaultValue={editingPkg?.hours ?? 4}
                    required
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                {/* Kilometers */}
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Kilometers
                  </label>
                  <input
                    type="number"
                    name="kilometers"
                    min="1"
                    defaultValue={editingPkg?.kilometers ?? 40}
                    required
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                  Sort Order{" "}
                  <span className="normal-case font-normal text-gray-400">
                    (lower = shown first)
                  </span>
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  min="0"
                  defaultValue={editingPkg?.sortOrder ?? 0}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* Actions */}
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
                  disabled={isPending}
                  className="flex-[2] bg-primary text-[#181611] font-black py-3.5 px-8 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                >
                  {isPending
                    ? "Saving..."
                    : editingPkg
                    ? "Update Package"
                    : "Add Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
