const FALLBACK_IMAGES = [
  "/images/hero/ramadan-session.webp",
  "/images/hero/homs-youth.webp",
  "/videos/hero-poster.jpg",
];

export function eventImageUrl(imageUrl: string | null, index: number) {
  return imageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}
