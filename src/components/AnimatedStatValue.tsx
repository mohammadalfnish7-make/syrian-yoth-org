"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  easeOutCubic,
  formatStatValue,
  parseStatValue,
} from "@/lib/parse-stat-value";

type AnimatedStatValueProps = {
  value: string;
  className?: string;
  durationMs?: number;
};

function isInViewport(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

export function AnimatedStatValue({
  value,
  className,
  durationMs = 2000,
}: AnimatedStatValueProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = useMemo(() => parseStatValue(value), [value]);
  const [display, setDisplay] = useState(() => formatStatValue(0, parsed));

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    setDisplay(formatStatValue(0, parsed));

    let cancelled = false;
    let frame = 0;
    let observer: IntersectionObserver | null = null;

    const runCountUp = () => {
      if (cancelled) return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reducedMotion || parsed.numeric <= 0) {
        setDisplay(value);
        return;
      }

      let startTime = 0;

      const animate = (timestamp: number) => {
        if (cancelled) return;
        if (!startTime) startTime = timestamp;

        const progress = Math.min((timestamp - startTime) / durationMs, 1);
        const current = parsed.numeric * easeOutCubic(progress);
        setDisplay(formatStatValue(current, parsed));

        if (progress < 1) {
          frame = requestAnimationFrame(animate);
        } else {
          setDisplay(value);
        }
      };

      frame = requestAnimationFrame(animate);
    };

    const maybeStart = () => {
      if (cancelled) return;
      if (isInViewport(element)) {
        observer?.disconnect();
        runCountUp();
      }
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          maybeStart();
        }
      },
      { threshold: 0 }
    );

    observer.observe(element);
    maybeStart();

    return () => {
      cancelled = true;
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs, parsed]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {display}
    </span>
  );
}
