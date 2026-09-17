import localFont from "next/font/local";

export const qomraArabic = localFont({
  src: [
    {
      path: "../../public/fonts/QomraArabic-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/QomraArabic-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/QomraArabic-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-qomra",
  display: "swap",
  fallback: ["Noto Sans Arabic", "system-ui", "sans-serif"],
});
