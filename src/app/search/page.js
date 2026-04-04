import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calculatePriceBreakdown } from "@/lib/dynamicPricing";
import { getOsrmDistanceAndDuration } from "@/lib/osrm";

const CAR_TYPE_ICONS = {
  Hatchback: "directions_car",
  Sedan:     "directions_car",
  SUV:       "airport_shuttle",
  MUV:       "airport_shuttle",
};

const TRIP_LABELS = {
  ONE_WAY:    "One Way",
  ROUND_TRIP: "Round Trip",
  RENTAL:     "Local Rental",
};

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const { type, fromCityId, packageId, pickupDate, pickupTime, fromName, fromLat, fromLng, toName, toLat, toLng } = params;

  // Rental relies on DB Cities
  const [fromCity, rentalPackage] = await Promise.all([
    fromCityId ? prisma.city.findUnique({ where: { id: fromCityId } }) : null,
    packageId   ? prisma.rentalPackage.findUnique({ where: { id: packageId } }) : null,
  ]);

  let carsWithPrices = [];
  let mapDistance = null;
  let mapDuration = null;

  if (type === "ONE_WAY" || type === "ROUND_TRIP") {
    const activeCars = await prisma.car.findMany({ where: { isActive: true } });
    if (fromLat && fromLng && toLat && toLng) {
      const osrm = await getOsrmDistanceAndDuration(fromLat, fromLng, toLat, toLng);
      
      if (osrm) {
        // Round trip doubles the UI display distance
        let calcDistance = osrm.distanceKm;
        if (type === "ROUND_TRIP") calcDistance *= 2;
        
        mapDistance = calcDistance.toFixed(1);
        mapDuration = osrm.durationMinutes;

        for (const car of activeCars) {
          // Send the raw single-way map distance to the Engine; the Engine multiplies it!
          const breakdown = calculatePriceBreakdown(car.id, osrm.distanceKm, type, pickupTime, 1);
          if (breakdown) {
            carsWithPrices.push({ car, price: breakdown.totalPayable, breakdown });
          }
        }
        carsWithPrices.sort((a, b) => a.price - b.price);
      }
    }
  } else if (type === "RENTAL" && packageId) {
    const pricings = await prisma.rentalPricing.findMany({
      where: {
        cityId:   fromCityId,
        packageId,
        isActive: true,
        car: { isActive: true },
      },
      include: { car: true },
      orderBy: { price: "asc" },
    });
    carsWithPrices = pricings.map((p) => ({ car: p.car, price: p.price }));
  }

  const buildBookingUrl = (carId, price, breakdown) => {
    const p = new URLSearchParams({
      carId, price, type,
      pickupDate, pickupTime,
      ...(fromCityId && { fromCityId }),
      ...(packageId  && { packageId }),
      ...(fromName   && { fromName }),
      ...(toName     && { toName }),
    });

    if (breakdown) {
      p.append("chargeDistance", breakdown.chargeDistance);
      p.append("baseFare", breakdown.baseFare);
      p.append("nightCharge", breakdown.nightCharge);
      p.append("gstAmount", breakdown.gstAmount);
    }

    return `/booking?${p.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[#181611] font-display">
      {/* Header */}
      <header className="bg-[#1e1a0e] border-b border-white/10 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-white hover:text-primary transition-colors mr-4">
            <span className="material-symbols-outlined">arrow_back</span>
          </a>
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <span className="material-symbols-outlined text-[#181611] text-xl">local_taxi</span>
            </div>
            <span className="text-white font-bold">Chaman Cab</span>
          </div>
        </div>
      </header>

    <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Trip Summary Card */}
        <div className="w-full min-w-0 bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          
          {/* LEFT: Trip Type & Locations */}
          <div className="flex-1 min-w-0 flex items-center gap-3 w-full">
            <span className="bg-primary/20 text-primary px-3 py-1.5 rounded-full text-[10px] uppercase font-black tracking-wider flex-shrink-0 self-start md:self-auto mt-0.5 md:mt-0">
              {TRIP_LABELS[type] ?? type}
            </span>
            
            <div className="flex items-center gap-2 text-white font-medium text-sm md:text-base flex-1 min-w-0">
              <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">location_on</span>
              <span className="truncate block">{fromName || fromCity?.name || "—"}</span>
              
              {toName && (
                <>
                  <span className="material-symbols-outlined text-white/30 flex-shrink-0 px-1">arrow_forward</span>
                  <span className="truncate block">{toName}</span>
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Distance, Date, and Modify Button */}
          <div className="flex-shrink-0 w-full md:w-auto flex items-center justify-end gap-3 md:gap-4 border-t border-white/10 md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 overflow-hidden">
            {mapDistance && (
              <div className="flex-shrink-0 flex items-center gap-1.5 text-primary/80 font-bold bg-primary/10 px-2 md:px-2.5 py-1.5 rounded-lg border border-primary/20 text-[11px] md:text-xs">
                 <span className="material-symbols-outlined text-[14px]">route</span>
                 {mapDistance} KM
              </div>
            )}

            <div className="flex-shrink-0 flex items-center gap-1.5 md:gap-2 text-white/60 text-[11px] md:text-xs whitespace-nowrap">
              <span className="material-symbols-outlined text-sm hidden md:block">calendar_month</span>
              <span suppressHydrationWarning>
                {pickupDate ? new Date(pickupDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                <span className="mx-1 md:mx-2 opacity-30">·</span> 
                {formatTime(pickupTime)}
              </span>
            </div>

            <a href="/" className="flex-shrink-0 inline-flex items-center justify-center gap-1 md:gap-2 text-primary hover:text-white font-bold text-[11px] md:text-xs bg-white/5 hover:bg-white/10 px-3 md:px-4 py-2 border border-white/10 rounded-lg transition-colors md:ml-2">
              <span className="material-symbols-outlined text-[14px] md:text-[16px]">edit</span> 
              <span className="hidden sm:inline">Modify</span>
              <span className="sm:hidden">Edit</span>
            </a>
          </div>
        </div>

        {/* Results */}
        <h2 className="text-white font-black text-xl mb-4">
          {carsWithPrices.length > 0
            ? `${carsWithPrices.length} Cabs Available`
            : "No cabs found for this route"}
        </h2>

        {carsWithPrices.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-white/20 text-6xl block mb-4">support_agent</span>
            <p className="text-white/60 text-lg font-semibold">Contact for Price</p>
            <p className="text-white/40 text-sm mt-2">We don't have standard pricing for this exact route yet. Please call our support team to get a custom quote and book your trip.</p>
            <a href="tel:+919876543210" className="inline-flex items-center gap-2 mt-6 bg-primary text-[#181611] font-bold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30">
              <span className="material-symbols-outlined">call</span>
              Call Now: +91 98765 43210
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {carsWithPrices.map(({ car, price, breakdown }) => (
              <div key={car.id} className="bg-white/5 border border-white/10 hover:border-primary/30 rounded-2xl p-5 transition-all group relative overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Car icon / image */}
                  <div className="bg-primary/10 rounded-xl p-4 flex-shrink-0 group-hover:bg-primary/20 transition-colors w-full sm:w-auto text-center sm:text-left">
                    <span className="material-symbols-outlined text-primary text-5xl">
                      {CAR_TYPE_ICONS[car.type] ?? "directions_car"}
                    </span>
                    <div className="mt-2 text-primary font-black text-xs uppercase tracking-widest whitespace-nowrap">
                      ₹{breakdown?.ratePerKm}/km
                    </div>
                  </div>

                  {/* Car details & breakdown */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-white font-black text-xl">{car.name}</h3>
                      <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{car.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        car.fuelType === "CNG" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                      }`}>{car.fuelType}</span>
                    </div>

                    {/* Features grid */}
                    <div className="flex flex-wrap gap-3 text-xs text-white/60 mb-4 bg-white/5 inline-flex p-2 rounded-lg">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">person</span>{car.seats}</span>
                      {car.hasAC && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">ac_unit</span>AC</span>}
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">luggage</span>{car.luggageCapacity}</span>
                    </div>

                    {/* Fare Calculation Breakdown Grid */}
                    {breakdown && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-black/30 rounded-xl p-3 border border-white/5">
                        <div>
                          <p className="text-white/40 mb-1">Billed Distance</p>
                          <p className="text-white font-bold">{breakdown.chargeDistance} KM</p>
                          {(breakdown.chargeDistance === 250) && <p className="text-primary/70 text-[10px] mt-0.5">*Min. outstation</p>}
                        </div>
                        <div>
                          <p className="text-white/40 mb-1">Base Fare</p>
                          <p className="text-white font-bold">₹{breakdown.baseFare.toLocaleString("en-IN")}</p>
                        </div>
                        {breakdown.nightCharge > 0 && (
                          <div>
                            <p className="text-white/40 mb-1">Night Charge</p>
                            <p className="text-amber-400 font-bold">+₹{breakdown.nightCharge}</p>
                            <p className="text-white/30 text-[10px] mt-0.5">10 PM - 6 AM</p>
                          </div>
                        )}
                        <div>
                          <p className="text-white/40 mb-1">GST (5%)</p>
                          <p className="text-white font-bold">+₹{breakdown.gstAmount.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-start gap-2 text-[11px] text-white/40 leading-snug">
                      <span className="material-symbols-outlined text-primary/50 text-[14px]">info</span>
                      <p>Toll tax, parking, and interstate charges are extra and to be paid as actuals. Time & distance calculated garage to garage.</p>
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="w-full sm:w-auto sm:text-right mt-2 flex-shrink-0 border-t border-white/5 sm:border-t-0 pt-4 sm:pt-0 sm:pl-4 sm:border-l whitespace-nowrap">
                    <p className="text-white/60 text-xs mb-0.5 font-semibold">Total Payable</p>
                    <p className="text-primary font-black text-3xl tracking-tight">
                      ₹{breakdown?.totalPayable?.toLocaleString("en-IN") || price.toLocaleString("en-IN")}
                    </p>
                    {type === "ROUND_TRIP" && (
                      <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">Full Round Trip</p>
                    )}
                    <Link
                      href={buildBookingUrl(car.id, breakdown?.totalPayable || price, breakdown)}
                      className="mt-4 flex w-full justify-center items-center gap-2 bg-primary hover:bg-primary/90 text-[#181611] font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                      Book Now
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
