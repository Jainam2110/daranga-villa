import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function VillaNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-stone-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-24 bg-stone-50">
        <Container size="narrow" className="text-center">
          <div className="p-12 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-6 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-maroon-50 text-maroon-800 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="font-serif text-3xl font-bold text-stone-900">
              Villa Residence Not Found
            </h1>

            <p className="text-stone-600 text-sm leading-relaxed font-light">
              The private villa you are looking for does not exist or is currently inactive. Please explore our active villa portfolio.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/villas">
                <Button variant="primary" size="md" className="bg-maroon-800 hover:bg-maroon-900">
                  View Villa Collection
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="md">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
