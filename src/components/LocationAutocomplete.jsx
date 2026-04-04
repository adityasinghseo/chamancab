import { useState, useEffect, useRef } from "react";

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
      // strictly limit searches to UP
      const queryStr = text.toLowerCase().includes("uttar pradesh") 
        ? text 
        : `${text}, Uttar Pradesh`;
        
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr)}&countrycodes=in&limit=8`;
      const res = await fetch(url);
      let data = await res.json();
      
      data = data || [];
      
      // Filter out non-UP locations to be strict
      data = data.filter(place => place.display_name.includes("Uttar Pradesh"));

      // Inject custom unmapped BHEL Jagdishpur location if matched
      const lowerText = text.toLowerCase();
      if ("bhel jagdishpur".includes(lowerText) || lowerText.includes("bhel") || lowerText.includes("jagdishpur")) {
        const bhelCustom = {
          display_name: "BHEL Jagdishpur, Amethi, Uttar Pradesh, 227809, India",
          lat: "26.4561010",
          lon: "81.6198203"
        };
        // avoid duplicates if Jagdishpur is already there
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

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setShowDropdown(false);
    onSelect({
      name: place.display_name,
      lat: place.lat,
      lng: place.lon,
    });
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
      {showDropdown && (query.trim().length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-[#2a2410] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
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
