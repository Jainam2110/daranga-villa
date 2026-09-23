"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils/pricing";
import { Edit2, Check, X } from "lucide-react";

export interface SerializedPricingVilla {
  _id: string;
  name: string;
  slug: string;
  location: string;
  pricePerNight: number;
  maxGuests: number;
  status: "ACTIVE" | "INACTIVE";
}

interface AdminPricingClientProps {
  initialVillas: SerializedPricingVilla[];
}

export function AdminPricingClient({ initialVillas }: AdminPricingClientProps) {
  const [villas, setVillas] = useState<SerializedPricingVilla[]>(initialVillas);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStartEdit = (villa: SerializedPricingVilla) => {
    setEditingId(villa._id);
    setNewPrice(villa.pricePerNight);
    setErrorMsg("");
  };

  const handleSavePrice = async (villaId: string) => {
    if (newPrice <= 0) {
      setErrorMsg("Price must be greater than zero.");
      return;
    }
    setSaving(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/villas/${villaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricePerNight: newPrice }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update price.");
      }

      setVillas((prev) =>
        prev.map((v) => (v._id === villaId ? { ...v, pricePerNight: newPrice } : v))
      );
      setEditingId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {villas.map((villa) => {
          const isEditing = editingId === villa._id;

          return (
            <div
              key={villa._id}
              className="p-5 rounded-xl bg-white dark:bg-[#151412] border border-[#DDD5C7] dark:border-[#302D28] shadow-xs space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-[#DDD5C7]/60 dark:border-[#302D28] pb-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#171513] dark:text-[#F4EFE5]">
                    {villa.name}
                  </h3>
                  <p className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
                    {villa.location || "Daranga Estate"}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                    villa.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                  }`}
                >
                  {villa.status}
                </span>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-lg bg-[#F5F2EC]/50 dark:bg-[#1C1A17]/50 border border-[#DDD5C7]/60 dark:border-[#302D28] space-y-2">
                <span className="text-[10px] uppercase font-semibold text-[#6E685F] dark:text-[#A9A39A] tracking-wider block">
                  Nightly Base Rate
                </span>

                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-base text-[#171513] dark:text-[#F4EFE5]">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#151412] border border-[#A8792E] dark:border-[#C89B4A] font-sans font-bold text-base text-[#171513] dark:text-[#F4EFE5]"
                    />
                  </div>
                ) : (
                  <div className="font-sans text-2xl font-bold text-[#171513] dark:text-[#F4EFE5]">
                    {formatCurrency(villa.pricePerNight)}
                    <span className="text-xs font-normal text-[#6E685F] dark:text-[#A9A39A] ml-1">
                      / night
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#6E685F] dark:text-[#A9A39A]">
                  Max Capacity: <strong>{villa.maxGuests} Guests</strong>
                </span>

                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F5F2EC] dark:bg-[#1C1A17] text-[#171513] dark:text-[#F4EFE5] border border-[#DDD5C7] dark:border-[#302D28]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSavePrice(villa._id)}
                      disabled={saving}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#171513] dark:bg-[#C89B4A] text-white dark:text-[#0B0B0A] flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{saving ? "Saving..." : "Save"}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(villa)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#A8792E] dark:text-[#C89B4A] hover:underline"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Rate</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
