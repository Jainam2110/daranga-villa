"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getPrimaryVillaImageUrl, formatCategoryLabel, sanitizeImageCategory } from "@/lib/utils/image";
import { formatCurrency } from "@/lib/utils/pricing";
import {
  Search,
  Plus,
  Edit2,
  Power,
  UploadCloud,
  X,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Image as ImageIcon,
  MapPin,
  Users,
  Bed,
  Bath,
  Star,
  Eye,
  Sparkles,
  Shield,
  Check,
} from "lucide-react";
import { AdminLocationPickerMap } from "@/components/admin/admin-location-picker-map";
import { AmenityIcon, STANDARD_LUXURY_AMENITIES } from "@/components/ui/amenity-icon";
import { VillaImageCategory, VILLA_IMAGE_CATEGORIES } from "@/types/villa";

export interface SerializedVillaImage {
  url: string;
  publicId?: string;
  category?: VillaImageCategory;
  label?: string;
}

export interface SerializedVilla {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  location?:
    | {
        address: string;
        latitude: number;
        longitude: number;
        placeId?: string;
      }
    | string;
  zone?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  mapX?: number;
  mapY?: number;
  images: (SerializedVillaImage | string)[];
  pricePerNight: number;
  maxGuests: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  houseRules: string[];
  cancellationPolicy?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

interface VillaManagementClientProps {
  initialVillas: SerializedVilla[];
}

const UDAIPUR_LOCATION_PRESETS = [
  {
    name: "Lake Pichola Waterfront",
    lat: 24.576,
    lng: 73.678,
    mapX: 58,
    mapY: 64,
  },
  {
    name: "Fateh Sagar Lakeside (Rani Road)",
    lat: 24.602,
    lng: 73.668,
    mapX: 50,
    mapY: 40,
  },
  {
    name: "Kodiyat Valley & Sajjangarh Ridge",
    lat: 24.59,
    lng: 73.635,
    mapX: 32,
    mapY: 55,
  },
  {
    name: "Lake Badi Nature Enclave",
    lat: 24.618,
    lng: 73.62,
    mapX: 22,
    mapY: 26,
  },
];

const STANDARD_HOUSE_RULES = [
  "No smoking indoors",
  "Quiet hours after 10:00 PM",
  "Pets strictly subject to prior approval",
  "Valid Government ID required at check-in",
  "Commercial photography requires prior permission",
  "Primary guest must be at least 18 years old",
];

export function VillaManagementClient({ initialVillas }: VillaManagementClientProps) {
  const [villas, setVillas] = useState<SerializedVilla[]>(initialVillas);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVilla, setEditingVilla] = useState<SerializedVilla | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  // Media Management State
  const [imagesList, setImagesList] = useState<SerializedVillaImage[]>([]);
  const [uploadCategory, setUploadCategory] = useState<VillaImageCategory>("EXTERIOR");
  const [uploadLabel, setUploadLabel] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Amenities & Rules State
  const [amenitiesList, setAmenitiesList] = useState<string[]>([]);
  const [customAmenityInput, setCustomAmenityInput] = useState("");
  const [houseRulesList, setHouseRulesList] = useState<string[]>([]);
  const [customRuleInput, setCustomRuleInput] = useState("");

  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    location: "",
    placeId: "",
    zone: "Lake Pichola Waterfront",
    googleMapsUrl: "",
    latitude: 24.576,
    longitude: 73.678,
    mapX: 58,
    mapY: 64,
    pricePerNight: 500,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    cancellationPolicy: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const normalizeImages = (rawImages: (SerializedVillaImage | string)[]): SerializedVillaImage[] => {
    if (!Array.isArray(rawImages)) return [];
    return rawImages
      .map((img) => {
        if (typeof img === "string") {
          return {
            url: img.trim(),
            publicId: "",
            category: "OTHER" as VillaImageCategory,
            label: "",
          };
        }
        if (img && typeof img === "object" && "url" in img) {
          const cat = sanitizeImageCategory(img.category);
          return {
            url: (img.url || "").trim(),
            publicId: (img.publicId || "").trim(),
            category: cat,
            label: (img.label || "").trim(),
          };
        }
        return { url: "", publicId: "", category: "OTHER" as VillaImageCategory, label: "" };
      })
      .filter((img) => Boolean(img.url));
  };

  const openAddModal = () => {
    setEditingVilla(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      location: "Haridas Ji Ki Magri, Lake Pichola, Udaipur, Rajasthan",
      placeId: "",
      zone: "Lake Pichola Waterfront",
      googleMapsUrl: "",
      latitude: 24.576,
      longitude: 73.678,
      mapX: 58,
      mapY: 64,
      pricePerNight: 25000,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 3,
      cancellationPolicy: "Full refund 7 days prior to check-in date",
      status: "ACTIVE",
    });
    setAmenitiesList([
      "High-Speed Wi-Fi",
      "Air Conditioning",
      "Private Infinity Pool",
      "Private Parking",
      "Gourmet Kitchen",
      "Daily Butler & Housekeeping",
      "Hot Water & Luxury Bath",
    ]);
    setHouseRulesList([
      "No smoking indoors",
      "Quiet hours after 10:00 PM",
      "Valid Government ID required at check-in",
    ]);
    setImagesList([]);
    setUploadCategory("EXTERIOR");
    setUploadLabel("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (villa: SerializedVilla) => {
    setEditingVilla(villa);

    const locAddress =
      typeof villa.location === "object" && villa.location !== null
        ? villa.location.address || ""
        : typeof villa.location === "string"
        ? villa.location
        : "";

    const locLat =
      typeof villa.location === "object" &&
      villa.location !== null &&
      typeof villa.location.latitude === "number"
        ? villa.location.latitude
        : villa.latitude !== undefined
        ? villa.latitude
        : 24.576;

    const locLng =
      typeof villa.location === "object" &&
      villa.location !== null &&
      typeof villa.location.longitude === "number"
        ? villa.location.longitude
        : villa.longitude !== undefined
        ? villa.longitude
        : 73.678;

    const locPlaceId =
      typeof villa.location === "object" && villa.location !== null
        ? villa.location.placeId || villa.placeId || ""
        : villa.placeId || "";

    setFormData({
      name: villa.name,
      slug: villa.slug,
      description: villa.description || "",
      location: locAddress,
      placeId: locPlaceId,
      zone: villa.zone || "Udaipur Sanctuary Enclave",
      googleMapsUrl: villa.googleMapsUrl || "",
      latitude: locLat,
      longitude: locLng,
      mapX: villa.mapX !== undefined ? villa.mapX : 50,
      mapY: villa.mapY !== undefined ? villa.mapY : 50,
      pricePerNight: villa.pricePerNight,
      maxGuests: villa.maxGuests,
      bedrooms: villa.bedrooms || 1,
      bathrooms: villa.bathrooms || 1,
      cancellationPolicy: villa.cancellationPolicy || "",
      status: villa.status,
    });
    setAmenitiesList(Array.isArray(villa.amenities) ? [...villa.amenities] : []);
    setHouseRulesList(Array.isArray(villa.houseRules) ? [...villa.houseRules] : []);
    setImagesList(normalizeImages(villa.images));
    setUploadCategory("EXTERIOR");
    setUploadLabel("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: (typeof UDAIPUR_LOCATION_PRESETS)[0]) => {
    setFormData((prev) => ({
      ...prev,
      zone: preset.name,
      location: `${preset.name}, Udaipur, Rajasthan`,
      latitude: preset.lat,
      longitude: preset.lng,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${preset.lat},${preset.lng}`,
      mapX: preset.mapX,
      mapY: preset.mapY,
    }));
  };

  const handleDeleteVilla = async (villa: SerializedVilla) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${villa.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(villa._id);
    try {
      const res = await fetch(`/api/admin/villas/${villa._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete villa.");
      }
      setVillas((prev) => prev.filter((v) => v._id !== villa._id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deletion failed";
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  // Cloudinary image upload handler with category assignment
  const handleImageFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    setFormError("");

    const newUploaded: SerializedVillaImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.toLowerCase().startsWith("image/")) {
        setFormError(`File '${file.name}' is not a valid image.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFormError(`File '${file.name}' exceeds the 10MB file limit.`);
        continue;
      }

      try {
        const fd = new FormData();
        fd.append("file", file);
        if (editingVilla?._id) {
          fd.append("villaId", editingVilla._id);
        }

        const res = await fetch("/api/admin/cloudinary/upload", {
          method: "POST",
          body: fd,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        newUploaded.push({
          url: data.image.url,
          publicId: data.image.publicId,
          category: uploadCategory,
          label: uploadLabel.trim() || formatCategoryLabel(uploadCategory),
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Image upload failed";
        setFormError(msg);
      }
    }

    if (newUploaded.length > 0) {
      setImagesList((prev) => [...prev, ...newUploaded]);
      setUploadLabel("");
    }
    setUploadingImages(false);
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    setImagesList((prev) => [
      ...prev,
      {
        url: manualUrl.trim(),
        publicId: "",
        category: uploadCategory,
        label: uploadLabel.trim() || formatCategoryLabel(uploadCategory),
      },
    ]);
    setManualUrl("");
    setUploadLabel("");
  };

  // Reorder & management helpers
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imagesList.length) return;
    setImagesList((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const setPrimaryImage = (index: number) => {
    if (index <= 0 || index >= imagesList.length) return;
    setImagesList((prev) => {
      const updated = [...prev];
      const [primary] = updated.splice(index, 1);
      return [primary, ...updated];
    });
  };

  const updateImageCategory = (index: number, newCategory: VillaImageCategory) => {
    setImagesList((prev) =>
      prev.map((img, i) => (i === index ? { ...img, category: newCategory } : img))
    );
  };

  const updateImageLabel = (index: number, newLabel: string) => {
    setImagesList((prev) =>
      prev.map((img, i) => (i === index ? { ...img, label: newLabel } : img))
    );
  };

  const removeImage = async (index: number) => {
    const target = imagesList[index];
    if (!target) return;

    if (target.publicId) {
      try {
        await fetch("/api/admin/cloudinary/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicId: target.publicId,
            url: target.url,
            villaId: editingVilla?._id,
          }),
        });
      } catch (err) {
        console.error("Cloudinary deletion failed:", err);
      }
    }

    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  // Amenities helpers
  const toggleAmenity = (name: string) => {
    setAmenitiesList((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenityInput.trim();
    if (!trimmed) return;
    if (!amenitiesList.includes(trimmed)) {
      setAmenitiesList((prev) => [...prev, trimmed]);
    }
    setCustomAmenityInput("");
  };

  const removeAmenity = (name: string) => {
    setAmenitiesList((prev) => prev.filter((a) => a !== name));
  };

  // House rules helpers
  const toggleHouseRule = (rule: string) => {
    setHouseRulesList((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]
    );
  };

  const addCustomHouseRule = () => {
    const trimmed = customRuleInput.trim();
    if (!trimmed) return;
    if (!houseRulesList.includes(trimmed)) {
      setHouseRulesList((prev) => [...prev, trimmed]);
    }
    setCustomRuleInput("");
  };

  const removeHouseRule = (rule: string) => {
    setHouseRulesList((prev) => prev.filter((r) => r !== rule));
  };

  const handleToggleStatus = async (villaId: string, currentStatus: "ACTIVE" | "INACTIVE") => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/villas/${villaId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to update villa status.");
        return;
      }
      setVillas((prev) =>
        prev.map((v) => (v._id === villaId ? { ...v, status: nextStatus } : v))
      );
    } catch {
      alert("Network error updating villa status.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setFormError(
        "Valid Google Maps coordinates are required. Latitude must be between -90 and 90, and Longitude between -180 and 180."
      );
      return;
    }

    setSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || undefined,
      description: formData.description.trim(),
      location: {
        address: formData.location.trim() || formData.zone.trim() || "Udaipur, Rajasthan",
        latitude: lat,
        longitude: lng,
        placeId: formData.placeId ? formData.placeId.trim() : "",
      },
      zone: formData.zone.trim(),
      googleMapsUrl:
        formData.googleMapsUrl.trim() ||
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      latitude: lat,
      longitude: lng,
      placeId: formData.placeId ? formData.placeId.trim() : "",
      mapX: Number(formData.mapX),
      mapY: Number(formData.mapY),
      pricePerNight: Number(formData.pricePerNight),
      maxGuests: Number(formData.maxGuests),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      images: imagesList,
      amenities: amenitiesList,
      houseRules: houseRulesList,
      cancellationPolicy: formData.cancellationPolicy.trim(),
      status: formData.status,
    };

    try {
      const url = editingVilla ? `/api/admin/villas/${editingVilla._id}` : "/api/admin/villas";
      const method = editingVilla ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save villa.");
      }

      const normalizedReturnedVilla: SerializedVilla = {
        ...data.data,
        images: normalizeImages(data.data.images),
      };

      if (editingVilla) {
        setVillas((prev) =>
          prev.map((v) => (v._id === editingVilla._id ? normalizedReturnedVilla : v))
        );
      } else {
        setVillas((prev) => [normalizedReturnedVilla, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVillas = villas.filter((villa) => {
    const locStr =
      typeof villa.location === "object" && villa.location !== null
        ? villa.location.address || ""
        : typeof villa.location === "string"
        ? villa.location
        : "";

    const matchesSearch =
      villa.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      locStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (villa.zone || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || villa.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#66635F] dark:text-[#BDB8B0]" />
            <input
              type="text"
              placeholder="Search villa name, zone, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#333333] text-xs text-[#202020] dark:text-[#FCFBF8] placeholder-[#8A8782] focus:outline-none focus:border-[#EFA1AA]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
            className="w-full sm:w-44 px-3 py-2 rounded-lg bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#333333] text-xs font-medium text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#EFA1AA]"
          >
            <option value="ALL">All Statuses ({villas.length})</option>
            <option value="ACTIVE">ACTIVE only</option>
            <option value="INACTIVE">INACTIVE only</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-lg bg-[#202020] hover:bg-[#333333] text-white transition-colors shadow-xs flex items-center justify-center gap-1.5 uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Add Villa</span>
        </button>
      </div>

      {/* Villa Portfolio Table */}
      <div className="bg-white dark:bg-[#202020] rounded-xl border border-[#E8E8E8] dark:border-[#333333] overflow-hidden shadow-xs">
        {filteredVillas.length === 0 ? (
          <div className="p-12 text-center text-[#66635F] dark:text-[#BDB8B0] space-y-3">
            <ImageIcon className="w-10 h-10 mx-auto text-[#8A8782]" />
            <h3 className="font-semibold text-[#202020] dark:text-[#FCFBF8] text-sm">No villas found</h3>
            <p className="text-xs max-w-sm mx-auto">Click the button below to add your first property residence.</p>
            <button
              onClick={openAddModal}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#202020] hover:bg-[#333333] text-white uppercase tracking-wider"
            >
              Add Villa
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F7F7F6] dark:bg-[#171717] border-b border-[#E8E8E8] dark:border-[#333333] text-[#66635F] dark:text-[#BDB8B0] uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-3 px-4">Villa Residence</th>
                  <th className="py-3 px-4">Location / Zone</th>
                  <th className="py-3 px-4 text-right">Price / Night</th>
                  <th className="py-3 px-4 text-center">Specs</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E8] dark:divide-[#333333] text-[#202020] dark:text-[#FCFBF8]">
                {filteredVillas.map((villa) => {
                  const coverImage = getPrimaryVillaImageUrl(villa.images);
                  const isDeleting = deletingId === villa._id;

                  return (
                    <tr
                      key={villa._id}
                      className="hover:bg-[#F7F7F6]/60 dark:hover:bg-[#171717]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#333333] flex-shrink-0">
                            <Image src={coverImage} alt={villa.name} fill sizes="48px" className="object-cover" />
                          </div>
                          <div>
                            <div className="font-serif font-bold text-[#202020] dark:text-[#FCFBF8] text-sm">
                              {villa.name}
                            </div>
                            <div className="text-[11px] text-[#66635F] dark:text-[#BDB8B0] font-mono">
                              /villas/{villa.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#66635F] dark:text-[#BDB8B0]">
                        {(() => {
                          const address =
                            typeof villa.location === "object" && villa.location !== null
                              ? villa.location.address || villa.zone || "Daranga Sanctuary"
                              : typeof villa.location === "string" && villa.location
                              ? villa.location
                              : villa.zone || "Daranga Sanctuary";

                          const hasValidCoords =
                            typeof villa.latitude === "number" &&
                            !isNaN(villa.latitude) &&
                            typeof villa.longitude === "number" &&
                            !isNaN(villa.longitude) &&
                            villa.latitude !== 0 &&
                            villa.longitude !== 0;

                          return (
                            <div className="space-y-1">
                              <div className="font-medium text-[#202020] dark:text-[#FCFBF8] flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#EFA1AA] flex-shrink-0" />
                                <span className="truncate max-w-[180px]">{villa.zone || "Udaipur, Rajasthan"}</span>
                              </div>
                              <div className="text-[11px] truncate max-w-xs text-[#66635F] dark:text-[#BDB8B0]">
                                {address}
                              </div>
                              {hasValidCoords ? (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#3F7658]/10 border border-[#3F7658]/20 text-[10px] font-mono text-[#3F7658]">
                                  <span>📍 GPS: {villa.latitude?.toFixed(4)}, {villa.longitude?.toFixed(4)}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <span className="text-[10px] text-[#D9822B] font-medium">
                                    ⚠️ Location needs to be verified
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(villa)}
                                    className="px-2 py-0.5 rounded bg-[#202020] hover:bg-[#333333] text-white text-[9px] font-bold"
                                  >
                                    Set Exact Location
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-sans font-bold text-[#202020] dark:text-[#FCFBF8]">
                        {formatCurrency(villa.pricePerNight)}
                      </td>

                      <td className="py-3.5 px-4 text-center text-[#66635F] dark:text-[#BDB8B0]">
                        <div className="flex items-center justify-center gap-2">
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3 h-3 text-[#EFA1AA]" />
                            <span>{villa.maxGuests}</span>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Bed className="w-3 h-3 text-[#EFA1AA]" />
                            <span>{villa.bedrooms || 1}BHK</span>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Bath className="w-3 h-3 text-[#EFA1AA]" />
                            <span>{villa.bathrooms || 1}B</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                            villa.status === "ACTIVE"
                              ? "bg-[#3F7658]/10 text-[#3F7658] border border-[#3F7658]/30"
                              : "bg-[#8A8782]/10 text-[#66635F] border border-[#E8E8E8] dark:border-[#333333]"
                          }`}
                        >
                          {villa.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(villa)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F7F7F6] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] border border-[#E8E8E8] dark:border-[#333333] hover:border-[#EFA1AA] transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(villa._id, villa.status)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                            villa.status === "ACTIVE"
                              ? "bg-[#F6D2B8]/40 text-[#202020] border-[#F6D2B8] hover:bg-[#F6D2B8]/60"
                              : "bg-[#3F7658]/10 text-[#3F7658] border-[#3F7658]/30 hover:bg-[#3F7658]/20"
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{villa.status === "ACTIVE" ? "Deactivate" : "Activate"}</span>
                        </button>

                        <button
                          disabled={isDeleting}
                          onClick={() => handleDeleteVilla(villa)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#C94A4A]/10 text-[#C94A4A] border border-[#C94A4A]/30 hover:bg-[#C94A4A]/20 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT VILLA MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-[#202020] rounded-2xl border border-[#E8E8E8] dark:border-[#333333] shadow-2xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E8E8E8] dark:border-[#333333] flex items-center justify-between bg-[#F7F7F6]/50 dark:bg-[#171717]/50">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#202020] dark:text-[#FCFBF8]">
                  {editingVilla ? `Edit Villa: ${editingVilla.name}` : "Create New Luxury Villa"}
                </h3>
                <p className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">
                  Manage residence basic details, categorized media gallery, amenities, and booking policies.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#66635F] hover:text-[#202020] dark:text-[#BDB8B0] dark:hover:text-[#FCFBF8] hover:bg-[#F7F7F6] dark:hover:bg-[#171717] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-[#C94A4A]/10 border border-[#C94A4A]/30 text-[#C94A4A] text-xs">
                  {formError}
                </div>
              )}

              {/* SECTION 1: BASIC INFO */}
              <div className="p-4 rounded-xl bg-[#F7F7F6]/60 dark:bg-[#171717]/40 border border-[#E8E8E8] dark:border-[#333333] space-y-4">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#202020] dark:text-[#FCFBF8] border-b border-[#E8E8E8] dark:border-[#333333] pb-2">
                  1. Basic Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                      Villa Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. The Celestial Residence"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#EFA1AA]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                      Slug Identifier (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g. celestial-residence"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#EFA1AA]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                    Editorial Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe villa highlights, lake views, architectural aesthetics..."
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#EFA1AA]"
                  />
                </div>
              </div>

              {/* SECTION 2: MAP LOCATION */}
              <div className="p-4 rounded-xl bg-[#F7F7F6]/60 dark:bg-[#171717]/40 border border-[#E8E8E8] dark:border-[#333333] space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#E8E8E8] dark:border-[#333333] pb-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#202020] dark:text-[#FCFBF8] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#EFA1AA]" />
                    <span>2. Location &amp; Interactive Map Coordinates</span>
                  </h4>
                  <span className="text-[10px] text-[#66635F] dark:text-[#BDB8B0] font-mono">
                    GPS: {Number(formData.latitude).toFixed(4)}, {Number(formData.longitude).toFixed(4)}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-[#66635F] dark:text-[#BDB8B0]">
                    Quick Location Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {UDAIPUR_LOCATION_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                          formData.zone === preset.name
                            ? "bg-[#202020] text-white dark:bg-[#FCFBF8] dark:text-[#202020] shadow-xs"
                            : "bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-[#202020] dark:text-[#FCFBF8] hover:border-[#EFA1AA]"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Unified Interactive Map Canvas & Location Fields */}
                <AdminLocationPickerMap
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  villaName={formData.name}
                  locationAddress={formData.location}
                  zone={formData.zone}
                  googleMapsUrl={formData.googleMapsUrl}
                  placeId={formData.placeId}
                  onChangeCoordinates={(lat, lng) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                    }));
                  }}
                  onAddressChange={(address) => {
                    setFormData((prev) => ({
                      ...prev,
                      location: address,
                    }));
                  }}
                  onZoneChange={(zone) => {
                    setFormData((prev) => ({
                      ...prev,
                      zone: zone,
                    }));
                  }}
                  onGoogleMapsUrlChange={(url) => {
                    setFormData((prev) => ({
                      ...prev,
                      googleMapsUrl: url,
                    }));
                  }}
                />
              </div>

              {/* SECTION 3: PROPERTY DETAILS & PRICING */}
              <div className="p-4 rounded-xl bg-[#F7F7F6]/60 dark:bg-[#171717]/40 border border-[#E8E8E8] dark:border-[#333333] space-y-4">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#202020] dark:text-[#FCFBF8] border-b border-[#E8E8E8] dark:border-[#333333] pb-2">
                  3. Specs &amp; Pricing
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                      Price / Night (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.pricePerNight}
                      onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs font-sans font-bold text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#EFA1AA]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                      Max Guests *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.maxGuests}
                      onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs font-bold text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#EFA1AA]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#EFA1AA]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs text-[#202020] dark:text-[#FCFBF8] focus:outline-none focus:border-[#EFA1AA]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: CLOUDINARY IMAGES WITH CATEGORIES & LABELS */}
              <div className="p-4 rounded-xl bg-[#F7F7F6]/60 dark:bg-[#171717]/40 border border-[#E8E8E8] dark:border-[#333333] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E8E8] dark:border-[#333333] pb-2">
                  <div>
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-[#202020] dark:text-[#FCFBF8] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#EFA1AA]" />
                      <span>4. Media &amp; Categorized Image Management</span>
                    </h4>
                    <span className="text-[10px] text-[#66635F] dark:text-[#BDB8B0]">
                      Assign categories and descriptive display labels to enhance the customer gallery experience.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                    className="text-[11px] font-semibold text-[#202020] dark:text-[#EFA1AA] hover:underline"
                  >
                    {showManualUrlInput ? "Hide URL input" : "+ Add image via URL"}
                  </button>
                </div>

                {/* Upload Category, Label & File Input - Compact Bar */}
                <div className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="w-full sm:w-44 flex-shrink-0">
                        <select
                          value={uploadCategory}
                          onChange={(e) => setUploadCategory(e.target.value as VillaImageCategory)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#333333] text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] focus:border-[#EFA1AA] focus:outline-hidden"
                        >
                          {VILLA_IMAGE_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1">
                        <input
                          type="text"
                          value={uploadLabel}
                          onChange={(e) => setUploadLabel(e.target.value)}
                          placeholder="Batch photo label (e.g. Master Bedroom Suite)..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#333333] text-xs text-[#202020] dark:text-[#FCFBF8] focus:border-[#EFA1AA] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="relative flex-shrink-0">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleImageFilesUpload(e.target.files)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <button
                        type="button"
                        className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-[#202020] text-white hover:bg-[#333333] text-xs font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4 text-[#EFA1AA]" />
                        <span>Upload Photos</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#66635F] dark:text-[#BDB8B0] flex items-center justify-between flex-wrap gap-1">
                    <span>Supports WEBP, JPG, PNG, AVIF (Max 10MB per file). Select files or click Upload.</span>
                    <button
                      type="button"
                      onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                      className="text-[10px] font-semibold text-[#202020] dark:text-[#EFA1AA] hover:underline cursor-pointer"
                    >
                      {showManualUrlInput ? "Hide URL input" : "+ Add image via URL"}
                    </button>
                  </p>
                </div>

                {showManualUrlInput && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs text-[#202020] dark:text-[#FCFBF8] focus:border-[#EFA1AA] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualUrl}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#F7F7F6] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] border border-[#E8E8E8] dark:border-[#333333]"
                    >
                      Add URL
                    </button>
                  </div>
                )}

                {uploadingImages && (
                  <div className="p-2.5 rounded-lg bg-[#F6D2B8]/40 border border-[#F6D2B8] text-[#202020] dark:text-[#FCFBF8] text-xs flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-[#202020] dark:border-[#EFA1AA] border-t-transparent rounded-full animate-spin" />
                    <span>Uploading images to Cloudinary...</span>
                  </div>
                )}

                {/* Compact Media Grid View (No Infinite Scrolling) */}
                {imagesList.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#66635F] dark:text-[#BDB8B0]">
                      <span className="font-semibold text-[#202020] dark:text-[#FCFBF8]">
                        Gallery Portfolio ({imagesList.length} Photos)
                      </span>
                      <span className="text-[10px] text-[#66635F] dark:text-[#BDB8B0]">
                        ★ 1st photo is Primary Cover • Click Star to make cover
                      </span>
                    </div>

                    <div className="max-h-[380px] sm:max-h-[440px] overflow-y-auto p-2 rounded-xl bg-[#F7F7F6]/60 dark:bg-[#171717]/60 border border-[#E8E8E8] dark:border-[#333333]">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                        {imagesList.map((img, idx) => (
                          <div
                            key={idx}
                            className={`group relative flex flex-col rounded-xl overflow-hidden border bg-white dark:bg-[#202020] transition-all shadow-xs ${
                              idx === 0
                                ? "border-[#202020] dark:border-[#EFA1AA] ring-2 ring-[#202020]/20 dark:ring-[#EFA1AA]/20"
                                : "border-[#E8E8E8] dark:border-[#333333] hover:border-[#202020] dark:hover:border-[#EFA1AA]"
                            }`}
                          >
                            {/* Thumbnail & Action Overlay */}
                            <div className="relative aspect-[4/3] w-full bg-black">
                              <Image src={img.url} alt={`Photo ${idx + 1}`} fill sizes="180px" className="object-cover" />

                              {/* Badges */}
                              <div className="absolute top-1.5 left-1.5 z-10">
                                {idx === 0 ? (
                                  <span className="px-1.5 py-0.5 rounded bg-[#202020] text-[#EFA1AA] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                    <span>Cover</span>
                                  </span>
                                ) : (
                                  <span className="px-1 py-0.5 rounded bg-black/70 text-white font-mono text-[9px]">
                                    #{idx + 1}
                                  </span>
                                )}
                              </div>

                              {/* Quick Cover Star for non-cover images */}
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => setPrimaryImage(idx)}
                                  title="Make this Primary Cover"
                                  className="absolute top-1.5 right-1.5 z-10 p-1 rounded bg-black/60 text-white/80 hover:text-[#EFA1AA] hover:bg-black/90 transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                                >
                                  <Star className="w-3 h-3" />
                                </button>
                              )}

                              {/* Hover Action Overlay */}
                              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1 z-20">
                                <button
                                  type="button"
                                  onClick={() => setPreviewImageUrl(img.url)}
                                  title="Enlarge preview"
                                  className="w-6 h-6 rounded bg-black/80 text-white flex items-center justify-center hover:bg-[#333333] transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveImage(idx, idx - 1)}
                                  title="Move left"
                                  className="w-6 h-6 rounded bg-black/80 text-white flex items-center justify-center hover:bg-[#333333] disabled:opacity-20 transition-colors cursor-pointer"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === imagesList.length - 1}
                                  onClick={() => moveImage(idx, idx + 1)}
                                  title="Move right"
                                  className="w-6 h-6 rounded bg-black/80 text-white flex items-center justify-center hover:bg-[#333333] disabled:opacity-20 transition-colors cursor-pointer"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeImage(idx)}
                                  title="Delete photo"
                                  className="w-6 h-6 rounded bg-[#C94A4A] text-white flex items-center justify-center hover:bg-[#b03e3e] transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Mini Category & Label Inputs */}
                            <div className="p-1.5 space-y-1 bg-white dark:bg-[#202020] text-[10px]">
                              <select
                                value={img.category || "OTHER"}
                                onChange={(e) => updateImageCategory(idx, e.target.value as VillaImageCategory)}
                                className="w-full px-1.5 py-0.5 rounded bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#333333] text-[10px] font-semibold text-[#202020] dark:text-[#FCFBF8] focus:border-[#EFA1AA] focus:outline-hidden truncate cursor-pointer"
                              >
                                {VILLA_IMAGE_CATEGORIES.map((cat) => (
                                  <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </option>
                                ))}
                              </select>

                              <input
                                type="text"
                                value={img.label || ""}
                                onChange={(e) => updateImageLabel(idx, e.target.value)}
                                placeholder="Label (e.g. Pool View)..."
                                className="w-full px-1.5 py-0.5 rounded bg-[#F7F7F6] dark:bg-[#171717] border border-[#E8E8E8] dark:border-[#333333] text-[10px] text-[#202020] dark:text-[#FCFBF8] focus:border-[#EFA1AA] focus:outline-hidden placeholder:text-[#999999]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5: AMENITIES MANAGEMENT */}
              <div className="p-4 rounded-xl bg-[#F7F7F6]/60 dark:bg-[#171717]/40 border border-[#E8E8E8] dark:border-[#333333] space-y-4">
                <div className="border-b border-[#E8E8E8] dark:border-[#333333] pb-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#202020] dark:text-[#FCFBF8] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#EFA1AA] flex-shrink-0" />
                    <span>5. Estate Amenities &amp; Inclusions</span>
                  </h4>
                  <span className="text-[10px] text-[#66635F] dark:text-[#BDB8B0]">
                    Click presets below or type custom amenities to assign features to this residence.
                  </span>
                </div>

                {/* Selected Amenities Chips */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-semibold text-[#66635F] dark:text-[#BDB8B0] block">
                    Active Amenities ({amenitiesList.length}):
                  </span>
                  {amenitiesList.length === 0 ? (
                    <p className="text-xs text-[#66635F] dark:text-[#BDB8B0] italic">
                      No amenities selected. Click presets below to add.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {amenitiesList.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] shadow-xs"
                        >
                          <AmenityIcon name={item} className="w-3.5 h-3.5 text-[#EFA1AA] flex-shrink-0" />
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => removeAmenity(item)}
                            className="ml-1 text-[#66635F] dark:text-[#BDB8B0] hover:text-[#C94A4A] flex-shrink-0 transition-colors cursor-pointer"
                            aria-label={`Remove ${item}`}
                          >
                            <X className="w-3.5 h-3.5 flex-shrink-0" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Standard Luxury Presets */}
                <div className="space-y-2 pt-2 border-t border-[#E8E8E8] dark:border-[#333333]">
                  <span className="text-[10px] uppercase font-semibold text-[#66635F] dark:text-[#BDB8B0] block">
                    Quick Add Luxury Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {STANDARD_LUXURY_AMENITIES.map((item, i) => {
                      const isSelected = amenitiesList.includes(item);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleAmenity(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#202020] text-white dark:bg-[#EFA1AA] dark:text-[#202020] font-bold shadow-xs scale-102"
                              : "bg-white dark:bg-[#202020] text-[#66635F] dark:text-[#BDB8B0] border border-[#E8E8E8] dark:border-[#333333] hover:border-[#202020]"
                          }`}
                        >
                          <AmenityIcon name={item} className={`w-3 h-3 flex-shrink-0 ${isSelected ? "text-white dark:text-[#202020]" : "text-[#EFA1AA]"}`} />
                          <span>{item}</span>
                          {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Amenity Adder */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customAmenityInput}
                    onChange={(e) => setCustomAmenityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomAmenity();
                      }
                    }}
                    placeholder="Type custom amenity (e.g. Private Helicopter Pad, Cigar Lounge)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs text-[#202020] dark:text-[#FCFBF8] focus:border-[#EFA1AA] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={addCustomAmenity}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#202020] hover:bg-[#333333] text-white transition-colors cursor-pointer"
                  >
                    + Add Custom
                  </button>
                </div>
              </div>

              {/* SECTION 6: POLICIES & RULES */}
              <div className="p-4 rounded-xl bg-[#F7F7F6]/60 dark:bg-[#171717]/40 border border-[#E8E8E8] dark:border-[#333333] space-y-4">
                <div className="border-b border-[#E8E8E8] dark:border-[#333333] pb-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#202020] dark:text-[#FCFBF8] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#EFA1AA] flex-shrink-0" />
                    <span>6. House Rules &amp; Cancellation Policy</span>
                  </h4>
                </div>

                {/* House Rules Tag Management */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-semibold text-[#66635F] dark:text-[#BDB8B0] block">
                    House Rules ({houseRulesList.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {houseRulesList.map((rule, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs font-medium text-[#202020] dark:text-[#FCFBF8] shadow-xs"
                      >
                        <Shield className="w-3 h-3 text-[#EFA1AA] flex-shrink-0" />
                        <span>{rule}</span>
                        <button
                          type="button"
                          onClick={() => removeHouseRule(rule)}
                          className="ml-1 text-[#66635F] dark:text-[#BDB8B0] hover:text-[#C94A4A] flex-shrink-0 transition-colors cursor-pointer"
                          aria-label={`Remove rule: ${rule}`}
                        >
                          <X className="w-3.5 h-3.5 flex-shrink-0" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Standard Rules Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {STANDARD_HOUSE_RULES.map((rule, i) => {
                      const isSelected = houseRulesList.includes(rule);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleHouseRule(rule)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#202020] text-white dark:bg-[#EFA1AA] dark:text-[#202020] font-bold shadow-xs"
                              : "bg-white dark:bg-[#202020] text-[#66635F] dark:text-[#BDB8B0] border border-[#E8E8E8] dark:border-[#333333] hover:border-[#202020]"
                          }`}
                        >
                          <Shield className={`w-3 h-3 flex-shrink-0 ${isSelected ? "text-white dark:text-[#202020]" : "text-[#EFA1AA]"}`} />
                          <span>{rule}</span>
                          {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={customRuleInput}
                      onChange={(e) => setCustomRuleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomHouseRule();
                        }
                      }}
                      placeholder="Add custom rule..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs text-[#202020] dark:text-[#FCFBF8] focus:border-[#EFA1AA] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={addCustomHouseRule}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#F7F7F6] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] border border-[#E8E8E8] dark:border-[#333333]"
                    >
                      Add Rule
                    </button>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                    Cancellation Policy Statement
                  </label>
                  <textarea
                    rows={2}
                    value={formData.cancellationPolicy}
                    onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                    placeholder="Full refund 7 days prior to check-in. 50% refund between 7 days and 48 hours."
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs text-[#202020] dark:text-[#FCFBF8] focus:border-[#EFA1AA] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* SECTION 7: LISTING STATUS */}
              <div className="p-4 rounded-xl bg-[#F7F7F6]/60 dark:bg-[#171717]/40 border border-[#E8E8E8] dark:border-[#333333]">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0] mb-1">
                  Listing Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#202020] border border-[#E8E8E8] dark:border-[#333333] text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] focus:border-[#EFA1AA] focus:outline-hidden"
                >
                  <option value="ACTIVE">ACTIVE (Visible on public customer website)</option>
                  <option value="INACTIVE">INACTIVE (Draft / Hidden from public website)</option>
                </select>
              </div>

              {/* Form Footer */}
              <div className="pt-3 border-t border-[#E8E8E8] dark:border-[#333333] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#F7F7F6] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] border border-[#E8E8E8] dark:border-[#333333] hover:bg-[#E8E8E8] dark:hover:bg-[#333333]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImages}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#202020] hover:bg-[#333333] text-white dark:bg-[#EFA1AA] dark:text-[#202020] transition-colors"
                >
                  {submitting ? "Saving..." : editingVilla ? "Save Changes" : "Create Villa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enlarged Image Preview Modal */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full">
            <Image src={previewImageUrl} alt="Full resolution preview" fill sizes="90vw" className="object-contain" />
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/80 text-white hover:bg-[#202020] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
