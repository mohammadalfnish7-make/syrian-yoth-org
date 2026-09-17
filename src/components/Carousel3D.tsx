"use client";

import { useCallback, useState } from "react";

export type Carousel3DSlide = {
  key: string;
  caption: React.ReactNode;
  href?: string;
  renderMedia: () => React.ReactNode;
};

type Carousel3DProps = {
  slides: Carousel3DSlide[];
  readMoreHref?: string;
  readMoreLabelAr?: string;
  readMoreLabelEn?: string;
  ariaLabel?: string;
};

const VISIBLE_RADIUS = 2;

function getOffset(index: number, current: number, total: number) {
  let diff = index - current;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

function getPositionClass(offset: number) {
  if (offset === 0) return "current";
  if (offset === 1) return "right-1";
  if (offset === -1) return "left-1";
  if (offset === 2) return "right-2";
  if (offset === -2) return "left-2";
  return "hidden";
}

function ChevronIcon({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === "prev" ? (
        <path d="M9 6l6 6-6 6" />
      ) : (
        <path d="M15 6l-6 6 6 6" />
      )}
    </svg>
  );
}

export function Carousel3D({
  slides,
  readMoreHref = "#involve",
  readMoreLabelAr = "اقرأ أكثر",
  readMoreLabelEn = "Read more",
  ariaLabel = "Carousel",
}: Carousel3DProps) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      setCurrent((index + total) % total);
    },
    [total]
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  if (total === 0) return null;

  return (
    <div className="carousel-3d">
      <div className="carousel-3d__stage">
        <button
          type="button"
          className="carousel-3d__arrow carousel-3d__arrow--prev"
          onClick={goPrev}
          aria-label="السابق"
        >
          <ChevronIcon direction="prev" />
        </button>

        <div className="carousel-3d__container">
          <div className="carousel-3d__slider" role="region" aria-label={ariaLabel}>
            {slides.map((slide, index) => {
              const offset = getOffset(index, current, total);
              const positionClass = getPositionClass(offset);
              const isHidden = Math.abs(offset) > VISIBLE_RADIUS;
              const isCurrent = offset === 0;

              const inner = (
                <figure className="carousel-3d__figure">
                  <div className="carousel-3d__media">{slide.renderMedia()}</div>
                  <figcaption className="carousel-3d__caption">
                    {slide.caption}
                  </figcaption>
                </figure>
              );

              return (
                <div
                  key={slide.key}
                  className={`carousel-3d__slide ${positionClass}${isCurrent ? " is-current" : ""}`}
                  style={isHidden ? { opacity: 0, visibility: "hidden" } : undefined}
                  onClick={() => {
                    if (!isCurrent && !isHidden) goTo(index);
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !isCurrent && !isHidden) {
                      e.preventDefault();
                      goTo(index);
                    }
                  }}
                  role="button"
                  tabIndex={isHidden ? -1 : 0}
                  aria-hidden={isHidden}
                  aria-current={isCurrent ? "true" : undefined}
                >
                  {slide.href && isCurrent ? (
                    <a href={slide.href} className="carousel-3d__link">
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="carousel-3d__arrow carousel-3d__arrow--next"
          onClick={goNext}
          aria-label="التالي"
        >
          <ChevronIcon direction="next" />
        </button>
      </div>

      <div className="carousel-3d__dots" role="group" aria-label={ariaLabel}>
        {slides.map((slide, i) => (
          <button
            key={slide.key}
            type="button"
            aria-label={`Slide ${i + 1}`}
            aria-current={i === current ? "true" : undefined}
            className={`carousel-3d__dot${i === current ? " carousel-3d__dot--active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <div className="carousel-3d__footer">
        <a href={readMoreHref} className="carousel-3d__read-more content-ar">
          {readMoreLabelAr}
        </a>
        <a href={readMoreHref} className="carousel-3d__read-more content-en">
          {readMoreLabelEn}
        </a>
      </div>
    </div>
  );
}
