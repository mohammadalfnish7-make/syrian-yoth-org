import type { LucideIcon } from "lucide-react";
import {
  Crown,
  GraduationCap,
  Rocket,
  HandHeart,
} from "lucide-react";
import type { ProgramCardIconKey } from "@/lib/site-content";

const ICON_MAP: Record<ProgramCardIconKey, LucideIcon> = {
  leadership: Crown,
  skills: GraduationCap,
  initiatives: Rocket,
  volunteer: HandHeart,
};

type ProgramCardIconProps = {
  name: ProgramCardIconKey;
  size?: number;
  className?: string;
};

export function ProgramCardIcon({
  name,
  size = 24,
  className,
}: ProgramCardIconProps) {
  const Icon = ICON_MAP[name];
  return (
    <Icon
      size={size}
      strokeWidth={2}
      className={`program-slide__icon-svg ${className ?? ""}`}
      aria-hidden
    />
  );
}
