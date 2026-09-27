"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { withLocale } from "@/lib/locale";

type LocaleLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  id?: string;
};

export function LocaleLink({ href, className, children, id }: LocaleLinkProps) {
  const pathname = usePathname() || "/ar";

  return (
    <Link id={id} href={withLocale(href, pathname)} className={className}>
      {children}
    </Link>
  );
}
