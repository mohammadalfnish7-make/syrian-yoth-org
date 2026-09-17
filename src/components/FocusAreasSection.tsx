import Image from "next/image";
import type { PublicFocusArea } from "@/lib/focus-areas";

type FocusAreasSectionProps = {
  areas: PublicFocusArea[];
};

function FocusAreaImage({ src }: { src: string }) {
  const isUploaded =
    src.startsWith("/api/uploads/") || src.startsWith("http");

  if (isUploaded) {
    return (
      <img src={src} alt="" className="focus-card__image" loading="lazy" />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      className="focus-card__image"
      sizes="(max-width: 640px) 200px, 240px"
    />
  );
}

export function FocusAreasSection({ areas }: FocusAreasSectionProps) {
  if (areas.length === 0) return null;

  return (
    <div className="focus-grid">
      {areas.map((area) => (
        <article
          key={area.id}
          className={`focus-card focus-card--${area.icon}`}
          tabIndex={0}
        >
          <FocusAreaImage src={area.image} />
          <div className="focus-card__overlay" aria-hidden />
          <p className="focus-card__name content-ar">{area.title.ar}</p>
          <p className="focus-card__name content-en">{area.title.en}</p>
          <div className="focus-card__content">
            <h3 className="focus-card__title content-ar">{area.title.ar}</h3>
            <h3 className="focus-card__title content-en">{area.title.en}</h3>
            <p className="focus-card__desc content-ar">{area.description.ar}</p>
            <p className="focus-card__desc content-en">{area.description.en}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
