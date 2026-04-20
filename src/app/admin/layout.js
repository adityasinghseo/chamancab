"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminThemeProvider from "@/components/AdminThemeProvider";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AdminThemeProvider>
      {!isLoginPage && <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
      <div className={`flex-1 flex flex-col min-h-screen overflow-x-hidden ${isLoginPage ? 'w-full' : ''}`}>
        {!isLoginPage && (
          <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a]">
            <img src="/CHAMANCAB-LOGO.webp" alt="Chaman Cab" className="h-10 w-auto object-contain" />
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
          </div>
        )}
        {children}
      </div>
    </AdminThemeProvider>
  );
}
