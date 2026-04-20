"use client";
import { usePathname } from "next/navigation";
import { useAdminTheme } from "@/components/AdminThemeProvider";
import { logout } from "@/app/actions/auth";

const NAV = [
  { href: "/admin",            label: "Dashboard",  icon: "dashboard" },
  { href: "/admin/bookings",   label: "Bookings",   icon: "receipt_long" },
  { href: "/admin/offers",     label: "Offers",     icon: "local_offer" },
  { href: "/admin/coupons",    label: "Coupons",    icon: "percent" },
  { href: "/admin/cars",       label: "Cab Fleet",  icon: "directions_car" },
  { href: "/admin/self-drive-cars", label: "Self Drive", icon: "car_rental" },
  { href: "/admin/packages",   label: "Packages",   icon: "timer" },
  { href: "/admin/pricing",    label: "Rental Prices", icon: "local_activity" },
  { href: "/admin/cities",     label: "Cities",     icon: "location_city" },
  { href: "/admin/drivers",    label: "Drivers",    icon: "person_search" },
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useAdminTheme();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-10 w-64 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-white/10 flex-shrink-0 flex flex-col justify-between transition-transform duration-300 transform h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
      `}>
        <div className="overflow-y-auto flex-1">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-white/10">
            <img src="/CHAMANCAB-LOGO.webp" alt="Chaman Cab" className="h-12 lg:h-16 md:h-20 w-auto object-contain" />
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-4 mt-2">
          {NAV.map(({ href, label, icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <a
                key={href}
                href={href}
                onClick={() => setIsOpen && setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? "bg-primary text-[#181611] shadow-md shadow-primary/25 font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                {label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-white/10 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm font-medium border border-transparent hover:border-gray-200 dark:hover:border-white/10"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </div>
          <div className={`w-8 h-4 rounded-full relative flex items-center p-0.5 transition-colors ${theme === "dark" ? "bg-primary" : "bg-gray-200"}`}>
             <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform ${theme === "dark" ? "translate-x-4" : "translate-x-0"}`}></div>
          </div>
        </button>

        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">open_in_new</span>
          View Website
        </a>
        
        {/* Quick User Info & Logout */}
        <div className="mt-3 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs uppercase">RA</div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Admin</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black leading-none mt-1">Super</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1 px-2 border border-gray-100 dark:border-white/10 rounded-lg text-gray-300 dark:text-gray-500 hover:text-red-500 transition-all group"
            >
              <span className="material-symbols-outlined text-[18px] group-active:scale-90 transition-transform">logout</span>
            </button>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}
