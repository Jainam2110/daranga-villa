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
        <div className="p-3.5 rounded-xl bg-[#B84A4A]/10 border border-[#B84A4A]/30 text-[#B84A4A] text-xs flex items-center justify-between">
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
              className="p-5 rounded-xl bg-white dark:bg-[#202020] border border-[#E8E6E2] dark:border-[#383633] shadow-xs space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-[#E8E6E2] dark:border-[#383633] pb-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#202020] dark:text-[#FCFBF8]">
                    {villa.name}
                  </h3>
                  <p className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">
                    {villa.location || "Daranga Estate"}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider border ${
                    villa.status === "ACTIVE"
                      ? "bg-[#3F6B52]/10 text-[#3F6B52] border-[#3F6B52]/30"
                      : "bg-[#8A8782]/10 text-[#66635F] border-[#DAD7D1]"
                  }`}
                >
                  {villa.status}
                </span>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-lg bg-[#F7F6F3] dark:bg-[#171717] border border-[#E8E6E2] dark:border-[#383633] space-y-2">
                <span className="text-[10px] uppercase font-semibold text-[#66635F] dark:text-[#BDB8B0] tracking-wider block">
                  Nightly Base Rate
                </span>

                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-base text-[#202020] dark:text-[#FCFBF8]">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#202020] border border-[#202020] dark:border-[#B99A62] font-sans font-bold text-base text-[#202020] dark:text-[#FCFBF8]"
                    />
                  </div>
                ) : (
                  <div className="font-sans text-2xl font-bold text-[#202020] dark:text-[#FCFBF8]">
                    {formatCurrency(villa.pricePerNight)}
                    <span className="text-xs font-normal text-[#66635F] dark:text-[#BDB8B0] ml-1">
                      / night
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#66635F] dark:text-[#BDB8B0]">
                  Max Capacity: <strong>{villa.maxGuests} Guests</strong>
                </span>

                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F7F6F3] dark:bg-[#171717] text-[#202020] dark:text-[#FCFBF8] border border-[#DAD7D1] dark:border-[#383633]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSavePrice(villa._id)}
                      disabled={saving}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#202020] hover:bg-[#171717] text-white flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{saving ? "Saving..." : "Save"}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(villa)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#202020] dark:text-[#FCFBF8] hover:text-[#B99A62] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#B99A62]" />
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
