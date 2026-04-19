"use client";
import { useState, useTransition } from "react";
import { createCoupon, updateCoupon, deleteCoupon } from "@/app/actions/coupon";
import { useRouter } from "next/navigation";

export default function AdminCouponsClient({ initialCoupons }) {
  const router = useRouter();
  const coupons = initialCoupons;
  const [isPending, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const initForm = {
    code: "",
    discountPercent: "",
    expiryDate: "",
    isActive: "true",
  };
  const [form, setForm] = useState(initForm);

  const openNew = () => {
    setEditingCoupon(null);
    setForm(initForm);
    setIsModalOpen(true);
  };

  const openEdit = (cpn) => {
    setEditingCoupon(cpn);
    setForm({
      code: cpn.code,
      discountPercent: cpn.discountPercent.toString(),
      expiryDate: new Date(cpn.expiryDate).toISOString().split("T")[0],
      isActive: cpn.isActive ? "true" : "false",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("code", form.code);
    fd.append("discountPercent", form.discountPercent);
    fd.append("expiryDate", form.expiryDate);
    fd.append("isActive", form.isActive);

    startTransition(async () => {
      const res = editingCoupon
        ? await updateCoupon(editingCoupon.id, fd)
        : await createCoupon(fd);

      if (res.error) {
        alert(res.error);
      } else {
        closeModal();
        router.refresh();
      }
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this coupon?")) return;
    startTransition(async () => {
      const res = await deleteCoupon(id);
      if (res.error) alert(res.error);
      else router.refresh();
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Coupons</h1>
          <p className="text-white/50 text-sm mt-1">Manage promo codes and discounts</p>
        </div>
        <button
          onClick={openNew}
          className="bg-primary hover:bg-primary/90 text-[#181611] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          disabled={isPending}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Coupon
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Coupon Code</th>
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Discount</th>
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Expiry Date</th>
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/40">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const isExpired = new Date(c.expiryDate) < new Date();
                  return (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-1 rounded tracking-widest font-black text-sm">
                          {c.code}
                        </span>
                      </td>
                      <td className="p-4 text-white font-medium">{c.discountPercent}% OFF</td>
                      <td className="p-4 text-white/70">
                        {new Date(c.expiryDate).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                        {isExpired && <span className="ml-2 text-xs bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded">Expired</span>}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          c.isActive && !isExpired ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/50"
                        }`}>
                          {c.isActive && !isExpired ? "Active" : c.isActive ? "Expired" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-[#1a1608] border border-primary/20 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
              <h3 className="text-lg font-black text-white">
                {editingCoupon ? "Edit Coupon" : "New Coupon"}
              </h3>
              <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">Coupon Code <span className="text-primary">*</span></label>
                <input
                  required
                  type="text"
                  value={form.code}
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  placeholder="e.g. SAVE10"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white uppercase"
                />
              </div>

              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">Discount Percentage (%) <span className="text-primary">*</span></label>
                <input
                  required
                  type="number"
                  min="1"
                  max="100"
                  value={form.discountPercent}
                  onChange={e => setForm({...form, discountPercent: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">Expiry Date <span className="text-primary">*</span></label>
                <input
                  required
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.expiryDate}
                  onChange={e => setForm({...form, expiryDate: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">Status</label>
                <select
                  value={form.isActive}
                  onChange={e => setForm({...form, isActive: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl font-bold text-white/70 bg-white/5 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="flex-1 px-4 py-3 rounded-xl font-black text-[#181611] bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center">
                  {isPending ? <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span> : null}
                  {editingCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
