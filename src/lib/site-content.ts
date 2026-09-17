export type BilingualText = {
  ar: string;
  en: string;
};

export type FocusAreaIconKey =
  | "leadership"
  | "skills"
  | "initiatives"
  | "community"
  | "opportunities";

export type ProgramCardIconKey =
  | "leadership"
  | "skills"
  | "initiatives"
  | "volunteer";

export type ProgramCard = {
  id?: string;
  icon: ProgramCardIconKey;
  tag: BilingualText;
  title: BilingualText;
  description: BilingualText;
  imageUrl?: string | null;
};

export type InvolveCardIconKey =
  | "volunteer"
  | "program"
  | "initiative"
  | "partner";

export type InvolveCard = {
  icon: InvolveCardIconKey;
  title: BilingualText;
  description: BilingualText;
};

export const DEFAULT_PROGRAMS: ProgramCard[] = [
  {
    icon: "leadership",
    tag: { ar: "قيادة", en: "Leadership" },
    title: { ar: "أكاديمية قادة الشباب", en: "Youth Leaders Academy" },
    description: {
      ar: "برنامج مكثف لتأهيل قادة شبابيين قادرين على إدارة المشاريع والتأثير المجتمعي.",
      en: "An intensive program preparing youth leaders to manage projects and create community impact.",
    },
  },
  {
    icon: "skills",
    tag: { ar: "مهارات", en: "Skills" },
    title: { ar: "مهارات المستقبل", en: "Future Skills" },
    description: {
      ar: "ورش عمل وتدريبات في التكنولوجيا والتواصل والعمل الجماعي.",
      en: "Workshops and training in technology, communication, and teamwork.",
    },
  },
  {
    icon: "initiatives",
    tag: { ar: "مبادرات", en: "Initiatives" },
    title: { ar: "صندوق المبادرات الشبابية", en: "Youth Initiatives Fund" },
    description: {
      ar: "دعم مالي وإرشادي للمبادرات الشبابية المحلية ذات الأثر المجتمعي.",
      en: "Financial and mentoring support for local youth initiatives with community impact.",
    },
  },
  {
    icon: "volunteer",
    tag: { ar: "تطوع", en: "Volunteering" },
    title: { ar: "شبكة المتطوعين", en: "Volunteer Network" },
    description: {
      ar: "منصة لربط المتطوعين بالمشاريع الميدانية في مختلف المحافظات.",
      en: "A platform connecting volunteers with field projects across governorates.",
    },
  },
];

export const INVOLVE_CARDS: InvolveCard[] = [
  {
    icon: "volunteer",
    title: { ar: "كن متطوعاً", en: "Become a Volunteer" },
    description: {
      ar: "انضم إلى شبكة المتطوعين لدينا في 10 محافظات وساهم في مشاريع مجتمعية.",
      en: "Join our volunteer network in 10 governorates and contribute to community projects.",
    },
  },
  {
    icon: "program",
    title: { ar: "سجّل في برنامج", en: "Join a Program" },
    description: {
      ar: "استكشف برامجنا التدريبية والتأهيلية وقدّم طلبك للمشاركة.",
      en: "Explore our training and development programs and apply to participate.",
    },
  },
  {
    icon: "initiative",
    title: { ar: "قدّم مبادرة", en: "Submit an Initiative" },
    description: {
      ar: "لديك فكرة لمشروع شبابي؟ نحن هنا لدعمك وتمكينك من تحقيقها.",
      en: "Have a youth project idea? We are here to support and empower you to achieve it.",
    },
  },
  {
    icon: "partner",
    title: { ar: "شاركنا الشراكة", en: "Partner With Us" },
    description: {
      ar: "للمؤسسات والمنظمات الراغبة في الشراكة معنا لتمكين الشباب السوري.",
      en: "For institutions and organizations interested in partnering to empower Syrian youth.",
    },
  },
];
