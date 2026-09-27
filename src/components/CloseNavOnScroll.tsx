"use client";

import { useEffect } from "react";

export function CloseNavOnScroll() {
  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 8) return;
      lastY = y;

      const toggle = document.getElementById("nav-open");
      if (toggle instanceof HTMLInputElement && toggle.checked) {
        toggle.checked = false;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
