"use server";

export async function fetchGooglePlaces(query) {
  if (!query) return [];
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    console.error("Missing GOOGLE_MAPS_API_KEY");
    return [];
  }

  // We restrict to India (components=country:in)
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:in&key=${key}&sessiontoken=custom_session`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "OK") {
       console.error("Google Places Error:", data.error_message || data.status);
       return [];
    }
    
    return data.predictions.map(p => ({
      display_name: p.description,
      place_id: p.place_id,
    }));
  } catch (e) {
    console.error("Google Places Fetch Error:", e);
    return [];
  }
}

export async function fetchGooglePlaceDetails(placeId) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${key}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "OK") return null;
    
    const location = data.result.geometry.location;
    return {
      lat: location.lat,
      lng: location.lng,
    };
  } catch (e) {
    console.error("Google Place Details Fetch Error:", e);
    return null;
  }
}

export async function fetchGoogleReverseGeocode(lat, lng) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "OK" || !data.results || data.results.length === 0) return null;
    
    // Return the formatted address of the most specific result
    return data.results[0].formatted_address;
  } catch (e) {
    console.error("Google Reverse Geocode Fetch Error:", e);
    return null;
  }
}
