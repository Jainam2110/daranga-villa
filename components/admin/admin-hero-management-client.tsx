"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Edit2,
  UploadCloud,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  Sliders,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { HeroSlideData } from "@/lib/api/hero-slides";

interface AdminHeroManagementClientProps {
  initialSlides: HeroSlideData[];
}

export function AdminHeroManagementClient({
  initialSlides,
}: AdminHeroManagementClientProps) {
  const [slides, setSlides] = useState<HeroSlideData[]>(initialSlides);
  const [loading, setLoading] = useState(false);
  const [savingReorder, setSavingReorder] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlideData | null>(null);
  const [formData, setFormData] = useState({
    url: "",
    title: "Villas For\nLuxury Living",
    tagline: "DARANGA SANCTUARIES",
    subtitle: "Where timeless heritage meets private modern luxury",
    caption: "The Grand Sanctuary Estate",
    publicId: "",
    isActive: true,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormData({
      url: "",
      title: "Villas For\nLuxury Living",
      tagline: "DARANGA SANCTUARIES",
      subtitle: "Where timeless heritage meets private modern luxury",
      caption: "",
      publicId: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slide: HeroSlideData) => {
    setEditingSlide(slide);
    setFormData({
      url: slide.url,
      title: slide.title || "Villas For\nLuxury Living",
      tagline: slide.tagline || "DARANGA SANCTUARIES",
      subtitle: slide.subtitle || "",
      caption: slide.caption || "",
      publicId: slide.publicId || "",
      isActive: slide.isActive,
    });
    setIsModalOpen(true);
  };

  // Cloudinary direct upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showFeedback("error", `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("category", "hero");

      const res = await fetch("/api/admin/cloudinary/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Image upload failed");
      }

      const uploadedUrl = data.url || data.image?.url;
      const uploadedPublicId = data.publicId || data.image?.publicId || "";

      if (!uploadedUrl) {
        throw new Error("No image URL returned from Cloudinary upload.");
      }

      setFormData((prev) => ({
        ...prev,
        url: uploadedUrl,
        publicId: uploadedPublicId,
      }));
      showFeedback("success", "Hero image uploaded to Cloudinary successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      showFeedback("error", msg);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Save (Create or Update) Slide
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url.trim()) {
      showFeedback("error", "Image URL is required");
      return;
    }

    setLoading(true);
    try {
      if (editingSlide) {
        const slideId = editingSlide._id || editingSlide.id;
        const res = await fetch(`/api/admin/hero-slides/${slideId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");

        setSlides((prev) =>
          prev.map((s) => ((s._id || s.id) === slideId ? { ...s, ...formData } : s))
        );
        showFeedback("success", "Hero slide updated successfully!");
      } else {
        const res = await fetch("/api/admin/hero-slides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Creation failed");

        setSlides((prev) => [...prev, data.slide]);
        showFeedback("success", "New hero slide added to homepage slideshow!");
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      showFeedback("error", msg);
    } finally {
      setLoading(false);
    }
  };

  // Delete Slide
  const handleDelete = async (slide: HeroSlideData) => {
    const slideId = slide._id || slide.id;
    if (!slideId) return;

    if (!confirm(`Are you sure you want to remove this hero slide?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/hero-slides/${slideId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete slide");
      }

      setSlides((prev) => prev.filter((s) => (s._id || s.id) !== slideId));
      showFeedback("success", "Hero slide removed successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      showFeedback("error", msg);
    }
  };

  // Reordering
  const moveSlide = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIdx];
    newSlides[targetIdx] = temp;

    setSlides(newSlides);
  };

  const handleSaveReorder = async () => {
    setSavingReorder(true);
    try {
      const res = await fetch("/api/admin/hero-slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reorder save failed");

      setSlides(data.slides);
      showFeedback("success", "Slides order updated and published!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      showFeedback("error", msg);
    } finally {
      setSavingReorder(false);
    }
  };

  const toggleActiveStatus = async (slide: HeroSlideData) => {
    const slideId = slide._id || slide.id;
    if (!slideId) return;

    const newStatus = !slide.isActive;
    try {
      const res = await fetch(`/api/admin/hero-slides/${slideId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!res.ok) throw new Error("Status update failed");

      setSlides((prev) =>
        prev.map((s) => ((s._id || s.id) === slideId ? { ...s, isActive: newStatus } : s))
      );
      showFeedback("success", `Slide ${newStatus ? "activated" : "hidden"} on live website.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Status change failed";
      showFeedback("error", msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-[#3F6B52]/10 text-[#3F6B52] border border-[#3F6B52]/30"
              : "bg-[#B84A4A]/10 text-[#B84A4A] border border-[#B84A4A]/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B99A62] block mb-1">
            HOMEPAGE CINEMATIC SLIDESHOW
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#202020] dark:text-[#FCFBF8]">
            Hero Slide Management
          </h2>
          <p className="text-xs text-[#66635F] dark:text-[#BDB8B0] mt-0.5">
            Add high-resolution photography, configure 2-line center titles, and adjust slide rotation order.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveReorder}
            disabled={savingReorder}
            className="px-4 py-2.5 rounded-xl border border-[#DAD7D1] dark:border-[#383633] hover:border-[#202020] dark:hover:border-[#B99A62] bg-[#F7F6F3] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${savingReorder ? "animate-spin text-[#B99A62]" : ""}`} />
            <span>{savingReorder ? "Saving..." : "Save Order"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-[#202020] hover:bg-[#171717] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hero Slide</span>
          </button>
        </div>
      </div>

      {/* Slides Grid List */}
      <div className="space-y-4">
        {slides.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] space-y-3">
            <ImageIcon className="w-10 h-10 text-[#B99A62] mx-auto opacity-50" />
            <h3 className="font-serif text-lg font-bold text-[#202020] dark:text-[#FCFBF8]">
              No Hero Slides Found
            </h3>
            <p className="text-xs text-[#66635F] dark:text-[#BDB8B0] max-w-sm mx-auto">
              Click &quot;Add Hero Slide&quot; to upload your first luxury background photograph for the homepage.
            </p>
          </div>
        ) : (
          slides.map((slide, idx) => (
            <div
              key={slide._id || slide.id || idx}
              className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#202020] border transition-all duration-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                slide.isActive
                  ? "border-[#E8E6E2] dark:border-[#383633] hover:border-[#202020] dark:hover:border-[#B99A62]"
                  : "border-dashed border-[#DAD7D1] dark:border-[#383633] opacity-60 bg-[#F7F6F3]/50 dark:bg-[#171717]/50"
              }`}
            >
              {/* Left: Thumbnail & Content Details */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Index badge */}
                <span className="font-mono text-xs font-bold text-[#202020] dark:text-[#FCFBF8] w-6 text-center">
                  #{idx + 1}
                </span>

                {/* Image Thumbnail with Overlay Preview */}
                <div className="relative w-28 sm:w-36 h-20 sm:h-24 rounded-xl overflow-hidden bg-[#202020] flex-shrink-0 border border-black/20 shadow-md">
                  <Image
                    src={slide.url}
                    alt={slide.title}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-1 text-center">
                    <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#B99A62] font-bold">
                      {slide.tagline}
                    </span>
                    <h4 className="font-serif text-[10px] text-white font-medium leading-tight whitespace-pre-line line-clamp-2 drop-shadow-md">
                      {slide.title}
                    </h4>
                  </div>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#F5D0B5]/30 text-[#B99A62] text-[9px] font-mono font-bold uppercase tracking-wider">
                      {slide.tagline || "HERO SLIDE"}
                    </span>
                    {!slide.isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-[#F7F6F3] dark:bg-[#171717] text-[#66635F] dark:text-[#BDB8B0] text-[9px] font-semibold uppercase">
                        Inactive / Hidden
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#202020] dark:text-[#FCFBF8] truncate whitespace-pre-line">
                    {slide.title.replace("\n", " — ")}
                  </h3>

                  {slide.subtitle && (
                    <p className="text-xs text-[#66635F] dark:text-[#BDB8B0] truncate font-light">
                      {slide.subtitle}
                    </p>
                  )}

                  <p className="text-[10px] font-mono text-[#8A8782] truncate max-w-md">
                    {slide.url}
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-[#E8E6E2] dark:border-[#383633]">
                {/* Reorder Buttons */}
                <div className="flex items-center bg-[#F7F6F3] dark:bg-[#171717] rounded-xl border border-[#E8E6E2] dark:border-[#383633] p-0.5">
                  <button
                    type="button"
                    onClick={() => moveSlide(idx, "up")}
                    disabled={idx === 0}
                    aria-label="Move Up"
                    title="Move Up"
                    className="p-1.5 rounded-lg text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-white disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSlide(idx, "down")}
                    disabled={idx === slides.length - 1}
                    aria-label="Move Down"
                    title="Move Down"
                    className="p-1.5 rounded-lg text-[#66635F] dark:text-[#BDB8B0] hover:text-[#202020] dark:hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Toggle Active Status */}
                <button
                  type="button"
                  onClick={() => toggleActiveStatus(slide)}
                  title={slide.isActive ? "Hide from website" : "Show on website"}
                  className={`p-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                    slide.isActive
                      ? "bg-[#3F6B52]/10 text-[#3F6B52] border border-[#3F6B52]/30"
                      : "bg-[#8A8782]/10 text-[#66635F] border border-[#DAD7D1]"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{slide.isActive ? "Active" : "Hidden"}</span>
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(slide)}
                  title="Edit Slide"
                  className="p-2 rounded-xl bg-[#F7F6F3] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] border border-[#DAD7D1] dark:border-[#383633] hover:border-[#202020] dark:hover:border-[#B99A62] transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(slide)}
                  title="Delete Slide"
                  className="p-2 rounded-xl bg-[#B84A4A]/10 text-[#B84A4A] border border-[#B84A4A]/30 hover:bg-[#B84A4A]/20 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#202020] text-[#202020] dark:text-[#FCFBF8] rounded-2xl border border-[#E8E6E2] dark:border-[#383633] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E8E6E2] dark:border-[#383633] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#B99A62]" />
                <h3 className="font-serif text-lg font-bold">
                  {editingSlide ? "Edit Hero Slide" : "Add New Hero Slide"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8A8782] hover:text-[#202020] dark:hover:text-white hover:bg-[#F7F6F3] dark:hover:bg-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Image Upload / URL */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0]">
                  Slide Photograph *
                </label>

                {/* Image Preview if available */}
                {formData.url && (
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] shadow-sm group">
                    <Image
                      src={formData.url}
                      alt="Hero slide preview"
                      fill
                      sizes="480px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#B99A62] font-bold">
                        {formData.tagline}
                      </span>
                      <h4 className="font-serif text-xl text-white font-normal leading-tight whitespace-pre-line mt-1 drop-shadow-md">
                        {formData.title}
                      </h4>
                    </div>
                  </div>
                )}

                {/* Cloudinary File Upload Dropzone / Button */}
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/avif, image/gif"
                    className="hidden"
                  />
                  <div
                    onClick={() => !uploadingImage && fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (uploadingImage) return;
                      const droppedFile = e.dataTransfer.files?.[0];
                      if (droppedFile) {
                        const fakeEvent = {
                          target: { files: [droppedFile] },
                        } as unknown as React.ChangeEvent<HTMLInputElement>;
                        handleFileUpload(fakeEvent);
                      }
                    }}
                    className={`cursor-pointer w-full py-5 px-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 text-center ${
                      uploadingImage
                        ? "border-[#B99A62] bg-[#B99A62]/10 opacity-80 cursor-wait"
                        : "border-[#DAD7D1] dark:border-[#383633] hover:border-[#202020] dark:hover:border-[#B99A62] bg-[#F7F6F3]/50 dark:bg-[#171717]/40"
                    }`}
                  >
                    <UploadCloud className={`w-6 h-6 text-[#B99A62] ${uploadingImage ? "animate-bounce" : ""}`} />
                    <div>
                      <p className="text-xs font-bold text-[#202020] dark:text-[#FCFBF8]">
                        {uploadingImage ? "Uploading to Cloudinary..." : "Click to select photo or Drag & Drop"}
                      </p>
                      <p className="text-[10px] text-[#8A8782] mt-0.5">
                        High-resolution JPG, PNG, WEBP up to 10MB
                      </p>
                    </div>
                  </div>

                  {formData.publicId && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#3F6B52] font-mono">
                      <Check className="w-3 h-3" />
                      <span>Cloudinary Asset: {formData.publicId}</span>
                    </div>
                  )}

                  <div className="relative flex items-center gap-2 pt-1">
                    <div className="flex-1 h-px bg-[#E8E6E2] dark:border-[#383633]" />
                    <span className="text-[10px] uppercase tracking-wider text-[#8A8782] font-semibold px-1">or URL</span>
                    <div className="flex-1 h-px bg-[#E8E6E2] dark:border-[#383633]" />
                  </div>

                  <div>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value, publicId: "" }))}
                      placeholder="Paste public image URL (https://...)"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8] placeholder-[#8A8782] focus:outline-none focus:border-[#202020] dark:focus:border-[#B99A62]"
                    />
                  </div>
                </div>
              </div>

              {/* Center Headline Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0]">
                  Center Headline (2-Line Serif Title) *
                </label>
                <textarea
                  rows={2}
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Villas For&#10;Luxury Living"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs font-serif text-[#202020] dark:text-[#FCFBF8] placeholder-[#8A8782] focus:outline-none focus:border-[#202020] dark:focus:border-[#B99A62]"
                />
                <p className="text-[10px] text-[#8A8782]">
                  Tip: Press Enter between words to create a 2-line title matching the mobile reference design.
                </p>
              </div>

              {/* Tagline / Eyebrow */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0]">
                  Tagline Badge
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. DARANGA SANCTUARIES, PRIVATE INFINITY POOLS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8] placeholder-[#8A8782] focus:outline-none focus:border-[#202020] dark:focus:border-[#B99A62]"
                />
              </div>

              {/* Subtitle / Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#66635F] dark:text-[#BDB8B0]">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Where timeless heritage meets private modern luxury"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F6F3] dark:bg-[#171717] border border-[#DAD7D1] dark:border-[#383633] text-xs text-[#202020] dark:text-[#FCFBF8] placeholder-[#8A8782] focus:outline-none focus:border-[#202020] dark:focus:border-[#B99A62]"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#202020] focus:ring-[#202020]"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-[#202020] dark:text-[#FCFBF8] cursor-pointer">
                  Display this slide in active slideshow
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#E8E6E2] dark:border-[#383633] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#DAD7D1] dark:border-[#383633] text-xs uppercase tracking-wider font-semibold hover:bg-[#F7F6F3] dark:hover:bg-[#171717]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-[#202020] hover:bg-[#171717] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold shadow-md disabled:opacity-50"
                >
                  {loading ? "Saving Slide..." : editingSlide ? "Save Changes" : "Create Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
