"use client";

import { useState } from "react";
import type { PublicEvent } from "@/lib/public-content";
import { eventImageUrl } from "@/lib/event-images";
import { Carousel3D, type Carousel3DSlide } from "@/components/Carousel3D";

function EventSlideMedia({
  src,
  fallback,
}: {
  src: string;
  fallback: string;
}) {
  const [current, setCurrent] = useState(src);

  return (
    <img
      src={current}
      alt=""
      className="carousel-3d__image"
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}

export function EventsCarousel({
  events,
  showReadMore = true,
}: {
  events: PublicEvent[];
  showReadMore?: boolean;
}) {
  const slides: Carousel3DSlide[] = events.map((event, index) => {
    const src = eventImageUrl(event.imageUrl, index);
    const fallback = eventImageUrl(null, index);

    return {
      key: event.id,
      href: event.registerPath,
      caption: (
        <>
          <span className="content-ar">{event.titleAr}</span>
          <span className="content-en">{event.titleEn}</span>
        </>
      ),
      renderMedia: () => <EventSlideMedia src={src} fallback={fallback} />,
    };
  });

  return (
    <Carousel3D
      slides={slides}
      readMoreHref="/events"
      readMoreLabelAr="كل الفعاليات"
      readMoreLabelEn="All events"
      ariaLabel="الفعاليات"
      showReadMore={showReadMore}
    />
  );
}
