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
  Sparkles,
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
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8792E] dark:text-[#C89B4A] block mb-1">
            HOMEPAGE CINEMATIC SLIDESHOW
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#171513] dark:text-[#F4EFE5]">
            Hero Slide Management
          </h2>
          <p className="text-xs text-[#6E685F] dark:text-[#A9A39A] mt-0.5">
            Add high-resolution photography, configure 2-line center titles, and adjust slide rotation order.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveReorder}
            disabled={savingReorder}
            className="px-4 py-2.5 rounded-xl border border-[#DDD5C7] dark:border-[#302D28] hover:border-[#A8792E] dark:hover:border-[#C89B4A] bg-[#F5F2EC]/50 dark:bg-[#1C1A17] text-[#171513] dark:text-[#F4EFE5] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${savingReorder ? "animate-spin text-[#C89B4A]" : ""}`} />
            <span>{savingReorder ? "Saving..." : "Save Order"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hero Slide</span>
          </button>
        </div>
      </div>

      {/* Slides Grid List */}
      <div className="space-y-4">
        {slides.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] space-y-3">
            <ImageIcon className="w-10 h-10 text-[#A8792E] dark:text-[#C89B4A] mx-auto opacity-50" />
            <h3 className="font-serif text-lg font-bold text-[#171513] dark:text-[#F4EFE5]">
              No Hero Slides Found
            </h3>
            <p className="text-xs text-[#6E685F] dark:text-[#A9A39A] max-w-sm mx-auto">
              Click &quot;Add Hero Slide&quot; to upload your first luxury background photograph for the homepage.
            </p>
          </div>
        ) : (
          slides.map((slide, idx) => (
            <div
              key={slide._id || slide.id || idx}
              className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#151412] border transition-all duration-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                slide.isActive
                  ? "border-[#DDD5C7] dark:border-[#302D28] hover:border-[#A8792E]/60 dark:hover:border-[#C89B4A]/60"
                  : "border-dashed border-[#DDD5C7] dark:border-[#302D28] opacity-60 bg-[#F5F2EC]/30 dark:bg-[#1C1A17]/30"
              }`}
            >
              {/* Left: Thumbnail & Content Details */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Index badge */}
                <span className="font-mono text-xs font-bold text-[#A8792E] dark:text-[#C89B4A] w-6 text-center">
                  #{idx + 1}
                </span>

                {/* Image Thumbnail with Overlay Preview */}
                <div className="relative w-28 sm:w-36 h-20 sm:h-24 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-black/20 shadow-md">
                  <Image
                    src={slide.url}
                    alt={slide.title}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                    <span className="font-serif text-[10px] text-white font-medium leading-tight whitespace-pre-line line-clamp-2 drop-shadow-md">
                      {slide.title}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#A8792E]/10 dark:bg-[#C89B4A]/15 text-[#A8792E] dark:text-[#C89B4A] text-[9px] font-mono font-bold uppercase tracking-wider">
                      {slide.tagline || "HERO SLIDE"}
                    </span>
                    {!slide.isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[9px] font-semibold uppercase">
                        Inactive / Hidden
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#171513] dark:text-[#F4EFE5] truncate whitespace-pre-line">
                    {slide.title.replace("\n", " — ")}
                  </h3>

                  {slide.subtitle && (
                    <p className="text-xs text-[#6E685F] dark:text-[#A9A39A] truncate font-light">
                      {slide.subtitle}
                    </p>
                  )}

                  <p className="text-[10px] font-mono text-stone-400 truncate max-w-md">
                    {slide.url}
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-[#DDD5C7]/60 dark:border-[#302D28]/60">
                {/* Reorder Buttons */}
                <div className="flex items-center bg-[#F5F2EC] dark:bg-[#1C1A17] rounded-xl border border-[#DDD5C7] dark:border-[#302D28] p-0.5">
                  <button
                    type="button"
                    onClick={() => moveSlide(idx, "up")}
                    disabled={idx === 0}
                    aria-label="Move Up"
                    title="Move Up"
                    className="p-1.5 rounded-lg text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-white disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSlide(idx, "down")}
                    disabled={idx === slides.length - 1}
                    aria-label="Move Down"
                    title="Move Down"
                    className="p-1.5 rounded-lg text-[#6E685F] dark:text-[#A9A39A] hover:text-[#171513] dark:hover:text-white disabled:opacity-30"
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
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-300 dark:border-stone-700"
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
                  className="p-2 rounded-xl bg-[#F5F2EC] dark:bg-[#1C1A17] text-[#171513] dark:text-[#F4EFE5] border border-[#DDD5C7] dark:border-[#302D28] hover:border-[#A8792E] dark:hover:border-[#C89B4A] transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(slide)}
                  title="Delete Slide"
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
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
          <div className="w-full max-w-lg bg-white dark:bg-[#151412] text-[#171513] dark:text-[#F4EFE5] rounded-2xl border border-[#DDD5C7] dark:border-[#302D28] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#DDD5C7]/70 dark:border-[#302D28] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#A8792E] dark:text-[#C89B4A]" />
                <h3 className="font-serif text-lg font-bold">
                  {editingSlide ? "Edit Hero Slide" : "Add New Hero Slide"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Image Upload / URL */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A]">
                  Slide Photograph *
                </label>

                {/* Image Preview if available */}
                {formData.url && (
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-[#DDD5C7] dark:border-[#302D28] shadow-sm group">
                    <Image
                      src={formData.url}
                      alt="Hero slide preview"
                      fill
                      sizes="480px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#C89B4A] font-bold">
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
                        ? "border-[#C89B4A] bg-[#C89B4A]/10 opacity-80 cursor-wait"
                        : "border-[#DDD5C7] dark:border-[#302D28] hover:border-[#A8792E] dark:hover:border-[#C89B4A] bg-[#F5F2EC]/30 dark:bg-[#1C1A17]/40 hover:bg-[#A8792E]/5 dark:hover:bg-[#C89B4A]/10"
                    }`}
                  >
                    <UploadCloud className={`w-6 h-6 text-[#A8792E] dark:text-[#C89B4A] ${uploadingImage ? "animate-bounce" : ""}`} />
                    <div>
                      <p className="text-xs font-bold text-[#171513] dark:text-[#F4EFE5]">
                        {uploadingImage ? "Uploading to Cloudinary..." : "Click to select photo or Drag & Drop"}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        High-resolution JPG, PNG, WEBP up to 10MB
                      </p>
                    </div>
                  </div>

                  {formData.publicId && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      <Check className="w-3 h-3" />
                      <span>Cloudinary Asset: {formData.publicId}</span>
                    </div>
                  )}

                  <div className="relative flex items-center gap-2 pt-1">
                    <div className="flex-1 h-px bg-[#DDD5C7] dark:bg-[#302D28]" />
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold px-1">or URL</span>
                    <div className="flex-1 h-px bg-[#DDD5C7] dark:bg-[#302D28]" />
                  </div>

                  <div>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value, publicId: "" }))}
                      placeholder="Paste public image URL (https://...)"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs text-[#171513] dark:text-[#F4EFE5] placeholder-stone-400 focus:outline-none focus:border-[#C89B4A]"
                    />
                  </div>
                </div>
              </div>

              {/* Center Headline Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A]">
                  Center Headline (2-Line Serif Title) *
                </label>
                <textarea
                  rows={2}
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Villas For&#10;Luxury Living"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs font-serif text-[#171513] dark:text-[#F4EFE5] placeholder-stone-400 focus:outline-none focus:border-[#C89B4A]"
                />
                <p className="text-[10px] text-stone-400">
                  Tip: Press Enter between words to create a 2-line title matching the mobile reference design.
                </p>
              </div>

              {/* Tagline / Eyebrow */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A]">
                  Tagline Badge
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. DARANGA SANCTUARIES, PRIVATE INFINITY POOLS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs text-[#171513] dark:text-[#F4EFE5] placeholder-stone-400 focus:outline-none focus:border-[#C89B4A]"
                />
              </div>

              {/* Subtitle / Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E685F] dark:text-[#A9A39A]">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Where timeless heritage meets private modern luxury"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC]/40 dark:bg-[#1C1A17] border border-[#DDD5C7] dark:border-[#302D28] text-xs text-[#171513] dark:text-[#F4EFE5] placeholder-stone-400 focus:outline-none focus:border-[#C89B4A]"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#C89B4A] focus:ring-[#C89B4A]"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-[#171513] dark:text-[#F4EFE5] cursor-pointer">
                  Display this slide in active slideshow
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#DDD5C7]/70 dark:border-[#302D28] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#DDD5C7] dark:border-[#302D28] text-xs uppercase tracking-wider font-semibold hover:bg-[#F5F2EC] dark:hover:bg-[#1C1A17]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-[#C89B4A] hover:bg-[#b5893a] text-[#0B0B0A] text-xs uppercase tracking-wider font-bold shadow-md hover:scale-105 active:scale-95 disabled:opacity-50"
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
