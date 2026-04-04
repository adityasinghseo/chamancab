"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4 font-display">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-10">
          <div className="flex flex-col items-center mb-8">
            <img src="/CHAMANCAB-LOGO.webp" alt="Chaman Cab" className="h-28 md:h-36 w-auto object-contain mb-4" />
            <h1 className="text-2xl font-black text-gray-900 leading-tight uppercase tracking-widest">Admin Portal</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Chaman Cab Management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
              <input 
                 name="username" 
                 type="text" 
                 required 
                 className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:border-primary outline-none transition-all placeholder-gray-300"
                 placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input 
                 name="password" 
                 type="password" 
                 required 
                 className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:border-primary outline-none transition-all placeholder-gray-300"
                 placeholder="••••••••"
              />
            </div>

            {error && (
               <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-shake">
                  {error}
               </div>
            )}

            <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-[#181611] text-white font-black text-[10px] uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-primary hover:text-[#181611] transition-all duration-300 shadow-xl shadow-[#181611]/10 flex items-center justify-center gap-2"
            >
               {loading ? (
                 <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
               ) : (
                 <>
                   <span className="material-symbols-outlined text-[18px]">lock_open</span>
                   Access Portal
                 </>
               )}
            </button>
          </form>

          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-10">
             © 2024 Chaman Cab · Admin System
          </p>
        </div>
      </div>
      
      {/* Background Decor */}
      <div className="fixed -bottom-24 -right-24 size-[500px] bg-primary/5 rounded-full blur-3xl z-[-1]"></div>
      <div className="fixed -top-24 -left-24 size-[500px] bg-primary/5 rounded-full blur-3xl z-[-1]"></div>
    </div>
  );
}
