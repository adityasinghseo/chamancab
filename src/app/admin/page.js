import { prisma } from "@/lib/prisma";

// Status badge colors
function StatusBadge({ status }) {
  const map = {
    PENDING:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? map.PENDING}`}>
      {label}
    </span>
  );
}

// Get initials for avatar fallback
function getInitials(name) {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default async function AdminDashboard() {
  // ── Fetch all data in parallel ────────────────────────────
  const [bookings, totalCities, totalLocations, totalRevenue, pendingCount, confirmedCount] =
    await Promise.all([
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { fromCity: true, toCity: true },
      }),
      prisma.city.count({ where: { isOperational: true } }),
      prisma.location.count({ where: { isOperational: true } }),
      prisma.booking.aggregate({
        _sum: { amount: true },
        where: { status: { in: ["COMPLETED", "CONFIRMED"] } },
      }),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
    ]);

  const revenue = totalRevenue._sum.amount ?? 0;
  const activeTrips = confirmedCount;

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8">
      {/* Top Navigation / Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome to Chaman Cab Admin Portal</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            {pendingCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-surface-dark"></span>
            )}
          </button>
          <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10 hidden md:block"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">RA</div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Rajesh Admin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">₹{revenue.toLocaleString("en-IN")}</h3>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
              <span className="material-symbols-outlined">route</span>
            </div>
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Trips</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{activeTrips}</h3>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-500/10 p-2 rounded-lg text-green-500">
              <span className="material-symbols-outlined">location_city</span>
            </div>
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Cities</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{totalCities}</h3>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-500">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pending Requests</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{pendingCount}</h3>
        </div>
      </div>

      {/* ── Recent Bookings Table + Quick Actions ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Table */}
        <div className="xl:col-span-3 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/30 dark:bg-white/[0.02]">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Recent Bookings</h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest 10 ride requests from customers.</p>
            </div>
            <a href="/admin/bookings" className="text-xs font-black text-primary uppercase tracking-widest hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Booking ID</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Route</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5 text-sm">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">#{booking.referenceId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">
                           {getInitials(booking.customerName)}
                         </div>
                         <p className="text-gray-900 dark:text-white font-bold">{booking.customerName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <span>{booking.fromCity?.name ?? '—'}</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                        <span>{booking.toCity?.name ?? booking.tripType === 'RENTAL' ? 'Local Rental' : '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {new Date(booking.pickupDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} · {booking.pickupTime}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">₹{booking.amount.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-widest">Quick Actions</h3>
            <div className="flex flex-col gap-2">
               {[
                { icon: "directions_car", label: "Manage Cars", href: "/admin/cars" },
                { icon: "payments",       label: "Pricing Matrix", href: "/admin/pricing" },
                { icon: "location_city",  label: "City Hubs", href: "/admin/cities" },
              ].map(({ icon, label, href }) => (
                <a key={label} href={href} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-primary/30 transition-all group">
                   <div className="bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-[#181611] transition-colors">
                     <span className="material-symbols-outlined text-[18px]">{icon}</span>
                   </div>
                   <span className="text-xs font-black text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white uppercase tracking-widest">{label}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl shadow-sm">
             <div className="flex items-center gap-2 text-primary mb-2">
               <span className="material-symbols-outlined animate-pulse">radio_button_checked</span>
               <span className="text-xs font-black uppercase tracking-widest">System Health</span>
             </div>
             <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
               All taxi services systems are operational. Database sync is active. 
             </p>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pb-4">
        © 2024 Chaman Cab Management System
      </div>
    </main>
  );
}
