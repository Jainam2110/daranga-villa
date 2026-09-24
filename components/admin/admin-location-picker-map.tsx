"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Search,
  MapPin,
  Satellite,
  Map as MapIcon,
  Loader2,
  Check,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  ZoomIn,
  ZoomOut,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  loadGoogleMaps,
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsSearchUrl,
  reverseGeocodeCoordinates,
} from "@/lib/google-maps";

interface GeocodeResult {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  googleMapsUrl: string;
}

interface AdminLocationPickerMapProps {
  latitude: number;
  longitude: number;
  villaName: string;
  locationAddress?: string;
  googleMapsUrl?: string;
  placeId?: string;
  onChangeCoordinates: (lat: number, lng: number) => void;
  onSelectLocationDetails?: (details: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    placeId?: string;
    googleMapsUrl: string;
  }) => void;
}

type GoogleMapMode = "roadmap" | "satellite" | "hybrid" | "terrain";

export function AdminLocationPickerMap({
  latitude,
  longitude,
  villaName,
  locationAddress = "",
  googleMapsUrl = "",
  placeId = "",
  onChangeCoordinates,
  onSelectLocationDetails,
}: AdminLocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Google Maps JS API instances
  const googleMapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.Marker | null>(null);
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Mode & UI States
  const [isGoogleJsApiLoaded, setIsGoogleJsApiLoaded] = useState<boolean>(false);
  const [mapMode, setMapMode] = useState<GoogleMapMode>("roadmap");
  const [zoomLevel, setZoomLevel] = useState<number>(16);

  // Address & Place state
  const [currentAddress, setCurrentAddress] = useState<string>(locationAddress);
  const [currentPlaceId, setCurrentPlaceId] = useState<string>(placeId);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  // Search autocomplete & fallback state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isReversingGeocode, setIsReversingGeocode] = useState(false);

  // Link paste resolver
  const [pastedUrl, setPastedUrl] = useState("");
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);

  // Fine-tuning step size
  const [stepSize, setStepSize] = useState<number>(0.0005);

  const safeLat = typeof latitude === "number" && !isNaN(latitude) ? latitude : 24.5854;
  const safeLng = typeof longitude === "number" && !isNaN(longitude) ? longitude : 73.7125;

  // Keep callback ref updated
  const onChangeCoordinatesRef = useRef(onChangeCoordinates);
  useEffect(() => {
    onChangeCoordinatesRef.current = onChangeCoordinates;
  }, [onChangeCoordinates]);

  const onSelectDetailsRef = useRef(onSelectLocationDetails);
  useEffect(() => {
    onSelectDetailsRef.current = onSelectLocationDetails;
  }, [onSelectLocationDetails]);

  // Reverse geocode and update address
  const handleReverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReversingGeocode(true);
    try {
      const res = await reverseGeocodeCoordinates(lat, lng);
      if (res && res.address) {
        setCurrentAddress(res.address);
        if (res.placeId) {
          setCurrentPlaceId(res.placeId);
        }
        if (onSelectDetailsRef.current) {
          onSelectDetailsRef.current({
            name: villaName || "Villa Location",
            address: res.address,
            latitude: lat,
            longitude: lng,
            placeId: res.placeId || currentPlaceId,
            googleMapsUrl: buildGoogleMapsSearchUrl(lat, lng),
          });
        }
      }
    } catch {
      // Keep existing address
    } finally {
      setIsReversingGeocode(false);
    }
  }, [villaName, currentPlaceId]);

  // Update map marker position
  const updateMarkerAndMap = useCallback((lat: number, lng: number, shouldPan = true) => {
    if (markerInstanceRef.current) {
      markerInstanceRef.current.setPosition({ lat, lng });
    }
    if (shouldPan && googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo({ lat, lng });
    }
  }, []);

  // 1. Initialize Official Google Maps JavaScript API if available
  useEffect(() => {
    let isMounted = true;

    async function initGoogleMaps() {
      if (!mapContainerRef.current) return;

      const googleObj = await loadGoogleMaps();
      if (!googleObj || !isMounted || !mapContainerRef.current) {
        return;
      }

      setIsGoogleJsApiLoaded(true);

      const initialCenter = { lat: safeLat, lng: safeLng };

      const map = new googleObj.maps.Map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoomLevel,
        mapTypeId: mapMode,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: false,
      });

      googleMapInstanceRef.current = map;

      // Google Red Pin Marker
      const marker = new googleObj.maps.Marker({
        position: initialCenter,
        map: map,
        draggable: true,
        title: villaName || "Daranga Villa Location",
        animation: googleObj.maps.Animation.DROP,
      });

      markerInstanceRef.current = marker;

      // Marker Drag Event
      marker.addListener("dragend", async () => {
        const pos = marker.getPosition();
        if (!pos) return;
        const newLat = Number(pos.lat().toFixed(6));
        const newLng = Number(pos.lng().toFixed(6));

        onChangeCoordinatesRef.current(newLat, newLng);
        setIsConfirmed(false);
        setStatusMessage(`📍 Red pointer dragged to: ${newLat}, ${newLng}`);
        setTimeout(() => setStatusMessage(null), 3000);

        await handleReverseGeocode(newLat, newLng);
      });

      // Map Click Event
      map.addListener("click", async (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const newLat = Number(e.latLng.lat().toFixed(6));
        const newLng = Number(e.latLng.lng().toFixed(6));

        marker.setPosition({ lat: newLat, lng: newLng });
        onChangeCoordinatesRef.current(newLat, newLng);
        setIsConfirmed(false);
        setStatusMessage(`📍 Red pointer placed at: ${newLat}, ${newLng}`);
        setTimeout(() => setStatusMessage(null), 3000);

        await handleReverseGeocode(newLat, newLng);
      });

      // Attach Places Autocomplete to Search Input if input exists
      if (searchInputRef.current && googleObj.maps.places) {
        const autocomplete = new googleObj.maps.places.Autocomplete(searchInputRef.current, {
          fields: ["place_id", "geometry", "name", "formatted_address"],
          componentRestrictions: { country: "in" },
        });

        autocomplete.bindTo("bounds", map);

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) {
            return;
          }

          const newLat = Number(place.geometry.location.lat().toFixed(6));
          const newLng = Number(place.geometry.location.lng().toFixed(6));
          const newAddress = place.formatted_address || place.name || "";
          const newPlaceId = place.place_id || "";

          map.panTo({ lat: newLat, lng: newLng });
          map.setZoom(17);
          marker.setPosition({ lat: newLat, lng: newLng });

          setCurrentAddress(newAddress);
          setCurrentPlaceId(newPlaceId);
          setIsConfirmed(false);
          onChangeCoordinatesRef.current(newLat, newLng);

          if (onSelectDetailsRef.current) {
            onSelectDetailsRef.current({
              name: place.name || villaName || "Villa Location",
              address: newAddress,
              latitude: newLat,
              longitude: newLng,
              placeId: newPlaceId,
              googleMapsUrl: buildGoogleMapsSearchUrl(newLat, newLng),
            });
          }

          setStatusMessage(`📍 Selected: ${place.name || newAddress}`);
          setTimeout(() => setStatusMessage(null), 4000);
        });

        autocompleteInstanceRef.current = autocomplete;
      }
    }

    initGoogleMaps();

    return () => {
      isMounted = false;
    };
  }, [safeLat, safeLng, zoomLevel, mapMode, villaName, handleReverseGeocode]);

  // Sync coordinates to Google Maps JS instance when coordinates change externally
  useEffect(() => {
    if (isGoogleJsApiLoaded && googleMapInstanceRef.current && markerInstanceRef.current) {
      const currentPos = markerInstanceRef.current.getPosition();
      if (!currentPos || currentPos.lat() !== safeLat || currentPos.lng() !== safeLng) {
        updateMarkerAndMap(safeLat, safeLng, true);
      }
    }
  }, [safeLat, safeLng, isGoogleJsApiLoaded, updateMarkerAndMap]);

  // Sync Map Mode
  const handleToggleMapMode = (mode: GoogleMapMode) => {
    setMapMode(mode);
    if (googleMapInstanceRef.current) {
      googleMapInstanceRef.current.setMapTypeId(mode);
    }
  };

  // Sync Zoom
  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.max(12, Math.min(19, newZoom));
    setZoomLevel(clamped);
    if (googleMapInstanceRef.current) {
      googleMapInstanceRef.current.setZoom(clamped);
    }
  };

  // 2. Search Places Fallback (when Places Autocomplete is not active)
  const handleSearchPlaces = async (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q || q.length < 2) return;

    setIsSearching(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/admin/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setSearchResults(data.results);
        setShowDropdown(data.results.length > 0);
        if (data.results.length === 0) {
          setStatusMessage("No exact matches found. Try searching a landmark or locality.");
          setTimeout(() => setStatusMessage(null), 4000);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch {
      setStatusMessage("Failed to search places. Please try again.");
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setIsSearching(false);
    }
  };

  // 3. Select Place from Autocomplete Dropdown
  const handleSelectSearchResult = (item: GeocodeResult) => {
    setShowDropdown(false);
    setSearchQuery(item.name);
    setCurrentAddress(item.displayName);
    if (item.placeId) setCurrentPlaceId(item.placeId);

    onChangeCoordinates(item.latitude, item.longitude);
    updateMarkerAndMap(item.latitude, item.longitude);
    setIsConfirmed(false);

    if (onSelectLocationDetails) {
      onSelectLocationDetails({
        name: item.name,
        address: item.displayName,
        latitude: item.latitude,
        longitude: item.longitude,
        placeId: item.placeId || "",
        googleMapsUrl: item.googleMapsUrl,
      });
    }

    setStatusMessage(`📍 Red pointer placed at ${item.name}`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // 4. Resolve Pasted Google Maps URL or Raw Coordinates
  const handleResolvePastedLink = async () => {
    const raw = pastedUrl.trim();
    if (!raw) return;

    setIsResolvingUrl(true);
    setStatusMessage(null);

    try {
      // Check if user entered raw coordinates: e.g. "24.5854, 73.6780"
      const coordMatch = raw.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
      if (coordMatch) {
        const newLat = parseFloat(coordMatch[1]);
        const newLng = parseFloat(coordMatch[2]);
        if (!isNaN(newLat) && !isNaN(newLng)) {
          onChangeCoordinates(newLat, newLng);
          updateMarkerAndMap(newLat, newLng);
          setStatusMessage(`📍 Set coordinates: ${newLat}, ${newLng}`);
          setPastedUrl("");
          setIsConfirmed(false);
          await handleReverseGeocode(newLat, newLng);
          setIsResolvingUrl(false);
          return;
        }
      }

      // Resolve via server API
      const res = await fetch("/api/admin/resolve-maps-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: raw }),
      });

      const data = await res.json();
      if (data.success && data.latitude && data.longitude) {
        onChangeCoordinates(data.latitude, data.longitude);
        updateMarkerAndMap(data.latitude, data.longitude);
        setIsConfirmed(false);
        await handleReverseGeocode(data.latitude, data.longitude);
        setStatusMessage(`📍 Red pointer placed: ${data.latitude}, ${data.longitude}`);
        setPastedUrl("");
      } else {
        setStatusMessage(data.error || "Could not extract coordinates from link.");
      }
    } catch {
      setStatusMessage("Failed to resolve link. Please try again.");
    } finally {
      setIsResolvingUrl(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // 5. Fine-Tune Nudge Pin Position
  const nudgeCoordinates = async (deltaLat: number, deltaLng: number) => {
    const newLat = Number((safeLat + deltaLat).toFixed(6));
    const newLng = Number((safeLng + deltaLng).toFixed(6));
    onChangeCoordinates(newLat, newLng);
    updateMarkerAndMap(newLat, newLng, false);
    setIsConfirmed(false);
    setStatusMessage(`📍 Adjusted to: ${newLat}, ${newLng}`);
    setTimeout(() => setStatusMessage(null), 2000);
  };

  // 6. Confirm Location Action
  const handleConfirmLocation = () => {
    setIsConfirmed(true);
    if (onSelectLocationDetails) {
      onSelectLocationDetails({
        name: villaName || "Villa Location",
        address: currentAddress || `${safeLat.toFixed(6)}, ${safeLng.toFixed(6)}`,
        latitude: safeLat,
        longitude: safeLng,
        placeId: currentPlaceId,
        googleMapsUrl: buildGoogleMapsSearchUrl(safeLat, safeLng),
      });
    }
    setStatusMessage("✅ Location confirmed & verified as canonical source of truth!");
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Google Maps embed URL for iframe fallback
  const tCode = mapMode === "satellite" ? "k" : mapMode === "terrain" ? "p" : "m";
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${safeLat},${safeLng}&hl=en&z=${zoomLevel}&t=${tCode}&output=embed`;

  const directionsUrl = buildGoogleMapsDirectionsUrl(safeLat, safeLng);
  const directMapsUrl =
    googleMapsUrl && googleMapsUrl.trim()
      ? googleMapsUrl.trim()
      : buildGoogleMapsSearchUrl(safeLat, safeLng);

  return (
    <div className="space-y-4 rounded-xl p-4 sm:p-5 bg-[#F5F2EC]/80 dark:bg-[#1C1A17]/80 border border-[#DDD5C7] dark:border-[#302D28] shadow-sm">
      {/* 1. Places Search Bar */}
      <div className="space-y-2 relative">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#171513] dark:text-[#F4EFE5] flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#C89B4A]" />
            <span>Search Villa Location</span>
          </label>
          <span className="text-[10px] text-[#6E685F] dark:text-[#A9A39A]">
            Google Places Autocomplete
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length >= 3) {
                  handleSearchPlaces(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchPlaces();
                }
              }}
              placeholder="Search villa location (e.g. Black Rose Villa, Sisarma, Rani Road, Fatehsagar Lake...)"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A] shadow-xs"
            />
            <Search className="w-4 h-4 text-[#6E685F] dark:text-[#A9A39A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            disabled={isSearching || !searchQuery.trim()}
            onClick={() => handleSearchPlaces()}
            className="px-4 py-2.5 rounded-lg bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-xs"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>

        {/* Autocomplete Dropdown Fallback */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-[#DDD5C7]/50 dark:divide-[#302D28]">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#F5F2EC] dark:hover:bg-[#1C1A17] transition-colors flex items-start gap-2.5 group"
              >
                <MapPin className="w-4 h-4 text-[#EA4335] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#171513] dark:text-[#F4EFE5] group-hover:text-[#A8792E] dark:group-hover:text-[#C89B4A]">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-[#6E685F] dark:text-[#A9A39A] truncate mt-0.5">
                    {item.displayName}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Interactive Google Map Container */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-[#171513] dark:text-[#F4EFE5] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335] inline-block shadow-xs animate-pulse" />
            <span>
              Interactive Google Map: {safeLat.toFixed(6)}, {safeLng.toFixed(6)}
            </span>
          </span>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5 bg-white dark:bg-[#151412] p-0.5 rounded-lg border border-[#DDD5C7] dark:border-[#302D28]">
              <button
                type="button"
                onClick={() => handleZoomChange(zoomLevel + 1)}
                title="Zoom In"
                className="p-1 rounded text-[#6E685F] dark:text-[#A9A39A] hover:text-[#C89B4A] hover:bg-[#F5F2EC] dark:hover:bg-[#1C1A17]"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[10px] font-mono text-[#6E685F] dark:text-[#A9A39A]">
                z{zoomLevel}
              </span>
              <button
                type="button"
                onClick={() => handleZoomChange(zoomLevel - 1)}
                title="Zoom Out"
                className="p-1 rounded text-[#6E685F] dark:text-[#A9A39A] hover:text-[#C89B4A] hover:bg-[#F5F2EC] dark:hover:bg-[#1C1A17]"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-0.5 bg-white dark:bg-[#151412] rounded-lg border border-[#DDD5C7] dark:border-[#302D28]">
              <button
                type="button"
                onClick={() => handleToggleMapMode("roadmap")}
                className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                  mapMode === "roadmap"
                    ? "bg-[#C89B4A] text-[#0B0B0A] shadow-xs"
                    : "text-[#6E685F] dark:text-[#A9A39A]"
                }`}
              >
                <MapIcon className="w-3 h-3" />
                <span>Map</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleMapMode("satellite")}
                className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                  mapMode === "satellite"
                    ? "bg-[#C89B4A] text-[#0B0B0A] shadow-xs"
                    : "text-[#6E685F] dark:text-[#A9A39A]"
                }`}
              >
                <Satellite className="w-3 h-3" />
                <span>Satellite</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-[#DDD5C7] dark:border-[#302D28] shadow-inner bg-[#12110F]">
          {/* Official Google Maps JS Canvas */}
          <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />

          {/* Iframe fallback if JS API key is not configured */}
          {!isGoogleJsApiLoaded && (
            <iframe
              key={`${safeLat}-${safeLng}-${zoomLevel}-${mapMode}`}
              title="Google Maps Location Embed"
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "100%", filter: "contrast(1.02) saturate(1.05)" }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full absolute inset-0 z-0"
            />
          )}

          {/* Top Quick Links */}
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Test Navigation Directions"
              className="px-2.5 py-1 rounded-md bg-[#0B0B0A]/90 hover:bg-[#C89B4A] text-white hover:text-black text-[10px] font-bold flex items-center gap-1 backdrop-blur-md border border-white/20 transition-all shadow-md"
            >
              <Navigation className="w-3 h-3 text-[#C89B4A] group-hover:text-black" />
              <span>Directions</span>
            </a>
            <a
              href={directMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open full view in Google Maps"
              className="px-2.5 py-1 rounded-md bg-[#0B0B0A]/90 hover:bg-[#C89B4A] text-white hover:text-black text-[10px] font-bold flex items-center gap-1 backdrop-blur-md border border-white/20 transition-all shadow-md"
            >
              <span>View Map</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Map Bottom Hint Banner */}
          <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none text-center">
            <span className="px-3 py-1 rounded-full bg-[#0B0B0A]/90 backdrop-blur-md text-white text-[10px] font-medium border border-white/10 shadow-md inline-flex items-center gap-1.5">
              <span>🎯</span>
              <span>Search for the villa, then drag the pin to the exact property location if needed.</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Selected Location Details Card & Confirmation */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-[#DDD5C7]/50 dark:border-[#302D28] pb-2">
          <h5 className="font-bold text-xs uppercase tracking-wider text-[#171513] dark:text-[#F4EFE5] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#EA4335]" />
            <span>📍 Selected Location</span>
          </h5>

          {isConfirmed ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Location Verified</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Unconfirmed Changes</span>
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#6E685F] dark:text-[#A9A39A] block mb-0.5">
              Formatted Address:
            </span>
            <div className="font-medium text-[#171513] dark:text-[#F4EFE5] bg-[#F5F2EC] dark:bg-[#1C1A17] px-3 py-2 rounded-lg border border-[#DDD5C7]/60 dark:border-[#302D28] flex items-center justify-between gap-2">
              <span className="truncate">{currentAddress || "No address selected yet"}</span>
              {isReversingGeocode && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C89B4A] flex-shrink-0" />}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#6E685F] dark:text-[#A9A39A] block mb-0.5">
                Exact Latitude:
              </span>
              <div className="font-mono font-semibold text-[#171513] dark:text-[#F4EFE5] bg-[#F5F2EC] dark:bg-[#1C1A17] px-3 py-2 rounded-lg border border-[#DDD5C7]/60 dark:border-[#302D28]">
                {safeLat.toFixed(6)}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-[#6E685F] dark:text-[#A9A39A] block mb-0.5">
                Exact Longitude:
              </span>
              <div className="font-mono font-semibold text-[#171513] dark:text-[#F4EFE5] bg-[#F5F2EC] dark:bg-[#1C1A17] px-3 py-2 rounded-lg border border-[#DDD5C7]/60 dark:border-[#302D28]">
                {safeLng.toFixed(6)}
              </div>
            </div>
          </div>

          {currentPlaceId && (
            <div className="text-[10px] text-[#6E685F] dark:text-[#A9A39A] font-mono truncate">
              Google Place ID: {currentPlaceId}
            </div>
          )}
        </div>

        {/* Confirm Location Button */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={handleConfirmLocation}
            className="flex-1 py-2.5 px-4 rounded-lg bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Location</span>
          </button>
        </div>
      </div>

      {/* 4. Fine-Tuning D-Pad, Steppers & Paste Input */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#171513] dark:text-[#F4EFE5] flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#C89B4A]" />
            <span>Fine-Tune Pin or Paste Coordinates</span>
          </span>

          {/* Step Size Selector */}
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-[#6E685F] dark:text-[#A9A39A]">Step:</span>
            {[
              { label: "10m", val: 0.0001 },
              { label: "50m", val: 0.0005 },
              { label: "200m", val: 0.002 },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setStepSize(s.val)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  stepSize === s.val
                    ? "bg-[#C89B4A] text-[#0B0B0A] font-bold"
                    : "bg-[#F5F2EC] dark:bg-[#1C1A17] text-[#6E685F] dark:text-[#A9A39A]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Direct Coordinate Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold uppercase text-[#6E685F] dark:text-[#A9A39A] mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={safeLat}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    onChangeCoordinates(val, safeLng);
                    updateMarkerAndMap(val, safeLng, false);
                    setIsConfirmed(false);
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#A8792E]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase text-[#6E685F] dark:text-[#A9A39A] mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={safeLng}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    onChangeCoordinates(safeLat, val);
                    updateMarkerAndMap(safeLat, val, false);
                    setIsConfirmed(false);
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#A8792E]"
              />
            </div>
          </div>

          {/* D-Pad Buttons */}
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-semibold text-[#6E685F] dark:text-[#A9A39A] mr-2">
              Nudge Pin:
            </span>
            <button
              type="button"
              onClick={() => nudgeCoordinates(0, -stepSize)}
              title="Move West"
              className="p-1.5 rounded-md bg-[#F5F2EC] dark:bg-[#1C1A17] hover:bg-[#C89B4A] hover:text-[#0B0B0A] text-[#171513] dark:text-[#F4EFE5] border border-[#DDD5C7] dark:border-[#302D28] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => nudgeCoordinates(stepSize, 0)}
                title="Move North"
                className="p-1.5 rounded-md bg-[#F5F2EC] dark:bg-[#1C1A17] hover:bg-[#C89B4A] hover:text-[#0B0B0A] text-[#171513] dark:text-[#F4EFE5] border border-[#DDD5C7] dark:border-[#302D28] transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => nudgeCoordinates(-stepSize, 0)}
                title="Move South"
                className="p-1.5 rounded-md bg-[#F5F2EC] dark:bg-[#1C1A17] hover:bg-[#C89B4A] hover:text-[#0B0B0A] text-[#171513] dark:text-[#F4EFE5] border border-[#DDD5C7] dark:border-[#302D28] transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => nudgeCoordinates(0, stepSize)}
              title="Move East"
              className="p-1.5 rounded-md bg-[#F5F2EC] dark:bg-[#1C1A17] hover:bg-[#C89B4A] hover:text-[#0B0B0A] text-[#171513] dark:text-[#F4EFE5] border border-[#DDD5C7] dark:border-[#302D28] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* URL Paste */}
        <div className="pt-2 border-t border-[#DDD5C7]/40 dark:border-[#302D28]/40 flex gap-2">
          <input
            type="text"
            value={pastedUrl}
            onChange={(e) => setPastedUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleResolvePastedLink();
              }
            }}
            placeholder="Paste Google Maps URL (maps.app.goo.gl / google.com/maps) or 24.5854, 73.6780"
            className="flex-1 px-3 py-1.5 rounded-md bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8792E]"
          />
          <button
            type="button"
            disabled={isResolvingUrl || !pastedUrl.trim()}
            onClick={handleResolvePastedLink}
            className="px-3 py-1.5 rounded-md bg-[#171513] dark:bg-[#2A2723] hover:bg-[#C89B4A] hover:text-[#0B0B0A] text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {isResolvingUrl ? <Loader2 className="w-3 h-3 animate-spin" /> : <LinkIcon className="w-3 h-3" />}
            <span>Set Pin</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-md animate-in fade-in flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
