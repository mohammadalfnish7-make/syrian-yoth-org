"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/videos/hero-bg.mp4";
const POSTER_SRC = "/videos/hero-poster.jpg";

function tryPlay(video: HTMLVideoElement) {
  if (typeof video.play !== "function") return;

  const playResult = video.play();
  if (playResult && typeof playResult.catch === "function") {
    playResult.catch(() => undefined);
  }
}

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [allowVideo, setAllowVideo] = useState(true);

  useEffect(() => {
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (
      connection?.saveData ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g"
    ) {
      setAllowVideo(false);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !allowVideo) return;

    if (typeof window.matchMedia !== "function") {
      tryPlay(video);
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function applyMotionPreference() {
      const el = videoRef.current;
      if (!el) return;

      if (motionQuery.matches) {
        el.pause();
        el.removeAttribute("autoplay");
      } else {
        el.setAttribute("autoplay", "");
        tryPlay(el);
      }
    }

    applyMotionPreference();
    motionQuery.addEventListener("change", applyMotionPreference);

    return () => {
      motionQuery.removeEventListener("change", applyMotionPreference);
    };
  }, [allowVideo]);

  return (
    <div className="hero-section__media" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={POSTER_SRC}
        alt=""
        fetchPriority="high"
        decoding="async"
        className={`hero-section__poster${videoReady ? " hero-section__poster--hidden" : ""}`}
      />
      {allowVideo ? (
        <video
          ref={videoRef}
          className={`hero-section__video${videoReady ? " hero-section__video--visible" : ""}`}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={POSTER_SRC}
          onCanPlay={() => setVideoReady(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      ) : null}
      <div className="hero-section__overlay" />
    </div>
  );
}
