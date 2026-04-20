import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  // Fetch operational cities and their locations for the form dropdowns
  const cities = await prisma.city.findMany({
    where: { isOperational: true },
    orderBy: { name: "asc" },
    include: {
      locations: {
        where: { isOperational: true },
        orderBy: { landmark: "asc" },
      },
    },
  });

  const packages = await prisma.rentalPackage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  // Fetch Google Reviews
  let reviewsData = null;
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJTQpIRk5LmjkR16HRkDNztl4&fields=reviews,rating,user_ratings_total&key=${apiKey}`, { next: { revalidate: 86400 } });
      const data = await res.json();
      if (data.result) {
        reviewsData = data.result;
      }
    }
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
  }

  return <HomeClient cities={cities} packages={packages} reviewsData={reviewsData} />;
}
