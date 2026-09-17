import type { LucideIcon } from "lucide-react";
import {
  Crown,
  GraduationCap,
  Rocket,
  HeartHandshake,
  Compass,
} from "lucide-react";
import type { FocusAreaIconKey } from "@/lib/site-content";

const ICON_MAP: Record<FocusAreaIconKey, LucideIcon> = {
  leadership: Crown,
  skills: GraduationCap,
  initiatives: Rocket,
  community: HeartHandshake,
  opportunities: Compass,
};

type FocusAreaIconProps = {
  name: FocusAreaIconKey;
  size?: number;
  className?: string;
};

export function FocusAreaIcon({
  name,
  size = 24,
  className,
}: FocusAreaIconProps) {
  const Icon = ICON_MAP[name];
  return (
    <Icon
      size={size}
      strokeWidth={2}
      className={`focus-card__icon-svg ${className ?? ""}`}
      aria-hidden
    />
  );
}
