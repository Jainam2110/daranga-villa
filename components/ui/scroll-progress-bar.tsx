"use client";

import React, { useEffect, useState } from "react";

export function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(Math.min(Math.max(currentProgress, 0), 100));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-[var(--accent)] via-[#ecd5a8] to-[var(--accent)] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(200,155,74,0.6)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
