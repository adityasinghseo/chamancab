export async function getOsrmDistanceAndDuration(fromLat, fromLng, toLat, toLng) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const distanceMeters = data.routes[0].distance;
      const durationSeconds = data.routes[0].duration;
      
      return {
        distanceKm: distanceMeters / 1000,
        durationMinutes: Math.round(durationSeconds / 60)
      };
    }
    return null;
  } catch (error) {
    console.error("OSRM Error:", error);
    return null;
  }
}
