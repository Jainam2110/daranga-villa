"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Search,
  MapPin,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Crosshair,
} from "lucide-react";
import {
  loadGoogleMapsLibraries,
  reverseGeocodeCoordinates,
} from "@/lib/google-maps";

export interface LocationValue {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

interface VillaLocationPickerProps {
  value?: LocationValue | string | null;
  onChange: (location: LocationValue | null) => void;
  villaName?: string;
  error?: string;
}

type MapMarkerInstance = {
  setMap?: (map: google.maps.Map | null) => void;
  setPosition?: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
  getPosition?: () => google.maps.LatLng | null | undefined;
  map?: google.maps.Map | null;
  position?: google.maps.LatLng | google.maps.LatLngLiteral | null;
  addListener?: (eventName: string, handler: (...args: unknown[]) => void) => google.maps.MapsEventListener;
} | null;

// Default regional center for UX view when no location is set (e.g. Igatpuri, Maharashtra)
// IMPORTANT: This default center is NEVER saved automatically.
const DEFAULT_MAP_CENTER = { lat: 19.6950, lng: 73.5620 };

export function VillaLocationPicker({
  value,
  onChange,
  villaName = "",
  error,
}: VillaLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Google Maps references
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<MapMarkerInstance>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Helper to extract location object from value
  const parseLocationValue = (
    val?: LocationValue | string | null
  ): LocationValue | null => {
    if (
      typeof val === "object" &&
      val !== null &&
      typeof val.latitude === "number" &&
      typeof val.longitude === "number" &&
      !isNaN(val.latitude) &&
      !isNaN(val.longitude) &&
      val.latitude >= -90 &&
      val.latitude <= 90 &&
      val.longitude >= -180 &&
      val.longitude <= 180 &&
      !(val.latitude === 0 && val.longitude === 0)
    ) {
      return {
        address: val.address || "",
        latitude: val.latitude,
        longitude: val.longitude,
        placeId: val.placeId || "",
      };
    }
    return null;
  };

  const initialLocation = parseLocationValue(value);
  const initialAddressText =
    initialLocation?.address || (typeof value === "string" ? value : "");

  // Local state
  const [selectedLocation, setSelectedLocation] = useState<LocationValue | null>(
    initialLocation
  );
  const [searchQuery, setSearchQuery] = useState(initialAddressText);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Keep latest onChange ref to avoid stale closures
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Adjust state during render when value prop changes
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    const parsed = parseLocationValue(value);
    if (parsed) {
      setSelectedLocation(parsed);
      if (parsed.address) setSearchQuery(parsed.address);
    } else if (typeof value === "string" && value.trim()) {
      setSearchQuery(value);
    } else if (!value) {
      setSelectedLocation(null);
    }
  }

  // Notify parent of location changes
  const updateLocationState = useCallback(
    (newLoc: LocationValue | null) => {
      setSelectedLocation(newLoc);
      onChangeRef.current(newLoc);
    },
    []
  );

  // Perform reverse geocoding for clicked or dragged coordinates
  const handleReverseGeocode = useCallback(
    async (lat: number, lng: number, placeId?: string) => {
      setIsGeocoding(true);
      try {
        const res = await reverseGeocodeCoordinates(lat, lng);
        const resolvedAddress = res?.address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        const resolvedPlaceId = placeId || res?.placeId || "";

        const newLoc: LocationValue = {
          address: resolvedAddress,
          latitude: lat,
          longitude: lng,
          placeId: resolvedPlaceId,
        };

        setSearchQuery(resolvedAddress);
        updateLocationState(newLoc);
        setStatusMessage(`📍 Location set: ${resolvedAddress}`);
        setTimeout(() => setStatusMessage(null), 3500);
      } catch (err) {
        console.warn("Reverse geocode error:", err);
      } finally {
        setIsGeocoding(false);
      }
    },
    [updateLocationState]
  );

  // Clear location handler
  const handleClearLocation = useCallback(() => {
    if (markerInstanceRef.current) {
      if ("setMap" in markerInstanceRef.current && typeof markerInstanceRef.current.setMap === "function") {
        markerInstanceRef.current.setMap(null);
      } else {
        markerInstanceRef.current.map = null;
      }
      markerInstanceRef.current = null;
    }

    setSelectedLocation(null);
    setSearchQuery("");
    updateLocationState(null);
    setStatusMessage("Location cleared.");
    setTimeout(() => setStatusMessage(null), 3000);
  }, [updateLocationState]);

  // Create or move marker on map
  const setOrUpdateMarker = useCallback(
    (
      libs: NonNullable<Awaited<ReturnType<typeof loadGoogleMapsLibraries>>>,
      map: google.maps.Map,
      lat: number,
      lng: number,
      title?: string
    ) => {
      const position = { lat, lng };

      if (markerInstanceRef.current) {
        if ("setPosition" in markerInstanceRef.current && typeof markerInstanceRef.current.setPosition === "function") {
          markerInstanceRef.current.setPosition(position);
        } else {
          markerInstanceRef.current.position = position;
        }
        map.panTo(position);
        return;
      }

      let marker: MapMarkerInstance = null;

      if (libs.AdvancedMarkerElement) {
        try {
          marker = new libs.AdvancedMarkerElement({
            map,
            position,
            gmpDraggable: true,
            title: title || villaName || "Villa Location",
          });

          marker.addListener?.("dragend", () => {
            if (!marker) return;
            const pos = marker.position;
            if (!pos) return;
            const newLat = typeof pos.lat === "function" ? pos.lat() : Number(pos.lat);
            const newLng = typeof pos.lng === "function" ? pos.lng() : Number(pos.lng);

            if (!isNaN(newLat) && !isNaN(newLng)) {
              handleReverseGeocode(Number(newLat.toFixed(6)), Number(newLng.toFixed(6)));
            }
          });
        } catch (e) {
          console.warn("AdvancedMarkerElement init failed, falling back to legacy Marker:", e);
        }
      }

      if (!marker && libs.Marker) {
        marker = new libs.Marker({
          position,
          map,
          draggable: true,
          title: title || villaName || "Villa Location",
          animation: libs.Animation?.DROP,
        });

        marker.addListener?.("dragend", () => {
          if (!marker || !("getPosition" in marker)) return;
          const pos = (marker as google.maps.Marker).getPosition();
          if (!pos) return;
          const newLat = Number(pos.lat().toFixed(6));
          const newLng = Number(pos.lng().toFixed(6));
          handleReverseGeocode(newLat, newLng);
        });
      }

      markerInstanceRef.current = marker;
      map.panTo(position);
    },
    [handleReverseGeocode, villaName]
  );

  // Initialize Google Map & Autocomplete
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      const libs = await loadGoogleMapsLibraries();
      if (!libs || !isMounted || !mapContainerRef.current) {
        if (isMounted) {
          setMapLoadError(
            "Map could not be loaded. Please check the Google Maps API configuration."
          );
        }
        return;
      }

      setIsMapLoaded(true);
      setMapLoadError(null);

      const center = selectedLocation
        ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude }
        : DEFAULT_MAP_CENTER;

      const zoom = selectedLocation ? 16 : 12;

      const map = new libs.Map(mapContainerRef.current, {
        center,
        zoom,
        mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // If initial selected location exists, place marker
      if (selectedLocation) {
        setOrUpdateMarker(
          libs,
          map,
          selectedLocation.latitude,
          selectedLocation.longitude,
          villaName
        );
      }

      // Map click listener: place marker and reverse geocode
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const newLat = Number(e.latLng.lat().toFixed(6));
        const newLng = Number(e.latLng.lng().toFixed(6));

        setOrUpdateMarker(libs, map, newLat, newLng, villaName);
        handleReverseGeocode(newLat, newLng);
      });

      // Attach Places Autocomplete to Search Input
      if (searchInputRef.current && libs.Autocomplete) {
        const autocomplete = new libs.Autocomplete(searchInputRef.current, {
          fields: ["place_id", "geometry", "name", "formatted_address"],
        });

        autocomplete.bindTo("bounds", map);

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) {
            return;
          }

          const newLat = Number(place.geometry.location.lat().toFixed(6));
          const newLng = Number(place.geometry.location.lng().toFixed(6));
          const formattedAddress = place.formatted_address || place.name || "";
          const placeId = place.place_id || "";

          map.panTo({ lat: newLat, lng: newLng });
          map.setZoom(16);

          setOrUpdateMarker(libs, map, newLat, newLng, place.name || villaName);

          const newLoc: LocationValue = {
            address: formattedAddress,
            latitude: newLat,
            longitude: newLng,
            placeId,
          };

          setSearchQuery(formattedAddress);
          updateLocationState(newLoc);

          setStatusMessage(`📍 Selected: ${place.name || formattedAddress}`);
          setTimeout(() => setStatusMessage(null), 3500);
        });

        autocompleteRef.current = autocomplete;
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (markerInstanceRef.current) {
        if ("setMap" in markerInstanceRef.current && typeof markerInstanceRef.current.setMap === "function") {
          markerInstanceRef.current.setMap(null);
        } else {
          markerInstanceRef.current.map = null;
        }
        markerInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleReverseGeocode, setOrUpdateMarker, updateLocationState, villaName]);

  // Sync marker position when selectedLocation changes externally
  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current && selectedLocation) {
      loadGoogleMapsLibraries().then((libs) => {
        if (libs && mapInstanceRef.current) {
          setOrUpdateMarker(
            libs,
            mapInstanceRef.current,
            selectedLocation.latitude,
            selectedLocation.longitude,
            villaName
          );
        }
      });
    }
  }, [isMapLoaded, selectedLocation, setOrUpdateMarker, villaName]);

  return (
    <div className="space-y-4 rounded-2xl p-4 sm:p-6 bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#383633] shadow-xs text-[#202020] dark:text-[#FCFBF8]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E8E8E8] dark:border-[#383633] pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-serif font-semibold text-[#202020] dark:text-[#FCFBF8] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#EFA1AA]" />
            <span>Villa Location &amp; Map Coordinates</span>
          </h3>
          <p className="text-xs text-[#66635F] dark:text-[#BDB8B0] mt-0.5">
            Search address, click map, or drag marker to set exact property spot.
          </p>
        </div>

        {selectedLocation && (
          <button
            type="button"
            onClick={handleClearLocation}
            className="px-3 py-1.5 rounded-lg border border-[#E8E8E8] dark:border-[#383633] hover:bg-[#FFF0F0] dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Location</span>
          </button>
        )}
      </div>

      {/* 1. Search Bar */}
      <div className="space-y-1 relative">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0]">
          Search Location / Address
        </label>
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address, landmark, or area (e.g. Igatpuri, Maharashtra)..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#202020] dark:focus:border-[#EFA1AA] transition-colors"
          />
          <Search className="w-4 h-4 text-[#66635F] dark:text-[#BDB8B0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Google Map Canvas */}
      <div className="space-y-2">
        <div className="relative w-full h-[350px] sm:h-[450px] rounded-xl overflow-hidden border border-[#E8E8E8] dark:border-[#383633] bg-[#171717] shadow-inner">
          {/* Map canvas container */}
          <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />

          {/* Map loading spinner */}
          {!isMapLoaded && !mapLoadError && (
            <div className="absolute inset-0 z-20 bg-[#171717]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-[#EFA1AA]" />
              <span>Loading Google Map...</span>
            </div>
          )}

          {/* Error Banner if Google Maps fails to load */}
          {mapLoadError && (
            <div className="absolute inset-0 z-20 bg-stone-900/90 p-6 flex flex-col items-center justify-center text-center gap-3 text-white">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <div className="max-w-md space-y-1">
                <h4 className="font-semibold text-sm">Map Unavailable</h4>
                <p className="text-xs text-stone-300">{mapLoadError}</p>
              </div>
            </div>
          )}

          {/* Helper banner at bottom of map */}
          {isMapLoaded && (
            <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none text-center">
              <span className="px-3 py-1.5 rounded-full bg-[#202020]/90 backdrop-blur-md text-white text-[11px] font-medium border border-white/10 shadow-md inline-flex items-center gap-1.5">
                <span>📍 Click anywhere on the map or drag marker to select exact spot</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Coordinates & Selected Address Details */}
      <div className="space-y-3 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
              Latitude *
            </label>
            <input
              type="number"
              step="0.000001"
              placeholder="e.g. 19.695000"
              value={selectedLocation ? selectedLocation.latitude : ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  const currentLng = selectedLocation?.longitude ?? DEFAULT_MAP_CENTER.lng;
                  const newLoc: LocationValue = {
                    address: selectedLocation?.address || searchQuery || "",
                    latitude: val,
                    longitude: currentLng,
                    placeId: selectedLocation?.placeId || "",
                  };
                  updateLocationState(newLoc);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs font-mono text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#202020] dark:focus:border-[#EFA1AA]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
              Longitude *
            </label>
            <input
              type="number"
              step="0.000001"
              placeholder="e.g. 73.562000"
              value={selectedLocation ? selectedLocation.longitude : ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  const currentLat = selectedLocation?.latitude ?? DEFAULT_MAP_CENTER.lat;
                  const newLoc: LocationValue = {
                    address: selectedLocation?.address || searchQuery || "",
                    latitude: currentLat,
                    longitude: val,
                    placeId: selectedLocation?.placeId || "",
                  };
                  updateLocationState(newLoc);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs font-mono text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#202020] dark:focus:border-[#EFA1AA]"
            />
          </div>
        </div>

        {/* Selected Location Card */}
        <div className="p-3.5 rounded-xl bg-[#F7F6F3] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#383633] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#202020] dark:text-[#FCFBF8] flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-[#EFA1AA]" />
              <span>Current Selected Location</span>
            </span>
            {isGeocoding && (
              <span className="text-[10px] text-[#EFA1AA] flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Reverse geocoding...</span>
              </span>
            )}
          </div>

          {selectedLocation ? (
            <div className="space-y-1 text-xs text-[#66635F] dark:text-[#BDB8B0]">
              <div>
                <span className="font-semibold text-[#202020] dark:text-[#FCFBF8]">Selected Address: </span>
                <span>{selectedLocation.address || "Not specified"}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#202020] dark:text-[#FCFBF8]">
                <span>Latitude: <strong>{selectedLocation.latitude.toFixed(6)}</strong></span>
                <span>Longitude: <strong>{selectedLocation.longitude.toFixed(6)}</strong></span>
                {selectedLocation.placeId && (
                  <span className="text-[#66635F] truncate max-w-[200px]">
                    Place ID: {selectedLocation.placeId}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-medium py-1">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>No map location selected yet. Please search or click on the map to set location.</span>
            </div>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="text-[11px] font-medium text-[#3F7658] dark:text-[#4ADE80] bg-[#3F7658]/10 dark:bg-[#3F7658]/20 border border-[#3F7658]/30 px-3 py-2 rounded-xl flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {error && (
        <div className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 p-2.5 rounded-xl flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
