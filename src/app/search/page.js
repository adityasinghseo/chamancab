import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
  const { type, fromCityId, toCityId, pickupLocId, dropLocId, packageId, pickupDate, pickupTime } = params;

  // Fetch cities/locations for display
  const [fromCity, toCity, pickupLoc, dropLoc, rentalPackage] = await Promise.all([
    fromCityId ? prisma.city.findUnique({ where: { id: fromCityId } }) : null,
    toCityId   ? prisma.city.findUnique({ where: { id: toCityId   } }) : null,
    pickupLocId ? prisma.location.findUnique({ where: { id: pickupLocId } }) : null,
    dropLocId   ? prisma.location.findUnique({ where: { id: dropLocId   } }) : null,
    packageId   ? prisma.rentalPackage.findUnique({ where: { id: packageId } }) : null,
  ]);

  // Fetch available cars with pricing
  let carsWithPrices = [];

  if (type === "ONE_WAY" || type === "ROUND_TRIP") {
    const pricings = await prisma.routePricing.findMany({
      where: {
        fromCityId,
        toCityId,
        tripType:  type,
        isActive: true,
        car: { isActive: true },
      },
      include: { car: true },
      orderBy: { price: "asc" },
    });
    carsWithPrices = pricings.map((p) => ({ car: p.car, price: p.price }));
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

  const buildBookingUrl = (carId, price) => {
    const params = new URLSearchParams({
      carId, price, type,
      pickupDate, pickupTime,
      ...(fromCityId  && { fromCityId }),
      ...(toCityId    && { toCityId }),
      ...(pickupLocId && { pickupLocId }),
      ...(dropLocId   && { dropLocId }),
      ...(packageId   && { packageId }),
    });
    return `/booking?${params}`;
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
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">
              {TRIP_LABELS[type] ?? type}
            </span>
            <div className="flex items-center gap-2 text-white font-semibold">
              <span className="material-symbols-outlined text-primary text-lg">location_on</span>
              {fromCity?.name ?? "—"}
              {toCity && (
                <>
                  <span className="material-symbols-outlined text-white/40">arrow_right_alt</span>
                  {toCity.name}
                </>
              )}
            </div>
            {rentalPackage && (
              <span className="text-white/60">· {rentalPackage.name}</span>
            )}
            {pickupLoc && (
              <span className="text-white/60 text-xs">Pickup: {pickupLoc.landmark}</span>
            )}
            <div className="ml-auto flex items-center gap-2 text-white/60 text-xs">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {pickupDate ? new Date(pickupDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              &nbsp;·&nbsp;{formatTime(pickupTime)}
            </div>
          </div>
          <div className="mt-3">
            <a href="/" className="text-primary/80 hover:text-primary text-xs font-medium">
              ← Modify Search
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
            <span className="material-symbols-outlined text-white/20 text-6xl block mb-4">search_off</span>
            <p className="text-white/60 text-lg font-semibold">No cabs available for this route yet</p>
            <p className="text-white/40 text-sm mt-2">Admin needs to add pricing for this route in the dashboard</p>
            <a href="/" className="inline-flex items-center gap-2 mt-6 bg-primary text-[#181611] font-bold px-6 py-3 rounded-xl">
              <span className="material-symbols-outlined">arrow_back</span>
              Try Another Route
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {carsWithPrices.map(({ car, price }) => (
              <div key={car.id} className="bg-white/5 border border-white/10 hover:border-primary/30 rounded-2xl p-5 transition-all group">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {/* Car icon / image */}
                  <div className="bg-primary/10 rounded-xl p-4 flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary text-4xl">
                      {CAR_TYPE_ICONS[car.type] ?? "directions_car"}
                    </span>
                  </div>

                  {/* Car details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-white font-black text-lg">{car.name}</h3>
                      <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{car.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        car.fuelType === "CNG" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                      }`}>{car.fuelType}</span>
                    </div>
                    {car.description && (
                      <p className="text-white/50 text-sm mb-3">{car.description}</p>
                    )}
                    {/* Features */}
                    <div className="flex flex-wrap gap-3 text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person</span>
                        {car.seats} Seats
                      </span>
                      {car.hasAC && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">ac_unit</span>
                          AC
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">luggage</span>
                        {car.luggageCapacity} Bags
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Fuel Included
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Driver Included
                      </span>
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="sm:text-right mt-2 sm:mt-0 flex-shrink-0">
                    <p className="text-white/50 text-xs mb-0.5">Total Price</p>
                    <p className="text-primary font-black text-3xl">
                      ₹{price.toLocaleString("en-IN")}
                    </p>
                    {type === "ROUND_TRIP" && (
                      <p className="text-white/40 text-xs">for full round trip</p>
                    )}
                    {type === "RENTAL" && rentalPackage && (
                      <p className="text-white/40 text-xs">for {rentalPackage.name}</p>
                    )}
                    <Link
                      href={buildBookingUrl(car.id, price)}
                      className="mt-3 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-[#181611] font-black px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30 text-sm"
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
