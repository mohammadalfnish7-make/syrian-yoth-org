"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useDragScroll } from "@/hooks/useDragScroll";
import {
  REGION_LABELS,
  REGION_ORDER,
  getGovernorateRegion,
  type GovernorateRegion,
} from "@/lib/governorate-regions";

export type PublicGovernorate = {
  id: string;
  nameAr: string;
  nameEn: string | null;
  sortOrder: number;
};

export type PublicNewsItem = {
  id: string;
  title: string;
  titleEn?: string | null;
  body: string;
  bodyEn?: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  governorateId: string;
  governorate: {
    nameAr: string;
    nameEn: string | null;
  };
};

type GovernorateNewsSectionProps = {
  governorates: PublicGovernorate[];
  news: PublicNewsItem[];
};

function formatNewsDate(date: string | null, locale: "ar" | "en") {
  if (!date) return "";
  return new Date(date).toLocaleDateString(locale === "ar" ? "ar-SY" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function pickGovernorateInRegion(
  regionGovernorates: PublicGovernorate[],
  newsCountByGov: Map<string, number>,
  preferredId?: string
) {
  if (preferredId && regionGovernorates.some((gov) => gov.id === preferredId)) {
    return preferredId;
  }

  const withNews = regionGovernorates.find(
    (gov) => (newsCountByGov.get(gov.id) ?? 0) > 0
  );
  return withNews?.id ?? regionGovernorates[0]?.id ?? "";
}

export function GovernorateNewsSection({
  governorates,
  news,
}: GovernorateNewsSectionProps) {
  const newsCountByGov = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of news) {
      counts.set(item.governorateId, (counts.get(item.governorateId) ?? 0) + 1);
    }
    return counts;
  }, [news]);

  const governoratesByRegion = useMemo(() => {
    const grouped = new Map<GovernorateRegion, PublicGovernorate[]>();
    for (const region of REGION_ORDER) {
      grouped.set(region, []);
    }
    for (const gov of governorates) {
      const region = getGovernorateRegion(gov);
      grouped.get(region)?.push(gov);
    }
    for (const region of REGION_ORDER) {
      grouped.get(region)?.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return grouped;
  }, [governorates]);

  const defaultGovernorateId = useMemo(() => {
    const withNews = governorates.find(
      (gov) => (newsCountByGov.get(gov.id) ?? 0) > 0
    );
    return withNews?.id ?? governorates[0]?.id ?? "";
  }, [governorates, newsCountByGov]);

  const defaultRegion = useMemo(() => {
    const gov = governorates.find((item) => item.id === defaultGovernorateId);
    return gov ? getGovernorateRegion(gov) : REGION_ORDER[0];
  }, [governorates, defaultGovernorateId]);

  const [activeRegion, setActiveRegion] = useState<GovernorateRegion | "">("");
  const [selectedGovernorateId, setSelectedGovernorateId] = useState("");
  const [governorateNews, setGovernorateNews] = useState<PublicNewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    if (!activeRegion && defaultRegion) {
      setActiveRegion(defaultRegion);
    }
  }, [activeRegion, defaultRegion]);

  useEffect(() => {
    if (!selectedGovernorateId && defaultGovernorateId) {
      setSelectedGovernorateId(defaultGovernorateId);
    }
  }, [defaultGovernorateId, selectedGovernorateId]);

  const regionGovernorates = useMemo(
    () => (activeRegion ? governoratesByRegion.get(activeRegion) ?? [] : []),
    [activeRegion, governoratesByRegion]
  );

  useEffect(() => {
    if (!activeRegion || regionGovernorates.length === 0) return;

    const selectedInRegion = regionGovernorates.some(
      (gov) => gov.id === selectedGovernorateId
    );
    if (!selectedInRegion) {
      setSelectedGovernorateId(
        pickGovernorateInRegion(regionGovernorates, newsCountByGov)
      );
    }
  }, [
    activeRegion,
    regionGovernorates,
    selectedGovernorateId,
    newsCountByGov,
  ]);

  useEffect(() => {
    if (!selectedGovernorateId) return;

    const controller = new AbortController();
    setLoadingNews(true);

    fetch(
      `/api/public/news?governorate_id=${encodeURIComponent(selectedGovernorateId)}`,
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load news");
        return res.json();
      })
      .then((data: { news: PublicNewsItem[] }) => {
        setGovernorateNews(data.news ?? []);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setGovernorateNews(
          news.filter((item) => item.governorateId === selectedGovernorateId)
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingNews(false);
        }
      });

    return () => controller.abort();
  }, [selectedGovernorateId, news]);

  const filteredNews = governorateNews;

  const selectedGovernorate = governorates.find(
    (gov) => gov.id === selectedGovernorateId
  );

  const newsTrackRef = useRef<HTMLDivElement>(null);
  const newsDrag = useDragScroll(newsTrackRef);
  const [newsIndex, setNewsIndex] = useState(0);
  const [canNewsPrev, setCanNewsPrev] = useState(false);
  const [canNewsNext, setCanNewsNext] = useState(false);

  const updateNewsCarousel = useCallback(() => {
    const track = newsTrackRef.current;
    if (!track) return;

    const slides = track.querySelectorAll<HTMLElement>(".news-slide");
    if (slides.length === 0) {
      setNewsIndex(0);
      setCanNewsPrev(false);
      setCanNewsNext(false);
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const isRtl = getComputedStyle(track).direction === "rtl";
    let closest = 0;
    let minDist = Infinity;

    slides.forEach((slide, i) => {
      const slideRect = slide.getBoundingClientRect();
      const dist = isRtl
        ? Math.abs(slideRect.right - trackRect.right)
        : Math.abs(slideRect.left - trackRect.left);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    setNewsIndex(closest);
    setCanNewsPrev(closest > 0);
    setCanNewsNext(closest < slides.length - 1);
  }, []);

  useEffect(() => {
    setNewsIndex(0);
    const track = newsTrackRef.current;
    if (!track) return;
    const isRtl = getComputedStyle(track).direction === "rtl";
    if (isRtl) {
      const slides = track.querySelectorAll<HTMLElement>(".news-slide");
      if (slides[0]) {
        slides[0].scrollIntoView({ inline: "start", block: "nearest" });
      }
    } else {
      track.scrollTo({ left: 0 });
    }
  }, [selectedGovernorateId]);

  useEffect(() => {
    const track = newsTrackRef.current;
    if (!track) return;

    updateNewsCarousel();
    track.addEventListener("scroll", updateNewsCarousel, { passive: true });
    window.addEventListener("resize", updateNewsCarousel);

    return () => {
      track.removeEventListener("scroll", updateNewsCarousel);
      window.removeEventListener("resize", updateNewsCarousel);
    };
  }, [filteredNews, updateNewsCarousel]);

  function scrollNewsTo(index: number) {
    const track = newsTrackRef.current;
    const slides = track?.querySelectorAll<HTMLElement>(".news-slide");
    slides?.[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  }

  function selectRegion(region: GovernorateRegion) {
    setActiveRegion(region);
    const regionGovs = governoratesByRegion.get(region) ?? [];
    setSelectedGovernorateId(
      pickGovernorateInRegion(regionGovs, newsCountByGov)
    );
  }

  if (governorates.length === 0) {
    return (
      <>
        <p className="section-desc content-ar">
          لا توجد أخبار منشورة حالياً. تابعنا قريباً.
        </p>
        <p className="section-desc content-en">
          No news stories published yet. Check back soon.
        </p>
      </>
    );
  }

  return (
    <div className="gov-news">
      <div className="gov-news__map-label">
        <span className="content-ar">اختر المنطقة ثم المحافظة</span>
        <span className="content-en">Select a region, then a governorate</span>
      </div>

      <div
        className="gov-news__region-tabs"
        role="group"
        aria-label="Regions"
      >
        {REGION_ORDER.map((region) => {
          const isActive = region === activeRegion;
          return (
            <button
              key={region}
              type="button"
              aria-pressed={isActive}
              className={`gov-news__region-tab ${isActive ? "gov-news__region-tab--active" : ""}`}
              onClick={() => selectRegion(region)}
            >
              <span className="content-ar">{REGION_LABELS[region].ar}</span>
              <span className="content-en">{REGION_LABELS[region].en}</span>
            </button>
          );
        })}
      </div>

      <div
        className="gov-news__gov-list"
        role="group"
        aria-label="Governorates"
      >
        {regionGovernorates.map((gov) => {
          const count = newsCountByGov.get(gov.id) ?? 0;
          const isActive = gov.id === selectedGovernorateId;

          return (
            <button
              key={gov.id}
              type="button"
              aria-pressed={isActive}
              className={`gov-news__gov-chip ${isActive ? "gov-news__gov-chip--active" : ""}`}
              onClick={() => setSelectedGovernorateId(gov.id)}
            >
              <span className="gov-news__gov-chip-name content-ar">
                {gov.nameAr}
              </span>
              <span className="gov-news__gov-chip-name content-en">
                {gov.nameEn || gov.nameAr}
              </span>
              {count > 0 ? (
                <span className="gov-news__gov-chip-count">{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="gov-news__panel">
        <div className="gov-news__panel-header">
          <h3 className="gov-news__panel-title">
            <span className="content-ar">
              أخبار {selectedGovernorate?.nameAr ?? "المحافظة"}
            </span>
            <span className="content-en">
              {selectedGovernorate?.nameEn ||
                selectedGovernorate?.nameAr ||
                "Governorate"}{" "}
              News
            </span>
          </h3>

          {filteredNews.length > 1 && (
            <div className="gov-news__nav">
              <button
                type="button"
                className="programs-carousel__btn gov-news__nav-btn"
                onClick={() => scrollNewsTo(Math.max(0, newsIndex - 1))}
                disabled={!canNewsPrev}
                aria-label="Previous news"
              >
                <ChevronRight size={20} className="content-ar" />
                <ChevronLeft size={20} className="content-en" />
              </button>
              <button
                type="button"
                className="programs-carousel__btn gov-news__nav-btn"
                onClick={() =>
                  scrollNewsTo(Math.min(filteredNews.length - 1, newsIndex + 1))
                }
                disabled={!canNewsNext}
                aria-label="Next news"
              >
                <ChevronLeft size={20} className="content-ar" />
                <ChevronRight size={20} className="content-en" />
              </button>
            </div>
          )}
        </div>

        {loadingNews ? (
          <div className="gov-news__empty">
            <p className="content-ar">جاري تحميل الأخبار…</p>
            <p className="content-en">Loading news…</p>
          </div>
        ) : filteredNews.length > 0 ? (
          <>
            <div
              className="gov-news__track drag-scroll"
              ref={newsTrackRef}
              {...newsDrag.dragHandlers}
            >
              {filteredNews.map((item) => (
                <article key={item.id} className="news-slide">
                  {item.coverImageUrl ? (
                    <div className="news-slide__image">
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : null}
                  <div className="news-slide__body">
                    <div className="news-card-plain__meta">
                      <span className="content-ar">خبر</span>
                      <span className="content-en">News</span>
                      <span>·</span>
                      <time dateTime={item.publishedAt ?? undefined}>
                        <span className="content-ar">
                          {formatNewsDate(item.publishedAt, "ar")}
                        </span>
                        <span className="content-en">
                          {formatNewsDate(item.publishedAt, "en")}
                        </span>
                      </time>
                    </div>
                    <h4 className="news-slide__title content-ar">{item.title}</h4>
                    <h4 className="news-slide__title content-en">{item.titleEn || item.title}</h4>
                    <p className="news-slide__excerpt content-ar">
                      {item.body.slice(0, 220)}
                      {item.body.length > 220 ? "…" : ""}
                    </p>
                    <p className="news-slide__excerpt content-en">
                      {(item.bodyEn || item.body).slice(0, 220)}
                      {(item.bodyEn || item.body).length > 220 ? "…" : ""}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {filteredNews.length > 1 && (
              <div
                className="programs-carousel__dots"
                role="group"
                aria-label="News slides"
              >
                {filteredNews.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`News slide ${i + 1}`}
                    aria-current={i === newsIndex ? "true" : undefined}
                    className={`programs-carousel__dot ${i === newsIndex ? "programs-carousel__dot--active" : ""}`}
                    onClick={() => scrollNewsTo(i)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="gov-news__empty">
            <p className="content-ar">لا توجد أخبار منشورة لهذه المحافظة حالياً.</p>
            <p className="content-en">
              No published stories for this governorate yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
