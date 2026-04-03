"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AdminThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

export const useAdminTheme = () => useContext(AdminThemeContext);

export default function AdminThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark"); // Default to dark as user saw it
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage
    const savedTheme = localStorage.getItem("admin-theme") || "dark";
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("admin-theme", nextTheme);
  };

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === "dark" ? "dark bg-[#0f0f0f]" : "light bg-gray-50 bg-white"}>
        <div className="min-h-screen text-gray-900 dark:text-gray-100 flex font-display transition-colors duration-300">
           {children}
        </div>
      </div>
    </AdminThemeContext.Provider>
  );
}
