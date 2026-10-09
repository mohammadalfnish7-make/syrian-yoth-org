import { PROFILE_MISSION, PROFILE_VISION } from "./profile-content";
import type { AboutSettings } from "../types/site";

export const DEFAULT_ABOUT: AboutSettings = {
  label: { ar: "من نحن", en: "Who We Are" },
  title: {
    ar: "مؤسسة شبابية سورية بروح قيادية",
    en: "A Syrian Youth Foundation with a Leadership Spirit",
  },
  mission: PROFILE_MISSION,
  vision: PROFILE_VISION,
  presenceLabel: {
    ar: "محافظات فيها حضور فاعل، ودمشق مركزاً",
    en: "Governorates with an active presence, Damascus as the hub",
  },
  values: [
    { ar: "الكرامة", en: "Dignity" },
    { ar: "المسؤولية", en: "Responsibility" },
    { ar: "العدل", en: "Justice" },
    { ar: "الأمانة", en: "Integrity" },
    { ar: "الإتقان", en: "Mastery" },
    { ar: "الانتماء", en: "Belonging" },
    { ar: "التكافل", en: "Solidarity" },
  ],
  yearsOfExperience: "10",
};
