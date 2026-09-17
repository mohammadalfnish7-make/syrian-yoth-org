"use client";

import Image from "next/image";
import type { ProgramCard } from "@/lib/site-content";
import { ProgramCardIcon } from "@/components/ProgramCardIcon";
import { Carousel3D, type Carousel3DSlide } from "@/components/Carousel3D";

type ProgramsCarouselProps = {
  programs: ProgramCard[];
};

function ProgramSlideMedia({ program }: { program: ProgramCard }) {
  if (program.imageUrl) {
    const isRemote =
      program.imageUrl.startsWith("http") || program.imageUrl.startsWith("/api/uploads/");

    if (isRemote) {
      return (
        <img
          src={program.imageUrl}
          alt=""
          className="carousel-3d__image"
          loading="lazy"
        />
      );
    }

    return (
      <Image
        src={program.imageUrl}
        alt=""
        fill
        className="carousel-3d__image"
        sizes="(max-width: 640px) 88vw, 400px"
      />
    );
  }

  return (
    <div
      className={`carousel-3d__placeholder carousel-3d__placeholder--${program.icon}`}
      aria-hidden
    >
      <ProgramCardIcon name={program.icon} size={64} />
    </div>
  );
}

export function ProgramsCarousel({ programs }: ProgramsCarouselProps) {
  const slides: Carousel3DSlide[] = programs.map((program) => ({
    key: program.id ?? program.title.en,
    href: "#involve",
    caption: (
      <>
        <span className="content-ar">{program.title.ar}</span>
        <span className="content-en">{program.title.en}</span>
      </>
    ),
    renderMedia: () => <ProgramSlideMedia program={program} />,
  }));

  return (
    <Carousel3D
      slides={slides}
      readMoreHref="#involve"
      readMoreLabelAr="اقرأ أكثر"
      readMoreLabelEn="Read more"
      ariaLabel="البرامج"
    />
  );
}
