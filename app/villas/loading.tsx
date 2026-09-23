import React from "react";
import { Container } from "@/components/ui/container";

export default function VillasLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      {/* Header skeleton */}
      <div className="bg-stone-900 py-20 lg:py-28 text-white">
        <Container className="text-center">
          <div className="max-w-xl mx-auto space-y-4 animate-pulse">
            <div className="h-6 w-36 bg-stone-800 rounded-full mx-auto" />
            <div className="h-10 w-3/4 bg-stone-800 rounded-lg mx-auto" />
            <div className="h-4 w-5/6 bg-stone-800/80 rounded mx-auto" />
          </div>
        </Container>
      </div>

      {/* Grid skeleton */}
      <main className="flex-1 py-16 bg-stone-50">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 animate-pulse"
              >
                <div className="aspect-[16/10] bg-stone-200 rounded-xl w-full" />
                <div className="h-6 bg-stone-200 rounded w-2/3" />
                <div className="h-4 bg-stone-150 rounded w-1/2" />
                <div className="h-10 bg-stone-200 rounded-lg w-full pt-4" />
              </div>
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}
