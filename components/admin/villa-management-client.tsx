"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getPrimaryVillaImageUrl } from "@/lib/utils/image";
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
} from "lucide-react";
import { AdminLocationPickerMap } from "@/components/admin/admin-location-picker-map";

export interface SerializedVillaImage {
  url: string;
  publicId: string;
}

export interface SerializedVilla {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  zone?: string;
  latitude?: number;
  longitude?: number;
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
    lat: 24.5760,
    lng: 73.6780,
    mapX: 58,
    mapY: 64,
  },
  {
    name: "Fateh Sagar Lakeside (Rani Road)",
    lat: 24.6020,
    lng: 73.6680,
    mapX: 50,
    mapY: 40,
  },
  {
    name: "Kodiyat Valley & Sajjangarh Ridge",
    lat: 24.5900,
    lng: 73.6350,
    mapX: 32,
    mapY: 55,
  },
  {
    name: "Lake Badi Nature Enclave",
    lat: 24.6180,
    lng: 73.6200,
    mapX: 22,
    mapY: 26,
  },
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

  // Cloudinary Images State
  const [imagesList, setImagesList] = useState<SerializedVillaImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    location: "",
    zone: "Lake Pichola Waterfront",
    latitude: 24.5760,
    longitude: 73.6780,
    mapX: 58,
    mapY: 64,
    pricePerNight: 500,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: "",
    houseRules: "",
    cancellationPolicy: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const normalizeImages = (rawImages: (SerializedVillaImage | string)[]): SerializedVillaImage[] => {
    if (!Array.isArray(rawImages)) return [];
    return rawImages
      .map((img) => {
        if (typeof img === "string") {
          return { url: img.trim(), publicId: "" };
        }
        if (img && typeof img === "object" && "url" in img) {
          return { url: (img.url || "").trim(), publicId: (img.publicId || "").trim() };
        }
        return { url: "", publicId: "" };
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
      zone: "Lake Pichola Waterfront",
      latitude: 24.5760,
      longitude: 73.6780,
      mapX: 58,
      mapY: 64,
      pricePerNight: 500,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: "Private Infinity Pool, High-Speed Wi-Fi, Air Conditioning, Butler Service, Gourmet Kitchen",
      houseRules: "No smoking indoors, Quiet hours after 10 PM",
      cancellationPolicy: "Full refund 7 days prior to check-in date",
      status: "ACTIVE",
    });
    setImagesList([]);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (villa: SerializedVilla) => {
    setEditingVilla(villa);
    setFormData({
      name: villa.name,
      slug: villa.slug,
      description: villa.description || "",
      location: villa.location || "",
      zone: villa.zone || "Udaipur Sanctuary Enclave",
      latitude: villa.latitude !== undefined ? villa.latitude : 24.5760,
      longitude: villa.longitude !== undefined ? villa.longitude : 73.6780,
      mapX: villa.mapX !== undefined ? villa.mapX : 50,
      mapY: villa.mapY !== undefined ? villa.mapY : 50,
      pricePerNight: villa.pricePerNight,
      maxGuests: villa.maxGuests,
      bedrooms: villa.bedrooms || 1,
      bathrooms: villa.bathrooms || 1,
      amenities: Array.isArray(villa.amenities) ? villa.amenities.join(", ") : "",
      houseRules: Array.isArray(villa.houseRules) ? villa.houseRules.join(", ") : "",
      cancellationPolicy: villa.cancellationPolicy || "",
      status: villa.status,
    });
    setImagesList(normalizeImages(villa.images));
    setFormError("");
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof UDAIPUR_LOCATION_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      zone: preset.name,
      latitude: preset.lat,
      longitude: preset.lng,
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
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Image upload failed";
        setFormError(msg);
      }
    }

    if (newUploaded.length > 0) {
      setImagesList((prev) => [...prev, ...newUploaded]);
    }
    setUploadingImages(false);
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    setImagesList((prev) => [...prev, { url: manualUrl.trim(), publicId: "" }]);
    setManualUrl("");
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imagesList.length) return;
    setImagesList((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
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
    setSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || undefined,
      description: formData.description.trim(),
      location: formData.location.trim(),
      zone: formData.zone.trim(),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      mapX: Number(formData.mapX),
      mapY: Number(formData.mapY),
      pricePerNight: Number(formData.pricePerNight),
      maxGuests: Number(formData.maxGuests),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      images: imagesList,
      amenities: formData.amenities
        ? formData.amenities.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      houseRules: formData.houseRules
        ? formData.houseRules.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
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
    const matchesSearch =
      villa.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (villa.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (villa.zone || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || villa.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6E685F] dark:text-[#A9A39A]" />
            <input
              type="text"
              placeholder="Search villa name, zone, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs text-[#171513] dark:text-[#F4EFE5] placeholder-[#6E685F] dark:placeholder-[#A9A39A] focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
            className="w-full sm:w-44 px-3 py-2 rounded-lg bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-medium text-[#171513] dark:text-[#F4EFE5] focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
          >
            <option value="ALL">All Statuses ({villas.length})</option>
            <option value="ACTIVE">ACTIVE only</option>
            <option value="INACTIVE">INACTIVE only</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-[#171513] dark:bg-[#C89B4A] text-white dark:text-[#0B0B0A] hover:bg-[#302D28] dark:hover:bg-[#b0853c] transition-colors shadow-xs flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Villa</span>
        </button>
      </div>

      {/* Villa Portfolio Table */}
      <div className="bg-white dark:bg-[#151412] rounded-xl border border-[#DDD5C7] dark:border-[#302D28] overflow-hidden shadow-xs">
        {filteredVillas.length === 0 ? (
          <div className="p-12 text-center text-[#6E685F] dark:text-[#A9A39A] space-y-3">
            <ImageIcon className="w-10 h-10 mx-auto text-[#6E685F]/40 dark:text-[#A9A39A]/40" />
            <h3 className="font-semibold text-[#171513] dark:text-[#F4EFE5] text-sm">No villas found</h3>
            <p className="text-xs max-w-sm mx-auto">
              Click the button below to add your first property residence.
            </p>
            <button
              onClick={openAddModal}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#171513] dark:bg-[#C89B4A] text-white dark:text-[#0B0B0A]"
            >
              Add Villa
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F2EC]/60 dark:bg-[#1C1A17]/60 border-b border-[#DDD5C7] dark:border-[#302D28] text-[#6E685F] dark:text-[#A9A39A] uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-3 px-4">Villa Residence</th>
                  <th className="py-3 px-4">Udaipur Zone / Location</th>
                  <th className="py-3 px-4 text-right">Price / Night</th>
                  <th className="py-3 px-4 text-center">Capacity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD5C7]/40 dark:divide-[#302D28]/60 text-[#171513] dark:text-[#F4EFE5]">
                {filteredVillas.map((villa) => {
                  const coverImage = getPrimaryVillaImageUrl(villa.images);
                  const isDeleting = deletingId === villa._id;

                  return (
                    <tr key={villa._id} className="hover:bg-[#F5F2EC]/50 dark:hover:bg-[#1C1A17]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F5F2EC] dark:bg-[#1C1A17] border border-[#DDD5C7]/60 dark:border-[#302D28] flex-shrink-0">
                            <Image
                              src={coverImage}
                              alt={villa.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-serif font-bold text-[#171513] dark:text-[#F4EFE5] text-sm">{villa.name}</div>
                            <div className="text-[11px] text-[#6E685F] dark:text-[#A9A39A] font-mono">/villas/{villa.slug}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#6E685F] dark:text-[#A9A39A]">
                        <div className="font-medium text-[#171513] dark:text-[#F4EFE5]">{villa.zone || "Udaipur, Rajasthan"}</div>
                        <div className="text-[11px] truncate max-w-xs">{villa.location || "Daranga Sanctuary"}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-sans font-bold text-[#171513] dark:text-[#F4EFE5]">
                        {formatCurrency(villa.pricePerNight)}
                      </td>

                      <td className="py-3.5 px-4 text-center text-[#6E685F] dark:text-[#A9A39A]">
                        {villa.maxGuests} Guests • {villa.bedrooms || 1} Bed
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                            villa.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40"
                          }`}
                        >
                          {villa.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(villa)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] text-[#171513] dark:text-[#F4EFE5] border border-[#DDD5C7] dark:border-[#302D28] hover:bg-[#DDD5C7]/50 dark:hover:bg-[#302D28] transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(villa._id, villa.status)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                            villa.status === "ACTIVE"
                              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100"
                              : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100"
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{villa.status === "ACTIVE" ? "Deactivate" : "Activate"}</span>
                        </button>

                        <button
                          disabled={isDeleting}
                          onClick={() => handleDeleteVilla(villa)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-[#151412] rounded-2xl border border-[#DDD5C7] dark:border-[#302D28] shadow-2xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#DDD5C7]/70 dark:border-[#302D28] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#171513] dark:text-[#F4EFE5]">
                  {editingVilla ? `Edit Villa: ${editingVilla.name}` : "Create New Luxury Villa"}
                </h3>
                <p className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
                  Set property details, interactive map positioning in Udaipur, pricing, and media gallery.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6E685F] hover:text-[#171513] dark:text-[#A9A39A] dark:hover:text-[#F4EFE5] hover:bg-[#F5F2EC] dark:hover:bg-[#1C1A17] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs">
                  {formError}
                </div>
              )}

              {/* SECTION 1: BASIC INFO */}
              <div className="p-4 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28] space-y-4">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#A8792E] dark:text-[#C89B4A] border-b border-[#DDD5C7]/40 dark:border-[#302D28] pb-2">
                  1. Basic Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      Villa Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. The Celestial Residence"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      Slug Identifier (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g. celestial-residence"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                    Editorial Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe villa highlights, lake views, architectural aesthetics..."
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
                  />
                </div>
              </div>

              {/* SECTION 2: INTERACTIVE UDAIPUR MAP LOCATION & PINPOINT */}
              <div className="p-4 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28] space-y-4">
                <div className="flex items-center justify-between border-b border-[#DDD5C7]/40 dark:border-[#302D28] pb-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#A8792E] dark:text-[#C89B4A] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C89B4A]" />
                    <span>2. Udaipur Location &amp; Interactive Map Pinpoint</span>
                  </h4>
                  <span className="text-[10px] text-[#6E685F] dark:text-[#A9A39A] font-mono">
                    Pin: {formData.mapX}%, {formData.mapY}% (GPS: {formData.latitude}, {formData.longitude})
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-[#6E685F] dark:text-[#A9A39A]">
                    Quick Location Presets (Click to Auto-Position Pin):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {UDAIPUR_LOCATION_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                          formData.zone === preset.name
                            ? "bg-[#C89B4A] text-[#0B0B0A] shadow-xs"
                            : "bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-[#171513] dark:text-[#F4EFE5] hover:border-[#C89B4A]"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real Interactive Map Canvas */}
                <AdminLocationPickerMap
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  villaName={formData.name}
                  onChangeCoordinates={(lat, lng) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                    }));
                  }}
                />

                {/* Location Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      Udaipur Zone / Area Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                      placeholder="e.g. Lake Pichola Waterfront, Rani Road"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      Full Address / Street Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Haridas Ji Ki Magri, Pichola West Bank, Udaipur"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      Latitude (°N)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      Longitude (°E)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      Map X Pos (%)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="95"
                      value={formData.mapX}
                      onChange={(e) => setFormData({ ...formData, mapX: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      Map Y Pos (%)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="95"
                      value={formData.mapY}
                      onChange={(e) => setFormData({ ...formData, mapY: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: PROPERTY DETAILS & PRICING */}
              <div className="p-4 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28] space-y-4">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#A8792E] dark:text-[#C89B4A] border-b border-[#DDD5C7]/40 dark:border-[#302D28] pb-2">
                  3. Property Details &amp; Pricing
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      Price / Night (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.pricePerNight}
                      onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-sans font-bold focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      Max Guests *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.maxGuests}
                      onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: AMENITIES */}
              <div className="p-4 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28] space-y-3">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#A8792E] dark:text-[#C89B4A] border-b border-[#DDD5C7]/40 dark:border-[#302D28] pb-2">
                  4. Amenities &amp; Features
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                    Amenities List (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    placeholder="Private Infinity Pool, Wi-Fi, Butler Service, Gourmet Kitchen"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
                  />
                </div>
              </div>

              {/* SECTION 5: HOUSE RULES & CANCELLATION */}
              <div className="p-4 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28] space-y-4">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#A8792E] dark:text-[#C89B4A] border-b border-[#DDD5C7]/40 dark:border-[#302D28] pb-2">
                  5. House Rules &amp; Cancellation Policy
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      House Rules (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.houseRules}
                      onChange={(e) => setFormData({ ...formData, houseRules: e.target.value })}
                      placeholder="No smoking indoors, Quiet hours after 10 PM"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                      Cancellation Policy
                    </label>
                    <input
                      type="text"
                      value={formData.cancellationPolicy}
                      onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                      placeholder="Full refund 7 days prior to check-in"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs focus:outline-none focus:ring-1 focus:ring-[#A8792E] dark:focus:ring-[#C89B4A]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: CLOUDINARY IMAGES MANAGER */}
              <div className="p-4 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28] space-y-4">
                <div className="flex items-center justify-between border-b border-[#DDD5C7]/40 dark:border-[#302D28] pb-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#A8792E] dark:text-[#C89B4A]">
                    6. Cloudinary Image Gallery
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                    className="text-[11px] font-semibold text-[#A8792E] dark:text-[#C89B4A] hover:underline"
                  >
                    {showManualUrlInput ? "Hide URL input" : "+ Add image via URL"}
                  </button>
                </div>

                {/* Upload Dropzone */}
                <div className="border-2 border-dashed border-[#DDD5C7] dark:border-[#302D28] rounded-xl p-5 text-center bg-white/60 dark:bg-[#151412]/60 hover:bg-white dark:hover:bg-[#151412] transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageFilesUpload(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-1">
                    <UploadCloud className="w-8 h-8 mx-auto text-[#A8792E] dark:text-[#C89B4A]" />
                    <p className="text-xs font-semibold text-[#171513] dark:text-[#F4EFE5]">
                      Click or drag &amp; drop images to upload to Cloudinary
                    </p>
                    <p className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
                      Supports WEBP, JPG, PNG, AVIF (Max 10MB per file)
                    </p>
                  </div>
                </div>

                {showManualUrlInput && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualUrl}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] text-[#171513] dark:text-[#F4EFE5] border border-[#DDD5C7] dark:border-[#302D28]"
                    >
                      Add URL
                    </button>
                  </div>
                )}

                {uploadingImages && (
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-700 dark:text-amber-400 text-xs">
                    Uploading image(s) to Cloudinary...
                  </div>
                )}

                {/* Attached Gallery Grid */}
                {imagesList.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
                      <span>{imagesList.length} Image(s) Attached</span>
                      <span>The 1st image is the <strong>Primary Cover Image</strong></span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {imagesList.map((img, idx) => (
                        <div
                          key={idx}
                          className={`relative group rounded-lg overflow-hidden border bg-black transition-all ${
                            idx === 0
                              ? "border-[#A8792E] dark:border-[#C89B4A] ring-2 ring-[#A8792E]/20"
                              : "border-[#DDD5C7] dark:border-[#302D28]"
                          }`}
                        >
                          <div className="relative aspect-[4/3] w-full">
                            <Image
                              src={img.url}
                              alt={`Villa ${idx + 1}`}
                              fill
                              sizes="200px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveImage(idx, idx - 1)}
                                className="w-7 h-7 rounded bg-black/80 text-white flex items-center justify-center text-xs hover:bg-[#A8792E] disabled:opacity-30"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === imagesList.length - 1}
                                onClick={() => moveImage(idx, idx + 1)}
                                className="w-7 h-7 rounded bg-black/80 text-white flex items-center justify-center text-xs hover:bg-[#A8792E] disabled:opacity-30"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="w-7 h-7 rounded bg-red-800 text-white flex items-center justify-center text-xs hover:bg-red-900"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="p-1 bg-[#171513] text-white flex items-center justify-between text-[10px] px-2">
                            <span className="font-mono text-stone-400">#{idx + 1}</span>
                            {idx === 0 && (
                              <span className="font-bold text-[#C89B4A] uppercase tracking-wider">
                                Primary Cover
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Select */}
              <div className="p-4 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17]/40 border border-[#DDD5C7]/60 dark:border-[#302D28]">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A] mb-1">
                  Listing Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-semibold text-[#171513] dark:text-[#F4EFE5]"
                >
                  <option value="ACTIVE">ACTIVE (Visible on public customer website)</option>
                  <option value="INACTIVE">INACTIVE (Draft / Hidden from public website)</option>
                </select>
              </div>

              {/* Form Footer */}
              <div className="pt-3 border-t border-[#DDD5C7]/70 dark:border-[#302D28] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] text-[#171513] dark:text-[#F4EFE5] border border-[#DDD5C7] dark:border-[#302D28]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImages}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#171513] dark:bg-[#C89B4A] text-white dark:text-[#0B0B0A] hover:bg-[#302D28] dark:hover:bg-[#b0853c] transition-colors"
                >
                  {submitting ? "Saving..." : editingVilla ? "Save Changes" : "Create Villa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
