import { PROFILE_PROGRAMS } from "@/lib/profile-content";

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
  slug: string;
  icon: ProgramCardIconKey;
  tag: BilingualText;
  title: BilingualText;
  description: BilingualText;
  audience: BilingualText;
  schedule: BilingualText;
  where: BilingualText;
  outcomes: BilingualText;
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
  commitment: BilingualText;
  skills: BilingualText;
  nextStep: BilingualText;
};

export const DEFAULT_PROGRAMS: ProgramCard[] = PROFILE_PROGRAMS.map((program) => ({
  id: program.id,
  slug: program.slug,
  icon: program.icon,
  tag: { ar: "برنامج", en: "Program" },
  title: { ar: program.titleAr, en: program.titleEn },
  description: { ar: program.descriptionAr, en: program.descriptionEn },
  audience: { ar: program.audienceAr, en: program.audienceEn },
  schedule: { ar: program.scheduleAr, en: program.scheduleEn },
  where: { ar: program.whereAr, en: program.whereEn },
  outcomes: { ar: program.outcomesAr, en: program.outcomesEn },
}));

export const INVOLVE_CARDS: InvolveCard[] = [
  {
    icon: "volunteer",
    title: { ar: "كن متطوعاً", en: "Become a Volunteer" },
    description: {
      ar: "انضم إلى التطوع المفتوح في فرع محافظتك، وإلى شبكة أصدقاء الشباب السوري.",
      en: "Join open volunteering in your governorate branch, and the Friends of Syrian Youth network.",
    },
    commitment: {
      ar: "لا حد أدنى ثابت للساعات. يُتفق على الدور بعد قبول الطلب.",
      en: "No fixed minimum of hours. The role is agreed after the request is accepted.",
    },
    skills: {
      ar: "الالتزام، والعمل مع فريق، والرغبة في الخدمة المحلية.",
      en: "Commitment, teamwork, and a wish to serve locally.",
    },
    nextStep: {
      ar: "يراجع فريق المحافظة الطلب ويتواصل معك على الهاتف أو البريد. لن يُغلق الطلب بصمت.",
      en: "The governorate team reviews the request and contacts you by phone or email. It will not be closed in silence.",
    },
  },
  {
    icon: "program",
    title: { ar: "سجّل في برنامج", en: "Join a Program" },
    description: {
      ar: "قائد، محطات، وجهتك الأكاديمية، نادي اليافعين، التدريبات، أو الفعاليات الجماهيرية.",
      en: "Qa'id, Mahattat, Your Academic Path, the Adolescents' Club, trainings, or public events.",
    },
    commitment: {
      ar: "يختلف حسب البرنامج. المدة والمكان في صفحة البرنامج نفسه.",
      en: "It depends on the program. Duration and place are on that program's page.",
    },
    skills: {
      ar: "الاستعداد للحضور والتعلّم. نادي اليافعين يشترط موافقة ولي الأمر.",
      en: "Readiness to attend and learn. The Adolescents' Club requires a guardian's consent.",
    },
    nextStep: {
      ar: "يصل الطلب باسم البرنامج الذي اخترته، ويردّ الفريق لتأكيد المقعد أو شرح الخطوة التالية.",
      en: "The request arrives with the program you chose. The team replies to confirm a place or explain the next step.",
    },
  },
  {
    icon: "initiative",
    title: { ar: "قدّم مبادرة", en: "Submit an Initiative" },
    description: {
      ar: "فكرة مشروع شبابي يمكن أن تكبر وفق رؤية كرة الثلج: تبدأ بمجموعة ثم تتسع.",
      en: "A youth project idea that can grow the way a snowball does: a group first, then a wider circle.",
    },
    commitment: {
      ar: "جلسة أولى لفهم الفكرة. الدعم إرشاد ومتابعة، لا وعداً مالياً تلقائياً.",
      en: "A first conversation to understand the idea. Support is guidance and follow-up, not an automatic grant.",
    },
    skills: {
      ar: "فكرة واضحة، وصلة بالمجتمع المحلي، واستعداد للتنفيذ.",
      en: "A clear idea, a link to the local community, and willingness to carry it out.",
    },
    nextStep: {
      ar: "نقرأ الفكرة ونردّ إن كانت ضمن محاور المؤسسة، أو نوضّح إن لم تكن كذلك.",
      en: "We read the idea and reply if it fits our focus areas, or explain if it does not.",
    },
  },
  {
    icon: "partner",
    title: { ar: "شاركنا الشراكة", en: "Partner With Us" },
    description: {
      ar: "للمؤسسات التي تريد العمل مع الشباب السوري ضمن استقلالية المؤسسة ولاحزبيتها.",
      en: "For organizations that want to work with Syrian youth within the Foundation's independence and non-partisanship.",
    },
    commitment: {
      ar: "تعارف أولاً، ثم صياغة شراكة برامجية أو مجتمعية.",
      en: "An introduction first, then a program or community partnership.",
    },
    skills: {
      ar: "جهة قادرة على دعم الشباب دون توظيف العمل سياسياً.",
      en: "An organization able to support youth without turning the work into politics.",
    },
    nextStep: {
      ar: "يتواصل فريق الشراكات مع الشخص المسؤول الذي سمّيته في الطلب.",
      en: "The partnerships team contacts the person you named on the form.",
    },
  },
];
