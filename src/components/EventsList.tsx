import { LocaleLink } from "@/components/LocaleLink";
import type { PublicEvent } from "@/lib/public-content";

function formatEventDate(value: string | null, locale: "ar" | "en") {
  if (!value) return locale === "ar" ? "موعد يُعلن لاحقاً" : "Date to be announced";
  return new Date(value).toLocaleDateString(locale === "ar" ? "ar-SY" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function EventsList({ events }: { events: PublicEvent[] }) {
  return (
    <div className="event-list">
      {events.map((event) => (
        <article key={event.id} className="event-card">
          <p className="event-card__meta">
            <span className="content-ar">{event.isRolling ? "مستمر" : formatEventDate(event.startsAt, "ar")}</span>
            <span className="content-en">{event.isRolling ? "Ongoing" : formatEventDate(event.startsAt, "en")}</span>
            <span aria-hidden="true"> · </span>
            <span className="content-ar">{event.cityAr}</span>
            <span className="content-en">{event.cityEn}</span>
          </p>
          <h3 className="event-card__title content-ar">{event.titleAr}</h3>
          <h3 className="event-card__title content-en">{event.titleEn}</h3>
          <p className="content-ar">{event.descriptionAr}</p>
          <p className="content-en">{event.descriptionEn}</p>
          <LocaleLink href={event.registerPath} className="btn-primary btn-primary--compact">
            <span className="content-ar">سجّل</span>
            <span className="content-en">Register</span>
          </LocaleLink>
        </article>
      ))}
    </div>
  );
}
