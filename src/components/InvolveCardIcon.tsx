import type { LucideIcon } from "lucide-react";
import {
  HandHeart,
  ClipboardList,
  Lightbulb,
  Handshake,
} from "lucide-react";
import type { InvolveCardIconKey } from "@/lib/site-content";

const ICON_MAP: Record<InvolveCardIconKey, LucideIcon> = {
  volunteer: HandHeart,
  program: ClipboardList,
  initiative: Lightbulb,
  partner: Handshake,
};

type InvolveCardIconProps = {
  name: InvolveCardIconKey;
  size?: number;
  className?: string;
};

export function InvolveCardIcon({
  name,
  size = 24,
  className,
}: InvolveCardIconProps) {
  const Icon = ICON_MAP[name];
  return (
    <Icon
      size={size}
      strokeWidth={2}
      className={`involve-card__icon-svg ${className ?? ""}`}
      aria-hidden
    />
  );
}
