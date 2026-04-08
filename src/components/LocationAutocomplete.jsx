import { useState, useEffect, useRef } from "react";
import { fetchGooglePlaces, fetchGooglePlaceDetails, fetchGoogleReverseGeocode } from "@/app/actions/googleMap";

export default function LocationAutocomplete({ label, placeholder, icon, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  const fetchLocations = async (text) => {
    if (!text.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      let data = await fetchGooglePlaces(text);
      
      // Filter logically to UP if preferred, or keep it open. Google autocomplete is smart.
      // E.g. data = data.filter(place => place.display_name.includes("Uttar Pradesh"));

      // Inject custom unmapped BHEL Jagdishpur location if matched
      const lowerText = text.toLowerCase();
      if ("bhel jagdishpur".includes(lowerText) || lowerText.includes("bhel") || lowerText.includes("jagdishpur")) {
        const bhelCustom = {
          display_name: "BHEL Jagdishpur, Amethi, Uttar Pradesh, India",
          place_id: "custom_bhel",
          lat: "26.4561010",
          lon: "81.6198203"
        };
        if (!data.some(d => d.display_name.includes("BHEL Jagdishpur"))) {
          data.unshift(bhelCustom);
        }
      }

      setResults(data.slice(0, 5));
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setShowDropdown(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchLocations(val);
    }, 500); // Debounce to respect Nominatim limits
  };

  const handleSelect = async (place) => {
    setQuery(place.display_name);
    setShowDropdown(false);
    setLoading(true);

    if (place.place_id === 'custom_bhel') {
      onSelect({ name: place.display_name, lat: place.lat, lng: place.lon });
    } else {
      const details = await fetchGooglePlaceDetails(place.place_id);
      if (details) {
        onSelect({ name: place.display_name, lat: details.lat, lng: details.lng });
      } else {
        // Fallback or error handling
        onSelect({ name: place.display_name, lat: null, lng: null });
      }
    }
    setLoading(false);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setLoading(true);
    setShowDropdown(true); // Keep dropdown open to show loading state
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        const address = await fetchGoogleReverseGeocode(lat, lng);
        const finalAddress = address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`; // fallback
        
        setQuery(finalAddress);
        setShowDropdown(false);
        setLoading(false);
        
        onSelect({ name: finalAddress, lat, lng });
      },
      (error) => {
        console.error("Geolocation Error:", error);
        alert("Failed to track location. Please ensure location permissions are granted.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative">
      <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5">
        <span className="material-symbols-outlined text-xs mr-1 align-middle">{icon}</span>
        {label}
      </label>
      <input
        type="text"
        required
        value={query}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all text-sm"
      />
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-[#2a2410] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {/* Static Current Location Button */}
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="w-full flex items-center gap-2 text-left px-4 py-3 border-b border-white/10 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-base">my_location</span>
            Use Current Location
          </button>
          
          {loading ? (
             <div className="p-3 text-xs text-white/50 text-center animate-pulse">Searching...</div>
          ) : results.length > 0 ? (
            results.map((place, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(place)}
                className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/10 text-white text-xs transition-colors"
              >
                {place.display_name}
              </button>
            ))
          ) : (
             <div className="p-3 text-xs text-white/50 text-center">No locations found.</div>
          )}
        </div>
      )}
    </div>
  );
}
