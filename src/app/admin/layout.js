"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminThemeProvider from "@/components/AdminThemeProvider";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <AdminThemeProvider>
      {!isLoginPage && <AdminSidebar />}
      <div className={`flex-1 flex flex-col min-h-screen overflow-x-hidden ${isLoginPage ? 'w-full' : ''}`}>
        {children}
      </div>
    </AdminThemeProvider>
  );
}
