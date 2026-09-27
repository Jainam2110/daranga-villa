"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Search,
  MapPin,
  Satellite,
  Map as MapIcon,
  Loader2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Navigation,
  Link as LinkIcon,
  CheckCircle2,
  X,
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
  locationAddress: string;
  zone: string;
  googleMapsUrl: string;
  placeId?: string;
  onChangeCoordinates: (lat: number, lng: number) => void;
  onAddressChange: (address: string) => void;
  onZoneChange: (zone: string) => void;
  onGoogleMapsUrlChange: (url: string) => void;
}

type GoogleMapMode = "roadmap" | "satellite";

export function AdminLocationPickerMap({
  latitude,
  longitude,
  villaName,
  locationAddress,
  zone,
  googleMapsUrl,
  onChangeCoordinates,
  onAddressChange,
  onZoneChange,
  onGoogleMapsUrlChange,
}: AdminLocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Google Maps JS API instances
  const googleMapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.Marker | null>(null);
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null);

  // UI States
  const [isGoogleJsApiLoaded, setIsGoogleJsApiLoaded] = useState<boolean>(false);
  const [mapMode, setMapMode] = useState<GoogleMapMode>("roadmap");
  const [zoomLevel, setZoomLevel] = useState<number>(16);

  // Search & Geocode States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isReversingGeocode, setIsReversingGeocode] = useState(false);

  // Link paste resolver
  const [pastedUrl, setPastedUrl] = useState("");
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);

  const safeLat = typeof latitude === "number" && !isNaN(latitude) ? latitude : 24.5854;
  const safeLng = typeof longitude === "number" && !isNaN(longitude) ? longitude : 73.7125;

  // Keep callback refs updated to prevent stale closures
  const onChangeCoordinatesRef = useRef(onChangeCoordinates);
  useEffect(() => {
    onChangeCoordinatesRef.current = onChangeCoordinates;
  }, [onChangeCoordinates]);

  const onAddressChangeRef = useRef(onAddressChange);
  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
  }, [onAddressChange]);

  const onZoneChangeRef = useRef(onZoneChange);
  useEffect(() => {
    onZoneChangeRef.current = onZoneChange;
  }, [onZoneChange]);

  const onGoogleMapsUrlChangeRef = useRef(onGoogleMapsUrlChange);
  useEffect(() => {
    onGoogleMapsUrlChangeRef.current = onGoogleMapsUrlChange;
  }, [onGoogleMapsUrlChange]);

  // Reverse geocode and update address
  const handleReverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReversingGeocode(true);
    try {
      const res = await reverseGeocodeCoordinates(lat, lng);
      if (res && res.address) {
        onAddressChangeRef.current(res.address);
        const autoMapUrl = buildGoogleMapsSearchUrl(lat, lng);
        onGoogleMapsUrlChangeRef.current(autoMapUrl);
      }
    } catch {
      // Keep existing address
    } finally {
      setIsReversingGeocode(false);
    }
  }, []);

  // Update map marker position
  const updateMarkerAndMap = useCallback((lat: number, lng: number, shouldPan = true) => {
    if (markerInstanceRef.current) {
      markerInstanceRef.current.setPosition({ lat, lng });
    }
    if (shouldPan && googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo({ lat, lng });
    }
  }, []);

  // Initialize Official Google Maps JavaScript API
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
        title: villaName || "Villa Location",
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
        onGoogleMapsUrlChangeRef.current(buildGoogleMapsSearchUrl(newLat, newLng));
        setStatusMessage(`📍 Pin moved to: ${newLat}, ${newLng}`);
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
        onGoogleMapsUrlChangeRef.current(buildGoogleMapsSearchUrl(newLat, newLng));
        setStatusMessage(`📍 Pin placed at: ${newLat}, ${newLng}`);
        setTimeout(() => setStatusMessage(null), 3000);

        await handleReverseGeocode(newLat, newLng);
      });

      // Attach Places Autocomplete to Search Input if available
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

          map.panTo({ lat: newLat, lng: newLng });
          map.setZoom(17);
          marker.setPosition({ lat: newLat, lng: newLng });

          onChangeCoordinatesRef.current(newLat, newLng);
          if (newAddress) onAddressChangeRef.current(newAddress);
          if (place.name) onZoneChangeRef.current(place.name);
          onGoogleMapsUrlChangeRef.current(buildGoogleMapsSearchUrl(newLat, newLng));

          setStatusMessage(`📍 Location selected: ${place.name || newAddress}`);
          setTimeout(() => setStatusMessage(null), 3500);
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

  // Search Places Fallback
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
          setStatusMessage("No exact matches found. Try searching a landmark or area.");
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

  // Select Place from Autocomplete Dropdown
  const handleSelectSearchResult = (item: GeocodeResult) => {
    setShowDropdown(false);
    setSearchQuery(item.name);

    onChangeCoordinates(item.latitude, item.longitude);
    onAddressChange(item.displayName);
    if (item.name) onZoneChange(item.name);
    onGoogleMapsUrlChange(item.googleMapsUrl);

    updateMarkerAndMap(item.latitude, item.longitude);

    setStatusMessage(`📍 Location set to ${item.name}`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Resolve Pasted Google Maps URL or Raw Coordinates
  const handleResolvePastedLink = async () => {
    const raw = pastedUrl.trim();
    if (!raw) return;

    setIsResolvingUrl(true);
    setStatusMessage(null);

    try {
      // 1. Check for raw coordinates e.g. "24.5854, 73.6780"
      const coordMatch = raw.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
      if (coordMatch) {
        const newLat = parseFloat(coordMatch[1]);
        const newLng = parseFloat(coordMatch[2]);
        if (!isNaN(newLat) && !isNaN(newLng)) {
          onChangeCoordinates(newLat, newLng);
          onGoogleMapsUrlChange(buildGoogleMapsSearchUrl(newLat, newLng));
          updateMarkerAndMap(newLat, newLng);
          setPastedUrl("");
          await handleReverseGeocode(newLat, newLng);
          setStatusMessage(`📍 GPS coordinates applied: ${newLat}, ${newLng}`);
          setIsResolvingUrl(false);
          return;
        }
      }

      // 2. Resolve via server API
      const res = await fetch("/api/admin/resolve-maps-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: raw }),
      });

      const data = await res.json();
      if (data.success && data.latitude && data.longitude) {
        onChangeCoordinates(data.latitude, data.longitude);
        onGoogleMapsUrlChange(data.resolvedUrl || raw);
        updateMarkerAndMap(data.latitude, data.longitude);
        await handleReverseGeocode(data.latitude, data.longitude);
        setStatusMessage(`📍 Coordinates extracted: ${data.latitude}, ${data.longitude}`);
        setPastedUrl("");
      } else {
        setStatusMessage(data.error || "Could not extract GPS coordinates from this link.");
      }
    } catch {
      setStatusMessage("Failed to resolve link. Please check the URL.");
    } finally {
      setIsResolvingUrl(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Google Maps embed URL for iframe fallback
  const tCode = mapMode === "satellite" ? "k" : "m";
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${safeLat},${safeLng}&hl=en&z=${zoomLevel}&t=${tCode}&output=embed`;

  const directionsUrl = buildGoogleMapsDirectionsUrl(safeLat, safeLng);
  const directMapsUrl =
    googleMapsUrl && googleMapsUrl.trim()
      ? googleMapsUrl.trim()
      : buildGoogleMapsSearchUrl(safeLat, safeLng);

  return (
    <div className="space-y-4 rounded-xl p-4 sm:p-5 bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383633] shadow-xs text-[#202020] dark:text-[#FCFBF8]">
      
      {/* 1. Places Search Bar */}
      <div className="space-y-1.5 relative">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#EFA1AA]" />
            <span>Search Location or Landmark</span>
          </label>
          <span className="text-[10px] text-[#66635F] dark:text-[#BDB8B0]">
            Search by area, hotel, lake or street
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
              placeholder="e.g. Sisarma, Rani Road, Lake Pichola, Fatehsagar Lake..."
              className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#202020] dark:focus:border-[#EFA1AA]"
            />
            <Search className="w-4 h-4 text-[#66635F] dark:text-[#BDB8B0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowDropdown(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            disabled={isSearching || !searchQuery.trim()}
            onClick={() => handleSearchPlaces()}
            className="px-4 py-2.5 rounded-lg bg-[#202020] hover:bg-[#171717] text-white dark:bg-[#FCFBF8] dark:text-[#202020] dark:hover:bg-white font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer shadow-xs"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#1E1E1E] border border-[#E8E8E8] dark:border-[#383633] rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-[#E8E8E8]/50 dark:divide-[#383633]">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#F7F6F3] dark:hover:bg-[#171717] transition-colors flex items-start gap-2.5 group cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#EFA1AA] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] group-hover:text-[#EFA1AA]">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-[#66635F] dark:text-[#BDB8B0] truncate mt-0.5">
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
          <span className="font-semibold text-[#202020] dark:text-[#FCFBF8] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EFA1AA] inline-block shadow-xs animate-pulse" />
            <span>
              Map Location: {safeLat.toFixed(6)}, {safeLng.toFixed(6)}
            </span>
          </span>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5 bg-[#F7F6F3] dark:bg-[#171717] p-0.5 rounded-lg border border-[#E8E8E8] dark:border-[#383633]">
              <button
                type="button"
                onClick={() => handleZoomChange(zoomLevel + 1)}
                title="Zoom In"
                className="p-1 rounded text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-white cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[10px] font-mono text-[#66635F] dark:text-[#BDB8B0]">
                z{zoomLevel}
              </span>
              <button
                type="button"
                onClick={() => handleZoomChange(zoomLevel - 1)}
                title="Zoom Out"
                className="p-1 rounded text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-white cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-0.5 bg-[#F7F6F3] dark:bg-[#171717] rounded-lg border border-[#E8E8E8] dark:border-[#383633]">
              <button
                type="button"
                onClick={() => handleToggleMapMode("roadmap")}
                className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  mapMode === "roadmap"
                    ? "bg-[#202020] text-white dark:bg-[#FCFBF8] dark:text-[#202020] shadow-xs"
                    : "text-[#66635F] dark:text-[#BDB8B0]"
                }`}
              >
                <MapIcon className="w-3 h-3" />
                <span>Map</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleMapMode("satellite")}
                className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  mapMode === "satellite"
                    ? "bg-[#202020] text-white dark:bg-[#FCFBF8] dark:text-[#202020] shadow-xs"
                    : "text-[#66635F] dark:text-[#BDB8B0]"
                }`}
              >
                <Satellite className="w-3 h-3" />
                <span>Satellite</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-[#E8E8E8] dark:border-[#383633] shadow-xs bg-[#202020]">
          {/* Official Google Maps JS Canvas */}
          <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />

          {/* Iframe fallback */}
          {!isGoogleJsApiLoaded && (
            <iframe
              key={`${safeLat}-${safeLng}-${zoomLevel}-${mapMode}`}
              title="Google Maps Location"
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "100%" }}
              allowFullScreen={true}
              loading="lazy"
              className="w-full h-full absolute inset-0 z-0"
            />
          )}

          {/* Top Quick Links */}
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Preview Directions"
              className="px-2.5 py-1 rounded-md bg-[#202020]/90 hover:bg-[#171717] text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md border border-white/20 transition-all shadow-sm"
            >
              <Navigation className="w-3 h-3 text-[#EFA1AA]" />
              <span>Directions</span>
            </a>
            <a
              href={directMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open full view in Google Maps"
              className="px-2.5 py-1 rounded-md bg-[#202020]/90 hover:bg-[#171717] text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md border border-white/20 transition-all shadow-sm"
            >
              <span>View Map</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Map Bottom Helper */}
          <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none text-center">
            <span className="px-3 py-1 rounded-full bg-[#202020]/90 backdrop-blur-md text-white text-[10px] font-medium border border-white/10 shadow-sm inline-flex items-center gap-1.5">
              <span>💡 Click map or drag red pin to set exact property spot</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Paste Google Maps Link or Coordinates */}
      <div className="p-3.5 rounded-xl bg-[#F7F6F3] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383633] space-y-2">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#202020] dark:text-[#FCFBF8] flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5 text-[#EFA1AA]" />
          <span>Quick Paste: Google Maps Share Link or GPS Coordinates</span>
        </label>
        <div className="flex gap-2">
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
            placeholder="Paste URL (e.g. https://maps.app.goo.gl/... or 24.5854, 73.6780)"
            className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-[#202020] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#202020] dark:focus:border-[#EFA1AA]"
          />
          <button
            type="button"
            disabled={isResolvingUrl || !pastedUrl.trim()}
            onClick={handleResolvePastedLink}
            className="px-3.5 py-2 rounded-lg bg-[#202020] hover:bg-[#171717] text-white dark:bg-[#FCFBF8] dark:text-[#202020] dark:hover:bg-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isResolvingUrl ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <span>Sync Map</span>
            )}
          </button>
        </div>
      </div>

      {/* 4. Structured Location Fields */}
      <div className="space-y-3 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
              Zone / Area Name *
            </label>
            <input
              type="text"
              required
              value={zone}
              onChange={(e) => onZoneChange(e.target.value)}
              placeholder="e.g. Lake Pichola Waterfront, Rani Road"
              className="w-full px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#202020] dark:focus:border-[#EFA1AA]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0]">
                Full Address / Street Location
              </label>
              {isReversingGeocode && (
                <span className="text-[10px] text-[#EFA1AA] flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Fetching address...</span>
                </span>
              )}
            </div>
            <input
              type="text"
              value={locationAddress}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="e.g. Haridas Ji Ki Magri, Pichola West Bank, Udaipur"
              className="w-full px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#202020] dark:focus:border-[#EFA1AA]"
            />
          </div>
        </div>

        {/* GPS Coordinates & Google Maps Share Link */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
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
                  onGoogleMapsUrlChange(buildGoogleMapsSearchUrl(val, safeLng));
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs font-mono text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#202020] dark:focus:border-[#EFA1AA]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
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
                  onGoogleMapsUrlChange(buildGoogleMapsSearchUrl(safeLat, val));
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs font-mono text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#202020] dark:focus:border-[#EFA1AA]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
              Google Maps URL
            </label>
            <input
              type="text"
              value={googleMapsUrl}
              onChange={(e) => onGoogleMapsUrlChange(e.target.value)}
              placeholder="Auto-generated or custom Google Maps link"
              className="w-full px-3 py-2 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs font-mono text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#202020] dark:focus:border-[#EFA1AA] truncate"
            />
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="text-[11px] font-medium text-[#3F7658] dark:text-[#4ADE80] bg-[#3F7658]/10 dark:bg-[#3F7658]/20 border border-[#3F7658]/30 px-3 py-2 rounded-lg animate-in fade-in flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
